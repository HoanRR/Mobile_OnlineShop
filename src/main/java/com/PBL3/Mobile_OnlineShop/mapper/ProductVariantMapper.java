package com.PBL3.Mobile_OnlineShop.mapper;

import com.PBL3.Mobile_OnlineShop.dto.request.VariantRequest;
import com.PBL3.Mobile_OnlineShop.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {

    @Mapping(source = "storage_capacity", target = "storageCapacity")
    @Mapping(source = "battery_capacity", target = "batteryCapacity")
    @Mapping(source = "total_available", target = "totalAvailable")
    @Mapping(source = "variant_image_link", target = "variantImageLink")
    @Mapping(target = "productVariantId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "devices", ignore = true)
    ProductVariant toProductVariant(VariantRequest request);
}
