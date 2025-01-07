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

//package com.meta.gateway.routes;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.cloud.gateway.route.RouteLocator;
//import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//
//@Configuration
//public class Routes {
//    @Value("${office.service.url}")
//    private String officeServiceUrl;
//    @Value("${user.service.url}")
//    private String userServiceUrl;
//
//    @Bean
//    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
//        return builder.routes()
//                // Office Service Routes
//                .route("office_service", r -> r
//                        .path("/os/**")
//                        .filters(f -> f
//                                .circuitBreaker(config -> config
//                                        .setName("officeServiceCircuitBreaker")
//                                        .setFallbackUri("forward:/fallbackRoute")))
//                        .uri(officeServiceUrl))
//                .route("office_service_swagger", r -> r
//                        .path("/aggregate/office-service/v3/api-docs")
//                        .filters(f -> f
//                                .circuitBreaker(config -> config
//                                        .setName("officeServiceSwaggerCircuitBreaker")
//                                        .setFallbackUri("forward:/fallbackRoute"))
//                                .setPath("/v3/api-docs"))
//                        .uri(officeServiceUrl))
//                // User Service Routes
//                .route("user_service", r -> r
//                        .path("/us/**")
//                        .filters(f -> f
//                                .circuitBreaker(config -> config
//                                        .setName("userServiceCircuitBreaker")
//                                        .setFallbackUri("forward:/fallbackRoute")))
//                        .uri(userServiceUrl))
//                .route("user_service_swagger", r -> r
//                        .path("/aggregate/user-service/v3/api-docs")
//                        .filters(f -> f
//                                .circuitBreaker(config -> config
//                                        .setName("userServiceSwaggerCircuitBreaker")
//                                        .setFallbackUri("forward:/fallbackRoute"))
//                                .setPath("/v3/api-docs"))
//                        .uri(userServiceUrl))
//                .build();
//    }
//
//    @RestController
//    public class FallbackController {
//        @GetMapping("/fallbackRoute")
//        public ResponseEntity<String> fallback() {
//            return ResponseEntity
//                    .status(HttpStatus.SERVICE_UNAVAILABLE)
//                    .body("Service is Unavailable for now, please try again later.");
//        }
//    }
//}
//

