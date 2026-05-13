package com.PBL3.Mobile_OnlineShop.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public class ApplyConditionVariantId implements Serializable {
    private Long applyConditionId;
    private Long productVariantId;
}
