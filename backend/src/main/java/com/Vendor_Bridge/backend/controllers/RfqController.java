package com.Vendor_Bridge.backend.controllers;

import com.Vendor_Bridge.backend.dtos.RfqRequest;
import com.Vendor_Bridge.backend.dtos.RfqUpdateRequest;
import com.Vendor_Bridge.backend.models.Rfq;
import com.Vendor_Bridge.backend.models.RfqStatus;
import com.Vendor_Bridge.backend.services.RfqService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rfqs")
public class RfqController {

    private final RfqService rfqService;

    public RfqController(RfqService rfqService) {
        this.rfqService = rfqService;
    }

    // Only Officers and Admins can create RFQs
    @PostMapping("/create")
    public ResponseEntity<?> createRfq(@RequestBody RfqRequest rfqRequest) {
        try {
            Rfq createdRfq = rfqService.createRfq(rfqRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRfq);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Officers, Admins, and Vendors can view all open RFQs
    @GetMapping("/all")
    public ResponseEntity<List<Rfq>> getAllRfqs() {
        return ResponseEntity.ok(rfqService.getAllRfqs());
    }

    @GetMapping("/published")
    public ResponseEntity<List<Rfq>> getPublishedRfqs(){
        return ResponseEntity.ok(rfqService.getPublishedRfqs());
    }

    @PutMapping("/update/{id}")
    public  ResponseEntity<?> update(@PathVariable Long id,@RequestBody RfqUpdateRequest rfqUpdateRequest){
        try{
            rfqService.updateRfq(id,rfqUpdateRequest);
            return new ResponseEntity<String>("updated successfully",HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/drafted")
    public ResponseEntity<?> getRfqForOfficer(){
        try {
            List<Rfq> drafted = rfqService.getDraftedRfqs(RfqStatus.DRAFT);
            return ResponseEntity.ok(drafted);
        } catch (Exception e) {
            return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/publish/{id}")
    public ResponseEntity<?> publishRfq(@PathVariable  Long id){
        try{
             rfqService.publishAnRfq(id);
             return  new ResponseEntity<String>("Rfq published successfully!!",HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



//
//    @GetMapping("/published")
//    public ResponseEntity<?> getRfqForuser(){
//        try {
//            List<Rfq> published = rfqService.getRfqsByStatus(RfqStatus.PUBLISHED);
//            return ResponseEntity.ok(published);
//        } catch (Exception e) {
//            return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }
//
//    @PostMapping("/{id}/action")
//    public ResponseEntity<?> handleRfqAction(
//            @PathVariable Long id,
//            @RequestBody RfqActionRequest request) {
//
//        try {
//            // Pass the data down to your business logic layer
//            rfqService.processAction(id, request.getAction(), request.getRemarks());
//
//            return new ResponseEntity<>("Action processed successfully", HttpStatus.OK);
//        } catch (Exception e) {
//            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
//        }
//    }

}