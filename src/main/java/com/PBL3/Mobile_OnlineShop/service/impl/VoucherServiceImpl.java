package com.PBL3.Mobile_OnlineShop.service.impl;

import com.PBL3.Mobile_OnlineShop.dto.request.VoucherCreateRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.VoucherExtendRequest;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Import 2 anh bạn này vào
import com.PBL3.Mobile_OnlineShop.exception.AppException;
import com.PBL3.Mobile_OnlineShop.exception.ErrorCode;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherCreateRequest request) {

        // CMT: Đổi sang lỗi VOUCHER_EXISTS mà bạn vừa khai báo trong ErrorCode
        if (voucherRepository.existsByVoucherCode(request.getVoucherCode())) {
            throw new AppException(ErrorCode.VOUCHER_EXISTS);
        }

        // ... (Phần đổ dữ liệu giữ nguyên)
        Voucher voucher = new Voucher();
        voucher.setVoucherCode(request.getVoucherCode().toUpperCase());
        voucher.setDiscountPercentage(request.getDiscountPercentage());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setUsedCount(0L);

        if (request.getApplyCondition() != null) {
            ApplyCondition condition = new ApplyCondition();
            condition.setMinValue(request.getApplyCondition().getMinValue());
            condition.setVoucher(voucher);

            List<Long> variantIds = request.getApplyCondition().getProductVariantIds();
            if (variantIds != null && !variantIds.isEmpty()) {
                List<ProductVariant> variants = productVariantRepository.findAllById(variantIds);
                condition.setProductVariants(variants);
            } else {
                condition.setProductVariants(new ArrayList<>());
            }
            voucher.setApplyCondition(condition);
        }

        Voucher savedVoucher = voucherRepository.save(voucher);

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

    @Transactional
    @Override
    public void extendVoucher(Long voucherId, VoucherExtendRequest request) {

        // CMT: Dùng ErrorCode mới tạo
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        LocalDateTime newEndDate = request.getEndDate();

        if (voucher.getStartDate() != null && newEndDate.isBefore(voucher.getStartDate())) {
            // CMT: Bắn lỗi custom message
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ngày kết thúc không hợp lệ");
        }

        if (voucher.getEndDate() != null && newEndDate.isBefore(voucher.getEndDate())) {
            // CMT: Bắn lỗi custom message
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chỉ được gia hạn, không được rút ngắn");
        }

        voucher.setEndDate(newEndDate);

        if (request.getUsageLimit() != null) {
            if (request.getUsageLimit() < voucher.getUsedCount()) {
                // CMT: Bắn lỗi custom message
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Usage limit không được nhỏ hơn số đã sử dụng");
            }
            voucher.setUsageLimit(request.getUsageLimit());
        }
    }
}