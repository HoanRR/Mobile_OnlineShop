package com.PBL3.Mobile_OnlineShop.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.DeviceRepository;
import com.PBL3.Mobile_OnlineShop.Repository.ProductRepository;
import com.PBL3.Mobile_OnlineShop.Repository.ProductVariantRepository;
import com.PBL3.Mobile_OnlineShop.Repository.WarrantyRepository;
import com.PBL3.Mobile_OnlineShop.dto.request.AddProductRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.ImportDevicesRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.VariantRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.GetDevicesResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.ImportDevicesResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.DevicesResponse;
import com.PBL3.Mobile_OnlineShop.dto.response.WarrantyResponse;
import com.PBL3.Mobile_OnlineShop.entity.Device;
import com.PBL3.Mobile_OnlineShop.entity.Product;
import com.PBL3.Mobile_OnlineShop.entity.ProductVariant;
import com.PBL3.Mobile_OnlineShop.entity.Warranty;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductService {
    ProductRepository productRepository;
    DeviceRepository deviceRepository;
    ProductVariantRepository productVariantRepository;
    WarrantyRepository warrantyRepository;

    public ImportDevicesResponse importDevices(ImportDevicesRequest request) {

        for (String imei : request.getImei_list()) {
            if (deviceRepository.existsByImei(imei)) {
                throw new AppException(ErrorCode.IMEI_EXISTS, "IMEI " + imei + " đã tồn tại trong hệ thống");
            }
        }

        ProductVariant productVariant = productVariantRepository
                .findByProductVariantId(request.getProduct_variant_id());
        if (productVariant == null) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND,
                    "Không tìm thấy mẫu sản phẩm (Product Variant) với ID: " + request.getProduct_variant_id());
        }

        List<DevicesResponse> listDeviceInfo = new ArrayList<>();
        for (String imei : request.getImei_list()) {
            Device device = Device.builder()
                    .imei(imei)
                    .status("AVAILABLE")
                    .productVariant(productVariant)
                    .build();

            Device savedDevice = deviceRepository.save(device);
            DevicesResponse info = DevicesResponse.builder()
                    .devices_id(savedDevice.getDeviceId())
                    .imei(savedDevice.getImei())
                    .status(savedDevice.getStatus())
                    .build();
            listDeviceInfo.add(info);
        }

        // Cập nhật lại số lượng totalAvailable cho ProductVariant
        long availableCount = deviceRepository.countByProductVariantAndStatus(productVariant, "AVAILABLE");
        productVariant.setTotalAvailable(availableCount);
        productVariantRepository.save(productVariant);

        return ImportDevicesResponse.builder()
                .imported(request.getImei_list().size())
                .devices(listDeviceInfo)
                .build();
    }

    public GetDevicesResponse GetDevices(String imei) {
        Device device = deviceRepository.findByImei(imei).orElseThrow(
                () -> new AppException(ErrorCode.DEVICES_NOT_FOUND, "Không tìm thấy thiết bị với imei:" + imei));
        Warranty warranty = warrantyRepository.findByDevice_DeviceId(device.getDeviceId()).orElseThrow(
                () -> new AppException(ErrorCode.WARRANTY_NOT_FOUND, "Không tìm thấy bảo hành của imei" + imei));
        return GetDevicesResponse.builder()
                .deviceId(device.getDeviceId())
                .imei(device.getImei())
                .status(device.getStatus())
                .productVariantId(device.getProductVariant().getProductVariantId())
                .productName(device.getProductVariant().getProduct().getProductName())
                .color(device.getProductVariant().getColor())
                .warratyInfo(WarrantyResponse.builder()
                        .warrantyId(warranty.getWarrantyId())
                        .startDate(warranty.getStartDate())
                        .endDate(warranty.getEndDate())
                        .warrantyMonth(warranty.getWarrantyMonth())
                        .build())
                .build();
    }

    public void AddProduct(AddProductRequest request) {

        if (productRepository.existsByProductName(request.getProduct_name())) {
            Product product = productRepository.findByProductName(request.getProduct_name())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, "Không tìm thấy sản phẩm với tên:" + request.getProduct_name()));
            
            for (VariantRequest variantRequest : request.getVariants()){
                ProductVariant productVariant = productVariantMapper.toProductVariant(variantRequest);
                productVariant.setProduct(product);
                productVariantRepository.save(productVariant);
            }
        }
        else{
            Product product = Product.builder()
                    .productName(request.getProduct_name())
                    .brand(request.getBrand())
                    .productImageLink(request.getProduct_image_link())
                        .build();
            }
        }
    }

}
