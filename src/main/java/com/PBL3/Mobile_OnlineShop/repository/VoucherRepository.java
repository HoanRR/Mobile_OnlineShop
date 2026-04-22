package com.PBL3.Mobile_OnlineShop.repository;

import com.PBL3.Mobile_OnlineShop.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    // Hàm check trùng mã (Trả về true nếu đã có mã này)
    boolean existsByVoucherCode(String voucherCode);
}