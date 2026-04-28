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
                .allowedOrigins("http://localhost:5050") // Điền domain/port của Frontend -> Cấp phép các yêu cầu từ nguồn này
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}