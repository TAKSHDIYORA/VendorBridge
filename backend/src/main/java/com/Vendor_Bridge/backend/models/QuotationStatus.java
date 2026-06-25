package com.Vendor_Bridge.backend.models;

public enum QuotationStatus {
    SUBMITTED,//after submit by vendor
    APPROVED_BY_OFFICER,//after approved by officer
    IN_QUEUE,//officer choose one other one is this
    APPROVED,//after approved by manager
    AWARDED,// after accepting the purchase order
    COMPLETED,//after completing the procurement with this quotation
    REJECTED//any issue officer or approver can reject the quotation
}