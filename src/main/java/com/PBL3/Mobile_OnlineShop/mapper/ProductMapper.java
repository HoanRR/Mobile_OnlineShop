package com.PBL3.Mobile_OnlineShop.mapper;

import com.PBL3.Mobile_OnlineShop.dto.request.UpdateProductRequest;
import com.PBL3.Mobile_OnlineShop.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProductMapper {
    @Mapping(source = "product_name", target = "productName")
    @Mapping(source = "brand", target = "brand")
    @Mapping(source = "product_image_link", target = "productImageLink")

    void updateProductFromRequest(UpdateProductRequest request, @MappingTarget Product product);
}
