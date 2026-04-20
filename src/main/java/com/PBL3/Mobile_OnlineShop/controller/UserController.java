package com.PBL3.Mobile_OnlineShop.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class UserController {

    @RequestMapping("/User")
    public String getUserPage() {
        return "user.html";
    }

}
