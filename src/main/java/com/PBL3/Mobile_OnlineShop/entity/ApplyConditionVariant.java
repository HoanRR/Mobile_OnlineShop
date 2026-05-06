package com.PBL3.Mobile_OnlineShop.entity;

import jakarta.persistence.*;


@Entity
@Table(name = "apply_condition_variant")
public class ApplyConditionVariant {
    @EmbeddedId
    private ApplyConditionVariantId id;

    @ManyToOne
    @MapsId("applyConditionId")
    @JoinColumn(name = "apply_condition_id")
    private ApplyCondition applyCondition;

    @ManyToOne
    @MapsId("productVariantId")
    @JoinColumn(name = "product_variant_id")
    private ProductVariant productVariant;
}