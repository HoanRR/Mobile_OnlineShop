package com.PBL3.Mobile_OnlineShop.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.ProductVariantRepository;
import com.PBL3.Mobile_OnlineShop.Repository.VoucherRepository;
import com.PBL3.Mobile_OnlineShop.dto.request.CreateVoucherRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateVoucherRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.ValidateVoucherRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.ValidateVoucherResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.VoucherResponse;
import com.PBL3.Mobile_OnlineShop.entity.ApplyCondition;
import com.PBL3.Mobile_OnlineShop.entity.ProductVariant;
import com.PBL3.Mobile_OnlineShop.entity.Voucher;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoucherService {

    VoucherRepository voucherRepository;
    ProductVariantRepository productVariantRepository;

    // =========================================================
    // CREATE VOUCHER (admin)
    // =========================================================
    @Transactional
    public VoucherResponse CreateVoucher(CreateVoucherRequest request) {
        if (voucherRepository.existsByVoucherCode(request.getVoucher_code())) {
            throw new AppException(ErrorCode.VOUCHER_EXISTS);
        }

        Voucher voucher = Voucher.builder()
                .voucherCode(request.getVoucher_code())
                .discountPercentage(request.getDiscount_percentage())
                .startDate(LocalDateTime.parse(request.getStart_date()))
                .endDate(LocalDateTime.parse(request.getEnd_date()))
                .usageLimit(request.getUsage_limit())
                .build();

        if (voucher.getStartDate().isAfter(voucher.getEndDate())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ngày bắt đầu và kết thúc không hợp lệ");
        }

        if (request.getApply_condition() != null) {
            ApplyCondition applyCondition = ApplyCondition.builder()
                    .voucher(voucher)
                    .minValue(request.getApply_condition().getMin_value())
                    .build();
            List<Long> variantIds = request.getApply_condition().getProduct_variant_ids();
            if (variantIds != null && !variantIds.isEmpty()) {
                applyCondition.setProductVariants(productVariantRepository.findAllById(variantIds));
            } else {
                applyCondition.setProductVariants(productVariantRepository.findAll());
            }
            voucher.setApplyConditions(applyCondition);
        }

        return toVoucherResponse(voucherRepository.save(voucher));
    }

    // =========================================================
    // UPDATE VOUCHER (admin)
    // =========================================================
    @Transactional
    public void UpdateVoucher(Long voucher_id, UpdateVoucherRequest request) {
        Voucher voucher = voucherRepository.findById(voucher_id)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND,
                        "Không tìm thấy voucher với id: " + voucher_id));

        if (request.getVoucher_code() != null && !request.getVoucher_code().isBlank()) {
            if (!request.getVoucher_code().equals(voucher.getVoucherCode())
                    && voucherRepository.existsByVoucherCode(request.getVoucher_code())) {
                throw new AppException(ErrorCode.VOUCHER_EXISTS,
                        "Mã voucher '" + request.getVoucher_code() + "' đã tồn tại");
            }
            voucher.setVoucherCode(request.getVoucher_code());
        }
        if (request.getDiscount_percentage() != null)
            voucher.setDiscountPercentage(request.getDiscount_percentage());
        if (request.getStart_date() != null && !request.getStart_date().isBlank())
            voucher.setStartDate(LocalDateTime.parse(request.getStart_date()));
        if (request.getEnd_date() != null && !request.getEnd_date().isBlank())
            voucher.setEndDate(LocalDateTime.parse(request.getEnd_date()));
        if (voucher.getStartDate() != null && voucher.getEndDate() != null
                && voucher.getStartDate().isAfter(voucher.getEndDate()))
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ngày bắt đầu phải trước ngày kết thúc");
        if (request.getUsage_limit() != null)
            voucher.setUsageLimit(request.getUsage_limit());

        if (request.getApply_condition() != null) {
            ApplyCondition condition = voucher.getApplyConditions();
            if (condition == null) condition = ApplyCondition.builder().voucher(voucher).build();
            if (request.getApply_condition().getMin_value() != null)
                condition.setMinValue(request.getApply_condition().getMin_value());
            List<Long> variantIds = request.getApply_condition().getProduct_variant_ids();
            if (variantIds != null && !variantIds.isEmpty())
                condition.setProductVariants(productVariantRepository.findAllById(variantIds));
            voucher.setApplyConditions(condition);
        }

        voucherRepository.save(voucher);
    }

    // =========================================================
    // GET AVAILABLE VOUCHERS (customer xem danh sách)
    // Chỉ lọc theo: còn thời hạn, còn usageLimit, đạt min_value (nếu truyền)
    // =========================================================
    @Transactional(readOnly = true)
    public List<VoucherResponse> getAvailableVouchers(Double orderTotal) {
        LocalDateTime now = LocalDateTime.now();
        return voucherRepository.findAll().stream()
                .filter(v -> isActive(v, now))
                .filter(v -> orderTotal == null || meetsMinValue(v, orderTotal))
                .map(this::toVoucherResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // VALIDATE VOUCHER (trước khi đặt hàng)
    // Kiểm tra: thời hạn → usageLimit → min_value → tính giảm giá
    // =========================================================
    @Transactional(readOnly = true)
    public ValidateVoucherResponse validateVoucher(ValidateVoucherRequest request) {
        Voucher voucher = voucherRepository.findByVoucherCode(request.getVoucherCode())
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();

        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate()))
            throw new AppException(ErrorCode.VOUCHER_EXPIRED, "Voucher chưa bắt đầu");
        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate()))
            throw new AppException(ErrorCode.VOUCHER_EXPIRED, "Voucher đã hết hạn");
        if (voucher.getUsageLimit() != null && voucher.getUsageLimit() <= 0)
            throw new AppException(ErrorCode.VOUCHER_INVALID, "Voucher đã hết lượt sử dụng");

        ApplyCondition condition = voucher.getApplyConditions();
        if (condition != null && condition.getMinValue() != null
                && request.getOrderTotal() < condition.getMinValue()) {
            throw new AppException(ErrorCode.VOUCHER_INVALID_MIN_VALUE,
                    "Đơn hàng tối thiểu " + condition.getMinValue() + " VNĐ để sử dụng voucher này");
        }

        double discountAmount = request.getOrderTotal() * (voucher.getDiscountPercentage() / 100);
        double finalTotal     = request.getOrderTotal() - discountAmount;

        return ValidateVoucherResponse.builder()
                .valid(true)
                .voucherId(voucher.getVoucherId())
                .voucherCode(voucher.getVoucherCode())
                .discountPercentage(voucher.getDiscountPercentage())
                .discountAmount(discountAmount)
                .finalTotal(finalTotal)
                .endDate(voucher.getEndDate() != null ? voucher.getEndDate().toString() : null)
                .usageLimit(voucher.getUsageLimit())
                .build();
    }

    // =========================================================
    // PRIVATE HELPERS
    // =========================================================

    private boolean isActive(Voucher v, LocalDateTime now) {
        if (v.getStartDate() != null && now.isBefore(v.getStartDate())) return false;
        if (v.getEndDate()   != null && now.isAfter(v.getEndDate()))    return false;
        if (v.getUsageLimit() != null && v.getUsageLimit() <= 0)        return false;
        return true;
    }

    private boolean meetsMinValue(Voucher v, Double orderTotal) {
        ApplyCondition cond = v.getApplyConditions();
        if (cond == null || cond.getMinValue() == null) return true;
        return orderTotal >= cond.getMinValue();
    }

    private VoucherResponse toVoucherResponse(Voucher v) {
        VoucherResponse.ApplyConditionResponse condResponse = null;
        ApplyCondition cond = v.getApplyConditions();
        if (cond != null) {
            condResponse = VoucherResponse.ApplyConditionResponse.builder()
                    .min_value(cond.getMinValue())
                    .build();
        }
        return VoucherResponse.builder()
                .voucher_id(v.getVoucherId())
                .voucher_code(v.getVoucherCode())
                .discount_percentage(v.getDiscountPercentage())
                .start_date(v.getStartDate() != null ? v.getStartDate().toString() : null)
                .end_date(v.getEndDate()     != null ? v.getEndDate().toString()   : null)
                .usage_limit(v.getUsageLimit())
                .apply_condition(condResponse)
                .build();
    }
}