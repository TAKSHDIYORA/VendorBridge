package com.Vendor_Bridge.backend.dtos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public class RfqUpdateRequest {
    private String title;
    private String description;
    private LocalDateTime deadline;
    private List<LineItemDto> lineItems;
    private Set<Long> vendorIds;

    // --- Getters and Setters ---
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public List<LineItemDto> getLineItems() {
        return lineItems;
    }

    public void setLineItems(List<LineItemDto> lineItems) {
        this.lineItems = lineItems;
    }

    public Set<Long> getVendorIds() {
        return vendorIds;
    }

    public void setVendorIds(Set<Long> vendorIds) {
        this.vendorIds = vendorIds;
    }

    // Nested class for Line Items
    public static class LineItemDto {

        private String item;
        private Integer quantity;
        private String unit;

        // Getters and Setters

        public String getItem() {
            return item;
        }

        public void setItem(String item) {
            this.item = item;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public String getUnit() {
            return unit;
        }

        public void setUnit(String unit) {
            this.unit = unit;
        }
    }
}