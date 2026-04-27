package com.PBL3.Mobile_OnlineShop.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.PBL3.Mobile_OnlineShop.Repository.*;
import com.PBL3.Mobile_OnlineShop.dto.request.OrderRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.*;
import com.PBL3.Mobile_OnlineShop.entity.*;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.dto.request.OfflineOrderRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateOrderStatusRequest;
import com.PBL3.Mobile_OnlineShop.enums.DeviceStatus;
import com.PBL3.Mobile_OnlineShop.enums.OrderStatus;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class OrderService {

    OrderRepository orderRepository;
    DeviceRepository deviceRepository;
    WarrantyRepository warrantyRepository;
    UserRepository userRepository;
    CartRepository cartRepository;
    VoucherRepository voucherRepository;
    CartDetailRepository cartDetailRepository;

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

    @Transactional
    public PaginatedResponse<OrderHistoryResponse> getMyOrders(String orderStatusStr, int page, int limit) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        OrderStatus status = null;
        if (orderStatusStr != null && !orderStatusStr.isBlank()) {
            try {
                status = OrderStatus.valueOf(orderStatusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.VALIDATION_ERROR,
                        "order_status không hợp lệ. Chấp nhận: WAIT, PROCESSING, DELIVERED, CANCELLED");
            }
        }

        int pageNo = page > 0 ? page - 1 : 0;
        Pageable pageable = PageRequest.of(pageNo, limit);

        Page<Order> orderPage = orderRepository.findByUserWithStatusFilter(user, status, pageable);

        List<OrderHistoryResponse> data = orderPage.getContent().stream()
                .map(o -> OrderHistoryResponse.builder()
                        .order_id(o.getOrderId())
                        .order_status(o.getOrderStatus() != null ? o.getOrderStatus().name() : null)
                        .order_date(o.getOrderDate())
                        .total_amount(o.getTotalAmount())
                        .discount_amount(o.getDiscountAmount())
                        .payment_method(o.getPaymentMethod())
                        .is_paid(o.getIsPaid())
                        .build())
                .collect(Collectors.toList());

        PaginatedResponse.PaginationMeta meta = new PaginatedResponse.PaginationMeta(
                page, limit, orderPage.getTotalElements());

        return new PaginatedResponse<>(data, meta);
    }

    @Transactional
    public OrderDetailResponse GetOrderDetail(Long order_id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Order order = orderRepository.findByUserWithIdFilter(user, order_id)
                .orElseThrow(() -> new AppException(ErrorCode.FORBIDDEN));

        OrderDetailResponse.DeliveryInfo delivery = OrderDetailResponse.DeliveryInfo
                .builder()
                .receiver_name(order.getReceiverName())
                .receiver_phone(order.getReceiverPhone())
                .shipping_address(order.getShippingAddress())
                .build();

        List<OrderDetailItemResponse> items = order.getOrderDetails().stream()
                .map(OD -> OrderDetailItemResponse.builder()
                        .order_detail_id(OD.getOrderDetailId())
                        .variant_id(OD.getProductVariant().getProductVariantId())
                        .device_id(OD.getDevice().getDeviceId())
                        .imei(OD.getDevice().getImei())
                        .product_name(OD.getProductVariant().getProduct().getProductName())
                        .color(OD.getProductVariant().getColor())
                        .storage_capacity(OD.getProductVariant().getStorageCapacity())
                        .price_at_purchase(OD.getPriceAtPurchase())
                        .build())
                .toList();
        return OrderDetailResponse.builder()
                .order_id(order.getOrderId())
                .user_id(order.getUser().getUserId())
                .order_status(order.getOrderStatus().name())
                .order_date(order.getOrderDate().toString())
                .total_amount(order.getTotalAmount())
                .discount_amount(order.getDiscountAmount())
                .payment_method(order.getPaymentMethod())
                .is_paid(order.getIsPaid())
                .voucher_id(order.getVoucher() != null ? order.getVoucher().getVoucherId() : null)
                .delivery(delivery)
                .items(items)
                .build();
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Lấy giỏ hàng của user
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        if ( cart.getCartDetails() == null || cart.getCartDetails().isEmpty()){
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        // Xác minh sản phẩm được chọn
        List<CartDetail> selectedItems = new ArrayList<>();
        for (OrderRequest.OrderItemRequest item : request.getItems()) {
            CartDetail cartDetail = cartDetailRepository.findById(item.getCart_detail_id())
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_DATA));

            // Kiểm tra cart detail này thuộc giỏ hàng của user
            if (!cartDetail.getCart().getCartId().equals(cart.getCartId())) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }

            selectedItems.add(cartDetail);
        }

        // Tính tổng giá từ DB
        Double totalAmount = selectedItems.stream()
                .mapToDouble(cd -> cd.getProductVariant().getPrice() * cd.getQuantity())
                .sum();

        // Tạo Order và OrderDetails...
        Order order = new Order();
        order.setUser(user);
        order.setReceiverName(request.getReceiver_name());
        order.setReceiverPhone(request.getReceiver_phone());
        order.setShippingAddress(request.getReceiver_phone());
        order.setPaymentMethod(request.getPayment_method());
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus(OrderStatus.WAIT);

        if (request.getVoucher_code() != null) {
            Voucher voucher = voucherRepository.findByVoucherCode(request.getVoucher_code())
                    .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

            Double discount = totalAmount * (voucher.getDiscountPercentage() / 100);
            if (totalAmount > voucher.getApplyConditions().getMinValue() && voucher.getStartDate().isBefore(LocalDateTime.now()) && voucher.getEndDate().isBefore(LocalDateTime.now())){
                order.setVoucher(voucher);
                order.setDiscountAmount(discount);
            }
            else {
                throw new AppException(ErrorCode.VOUCHER_INVALID);
            }
        }

        order.setTotalAmount(totalAmount - (order.getDiscountAmount() != null ? order.getDiscountAmount() : 0));

        Order savedOrder = orderRepository.save(order);

        cartDetailRepository.deleteAll(selectedItems);

        return OrderResponse.builder()
                .order_id(savedOrder.getOrderId())
                .order_status(savedOrder.getOrderStatus().name())
                .order_date(savedOrder.getOrderDate())
                .total_amount(savedOrder.getTotalAmount())
                .discount_amount(savedOrder.getDiscountAmount())
                .payment_method(savedOrder.getPaymentMethod())
                .is_paid(savedOrder.getIsPaid())
                .build();
    }

}
