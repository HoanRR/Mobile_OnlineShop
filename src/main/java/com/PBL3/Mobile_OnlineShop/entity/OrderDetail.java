package com.PBL3.Mobile_OnlineShop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_detail")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderDetailId;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    private ProductVariant productVariant;

    @ManyToOne
    @JoinColumn(name = "device_id") // many to one ở đây là để đơn tránh điện thoại trả về ko bán được
    private Device device;

    private Double priceAtPurchase;
}