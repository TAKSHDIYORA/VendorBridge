package com.Vendor_Bridge.backend.dtos;

import java.time.LocalDateTime;
import java.util.Date;

public class QuotationFinalRequest {
    private String action; // Will be "APPROVE" or "REJECT"
    private String remarks;
    private String shippingAddress;
    private LocalDateTime expectedDeliveryDate;

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public LocalDateTime getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }

    public void setExpectedDeliveryDate(LocalDateTime expectedDeliveryDate) {
        this.expectedDeliveryDate = expectedDeliveryDate;
    }
}