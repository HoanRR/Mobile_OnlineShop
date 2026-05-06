package com.PBL3.Mobile_OnlineShop.Service;

import com.PBL3.Mobile_OnlineShop.Exeption.AppException;
import com.PBL3.Mobile_OnlineShop.Exeption.ErrorCode;
import com.PBL3.Mobile_OnlineShop.Repository.*;
import com.PBL3.Mobile_OnlineShop.dto.request.AddProductRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.ImportDevicesRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.UpdateProductRequest;
import com.PBL3.Mobile_OnlineShop.dto.request.VariantRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.*;
import com.PBL3.Mobile_OnlineShop.entity.*;
import com.PBL3.Mobile_OnlineShop.enums.DeviceStatus;
import com.PBL3.Mobile_OnlineShop.mapper.ProductMapper;
import com.PBL3.Mobile_OnlineShop.mapper.ProductVariantMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level =  AccessLevel.PRIVATE, makeFinal = true)
public class ProductService {
    ProductRepository productRepository;
    DeviceRepository deviceRepository;
    ProductVariantRepository productVariantRepository;
    WarrantyRepository warrantyRepository;
    ProductVariantMapper productVariantMapper;
    ProductMapper productMapper;
    OrderRepository orderRepository;
    OrderDetailRepository orderDetailRepository;

    public ImportDevicesResponse importDevices(ImportDevicesRequest request){

        for (String imei : request.getImei_list()) {
            if (deviceRepository.existsByImei(imei)) {
                throw new AppException(ErrorCode.IMEI_EXISTS, "IMEI " + imei + " đã tồn tại trong hệ thống");
            }
        }

        ProductVariant productVariant = productVariantRepository.findByProductVariantId(request.getProduct_variant_id());
        if (productVariant == null) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, "Không tìm thấy mẫu sản phẩm (Product Variant) với ID: " + request.getProduct_variant_id());
        }

        List<DevicesResponse> listDeviceInfo = new ArrayList<>();
        for (String imei : request.getImei_list()) {
            Device device = Device.builder()
                    .imei(imei)
                    .status(DeviceStatus.AVAILABLE)
                    .productVariant(productVariant)
                    .build();

            Device savedDevice = deviceRepository.save(device);
            DevicesResponse info = DevicesResponse.builder()
                    .devices_id(savedDevice.getDeviceId())
                    .imei(savedDevice.getImei())
                    .status(savedDevice.getStatus().toString())
                    .build();
            listDeviceInfo.add(info);
        }
        
        // Cập nhật lại số lượng totalAvailable cho ProductVariant
        long availableCount = deviceRepository.countByProductVariantAndStatus(productVariant, DeviceStatus.AVAILABLE);
        productVariant.setTotalAvailable(availableCount);
        productVariantRepository.save(productVariant);

        return ImportDevicesResponse.builder()
                .imported(request.getImei_list().size())
                .devices(listDeviceInfo)
                .build();
    }

    public GetDevicesResponse GetDevices(String imei){
        Device device = deviceRepository.findByImei(imei).orElseThrow(() -> new AppException(ErrorCode.DEVICES_NOT_FOUND, "Không tìm thấy thiết bị với imei:" + imei) );
        Warranty warranty = warrantyRepository.findByDevice_DeviceId(device.getDeviceId()).orElseThrow(() -> new AppException(ErrorCode.WARRANTY_NOT_FOUND, "Không tìm thấy bảo hành của imei" + imei));
        return GetDevicesResponse.builder()
                .deviceId(device.getDeviceId())
                .imei(device.getImei())
                .status(device.getStatus().toString())
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

    public void AddProduct(AddProductRequest request){
        if (request == null || request.getProduct_name() == null || request.getProduct_name().trim().isEmpty()
                || request.getVariants() == null || request.getVariants().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_DATA, "Tên sản phẩm và danh sách phiên bản không được để trống");
        }

        if (productRepository.existsByProductName(request.getProduct_name())){
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
            productRepository.save(product);
            for (VariantRequest variantRequest : request.getVariants()){
                ProductVariant productVariant = productVariantMapper.toProductVariant(variantRequest);
                productVariant.setProduct(product);
                productVariantRepository.save(productVariant);
            }
        }
    }

    public void UpdateProduct(UpdateProductRequest request, Long product_id){
        Product product = productRepository.findByProductId(product_id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, "Không tồn tại sản phẩm với id:" + product_id));
        productMapper.updateProductFromRequest(request, product);
        productRepository.save(product);
    }
    @Transactional
    public void DeleteProduct(Long product_id){
        // 1. Kiểm tra sản phẩm có tồn tại không (404)
        Product product = productRepository.findByProductId(product_id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND,
                        "Không tìm thấy sản phẩm với id: " + product_id));

        // 2. Kiểm tra có đơn hàng liên quan không (409)
        List<ProductVariant> variants = product.getVariants();
        if (variants != null && !variants.isEmpty()) {
            boolean hasOrders = orderDetailRepository.existsByProductVariantIn(variants);
            if (hasOrders) {
                throw new AppException(ErrorCode.PRODUCT_HAS_ORDERS);
            }
        }

        // 3. Xóa product (cascade sẽ tự xóa các ProductVariant tương ứng)
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<ProductViewResponse> GetProductView (
            Integer page,
            Integer limit,
            String brand,
            String keyword,
            String sort_by,
            String order)
    {
        sort_by = sort_by.equals("price") ? "min_price" : sort_by;

        Set<String> ALLOWED_SORT_COLUMNS = Set.of(
                "min_price", "avg_rating", "product_name"
        );

        if (!ALLOWED_SORT_COLUMNS.contains(sort_by)) sort_by = "min_price";
        String sortOrder = "desc".equalsIgnoreCase(order) ? "DESC" : "ASC";

        int offset = (page-1) *limit;

        String brandParam   = (brand   != null && !brand.isBlank())   ? brand   : null;
        String keywordParam = (keyword != null && !keyword.isBlank()) ? keyword : null;

        List<ProductSummaryProjection> raw = productRepository.findAllWithFilters(brandParam, keywordParam, limit, offset, sort_by, sortOrder);

        long total = productRepository.countWithFilters(brandParam, keywordParam);

        List<ProductViewResponse> data = raw.stream()
                .map(p -> ProductViewResponse.builder()
                        .product_id(p.getProduct_id())
                        .product_name(p.getProduct_name())
                        .brand(p.getBrand())
                        .product_image_link(p.getProduct_image_link())
                        .min_price(p.getMin_price())
                        .avg_rating(p.getAvg_rating())
                        .build()
                )
                .toList();

        return PaginatedResponse.<ProductViewResponse>builder()
                .data(data)
                .pagination(new PaginatedResponse.PaginationMeta(page, limit, total))
                .build();
    }

    @Transactional
    public ProductDetailResponse GetProductDetail(Long product_id){
        Product product = productRepository.findByProductId(product_id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        List<ProductVariantResponse>  variants = product.getVariants().stream()
                .map(pv -> ProductVariantResponse
                        .builder()
                        .productVariantId(pv.getProductVariantId())
                        .price(pv.getPrice())
                        .ram(pv.getRam())
                        .chip(pv.getChip())
                        .variantImageLink(pv.getVariantImageLink())
                        .batteryCapacity(pv.getBatteryCapacity())
                        .storageCapacity(pv.getStorageCapacity())
                        .totalAvailable(pv.getTotalAvailable())
                        .color(pv.getColor())
                        .build()).toList();
        List<ReviewResponse> reviews = new ArrayList<>();
        for (ProductReview pr : product.getReviews()){
            ReviewResponse.variantInfo variantInfo = ReviewResponse.variantInfo
                    .builder()
                    .product_variant_id(pr.getProductVariant().getProductVariantId())
                    .storage_capacity(pr.getProductVariant().getStorageCapacity())
                    .color(pr.getProductVariant().getColor())
                    .build();
            ReviewResponse reviewResponse = ReviewResponse
                    .builder()
                    .product_review_id(pr.getProductReviewId())
                    .user_id(pr.getUser().getUserId())
                    .review_date(pr.getReviewDate().toString())
                    .rating(pr.getRating())
                    .comment(pr.getComment())
                    .is_purchased(pr.getIsPurchased())
                    .variant(variantInfo)
                    .build();
            reviews.add(reviewResponse);
        }
        return ProductDetailResponse.builder()
                .product_id(product.getProductId())
                .brand(product.getBrand())
                .product_name(product.getProductName())
                .product_image_link(product.getProductImageLink())
                .variant(variants)
                .review(reviews)
                .build();
    }

}
