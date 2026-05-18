package com.PBL3.Mobile_OnlineShop.mapper;

import com.PBL3.Mobile_OnlineShop.dto.response.MyInfoResponse;
import com.PBL3.Mobile_OnlineShop.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "user_id", source = "userId")
    @Mapping(target = "full_name", source = "fullName")
    @Mapping(target = "phone_number", source = "phoneNumber")
    MyInfoResponse toMyInfoResponse(User user);
}
