package com.PBL3.Mobile_OnlineShop.Config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller chuyển tiếp các URL "clean" (không có đuôi .html)
 * đến file HTML tĩnh tương ứng trong thư mục static/.
 *
 * VD: /customer/index  →  forward:/customer/index.html
 *     /                →  redirect:/customer/index
 */
@Controller
public class ViewController {

    // ==================== TRANG MẶC ĐỊNH ====================
    @GetMapping("/")
    public String home() {
        return "redirect:/customer/index";
    }

    // ==================== CUSTOMER PAGES ====================
    @GetMapping("/customer/index")
    public String customerIndex() {
        return "forward:/customer/index.html";
    }

    @GetMapping("/customer/login")
    public String customerLogin() {
        return "forward:/customer/login.html";
    }

    @GetMapping("/customer/register")
    public String customerRegister() {
        return "forward:/customer/register.html";
    }

    @GetMapping("/customer/cart")
    public String customerCart() {
        return "forward:/customer/cart.html";
    }

    @GetMapping("/customer/checkout")
    public String customerCheckout() {
        return "forward:/customer/checkout.html";
    }

    @GetMapping("/customer/product-detail")
    public String customerProductDetail() {
        return "forward:/customer/product-detail.html";
    }

    @GetMapping("/customer/profile")
    public String customerProfile() {
        return "forward:/customer/profile.html";
    }

    @GetMapping("/customer/order-history")
    public String customerOrderHistory() {
        return "forward:/customer/order-history.html";
    }

    @GetMapping("/customer/order-success")
    public String customerOrderSuccess() {
        return "forward:/customer/order-success.html";
    }

    @GetMapping("/customer/reset-password")
    public String customerResetPassword() {
        return "forward:/customer/reset-password.html";
    }

    // ==================== ADMIN PAGES ====================
    @GetMapping("/admin/index_admin")
    public String adminIndex() {
        return "forward:/admin/index_admin.html";
    }

    @GetMapping("/admin/admin_product")
    public String adminProduct() {
        return "forward:/admin/admin_product.html";
    }

    @GetMapping("/admin/admin_user")
    public String adminUser() {
        return "forward:/admin/admin_user.html";
    }

    @GetMapping("/admin/admin_devices")
    public String adminDevices() {
        return "forward:/admin/admin_devices.html";
    }

    @GetMapping("/admin/admin_voucher")
    public String adminVoucher() {
        return "forward:/admin/admin_voucher.html";
    }

    // ==================== STAFF PAGES ====================
    @GetMapping("/staff/pos")
    public String staffPos() {
        return "forward:/staff/pos.html";
    }

    @GetMapping("/staff/checkout-info")
    public String staffCheckoutInfo() {
        return "forward:/staff/checkout-info.html";
    }

    @GetMapping("/staff/orders")
    public String staffOrders() {
        return "forward:/staff/orders.html";
    }

    @GetMapping("/staff/products")
    public String staffProducts() {
        return "forward:/staff/products.html";
    }

    @GetMapping("/staff/warranty")
    public String staffWarranty() {
        return "forward:/staff/warranty.html";
    }

    @GetMapping("/staff/reviews")
    public String staffReviews() {
        return "forward:/staff/reviews.html";
    }

    @GetMapping("/staff/review-detail")
    public String staffReviewDetail() {
        return "forward:/staff/review-detail.html";
    }
}
