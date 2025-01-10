// src/main/java/com/map/MetaHive/config/WebSocketConfig.java

package com.map.MetaHive.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.context.annotation.Bean;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory broker with destinations prefixed by /topic and /queue
        config.enableSimpleBroker("/topic", "/queue");
        // Set application destination prefix for client messages
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:3000", "http://127.0.0.1:3000") // Specify allowed origins
                .withSockJS();
    }

    @Bean
    public CorsFilter corsFilter() {
        // Configure CORS for the React app
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true); // Allow credentials (e.g., cookies, headers)
        config.addAllowedOrigin("http://localhost:3000"); // React development server
        config.addAllowedOrigin("http://127.0.0.1:3000"); // Alternate local development origin
        // Add your production frontend URL below
        // config.addAllowedOrigin("https://your-production-domain.com");
        config.addAllowedHeader("*"); // Allow all headers
        config.addAllowedMethod("*"); // Allow all HTTP methods (GET, POST, etc.)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // Apply the CORS configuration
        return new CorsFilter(source); // Return the configured filter
    }
}
