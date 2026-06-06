function formatDate(dateValue) {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;
    return date.toLocaleDateString('vi-VN');
}

async function lookupWarranty() {
    const imei = document.getElementById('warrantyImei')?.value.trim().toUpperCase();
    const resultDiv = document.getElementById('warrantyResult');
    
    if (!imei) {
        resultDiv.innerHTML = '<div class="empty-state">Vui lòng nhập IMEI để tra cứu.</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="empty-state">Đang tra cứu...</div>';

    try {
        const accessToken = localStorage.getItem('accessToken') || '';
        
        const response = await fetch(`http://localhost:8080/api/staff/warranty/${imei}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            let errorMsg = 'Không tìm thấy thông tin bảo hành cho IMEI này.';
            try {
                const errData = await response.json();
                if (errData.error && errData.error.message) {
                    errorMsg = errData.error.message;
                } else if (errData.message) {
                    errorMsg = errData.message;
                }
            } catch (e) {}
            resultDiv.innerHTML = `<div class="empty-state" style="color: var(--red);">${errorMsg}</div>`;
            return;
        }

        const data = await response.json();
        renderWarranty(data);
    } catch (error) {
        console.error('Lỗi tra cứu bảo hành:', error);
        resultDiv.innerHTML = '<div class="empty-state" style="color: var(--red);">Lỗi kết nối. Vui lòng thử lại!</div>';
    }
}

function renderWarranty(data) {
    const resultDiv = document.getElementById('warrantyResult');
    if (!resultDiv) return;

    const valid = data.is_valid;
    const badgeClass = valid ? 'valid' : 'expired';
    const badgeText = valid ? 'Còn bảo hành' : 'Hết bảo hành';
    
    const statusText = data.device_status === 'WARRANTY' ? 'Đang bảo hành' : 
                       data.device_status === 'RETURNED' ? 'Đã yêu cầu đổi/trả' : 
                       data.device_status === 'SOLD' ? 'Bình thường (Đã bán)' : data.device_status;

    let actionButtons = '';
    if (data.device_status === 'WARRANTY') {
        actionButtons = `
            <div style="display: flex; gap: 12px; justify-content: center; width: 100%;">
                <button class="btn-action" style="background-color: var(--green); color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s;" onclick="xuLyBaoHanhDoiTra('${data.imei}', 'COMPLETE_WARRANTY')">
                    <i class="fa-solid fa-circle-check"></i> Hoàn thành bảo hành
                </button>
            </div>
        `;
    } else if (data.device_status === 'RETURNED') {
        actionButtons = `
            <div style="display: flex; gap: 12px; justify-content: center; width: 100%; flex-wrap: wrap;">
                <button class="btn-action" style="background-color: var(--green); color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s;" onclick="xuLyBaoHanhDoiTra('${data.imei}', 'CONFIRM_RETURN_GOOD')">
                    <i class="fa-solid fa-boxes-stacked"></i> Nhập lại kho (Tốt)
                </button>
                <button class="btn-action" style="background-color: var(--red); color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s;" onclick="xuLyBaoHanhDoiTra('${data.imei}', 'CONFIRM_RETURN_DEFECTIVE')">
                    <i class="fa-solid fa-circle-xmark"></i> Báo hỏng (Lỗi)
                </button>
            </div>
        `;
    }

    resultDiv.innerHTML = `
        <div class="warranty-card">
            <div class="warranty-item">
                <span>IMEI thiết bị</span>
                <strong>${data.imei}</strong>
            </div>
            <div class="warranty-item">
                <span>Sản phẩm</span>
                <strong>${data.product_name} (${data.color})</strong>
            </div>
            <div class="warranty-item">
                <span>Ngày kích hoạt</span>
                <strong>${formatDate(data.start_date)}</strong>
            </div>
            <div class="warranty-item">
                <span>Ngày hết hạn</span>
                <strong>${formatDate(data.end_date)}</strong>
            </div>
            <div class="warranty-item">
                <span>Trạng thái bảo hành</span>
                <div>
                    <span class="warranty-badge ${badgeClass}">${badgeText}</span>
                </div>
            </div>
            <div class="warranty-item">
                <span>Trạng thái thiết bị</span>
                <strong style="color: ${data.device_status === 'WARRANTY' ? 'var(--orange, #ff9800)' : data.device_status === 'RETURNED' ? 'var(--red)' : 'var(--green)'};">${statusText}</strong>
            </div>
            ${data.request_reason ? `
            <div class="warranty-item" style="grid-column: 1 / -1; background: rgba(255, 152, 0, 0.08); padding: 10px 14px; border-radius: 8px; border-left: 4px solid #ff9800; margin-top: 10px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
                <span style="font-size: 12px; color: var(--muted); font-weight:600;">Lý do khách hàng yêu cầu</span>
                <strong style="color: var(--text); font-style: italic; font-weight: 500;">"${data.request_reason}"</strong>
            </div>
            ` : ''}
            ${actionButtons ? `
            <div class="warranty-actions-wrap" style="grid-column: 1 / -1; margin-top: 10px; display: flex; justify-content: center; width: 100%;">
                ${actionButtons}
            </div>
            ` : ''}
        </div>
    `;
}

async function taiDanhSachYeuCau() {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;

    try {
        const accessToken = localStorage.getItem('accessToken') || '';
        
        const response = await fetch(`http://localhost:8080/api/staff/warranty/requests`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Không thể tải danh sách yêu cầu');

        const data = await response.json();
        
        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;padding:20px;color:#888;">
                        Không có yêu cầu nào đang chờ xử lý.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        data.forEach(item => {
            const statusText = item.device_status === 'WARRANTY' ? 'Yêu cầu bảo hành' : 'Yêu cầu đổi trả';
            const statusColor = item.device_status === 'WARRANTY' ? '#ff9800' : '#dc3545';
            
            let actions = '';
            if (item.device_status === 'WARRANTY') {
                actions = `
                    <button class="btn-action" style="background-color:#28a745; color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer;" onclick="xuLyBaoHanhDoiTra('${item.imei}', 'COMPLETE_WARRANTY')">Hoàn thành</button>
                    <button class="btn-action" style="background-color:#dc3545; color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer;" onclick="xuLyBaoHanhDoiTra('${item.imei}', 'REJECT')">Từ chối</button>
                `;
            } else if (item.device_status === 'RETURNED') {
                actions = `
                    <button class="btn-action" style="background-color:#28a745; color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer;" onclick="xuLyBaoHanhDoiTra('${item.imei}', 'CONFIRM_RETURN_GOOD')">Duyệt (Tốt)</button>
                    <button class="btn-action" style="background-color:#ff9800; color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer;" onclick="xuLyBaoHanhDoiTra('${item.imei}', 'CONFIRM_RETURN_DEFECTIVE')">Duyệt (Lỗi)</button>
                    <button class="btn-action" style="background-color:#dc3545; color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer;" onclick="xuLyBaoHanhDoiTra('${item.imei}', 'REJECT')">Từ chối</button>
                `;
            }

            html += `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${item.imei}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <strong>${item.product_name} (${item.color})</strong>
                        ${item.request_reason ? `<br><span style="font-size: 11px; font-style: italic; color: #888;">Lý do: "${item.request_reason}"</span>` : ''}
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><span style="color: ${statusColor}; font-weight:600;">${statusText}</span></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; display:flex; gap:5px;">${actions}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    } catch (error) {
        console.error('Lỗi tải danh sách yêu cầu:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;padding:20px;color:red;">
                    Không thể tải danh sách yêu cầu.
                </td>
            </tr>
        `;
    }
}

async function xuLyBaoHanhDoiTra(imei, action) {
    let confirmMsg = 'Bạn có chắc chắn muốn thực hiện thao tác này?';
    if (action === 'COMPLETE_WARRANTY') confirmMsg = 'Xác nhận hoàn thành bảo hành cho thiết bị này?';
    if (action === 'CONFIRM_RETURN_GOOD') confirmMsg = 'Xác nhận nhập lại kho thiết bị này?';
    if (action === 'CONFIRM_RETURN_DEFECTIVE') confirmMsg = 'Xác nhận báo hỏng thiết bị này?';
    if (action === 'REJECT') confirmMsg = 'Xác nhận từ chối yêu cầu này?';

    const ok = await showConfirm(confirmMsg, {
        title: 'Xác nhận xử lý',
        type: 'warning',
        okText: 'Xác nhận',
        cancelText: 'Hủy'
    });
    if (!ok) return;

    try {
        const accessToken = localStorage.getItem('accessToken') || '';
        
        const response = await fetch(`http://localhost:8080/api/staff/orders/process-warranty-return?imei=${imei}&action=${action}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.error?.message || err?.message || `HTTP ${response.status}`);
        }

        showToast('Xử lý thành công!', 'success');
        lookupWarranty();
        taiDanhSachYeuCau();
    } catch (loi) {
        console.error('Lỗi khi xử lý bảo hành/đổi trả:', loi);
        showToast(loi.message || 'Thao tác thất bại. Vui lòng thử lại!', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const lookupBtn = document.getElementById('warrantyLookupBtn');
    const imeiInput = document.getElementById('warrantyImei');

    if (lookupBtn) {
        lookupBtn.addEventListener('click', lookupWarranty);
    }
    
    if (imeiInput) {
        imeiInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') lookupWarranty();
        });
    }

    taiDanhSachYeuCau();
});

window.xuLyBaoHanhDoiTra = xuLyBaoHanhDoiTra;
window.lookupWarranty = lookupWarranty;
window.taiDanhSachYeuCau = taiDanhSachYeuCau;
