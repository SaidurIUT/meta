package com.meta.gateway.routes;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.server.mvc.filter.CircuitBreakerFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import java.net.URI;

import static org.springframework.cloud.gateway.server.mvc.filter.FilterFunctions.setPath;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.web.servlet.function.RequestPredicates.GET;

@Configuration
public class Routes {
    @Value("${office.service.url}")
    private String officeServiceUrl;
    @Value("${user.service.url}")
    private String userServiceUrl;

    // Office Service Routes

    @Bean
    public RouterFunction<ServerResponse> officeServiceRoute() {
        return route("office_service")
                .route(RequestPredicates.path("/os/**"), HandlerFunctions.http(officeServiceUrl))
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("officeServiceCircuitBreaker",   URI.create("forward:/fallbackRoute")))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> officeServiceSwaggerRoute() {
        return route("office_service_swagger")
                .route(GET("/aggregate/office-service/v3/api-docs"), HandlerFunctions.http(officeServiceUrl))
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("officeServiceSwaggerCircuitBreaker",   URI.create("forward:/fallbackRoute")))
                .filter(setPath("/v3/api-docs"))
                .build();
    }

    // User Service Routes

    @Bean
    public RouterFunction<ServerResponse> userServiceRoute() {
        return route("user_service")
                .route(RequestPredicates.path("/us/**"), HandlerFunctions.http(userServiceUrl))
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("userServiceCircuitBreaker",   URI.create("forward:/fallbackRoute")))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> userServiceSwaggerRoute() {
        return route("user_service_swagger")
                .route(GET("/aggregate/user-service/v3/api-docs"), HandlerFunctions.http(userServiceUrl))
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("userServiceSwaggerCircuitBreaker",   URI.create("forward:/fallbackRoute")))
                .filter(setPath("/v3/api-docs"))
                .build();
    }



    @Bean
    public RouterFunction<ServerResponse> fallbackRoute(){
        return route("fallbackRoute")
                .GET("/fallbackRoute", request -> ServerResponse.status(HttpStatus.SERVICE_UNAVAILABLE).body("Service is Unavailable for now, please try again later."))
                .build();
    }


}