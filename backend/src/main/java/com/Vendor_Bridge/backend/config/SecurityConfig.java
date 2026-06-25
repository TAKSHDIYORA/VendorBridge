package com.Vendor_Bridge.backend.config;

import com.Vendor_Bridge.backend.jwt.JwtAuthenticationFilter;
import com.Vendor_Bridge.backend.services.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserService userService) {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider(userService);
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        authenticationProvider.setHideUserNotFoundExceptions(false);
        return new ProviderManager(authenticationProvider);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> originsList = Arrays.asList(allowedOrigins.split(","));
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(originsList);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        configuration.setExposedHeaders(Collections.singletonList("Authorization"));
        configuration.setAllowCredentials(true); // Needed if you pass cookies or pass explicit auth tokens back/forth

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Applies this rule to all application paths
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {

        http.cors(cors -> cors.configure(http))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

//
                                .requestMatchers(HttpMethod.POST, "/api/auth/register/vendor").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/auth/register/staff").hasRole("ADMIN")
                                .requestMatchers("/api/auth/login").permitAll()
                                .requestMatchers("/api/auth/users/vendors").hasAnyRole("ADMIN", "OFFICER")
                                .requestMatchers("/api/rfqs/create").hasAnyRole("ADMIN", "OFFICER")
                                .requestMatchers("/api/rfqs/all").hasAnyRole("ADMIN", "OFFICER")
                                .requestMatchers("/api/rfqs/published").hasAnyRole("VENDOR")
                                .requestMatchers(HttpMethod.PUT,"/api/rfqs/publish/**").hasAnyRole("APPROVER")
                                .requestMatchers(HttpMethod.PUT,"/api/quotations/approve/**").hasAnyRole("OFFICER")
                                .requestMatchers(HttpMethod.GET,"/api/quotations/officer/**").hasAnyRole("APPROVER")
                                .requestMatchers(HttpMethod.PUT,"/api/quotations/action/**").hasAnyRole("APPROVER")
                                .requestMatchers(HttpMethod.GET,"/api/quotations/po/all").hasAnyRole("APPROVER","OFFICER")


                                .anyRequest().authenticated()

                )
                .httpBasic(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 2. REGISTER JWT FILTER on the chain before the standard UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

}