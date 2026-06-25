package com.Vendor_Bridge.backend.dtos;

public class RfqActionRequest {
    private String action; // Will be "APPROVE" or "REJECT"
    private String remarks;

    // --- Getters and Setters ---
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}