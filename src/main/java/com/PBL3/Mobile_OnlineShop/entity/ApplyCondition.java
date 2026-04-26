package com.PBL3.Mobile_OnlineShop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "apply_condition")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplyCondition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long applyConditionId;

    @ManyToOne
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    private Double minValue;

    @ManyToMany
    @JoinTable(name = "apply_condition_variant", joinColumns = @JoinColumn(name = "apply_condition_id"), inverseJoinColumns = @JoinColumn(name = "product_variant_id"))
    private List<ProductVariant> productVariants;
}