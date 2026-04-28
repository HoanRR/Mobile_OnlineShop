package com.PBL3.Mobile_OnlineShop.Repository;

import com.PBL3.Mobile_OnlineShop.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    boolean existsByVoucherCode(String voucher_code);
}
