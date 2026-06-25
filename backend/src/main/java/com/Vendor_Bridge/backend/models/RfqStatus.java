package com.Vendor_Bridge.backend.models;

public enum RfqStatus {
      DRAFT,
      PUBLISHED, //once approved by approver or a vendor rejects the po
      REJECTED,  //rejected by approver then
      IN_REVIEW, //once the officer chose a vendor then waiting for approver selection and vendor acceptance
      AWARDED,//once approver approve an quotation for rfq and vendor accepts the PO
      COMPLETED, //request is served and procurement process is successfully completed then
      CLOSED,  //deadline is gone and procurement request not served.

}