package com.PBL3.Mobile_OnlineShop.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Kích hoạt @PreAuthorize("hasRole('ADMIN')") trên Controller
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomJwtDecoder customJwtDecoder;

    // Mảng các đường dẫn Public (Không cần đăng nhập)
    private final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // Tắt CSRF vì dùng JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Tắt
                                                                                                              // Session
                .authorizeHttpRequests(request -> request
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()

                        // Cách 1: Phân quyền trực tiếp tại đây
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Các request còn lại phải có Token
                        .anyRequest().authenticated())
                // CẤU HÌNH OAUTH2 RESOURCE SERVER (Sức mạnh của Nimbus)
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwtConfigurer -> jwtConfigurer
                                .decoder(customJwtDecoder)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint()) // Xử lý 401
                        .accessDeniedHandler(new CustomAccessDeniedHandler()) // THÊM DÒNG NÀY ĐỂ XỬ LÝ 403
                );

        return http.build();
    }

    // --- BỘ CHUYỂN ĐỔI QUYỀN (QUAN TRỌNG) ---
    // Mặc định Spring gán quyền là "SCOPE_ADMIN". Hàm này giúp đổi thành
    // "ROLE_ADMIN"
    // Để khớp với lệnh @PreAuthorize("hasRole('ADMIN')")
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthorityPrefix("ROLE_"); // Thêm tiền tố ROLE_
        converter.setAuthoritiesClaimName("role"); // Lấy giá trị từ key "role" trong Token

        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(converter);
        return jwtConverter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}