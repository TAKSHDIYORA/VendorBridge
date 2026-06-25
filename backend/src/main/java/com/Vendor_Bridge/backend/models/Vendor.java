package com.Vendor_Bridge.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "vendors")
@PrimaryKeyJoinColumn(name = "user_id") // Links to the User table's ID
public class Vendor extends User {

    @Column(name = "company_name", length = 150, nullable = false)
    private String companyName;

    @Column(name = "gst_number", length = 50, unique = true)
    private String gstNumber;

    @Column(name = "vendor_category", length = 100)
    private String vendorCategory;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String country;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    // Maps to Decimal(3,2) with a default of 0.00
    @Column(precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private VendorStatus status = VendorStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;



     @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL)
     @JsonIgnore
    private List<Invoice> invoices;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<PurchaseOrder> purchaseOrders;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Quotation> quotations;

    @ManyToMany(mappedBy = "assignedVendors")
    @JsonIgnore
    private Set<Rfq> rfqVendors = new HashSet<>();



    public Vendor() {
        super();
        this.setRole(Role.VENDOR);
    }

    public Vendor(String email, String password, String companyName) {
        super(email, password, Role.VENDOR);
        this.companyName = companyName;
    }

    // --- Getters and Setters ---
    public Set<Rfq> getRfqVendors() { return rfqVendors; }
    public void setRfqVendors(Set<Rfq> rfqVendors) { this.rfqVendors = rfqVendors; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public String getVendorCategory() { return vendorCategory; }
    public void setVendorCategory(String vendorCategory) { this.vendorCategory = vendorCategory; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public VendorStatus getStatus() { return status; }
    public void setStatus(VendorStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}