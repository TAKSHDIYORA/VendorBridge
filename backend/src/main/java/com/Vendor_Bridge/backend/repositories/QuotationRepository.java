package com.Vendor_Bridge.backend.repositories;

import com.Vendor_Bridge.backend.models.Quotation;
import com.Vendor_Bridge.backend.models.QuotationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuotationRepository extends JpaRepository<Quotation,Long> {
//    public List<Quotation> findByRfqId(Long rfqId);
//    public List<Quotation> findByStatus(QuotationStatus status);
//    public List<Quotation> findByVendorEmail(String email);

    @Query("SELECT DISTINCT q FROM Quotation q " +
            "LEFT JOIN FETCH q.items i " +
            "LEFT JOIN FETCH i.rfqLineItem " +
            "LEFT JOIN FETCH q.vendor " +
            "WHERE q.rfq.id = :rfqId")
    List<Quotation> findByRfqId(@Param("rfqId") Long rfqId);

    // 2. Fetch by Status (Perfect for your Approvals Queue)
    @Query("SELECT DISTINCT q FROM Quotation q " +
            "LEFT JOIN FETCH q.rfq " +
            "LEFT JOIN FETCH q.vendor " +
            "WHERE q.status = :status")
    List<Quotation> findByStatus(@Param("status") QuotationStatus status);

    // 3. Fetch by Vendor Email
    @Query("SELECT DISTINCT q FROM Quotation q " +
            "LEFT JOIN FETCH q.rfq " +
            "LEFT JOIN FETCH q.items " +
            "WHERE q.vendor.email = :email")
    List<Quotation> findByVendorEmail(@Param("email") String email);


}
