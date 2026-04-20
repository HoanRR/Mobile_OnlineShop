package com.PBL3.Mobile_OnlineShop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "product_variant")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productVariantId;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    @Column(nullable = false)
    private Long totalAvailable;

    @Column(length = 100)
    private String color;

    private Long storageCapacity;

    private Long batteryCapacity;

    @Column(length = 100)
    private String resolution;

    @Column(length = 100)
    private String chip;

    @Column(length = 100)
    private String ram;

    @Min(value = 0, message = "Giá sản phẩm phải lớn hơn hoặc bằng 0")
    @Column(nullable = false)
    private Double price;

    @Column(length = 500)
    private String variantImageLink;

    @OneToMany(mappedBy = "productVariant")
    private List<Device> devices;
}