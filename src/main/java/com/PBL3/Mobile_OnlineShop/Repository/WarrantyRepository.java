package com.PBL3.Mobile_OnlineShop.Repository;

import com.PBL3.Mobile_OnlineShop.entity.Device;
import com.PBL3.Mobile_OnlineShop.entity.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, Long> {
    Optional<Warranty> findByDevice_DeviceId(Long deviceId);

    Optional<Warranty> findFirstByDeviceOrderByEndDateDesc(Device device);
}
