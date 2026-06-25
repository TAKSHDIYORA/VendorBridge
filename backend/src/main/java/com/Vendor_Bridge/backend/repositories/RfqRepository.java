package com.Vendor_Bridge.backend.repositories;

import com.Vendor_Bridge.backend.models.Rfq;
import com.Vendor_Bridge.backend.models.RfqStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RfqRepository extends JpaRepository<Rfq, Long> {
    // Custom query to let an officer see only their own RFQs
    List<Rfq> findByCreatedById(Long officerId);

    List<Rfq> findByStatus(RfqStatus status);

    @Query("SELECT DISTINCT r FROM Rfq r LEFT JOIN FETCH r.lineItems LEFT JOIN FETCH r.assignedVendors")
    List<Rfq> findAllWithfast();

    @Query("SELECT DISTINCT r FROM Rfq r " +
            "LEFT JOIN FETCH r.lineItems " +
            "LEFT JOIN FETCH r.assignedVendors " +
            "WHERE r.status = :status")
    List<Rfq> findByStatusWithDetails(@Param("status") RfqStatus status);
}