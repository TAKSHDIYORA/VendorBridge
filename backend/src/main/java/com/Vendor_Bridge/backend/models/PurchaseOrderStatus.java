package com.Vendor_Bridge.backend.models;

public enum PurchaseOrderStatus {
    DRAFT,
    ISSUED,         // Sent to the vendor
    ACCEPTED,       // Vendor agreed to the terms
    IN_TRANSIT,     // Goods are being shipped
    DELIVERED,      // Goods received
    CANCELLED
}