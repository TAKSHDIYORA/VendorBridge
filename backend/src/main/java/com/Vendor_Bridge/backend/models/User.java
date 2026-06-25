package com.Vendor_Bridge.backend.models;

import jakarta.persistence.*;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public class User implements UserDetails {
       @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private  Long id;

       @Column(unique = true,nullable = false)
     private  String email;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    @Column(nullable = false)
    private  String password;

    public User(String email, String password, Role role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public User() {
    }

    @Enumerated(EnumType.STRING)
    private  Role role;

       @Override
    public Collection<?extends GrantedAuthority> getAuthorities(){
           return List.of(new SimpleGrantedAuthority("ROLE_"+role.name()));
       }
    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    public void setEmail(String mail) {
           this.email = mail;
    }

    public void setPassword(@Nullable String encode) {
      this.password = encode;
       }

    public void setRole(Role role) {
           this.role = role;
    }
}
