package com.Vendor_Bridge.backend.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VendorUpdate {
    @NotBlank(message = "email address can't be NULL")
    private String email;

    @NotBlank(message = "Company Name cannot be empty")
    private String companyName;

    @NotBlank(message = "GST Number cannot be empty")
    @Size(min = 15, max = 15, message = "GST Number must be exactly 15 characters long")
    private String gstNumber;

    @NotBlank(message = "Vendor Category cannot be empty")
    private String vendorCategory;

    // Address fields are usually optional, but you can add @NotBlank if you want to force them!
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;

    // --- Getters and Setters ---
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
}