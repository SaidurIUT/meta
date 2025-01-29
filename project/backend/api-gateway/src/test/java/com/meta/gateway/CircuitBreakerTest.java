package com.meta.gateway;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class CircuitBreakerTest extends BaseTestcontainers {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @Test
    void shouldOpenCircuitBreakerAfterFailures() {
        // Get the circuit breaker for user service
        CircuitBreaker circuitBreaker = circuitBreakerRegistry.circuitBreaker("userServiceCircuitBreaker");
        
        // Make multiple calls to trigger circuit breaker
        for (int i = 0; i < 5; i++) {
            ResponseEntity<String> response = restTemplate.getForEntity("/user/profile", String.class);
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        // Verify circuit breaker state
        assertThat(circuitBreaker.getState()).isEqualTo(CircuitBreaker.State.OPEN);
    }
} 