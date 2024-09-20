package com.student.filesystem;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import javax.sql.DataSource;

/**
 * Configuration class for application-wide settings and beans
 */
@Configuration
public class AppConfig {

    /**
     * Configures security filter chain for HTTP requests.
     * Disables CSRF protection, sets up authorization rules, and configures exception handling.
     * @param http HttpSecurity object for configuring security
     * @return SecurityFilterChain instance
     * @throws Exception if configuration encounters an error
     */

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsFilter corsFilter) throws Exception {
        http
                .csrf().disable() // Disable CSRF protection
                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                                .anyRequest().permitAll() // Permit all requests without authentication
                )
                .exceptionHandling() // Configure exception handling
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                .and()
                .addFilterBefore(corsFilter, CorsFilter.class) // Add CORS filter after CSRF filter
                .formLogin() // Configure form-based login
                .successHandler((req, res, auth) -> res.setStatus(HttpStatus.NO_CONTENT.value())) // Set success handler to return 204 status code
                .failureHandler(new SimpleUrlAuthenticationFailureHandler()) // Set failure handler for authentication failures
                .and()
                .logout() // Configure logout functionality
                .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT));
        return http.build();
    }
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:5173"); // Allow requests from your frontend domain
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true); // Allow credentials (cookies)
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
    /**
     * Provides an implementation of UserDetailsManager for managing user details.
     * @param dataSource DataSource for user data storage
     * @return UserDetailsManager instance
     */
    @Bean
    UserDetailsManager users(DataSource dataSource){
        return new JdbcUserDetailsManager(dataSource);
    }

    /**
     * Provides a PasswordEncoder bean for encoding passwords.
     * @return PasswordEncoder instance
     */
    @Bean
    PasswordEncoder passwordEncoder(){
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}
