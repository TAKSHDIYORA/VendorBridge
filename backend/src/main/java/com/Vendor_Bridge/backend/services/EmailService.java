package com.Vendor_Bridge.backend.services;

import com.Vendor_Bridge.backend.models.PurchaseOrder;
import com.Vendor_Bridge.backend.models.Quotation;
import com.Vendor_Bridge.backend.models.Rfq;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // --- BASE METHOD (Handles the actual sending asynchronously) ---
    @Async // Runs in a separate thread so it doesn't slow down your API responses
    protected void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indicates this is HTML

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    // =================================================================
    // BUSINESS USE CASES
    // =================================================================

    // 1. OTP for Email Verification
    public void sendOtpEmail(String to, String otp) {
        String subject = "Vendor Bridge - Verify Your Email";
        String body = "<h3>Welcome to Vendor Bridge!</h3>"
                + "<p>Your verification code is: <strong>" + otp + "</strong></p>"
                + "<p>This code will expire in 10 minutes.</p>";
        sendHtmlEmail(to, subject, body);
    }

    // 2. Registration Greetings
    public void sendRegistrationGreeting(String to, String companyName) {
        String subject = "Welcome to Vendor Bridge, " + companyName + "!";
        String body = "<h3>Registration Successful</h3>"
                + "<p>Hello " + companyName + ",</p>"
                + "<p>Your vendor account has been successfully created. You can now log in and start receiving Requests for Quotation (RFQs).</p>";
        sendHtmlEmail(to, subject, body);
    }

    // 3. Sending Invite for an RFQ
    public void sendRfqInvite(String to, Rfq rfq) {
        String subject = "New RFQ Invitation: " + rfq.getTitle();
        String body = "<h3>New Procurement Request</h3>"
                + "<p>You have been invited to bid on a new RFQ: <strong>" + rfq.getTitle() + "</strong></p>"
                + "<p>Deadline: " + rfq.getDeadline().toString() + "</p>"
                + "<a href='http://localhost:5173/vendor/rfqs/" + rfq.getId() + "'>Click here to view and submit your quote</a>";
        sendHtmlEmail(to, subject, body);
    }

    // 4. Quotation Approval Updates
    public void sendQuotationUpdate(String to, Quotation quote, String statusMessage) {
        String subject = "Quotation Update: " + quote.getRfq().getTitle();
        String body = "<h3>Status Update on Your Quotation</h3>"
                + "<p>Your quotation for RFQ <strong>" + quote.getRfq().getTitle() + "</strong> has been updated.</p>"
                + "<p>New Status: <strong>" + statusMessage + "</strong></p>";
        sendHtmlEmail(to, subject, body);
    }

    // 5. Sending Purchase Order
    public void sendPurchaseOrder(String to, PurchaseOrder po) {
        String subject = "Contract Awarded! Purchase Order #" + po.getPoNumber();
        String body = "<h3>Congratulations!</h3>"
                + "<p>Your quotation has been approved and you have been awarded the contract.</p>"
                + "<p>Please log in to your dashboard to view and accept Purchase Order <strong>#" + po.getPoNumber() + "</strong>.</p>";
        // Note: You can upgrade the base method to attach a generated PDF here later!
        sendHtmlEmail(to, subject, body);
    }

    // 7. Customized Email from Officer/Approver
    public void sendCustomEmail(String to, String subject, String customMessage) {
        String body = "<h3>Message from Vendor Bridge Procurement Team</h3>"
                + "<p>" + customMessage.replace("\n", "<br>") + "</p>";
        sendHtmlEmail(to, subject, body);
    }
}