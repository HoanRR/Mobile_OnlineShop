package com.PBL3.Mobile_OnlineShop.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SignInController {
    @GetMapping("/Signin")
    public String getSignInpage() {
        return "login.html";
    }

}
