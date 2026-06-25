package com.Vendor_Bridge.backend.models;

public enum InvoiceStatus {
    PENDING,        // Invoice received but not paid
    APPROVED,       // Cleared for payment
    PAID,           // Payment completed
    OVERDUE,        // Past the due date
    CANCELLED
}