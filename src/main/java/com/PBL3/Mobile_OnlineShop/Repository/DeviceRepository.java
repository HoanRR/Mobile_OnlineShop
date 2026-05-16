package com.PBL3.Mobile_OnlineShop.Repository;

import com.PBL3.Mobile_OnlineShop.entity.Device;
import com.PBL3.Mobile_OnlineShop.entity.ProductVariant;
import com.PBL3.Mobile_OnlineShop.enums.DeviceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    boolean existsByImei(String imei);
    Optional<Device> findByImei(String imei);
    long countByProductVariantAndStatus(ProductVariant productVariant, DeviceStatus status);
}
