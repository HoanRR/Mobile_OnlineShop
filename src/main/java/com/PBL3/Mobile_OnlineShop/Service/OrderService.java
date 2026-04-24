package com.PBL3.Mobile_OnlineShop.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;

import org.springframework.stereotype.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.DeviceRepository;
import com.PBL3.Mobile_OnlineShop.Repository.OrderRepository;
import com.PBL3.Mobile_OnlineShop.Repository.WarrantyRepository;
import com.PBL3.Mobile_OnlineShop.dto.request.OfflineOrderRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateOrderStatusRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.OfflineOrderResponse;
import com.PBL3.Mobile_OnlineShop.entity.Device;
import com.PBL3.Mobile_OnlineShop.entity.Order;
import com.PBL3.Mobile_OnlineShop.entity.OrderDetail;
import com.PBL3.Mobile_OnlineShop.entity.ProductVariant;
import com.PBL3.Mobile_OnlineShop.entity.Warranty;
import com.PBL3.Mobile_OnlineShop.enums.DeviceStatus;
import com.PBL3.Mobile_OnlineShop.enums.OrderStatus;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final DeviceRepository deviceRepository;
    private final WarrantyRepository warrantyRepository;

    @Transactional
    public void updateStatus(Long orderId, UpdateOrderStatusRequest request) {
        // 1. Tìm đơn hàng, ném lỗi 404 nếu không thấy
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // 2. Validate luồng trạng thái
        if (!order.getOrderStatus().isValidTransition(request.getOrderStatus())) {
            // Ném lỗi 422
            throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION);
        }

        // 3. Cập nhật trạng thái
        order.setOrderStatus(request.getOrderStatus());

        // 4. Cập nhật thanh toán (nếu client có gửi is_paid)
        if (request.getIsPaid() != null) {
            order.setIsPaid(request.getIsPaid());
        }

        // 5. Lưu vào DB (Có thể bỏ qua nếu dùng @Transactional và Entity được quản lý
        // bởi Hibernate)
        orderRepository.save(order);
    }

    @Transactional
    public OfflineOrderResponse createOfflineOrder(OfflineOrderRequest request) {
        // 1. Khởi tạo Order (Đơn hàng)
        Order order = new Order();
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setIsPaid(request.getIsPaid());

        // Đơn offline mặc định hoàn thành luôn
        order.setOrderStatus(OrderStatus.DELIVERED);
        order.setOrderDate(LocalDateTime.now());
        order.setDiscountAmount(0.0); // Offline mua thẳng chưa tính voucher

        double totalAmount = 0.0;
        List<OrderDetail> orderDetails = new ArrayList<>();

        // 2. Xử lý từng IMEI được gửi lên
        for (OfflineOrderRequest.ImeiRequest item : request.getItems()) {
            // Tìm Device theo IMEI
            Device device = deviceRepository.findByImei(item.getImei())
                    .orElseThrow(
                            () -> new AppException(ErrorCode.IMEI_NOT_FOUND, "Không tìm thấy IMEI: " + item.getImei()));

            // Kiểm tra trạng thái Device (chỉ bán máy đang AVAILABLE)
            if (device.getStatus() != DeviceStatus.AVAILABLE) {
                throw new AppException(ErrorCode.IMEI_ALREADY_SOLD,
                        "IMEI " + item.getImei() + " đã được bán hoặc đang lỗi!");
            }

            // Đổi trạng thái thiết bị thành ĐÃ BÁN
            device.setStatus(DeviceStatus.SOLD);
            // BỔ SUNG: Tự động kích hoạt bảo hành mặc định 12 tháng
            Warranty warranty = new Warranty();
            warranty.setDevice(device);
            warranty.setStartDate(LocalDateTime.now());
            warranty.setWarrantyMonth(12); // Mặc định 12 tháng
            warranty.setEndDate(LocalDateTime.now().plusMonths(12)); // Cộng thêm 12 tháng vào ngày hiện tại
            warrantyRepository.save(warranty); // Lưu bảo hành vào DB

            // ... (code cũ tạo OrderDetail giữ nguyên)

            // Lấy thông tin biến thể (Variant) để lấy giá và trừ tồn kho
            ProductVariant variant = device.getProductVariant();

            // Trừ đi 1 sản phẩm trong tồn kho chung của biến thể đó
            if (variant.getTotalAvailable() > 0) {
                variant.setTotalAvailable(variant.getTotalAvailable() - 1);
            }

            // Tạo chi tiết đơn hàng (OrderDetail)
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setDevice(device);
            detail.setProductVariant(variant);
            detail.setPriceAtPurchase(variant.getPrice());

            totalAmount += variant.getPrice();
            orderDetails.add(detail);
        }

        // 3. Cập nhật tổng tiền và lưu vào Database
        order.setTotalAmount(totalAmount);
        order.setOrderDetails(orderDetails);

        // Lưu Order (Do cấu hình cascade = CascadeType.ALL nên OrderDetail sẽ tự động
        // được lưu theo)
        Order savedOrder = orderRepository.save(order);

        // 4. Map dữ liệu trả về Response
        List<OfflineOrderResponse.ItemResponse> itemResponses = savedOrder.getOrderDetails().stream()
                .map(detail -> OfflineOrderResponse.ItemResponse.builder()
                        .orderDetailId(detail.getOrderDetailId())
                        .deviceId(detail.getDevice().getDeviceId())
                        .imei(detail.getDevice().getImei())
                        .priceAtPurchase(detail.getPriceAtPurchase())
                        .build())
                .toList();

        return OfflineOrderResponse.builder()
                .orderId(savedOrder.getOrderId())
                .orderStatus(savedOrder.getOrderStatus())
                .totalAmount(savedOrder.getTotalAmount())
                .items(itemResponses)
                .build();
    }
}
