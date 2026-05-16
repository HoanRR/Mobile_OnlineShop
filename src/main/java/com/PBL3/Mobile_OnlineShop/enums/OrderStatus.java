package com.PBL3.Mobile_OnlineShop.enums;

public enum OrderStatus {
    WAIT, PROCESSING, DELIVERED, CANCELLED;

    public boolean isValidTransition(OrderStatus nextStatus) {
        if (this == WAIT && (nextStatus == PROCESSING || nextStatus == CANCELLED)) {
            return true;
        }

        if (this == PROCESSING && (nextStatus == DELIVERED || nextStatus == CANCELLED)) {
            return true;
        }
        return false;
    }
}