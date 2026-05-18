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
                if (errData.message) errorMsg = errData.message;
            } catch (e) {}
            resultDiv.innerHTML = `<div class="empty-state" style="color: red;">${errorMsg}</div>`;
            return;
        }

        const data = await response.json();
        renderWarranty(data);
    } catch (error) {
        console.error('Lỗi tra cứu bảo hành:', error);
        resultDiv.innerHTML = '<div class="empty-state" style="color: red;">Lỗi kết nối. Vui lòng thử lại!</div>';
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
            <div style="margin-top: 15px; text-align: center;">
                <button class="btn-action" style="background-color:#28a745; color:white; padding:10px 20px; border:none; border-radius:8px; cursor:pointer; font-weight:600;" onclick="xuLyBaoHanhDoiTra('${data.imei}', 'COMPLETE_WARRANTY')">Hoàn thành bảo hành</button>
            </div>
        `;
    } else if (data.device_status === 'RETURNED') {
        actionButtons = `
            <div style="margin-top: 15px; text-align: center; display:flex; gap:10px; justify-content:center;">
                <button class="btn-action" style="background-color:#28a745; color:white; padding:10px 20px; border:none; border-radius:8px; cursor:pointer; font-weight:600;" onclick="xuLyBaoHanhDoiTra('${data.imei}', 'CONFIRM_RETURN_GOOD')">Nhập lại kho (Tốt)</button>
                <button class="btn-action" style="background-color:#dc3545; color:white; padding:10px 20px; border:none; border-radius:8px; cursor:pointer; font-weight:600;" onclick="xuLyBaoHanhDoiTra('${data.imei}', 'CONFIRM_RETURN_DEFECTIVE')">Báo hỏng (Lỗi)</button>
            </div>
        `;
    }

    resultDiv.innerHTML = `
        <div class="warranty-card" style="max-width: 600px; margin: 20px auto; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div class="warranty-item" style="display:flex; justify-content:space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                <span style="color: #666;">IMEI:</span><strong style="color: #333;">${data.imei}</strong>
            </div>
            <div class="warranty-item" style="display:flex; justify-content:space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                <span style="color: #666;">Sản phẩm:</span><strong style="color: #333;">${data.product_name} (${data.color})</strong>
            </div>
            <div class="warranty-item" style="display:flex; justify-content:space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                <span style="color: #666;">Ngày bắt đầu:</span><strong style="color: #333;">${formatDate(data.start_date)}</strong>
            </div>
            <div class="warranty-item" style="display:flex; justify-content:space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                <span style="color: #666;">Ngày hết hạn:</span><strong style="color: #333;">${formatDate(data.end_date)}</strong>
            </div>
            <div class="warranty-item" style="display:flex; justify-content:space-between; padding: 12px 0; border-bottom: 1px solid #eee; align-items: center;">
                <span style="color: #666;">Hạn bảo hành:</span><strong class="warranty-badge ${badgeClass}" style="padding: 4px 10px; border-radius: 4px; color: white; background: ${valid ? '#28a745' : '#dc3545'}; font-size: 13px;">${badgeText}</strong>
            </div>
            <div class="warranty-item" style="display:flex; justify-content:space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                <span style="color: #666;">Trạng thái thiết bị:</span><strong style="color: ${data.device_status === 'WARRANTY' ? '#ff9800' : data.device_status === 'RETURNED' ? '#dc3545' : '#28a745'};">${statusText}</strong>
            </div>
            ${actionButtons}
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
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product_name} (${item.color})</td>
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

    if (!confirm(confirmMsg)) return;

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
            let errorMsg = `Thao tác thất bại`;
            try {
                const errorData = await response.json();
                if (errorData.message) errorMsg = errorData.message;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        alert('Xử lý thành công!');
        lookupWarranty();
        taiDanhSachYeuCau();
    } catch (loi) {
        console.error('Lỗi khi xử lý bảo hành/đổi trả:', loi);
        alert(loi.message || 'Thao tác thất bại. Vui lòng thử lại!');
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
