package com.Vendor_Bridge.backend.repositories;

import com.Vendor_Bridge.backend.models.User;
import com.Vendor_Bridge.backend.models.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor,Long> {
    public Optional<Vendor> findByEmail(String email);
}
