package com.PBL3.Mobile_OnlineShop.service.impl;

import com.PBL3.Mobile_OnlineShop.dto.request.VoucherCreateRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.VoucherResponse;
import com.PBL3.Mobile_OnlineShop.entity.ApplyCondition;
import com.PBL3.Mobile_OnlineShop.entity.ProductVariant;
import com.PBL3.Mobile_OnlineShop.entity.Voucher;
import com.PBL3.Mobile_OnlineShop.repository.ProductVariantRepository;
import com.PBL3.Mobile_OnlineShop.repository.VoucherRepository;
import com.PBL3.Mobile_OnlineShop.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional // Bắt buộc phải có để Rollback nếu lỗi giữa chừng
    public VoucherResponse createVoucher(VoucherCreateRequest request) {

        // 1. Kiểm tra trùng mã (Yêu cầu báo lỗi 409 trong thiết kế)
        if (voucherRepository.existsByVoucherCode(request.getVoucherCode())) {
            throw new IllegalStateException("Mã voucher đã tồn tại");
        }

        // 2. Đổ dữ liệu vào Entity Voucher
        Voucher voucher = new Voucher();
        voucher.setVoucherCode(request.getVoucherCode().toUpperCase()); // Luôn viết hoa mã
        voucher.setDiscountPercentage(request.getDiscountPercentage());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setUsageLimit(request.getUsageLimit());

        // 3. Xử lý logic ApplyCondition (Nếu Frontend có gửi lên)
        if (request.getApplyCondition() != null) {
            ApplyCondition condition = new ApplyCondition();
            condition.setMinValue(request.getApplyCondition().getMinValue());

            // KẾT NỐI 2 CHIỀU (Bi-directional): Cực kỳ quan trọng để Cascade hoạt động
            condition.setVoucher(voucher);

            // Nếu có chỉ định áp dụng cho Sản phẩm cụ thể
            List<Long> variantIds = request.getApplyCondition().getProductVariantIds();
            if (variantIds != null && !variantIds.isEmpty()) {
                // Nhờ JPA lôi 1 phát tất cả các sản phẩm có ID trong mảng này lên
                List<ProductVariant> variants = productVariantRepository.findAllById(variantIds);
                condition.setProductVariants(variants);
            } else {
                // Nếu rỗng -> Áp dụng cho tất cả
                condition.setProductVariants(new ArrayList<>());
            }

            // Gắn Điều kiện vào Voucher
            voucher.setApplyCondition(condition);
        }

        // 4. Lưu xuống Database (Phép màu Cascade: Tự động lưu cả ApplyCondition và
        // Bảng trung gian)
        Voucher savedVoucher = voucherRepository.save(voucher);

        // 5. Trả về kết quả
        return VoucherResponse.builder()
                .voucherId(savedVoucher.getVoucherId())
                .voucherCode(savedVoucher.getVoucherCode())
                .discountPercentage(savedVoucher.getDiscountPercentage())
                .maxDiscountAmount(savedVoucher.getMaxDiscountAmount())
                .startDate(savedVoucher.getStartDate())
                .endDate(savedVoucher.getEndDate())
                .usageLimit(savedVoucher.getUsageLimit())
                .build();
    }
}