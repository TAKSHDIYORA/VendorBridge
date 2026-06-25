package com.Vendor_Bridge.backend.models;

import jakarta.persistence.*;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "rfqs")
public class Rfq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)

    private RfqStatus status;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Link the RFQ back to the Officer who created it
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "rfq", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RfqLineItem> lineItems = new ArrayList<>();

    // 2. The Many-To-Many relationship with Vendors
    @ManyToMany
    @JoinTable(
            name = "rfq_vendors",
            joinColumns = @JoinColumn(name = "rfq_id"),
            inverseJoinColumns = @JoinColumn(name = "vendor_id")
    )
    private Set<Vendor> assignedVendors = new HashSet<>();

    // Don't forget to add Getters and Setters for these two new fields!
    public List<RfqLineItem> getLineItems() { return lineItems; }
    public void setLineItems(List<RfqLineItem> lineItems) { this.lineItems = lineItems; }
    public Set<Vendor> getAssignedVendors() { return assignedVendors; }
    public void setAssignedVendors(Set<Vendor> assignedVendors) { this.assignedVendors = assignedVendors; }

    // Standard Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public RfqStatus getStatus() { return status; }
    public void setStatus(RfqStatus status) { this.status = status; }
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
}