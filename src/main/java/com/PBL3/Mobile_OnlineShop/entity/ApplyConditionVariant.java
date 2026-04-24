package com.PBL3.Mobile_OnlineShop.entity;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "apply_condition_variant")
public class ApplyConditionVariant {
    @EmbeddedId
    private ApplyConditionVariantId id;

    @ManyToOne
    @MapsId("applyConditionId")
    private ApplyCondition applyCondition;

    @ManyToOne
    @MapsId("productVariantId")
    private ProductVariant productVariant;
}