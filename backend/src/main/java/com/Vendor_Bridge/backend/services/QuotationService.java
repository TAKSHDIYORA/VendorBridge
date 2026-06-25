package com.Vendor_Bridge.backend.services;

import com.Vendor_Bridge.backend.dtos.*;
import com.Vendor_Bridge.backend.models.*;
import com.Vendor_Bridge.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static com.Vendor_Bridge.backend.models.QuotationStatus.*;

@Service
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final RfqRepository rfqRepository;
    private final RfqService rfqService;
    private final RfqLineItemRepository rfqLineItemRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    // Constructor injection omitted for brevity...

    @Autowired
    public QuotationService(QuotationRepository quotationRepository, RfqService rfqService,RfqRepository rfqRepository, RfqLineItemRepository rfqLineItemRepository, UserRepository userRepository,VendorRepository vendorRepository,PurchaseOrderRepository purchaseOrderRepository) {
        this.quotationRepository = quotationRepository;
        this.rfqRepository = rfqRepository;
        this.rfqLineItemRepository = rfqLineItemRepository;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.rfqService = rfqService;
        this.purchaseOrderRepository = purchaseOrderRepository;

    }

    public Quotation submitQuotation(QuotationRequest request) {
        // 1. Identify the logged-in Vendor
        String currentEmail = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        Vendor vendor =  vendorRepository.findByEmail(currentEmail).orElseThrow();

        // 2. Fetch the RFQ
        Rfq rfq = rfqRepository.findById(request.getRfqId())
                .orElseThrow(() -> new RuntimeException("RFQ not found"));

        // Optional Security Check: Ensure the vendor was actually assigned to this RFQ!
        if (!rfq.getAssignedVendors().contains(vendor)) {
            throw new RuntimeException("You are not authorized to bid on this RFQ.");
        }

        // 3. Build the Quotation Shell
        Quotation quotation = new Quotation();
        quotation.setRfq(rfq);
        quotation.setVendor(vendor);
        quotation.setRemarks(request.getRemarks());

        // 4. Process Pricing & Math
        double grandTotal = 0.0;
        List<QuotationLineItem> quoteItems = new ArrayList<>();

        for (QuotationItemRequest itemReq : request.getItems()) {
            RfqLineItem rfqItem = rfqLineItemRepository.findById(itemReq.getRfqLineItemId())
                    .orElseThrow(() -> new RuntimeException("RFQ Line Item not found"));

            QuotationLineItem qItem = new QuotationLineItem();
            qItem.setQuotation(quotation);
            qItem.setRfqLineItem(rfqItem);
            qItem.setUnitPrice(itemReq.getUnitPrice());

            // Backend math calculation: Price * Quantity requested
            double lineTotal = itemReq.getUnitPrice() * rfqItem.getQuantity();
            qItem.setTotalPrice(lineTotal);

            grandTotal += lineTotal;
            quoteItems.add(qItem);
        }

        quotation.setItems(quoteItems);
        quotation.setTotalAmount(grandTotal);

        return quotationRepository.save(quotation);
    }

    public List<Quotation> getQuotationsForRfq(Long rfqId) {
        return quotationRepository.findByRfqId(rfqId);
    }

    @Transactional
    public void approvedByOfficer(Long rfqId,Long quoteId) throws  Exception{
        Rfq rfq = rfqRepository.findById(rfqId).orElseThrow();
        List<Quotation> quotations = quotationRepository.findByRfqId(rfqId);
        for(Quotation quotation : quotations){
            if(quotation.getId()==quoteId){
                quotation.setStatus(APPROVED_BY_OFFICER);
            }else{
                quotation.setStatus(IN_QUEUE);
            }
        }
        rfq.setStatus(RfqStatus.IN_REVIEW);
    }

    public List<Quotation> fetchByOfficer(){
        List<Quotation> quotations = quotationRepository.findByStatus(APPROVED_BY_OFFICER);
        return quotations;
    }

    @Transactional
    public String awardQuotation(QuotationFinalRequest request,Long quoteid)throws Exception{
         String action = request.getAction();

        if (action.equalsIgnoreCase("APPROVE")) {
            // 1. Fetch Quotation
            Quotation quote = quotationRepository.findById(quoteid)
                    .orElseThrow(() -> new RuntimeException("Quotation not found"));
                    // 2. Update Statuses
            quote.setStatus(QuotationStatus.APPROVED);
            // 3. Generate the Purchase Order
            PurchaseOrder po = new PurchaseOrder();
            po.setPoNumber("PO-" + LocalDateTime.now().getYear() + "-" + String.format("%04d", quote.getId()));
            po.setVendor(quote.getVendor());
            po.setQuotation(quote);
            po.setTotalAmount(quote.getTotalAmount());
            po.setStatus(PurchaseOrderStatus.ISSUED);
            po.setIssueDate(LocalDateTime.now());

            // 4. Inject Dynamic Data from your QuotationFinalRequest DTO (assuming it is named 'request')
            po.setShippingAddress(request.getShippingAddress());
            po.setExpectedDeliveryDate(request.getExpectedDeliveryDate());

            // 5. Save to Database
            purchaseOrderRepository.save(po); // Ensure PurchaseOrderRepository is injected!

            // Optional: emailService.sendPurchaseOrder(quote.getVendor().getEmail(), po);

            return "Quotation awarded successfully and PO generated";

        } else if (action.equalsIgnoreCase("REJECT")) {
            // 1. Fetch Quotation
            Quotation quote = quotationRepository.findById(quoteid)
                    .orElseThrow(() -> new RuntimeException("Quotation not found"));

            // 2. Update Statuses
            quote.setStatus(QuotationStatus.REJECTED);

            // 3. Re-open the RFQ so the Officer can select the 2nd best quote
            quote.getRfq().setStatus(RfqStatus.PUBLISHED);

            return "Quotation rejected successfully and RFQ reverted to PUBLISHED";

        } else {
            throw new IllegalArgumentException("Invalid action provided. Must be APPROVE or REJECT.");
        }
    }

    @Transactional
    public String PoActions(Long id,String action)throws Exception{
        if(action.equals("accept")){
           PurchaseOrder po = purchaseOrderRepository.findById(id).orElseThrow();
           po.setStatus(PurchaseOrderStatus.ACCEPTED);
            po.getQuotation().setStatus(AWARDED);
            po.getQuotation().getRfq().setStatus(RfqStatus.AWARDED);
           return "PO accepted by vendor successfully";
        }else if(action.equals("reject")){
            PurchaseOrder po = purchaseOrderRepository.findById(id).orElseThrow();
            po.setStatus(PurchaseOrderStatus.CANCELLED);
            po.getQuotation().setStatus(REJECTED);
            po.getQuotation().getRfq().setStatus(RfqStatus.PUBLISHED);
            return "PO rejected by vendor successfully";
        }else{
            throw new IllegalArgumentException();
        }
    }


    public List<PurchaseOrder> getMyPos(User user)throws Exception{
        List<PurchaseOrder> pos = purchaseOrderRepository.findByVendorId(user.getId());
        return pos;
    }

    public List<PurchaseOrder> getALLPos(){
        List<PurchaseOrder> pos = purchaseOrderRepository.findAll();
        return pos;
    }




}