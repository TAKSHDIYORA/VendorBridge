package com.Vendor_Bridge.backend.dtos;

import com.Vendor_Bridge.backend.models.Role;

public class registerRequest {
    private String email;
    private String password;
    private Role role;

    // Vendor-specific fields needed for registration
    private String companyName;
    private String gstNumber;
    private String vendorCategory;

    // --- Getters and Setters ---

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }
    public void setRole(Role role) {
        this.role = role;
    }

    public String getCompanyName() {
        return companyName;
    }
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getGstNumber() {
        return gstNumber;
    }
    public void setGstNumber(String gstNumber) {
        this.gstNumber = gstNumber;
    }

    public String getVendorCategory() {
        return vendorCategory;
    }
    public void setVendorCategory(String vendorCategory) {
        this.vendorCategory = vendorCategory;
    }
}