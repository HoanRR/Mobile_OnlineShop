package com.PBL3.Mobile_OnlineShop.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.dto.response.WarrantyDetailResponse;
import com.PBL3.Mobile_OnlineShop.entity.Device;
import com.PBL3.Mobile_OnlineShop.entity.Warranty;
import com.PBL3.Mobile_OnlineShop.Repository.DeviceRepository;
import com.PBL3.Mobile_OnlineShop.Repository.WarrantyRepository;
import com.PBL3.Mobile_OnlineShop.enums.DeviceStatus;
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

        // 3. Kiểm tra hạn bảo hành
        boolean isValid = !warranty.getEndDate().isBefore(LocalDateTime.now());

        // 4. Trả về thông tin (200 OK)
        return WarrantyDetailResponse.builder()
                .warrantyId(warranty.getWarrantyId())
                .deviceId(device.getDeviceId())
                .imei(device.getImei())
                .productName(device.getProductVariant().getProduct().getProductName())
                .color(device.getProductVariant().getColor())
                .startDate(warranty.getStartDate())
                .endDate(warranty.getEndDate())
                .warrantyMonth(warranty.getWarrantyMonth())
                .isValid(isValid)
                .deviceStatus(device.getStatus().name())
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.List<WarrantyDetailResponse> getWarrantyRequests() {
        java.util.List<Device> warrantyDevices = deviceRepository.findByStatus(DeviceStatus.WARRANTY);
        java.util.List<Device> returnedDevices = deviceRepository.findByStatus(DeviceStatus.RETURNED);

        java.util.List<Device> allRequests = new java.util.ArrayList<>();
        allRequests.addAll(warrantyDevices);
        allRequests.addAll(returnedDevices);

        return allRequests.stream().map(device -> {
            Warranty warranty = warrantyRepository.findFirstByDeviceOrderByEndDateDesc(device).orElse(null);
            
            return WarrantyDetailResponse.builder()
                    .warrantyId(warranty != null ? warranty.getWarrantyId() : null)
                    .deviceId(device.getDeviceId())
                    .imei(device.getImei())
                    .productName(device.getProductVariant().getProduct().getProductName())
                    .color(device.getProductVariant().getColor())
                    .startDate(warranty != null ? warranty.getStartDate() : null)
                    .endDate(warranty != null ? warranty.getEndDate() : null)
                    .warrantyMonth(warranty != null ? warranty.getWarrantyMonth() : null)
                    .isValid(warranty != null ? !warranty.getEndDate().isBefore(LocalDateTime.now()) : false)
                    .deviceStatus(device.getStatus().name())
                    .build();
        }).collect(java.util.stream.Collectors.toList());
    }
}