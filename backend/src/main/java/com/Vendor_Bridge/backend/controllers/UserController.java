package com.Vendor_Bridge.backend.controllers;

import com.Vendor_Bridge.backend.dtos.*;
import com.Vendor_Bridge.backend.jwt.JwtService;
import com.Vendor_Bridge.backend.models.Role;
import com.Vendor_Bridge.backend.models.User;
import com.Vendor_Bridge.backend.models.Vendor;
import com.Vendor_Bridge.backend.repositories.VendorRepository;
import com.Vendor_Bridge.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

import static com.Vendor_Bridge.backend.models.Role.ADMIN;
import static com.Vendor_Bridge.backend.models.Role.VENDOR;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private  final JwtService jwtService;

    @Autowired
    public UserController(UserService userService,JwtService jwtService,AuthenticationManager authenticationManager){
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register/vendor")
    public ResponseEntity<?> registerUser(@RequestBody registerRequest regReq){
        try{
            regReq.setRole(VENDOR);
             userService.registerVendor(regReq);
             return new ResponseEntity<String>("user registerd successfully!!",HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<String>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PostMapping("/register/staff")
    public ResponseEntity<?> registerStaff(@RequestBody registerRequest regReq){
        try{
            if(regReq.getRole()==ADMIN){
                return new ResponseEntity<String>("can't register the admin",HttpStatus.UNAUTHORIZED);
            }
            userService.registerUser(regReq);
            return new ResponseEntity<String>("user registerd successfully!!",HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<Exception>(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody loginRequest logReq){
        try{
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(logReq.getEmail(), logReq.getPassword())
            );

            String token = jwtService.generateToken((UserDetails) auth.getPrincipal());
            loginResponse response = new loginResponse(token, logReq.getEmail(), auth.getAuthorities().iterator().next().getAuthority());

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (UsernameNotFoundException e) {
            // This triggers when the UserDetailsService cannot find the email in the database
            return new ResponseEntity<>("Username not found", HttpStatus.NOT_FOUND);

        }catch (BadCredentialsException e) {
            // This triggers specifically when the email exists, but the password is wrong
            return new ResponseEntity<>("Wrong password", HttpStatus.UNAUTHORIZED);

        }  catch (Exception e) {
            // Catch-all for any other server errors (e.g., database is down)
            return new ResponseEntity<>("An error occurred during login", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/users/vendors")
    @PreAuthorize("hasRole('OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAllVendors() {
     try {

         List<User> vendors = userService.fetchByRole(VENDOR);
//         List<String> emails = new ArrayList<String>();

         return ResponseEntity.ok(vendors);
     } catch (Exception e) {
         return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
     }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getVendor(@AuthenticationPrincipal User currentUser){
        try{
            String email = currentUser.getEmail();
            Vendor vendor = userService.getVendor(email);
              return new ResponseEntity<Vendor>(vendor,HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @PutMapping("/profile")
    public ResponseEntity<?> changeVendor(@RequestBody VendorUpdate vendor){
        try{
                 userService.update(vendor);
            return new ResponseEntity<String>("Profile updated successfully!!!",HttpStatus.OK);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal User currUser,@RequestBody PasswordUpdate passwordUpdate){
       try{
           userService.updatePass(passwordUpdate,currUser.getEmail());
           return new ResponseEntity<String>("password updated successfully",HttpStatus.OK);
       } catch (Exception e) {
          return new ResponseEntity<String>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
       }
    }

}
