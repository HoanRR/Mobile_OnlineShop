package com.PBL3.Mobile_OnlineShop.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.ProductVariantRepository;
import com.PBL3.Mobile_OnlineShop.Repository.VoucherRepository;
import com.PBL3.Mobile_OnlineShop.dto.request.CreateVoucherRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateVoucherRequest;
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

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoucherService {
    VoucherRepository voucherRepository;
    ProductVariantRepository productVariantRepository;
    @Transactional
    public VoucherResponse CreateVoucher(CreateVoucherRequest request){
        if (voucherRepository.existsByVoucherCode(request.getVoucher_code())){
            throw new AppException(ErrorCode.VOUCHER_EXISTS);
        }
        String startDateString, endDateString;

        Voucher voucher = Voucher.builder()
                .voucherCode(request.getVoucher_code())
                .discountPercentage(request.getDiscount_percentage())
                .startDate(LocalDateTime.parse(request.getStart_date()))
                .endDate(LocalDateTime.parse(request.getEnd_date()))
                .usageLimit(request.getUsage_limit())
                .build();

        if ( voucher.getStartDate().isAfter(voucher.getEndDate())){
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ngày bắt đầu và kết thúc không hợp lệ");
        }

        if (request.getApply_condition() != null){

            ApplyCondition applyCondition = ApplyCondition.builder()
                    .voucher(voucher)
                    .minValue(request.getApply_condition().getMin_value())
                    .build();
            List<Long> variantIds = request.getApply_condition().getProduct_variant_ids();
            if (variantIds != null && !variantIds.isEmpty()){
                List<ProductVariant> variants = productVariantRepository.findAllById(variantIds);
                applyCondition.setProductVariants(variants);
            }
            else {
                applyCondition.setProductVariants(productVariantRepository.findAll());
            }
            voucher.setApplyConditions(applyCondition);
        }

        Voucher vouchersave = voucherRepository.save(voucher);

        return VoucherResponse.builder()
                .voucher_id(vouchersave.getVoucherId())
                .discount_percentage(vouchersave.getDiscountPercentage())
                .voucher_code(vouchersave.getVoucherCode())
                .end_date(vouchersave.getEndDate().toString())
                .start_date(vouchersave.getStartDate().toString())
                .usage_limit(vouchersave.getUsageLimit())
                .build();
    }

    @Transactional
    public void UpdateVoucher(Long voucher_id, UpdateVoucherRequest request) {
        Voucher voucher = voucherRepository.findById(voucher_id)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND,
                        "Không tìm thấy voucher với id: " + voucher_id));

        // Cập nhật các trường nếu có giá trị mới (PATCH semantics)
        if (request.getVoucher_code() != null && !request.getVoucher_code().isBlank()) {
            if (!request.getVoucher_code().equals(voucher.getVoucherCode())
                    && voucherRepository.existsByVoucherCode(request.getVoucher_code())) {
                throw new AppException(ErrorCode.VOUCHER_EXISTS,
                        "Mã voucher '" + request.getVoucher_code() + "' đã tồn tại");
            }
            voucher.setVoucherCode(request.getVoucher_code());
        }
        if (request.getDiscount_percentage() != null) {
            voucher.setDiscountPercentage(request.getDiscount_percentage());
        }
        if (request.getStart_date() != null && !request.getStart_date().isBlank()) {
            voucher.setStartDate(LocalDateTime.parse(request.getStart_date()));
        }
        if (request.getEnd_date() != null && !request.getEnd_date().isBlank()) {
            voucher.setEndDate(LocalDateTime.parse(request.getEnd_date()));
        }
        if (voucher.getStartDate() != null && voucher.getEndDate() != null
                && voucher.getStartDate().isAfter(voucher.getEndDate())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ngày bắt đầu phải trước ngày kết thúc");
        }
        if (request.getUsage_limit() != null) {
            voucher.setUsageLimit(request.getUsage_limit());
        }

        // Cập nhật điều kiện áp dụng nếu có
        if (request.getApply_condition() != null) {
            ApplyCondition condition = voucher.getApplyConditions();
            if (condition == null) {
                condition = ApplyCondition.builder().voucher(voucher).build();
            }
            if (request.getApply_condition().getMin_value() != null) {
                condition.setMinValue(request.getApply_condition().getMin_value());
            }
            List<Long> variantIds = request.getApply_condition().getProduct_variant_ids();
            if (variantIds != null && !variantIds.isEmpty()) {
                List<ProductVariant> variants = productVariantRepository.findAllById(variantIds);
                condition.setProductVariants(variants);
            }
            voucher.setApplyConditions(condition);
        }

        voucherRepository.save(voucher);

    }

}
