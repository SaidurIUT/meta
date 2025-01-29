package com.meta.gateway;

import org.junit.jupiter.api.BeforeAll;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
public abstract class BaseTestcontainers {

    static final Network NETWORK = Network.newNetwork();
    
    @Container
    static final MySQLContainer<?> mysqlContainer = new MySQLContainer<>("mysql:8.0.36")
            .withNetwork(NETWORK)
            .withNetworkAliases("mysql")
            .withDatabaseName("keycloak")
            .withUsername("keycloak")
            .withPassword("password");

    @Container
    static final GenericContainer<?> keycloakContainer = new GenericContainer<>("quay.io/keycloak/keycloak:24.0.1")
            .withNetwork(NETWORK)
            .withNetworkAliases("keycloak")
            .withExposedPorts(8080)
            .withEnv("KEYCLOAK_ADMIN", "admin")
            .withEnv("KEYCLOAK_ADMIN_PASSWORD", "admin")
            .withEnv("KC_DB", "mysql")
            .withEnv("KC_DB_URL", "jdbc:mysql://mysql:3306/keycloak")
            .withEnv("KC_DB_USERNAME", "keycloak")
            .withEnv("KC_DB_PASSWORD", "password")
            .withCommand("start-dev");

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.security.oauth2.resourceserver.jwt.issuer-uri", 
            () -> String.format("http://localhost:%d/realms/meta", keycloakContainer.getMappedPort(8080)));
    }

    @BeforeAll
    static void beforeAll() {
        mysqlContainer.start();
        keycloakContainer.start();
    }
} 