package com.PBL3.Mobile_OnlineShop.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.dto.response.WarrantyDetailResponse;
import com.PBL3.Mobile_OnlineShop.entity.Device;
import com.PBL3.Mobile_OnlineShop.entity.Warranty;
import com.PBL3.Mobile_OnlineShop.Repository.DeviceRepository;
import com.PBL3.Mobile_OnlineShop.Repository.WarrantyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WarrantyService {

    private final DeviceRepository deviceRepository;
    private final WarrantyRepository warrantyRepository;

    @Transactional(readOnly = true) // Tối ưu hiệu suất cho hàm chỉ đọc (GET)
    public WarrantyDetailResponse checkWarranty(String imei) {
        // 1. Kiểm tra IMEI có tồn tại không (Lỗi 404)
        Device device = deviceRepository.findByImei(imei)
                .orElseThrow(() -> new AppException(ErrorCode.IMEI_NOT_FOUND));

        // 2. Tìm gói bảo hành mới nhất của thiết bị này (Lỗi 400 nếu chưa kích hoạt)
        Warranty warranty = warrantyRepository.findFirstByDeviceOrderByEndDateDesc(device)
                .orElseThrow(() -> new AppException(ErrorCode.WARRANTY_NOT_ACTIVATED));

        // 3. Kiểm tra hạn bảo hành (Lỗi 422)
        if (warranty.getEndDate().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.WARRANTY_EXPIRED);
        }

        // 4. Nếu hợp lệ (Còn hạn), trả về thông tin (200 OK)
        return WarrantyDetailResponse.builder()
                .warrantyId(warranty.getWarrantyId())
                .deviceId(device.getDeviceId())
                .imei(device.getImei())
                .productName(device.getProductVariant().getProduct().getProductName())
                .color(device.getProductVariant().getColor())
                .startDate(warranty.getStartDate())
                .endDate(warranty.getEndDate())
                .warrantyMonth(warranty.getWarrantyMonth())
                .isValid(true)
                .build();
    }
}