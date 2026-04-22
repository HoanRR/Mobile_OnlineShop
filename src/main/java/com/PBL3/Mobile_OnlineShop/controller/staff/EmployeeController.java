package com.PBL3.Mobile_OnlineShop.controller.staff;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class EmployeeController {
    @RequestMapping("/Employee")
    public String getUserPage() {
        return "employee.html";
    }
}
