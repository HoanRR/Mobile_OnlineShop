package com.PBL3.Mobile_OnlineShop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import com.PBL3.Mobile_OnlineShop.enums.OrderStatus;

import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "`order`") // Tránh conflict với keyword ORDER trong SQL
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private OrderStatus orderStatus;

    private LocalDateTime orderDate;

    @Min(value = 0, message = "Tổng tiền đơn hàng không được âm")
    @Column(nullable = false)
    private Double totalAmount;

    @Column(length = 20)
    private String paymentMethod;

    private Boolean isPaid;

    @ManyToOne
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    private Double discountAmount;

    @NotBlank(message = "Tên người nhận không được trống")
    @Column(length = 255, nullable = false)
    private String receiverName;

    @NotBlank(message = "Số điện thoại người nhận không được trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không hợp lệ")
    @Column(length = 20, nullable = false)
    private String receiverPhone;

    @NotBlank(message = "Địa chỉ giao hàng không được trống")
    @Column(length = 500, nullable = false)
    private String shippingAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderDetail> orderDetails;
}