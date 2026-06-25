package com.Vendor_Bridge.backend.controllers;
import com.Vendor_Bridge.backend.dtos.QuotationFinalRequest;
import com.Vendor_Bridge.backend.dtos.QuotationRequest;
import com.Vendor_Bridge.backend.models.*;
import com.Vendor_Bridge.backend.services.QuotationService;
import com.Vendor_Bridge.backend.services.RfqService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/quotations")
public class QuotationController {
    private final QuotationService quotationService;
    private final RfqService rfqService;
    @Autowired
    public QuotationController(QuotationService quotationService, RfqService rfqService) {
        this.quotationService = quotationService;
        this.rfqService = rfqService;
    }
    @PostMapping("/submit")
    public ResponseEntity<?> submitQuote(@RequestBody QuotationRequest request) {
        try {
            Quotation quote = quotationService.submitQuotation(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(quote);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    @GetMapping("/rfq/{rfqId}")
    @PreAuthorize("hasRole('OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<List<Quotation>> getQuotationsByRfq(@PathVariable Long rfqId) {
        try {
            List<Quotation> quotations = quotationService.getQuotationsForRfq(rfqId);
            return ResponseEntity.ok(quotations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @PutMapping("/approve/{rfqid}/{quoteid}")
    public ResponseEntity<?> approveByOfficer(@PathVariable Long rfqid,@PathVariable Long quoteid){
        try{
             quotationService.approvedByOfficer(rfqid,quoteid);
               return new ResponseEntity<String>("Quotation approved by officer successfully!!",HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/officer")
    public ResponseEntity<?> fetchByOfficer(){
        try{
            List<Quotation>quotations = quotationService.fetchByOfficer();
            return new ResponseEntity<List<Quotation>>(quotations,HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/action/{quoteId}")
    public ResponseEntity<?>awardQuotation(@RequestBody QuotationFinalRequest request,@PathVariable Long quoteId){
        try{

           String response =  quotationService.awardQuotation(request,quoteId);

            return new ResponseEntity<String>(response,HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/po/{id}/{action}")
    public ResponseEntity<?> handlePoAction(@PathVariable String action,@PathVariable Long id){
        try{
             String response = quotationService.PoActions(id,action);
            return new ResponseEntity<String>(response,HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/po/my-orders")
    public ResponseEntity<?> getMyPo(@AuthenticationPrincipal User currUser){
        try{

            List<PurchaseOrder> pos = quotationService.getMyPos(currUser);
            return new ResponseEntity<List<PurchaseOrder>>(pos,HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/po/all")
    public ResponseEntity<?> getAllPo(){
        try{

            List<PurchaseOrder> pos = quotationService.getALLPos();
            return new ResponseEntity<List<PurchaseOrder>>(pos,HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



}
