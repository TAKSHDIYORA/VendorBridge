package com.Vendor_Bridge.backend.services;

import com.Vendor_Bridge.backend.dtos.RfqLineItemRequest;
import com.Vendor_Bridge.backend.dtos.RfqRequest;
import com.Vendor_Bridge.backend.dtos.RfqUpdateRequest;
import com.Vendor_Bridge.backend.models.*;
import com.Vendor_Bridge.backend.repositories.RfqRepository;
import com.Vendor_Bridge.backend.repositories.UserRepository;
import com.Vendor_Bridge.backend.repositories.VendorRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RfqService {

    private final RfqRepository rfqRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    public RfqService(RfqRepository rfqRepository, UserRepository userRepository,VendorRepository vendorRepository) {
        this.rfqRepository = rfqRepository;
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
    }
   public Rfq getRfq(Long id){
        return rfqRepository.findById(id).get();
   }

   @Transactional
    public Rfq createRfq(RfqRequest request) {
        // 1. Authenticate the Officer
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String currentEmail = ((UserDetails) principal).getUsername();
        User currentOfficer = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        // 2. Build the Core RFQ
        Rfq rfq = new Rfq();
        rfq.setTitle(request.getTitle());
        rfq.setDescription(request.getDescription());
        rfq.setDeadline(request.getDeadline());
        rfq.setStatus(RfqStatus.DRAFT);
        rfq.setCreatedBy(currentOfficer);

        // 3. Process Line Items (Bi-directional mapping)
        if (request.getLineItems() != null) {
            List<RfqLineItem> items = new ArrayList<>();
            for (RfqLineItemRequest itemReq : request.getLineItems()) {
                RfqLineItem item = new RfqLineItem();
                item.setItem(itemReq.getItem());
                item.setQuantity(itemReq.getQuantity());
                item.setUnit(itemReq.getUnit());

                // CRITICAL: Link the item back to the parent RFQ before saving
                item.setRfq(rfq);
                items.add(item);
            }
            rfq.setLineItems(items);
        }

        // 4. Process Assigned Vendors
        if (request.getVendorIds() != null && !request.getVendorIds().isEmpty()) {
            Set<Vendor> vendors = new HashSet<>(vendorRepository.findAllById(request.getVendorIds()));

            // Optional Security Check: Ensure all fetched IDs are actually vendors
            for(Vendor v : vendors) {
                if(v.getRole() != Role.VENDOR) {
                    throw new RuntimeException("User ID " + v.getId() + " is not a valid vendor.");
                }
            }
            rfq.setAssignedVendors(vendors);
        }

        // 5. Save everything at once (CascadeType.ALL handles the line items)
        return rfqRepository.save(rfq);
    }


    @Transactional
    public void updateRfq(Long id, RfqUpdateRequest request) throws Exception {
        Rfq rfq = rfqRepository.findById(id)
                .orElseThrow(() -> new Exception("RFQ not found"));

        if (rfq.getStatus() != RfqStatus.DRAFT && rfq.getStatus() != RfqStatus.PUBLISHED) {
            throw new Exception("Editing is locked. You cannot modify an RFQ in " + rfq.getStatus() + " status.");
        }

        if (rfq.getStatus() == RfqStatus.DRAFT) {
            rfq.setTitle(request.getTitle());
            rfq.setDescription(request.getDescription());
            rfq.setDeadline(request.getDeadline());

            // 1. Wipe out the old items completely
            rfq.getLineItems().clear();

            // 2. FORCE Hibernate to delete them from the database immediately to prevent duplicates
            rfqRepository.flush();

            // 3. Add the incoming items as brand new rows
            if (request.getLineItems() != null) {
                for (RfqUpdateRequest.LineItemDto dto : request.getLineItems()) {
                    RfqLineItem newItem = new RfqLineItem();
                    newItem.setItem(dto.getItem());
                    newItem.setQuantity(dto.getQuantity());
                    newItem.setUnit(dto.getUnit());
                    newItem.setRfq(rfq); // Link back to parent
                    rfq.getLineItems().add(newItem);
                }
            }
        }

        if (request.getVendorIds() != null && !request.getVendorIds().isEmpty()) {
            List<Vendor> vendors = vendorRepository.findAllById(request.getVendorIds());
            rfq.setAssignedVendors(new HashSet<>(vendors));
        } else {
            rfq.getAssignedVendors().clear();
        }
    }

    public List<Rfq> getPublishedRfqs(){
        return  rfqRepository.findByStatusWithDetails(RfqStatus.PUBLISHED);
    }

    public List<Rfq> getAllRfqs(){
         return rfqRepository.findAllWithfast();
    }

    public List<Rfq> getDraftedRfqs(RfqStatus draft){
        return  rfqRepository.findByStatusWithDetails(RfqStatus.DRAFT);
    }

    @Transactional
    public void publishAnRfq(Long id) throws Exception{
        Rfq rfq = rfqRepository.findById(id).orElseThrow();
        rfq.setStatus(RfqStatus.PUBLISHED);
    }
}