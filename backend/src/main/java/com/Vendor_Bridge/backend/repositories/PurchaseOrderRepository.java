package com.Vendor_Bridge.backend.repositories;

import com.Vendor_Bridge.backend.models.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder,Long> {
    List<PurchaseOrder> findByVendorId(Long userId);
}
