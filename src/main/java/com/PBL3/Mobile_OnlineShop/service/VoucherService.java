package com.PBL3.Mobile_OnlineShop.service;

import com.PBL3.Mobile_OnlineShop.dto.request.VoucherCreateRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.VoucherExtendRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.VoucherResponse;

public interface VoucherService {
    VoucherResponse createVoucher(VoucherCreateRequest request);
    void extendVoucher(Long voucherId, VoucherExtendRequest request);
}
