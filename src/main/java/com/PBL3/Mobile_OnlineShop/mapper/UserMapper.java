package com.PBL3.Mobile_OnlineShop.mapper;

import com.PBL3.Mobile_OnlineShop.dto.request.UpdateMyInfoRequest;
import com.PBL3.Mobile_OnlineShop.dto.response.MyInfoResponse;
import com.PBL3.Mobile_OnlineShop.entity.User;

import java.beans.BeanProperty;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface UserMapper {
   @Mapping(target = "name", source = "fullName")
    MyInfoResponse toMyInfoResponse(User user);

// tự động bỏ qua những trường mà frontend không gửi (tránh việc đè giá trị null vào database).
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUserFromRequest(UpdateMyInfoRequest request, @MappingTarget User user);
}
