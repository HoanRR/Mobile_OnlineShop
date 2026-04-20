package com.PBL3.Mobile_OnlineShop.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SignUpController {

    @RequestMapping("/Signup")
    public String getSignUpPage() {
        return "signup.html";
    }

}
