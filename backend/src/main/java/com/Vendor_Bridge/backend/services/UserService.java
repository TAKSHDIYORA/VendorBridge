package com.Vendor_Bridge.backend.services;

import com.Vendor_Bridge.backend.dtos.PasswordUpdate;
import com.Vendor_Bridge.backend.dtos.VendorUpdate;
import com.Vendor_Bridge.backend.dtos.registerRequest;
import com.Vendor_Bridge.backend.models.Role;
import com.Vendor_Bridge.backend.models.User;
import com.Vendor_Bridge.backend.models.Vendor;
import com.Vendor_Bridge.backend.repositories.UserRepository;
import com.Vendor_Bridge.backend.repositories.VendorRepository;
import org.aspectj.apache.bcel.ExceptionConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {
    private  final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private  final VendorRepository vendorRepository;

    @Autowired
    public UserService(UserRepository userRepository,PasswordEncoder passwordEncoder,VendorRepository vendorRepository){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.vendorRepository = vendorRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)throws UsernameNotFoundException {
        return userRepository.findByEmail(username).orElseThrow(()->new UsernameNotFoundException("User not found in mysql: "+username));
    }

    public List<User> fetchByRole(Role role) throws  Exception{
        try{
             List<User> users = userRepository.findByRole(role);
             return users;
        } catch (Exception e) {
            throw  new Exception(e.getMessage());
        }
    }

    @Transactional
    public void registerUser(registerRequest registerrequest)throws  Exception{
         try{
             if(userRepository.findByEmail(registerrequest.getEmail()).isPresent()){
                 throw  new Exception("user already exists!");
             }
             String password = passwordEncoder.encode(registerrequest.getPassword());
             User user = new User(registerrequest.getEmail(), password,registerrequest.getRole());
             userRepository.save(user);
         }catch (Exception e){
             throw new Exception(e.getMessage());
         }
    }

    @Transactional
    public void registerVendor(registerRequest request) throws Exception {
        try {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new Exception("User already exists!");
            }

            Vendor vendor = new Vendor();
            vendor.setEmail(request.getEmail());
            vendor.setPassword(passwordEncoder.encode(request.getPassword()));
            vendor.setRole(Role.VENDOR);

            // Map the vendor-specific fields from the DTO
            vendor.setCompanyName(request.getCompanyName());
            vendor.setGstNumber(request.getGstNumber());
            vendor.setVendorCategory(request.getVendorCategory());

            // Saving via vendorRepository ensures data is written to both user and vendors tables
            vendorRepository.save(vendor);

        } catch (Exception e) {
//            System.out.println(e.getMessage());
            throw new Exception(e.getMessage());
        }
    }

     public Vendor getVendor(String email) throws Exception{
         try{
               return vendorRepository.findByEmail(email).orElseThrow();
         } catch (Exception e) {
             throw  new Exception(e.getMessage());
         }
     }

     @Transactional
    public void update(VendorUpdate vendorUpdate)throws Exception{
        try{
            Optional<Vendor> vendor = vendorRepository.findByEmail(vendorUpdate.getEmail());
            if(vendor.isEmpty()){
                throw new Exception("vendor not found!!");
            }
          Vendor  ven = vendor.get();
            ven.setCompanyName(vendorUpdate.getCompanyName());
            ven.setGstNumber(vendorUpdate.getGstNumber());
            ven.setVendorCategory(vendorUpdate.getVendorCategory());
            ven.setAddress(vendorUpdate.getAddress());
            ven.setCity(vendorUpdate.getCity());
            ven.setState(vendorUpdate.getState());
            ven.setCountry(vendorUpdate.getCountry());
            ven.setPostalCode(vendorUpdate.getPostalCode());

            vendorRepository.save(ven);

        } catch (Exception e) {
            throw new Exception(e);
        }
     }

     @Transactional
    public void updatePass(PasswordUpdate passwordUpdate,String email)throws  Exception{
        try{
            Optional<Vendor> vendor = vendorRepository.findByEmail(email);
            if(vendor.isEmpty()){
                throw new Exception("vendor not found!!");
            }
            Vendor ven = vendor.get();

            if (!passwordEncoder.matches(passwordUpdate.getCurrentPassword(), ven.getPassword())) {
                throw new Exception("Enter valid password");
            }
             String newEncodedPass = passwordEncoder.encode(passwordUpdate.getNewPassword());
            ven.setPassword(newEncodedPass);
            vendorRepository.save(ven);
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
     }
}

