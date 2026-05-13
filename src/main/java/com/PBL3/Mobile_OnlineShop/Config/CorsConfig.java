package com.PBL3.Mobile_OnlineShop.Config;
// Config tat bao mat Cors : Trình dyệt chặn gọi từ cổng khác -> Tắt
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho mọi endpoint
                .allowedOrigins("http://127.0.0.1:5501", 
                    "http://localhost:5501", 
                    "http://127.0.0.1:5500",
                    "http://localhost:5500",
                    "http://localhost:5050") // Cấp phép các yêu cầu từ nguồn này
                .allowedMethods("GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}