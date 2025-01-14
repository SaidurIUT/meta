package com.meta.checker.client;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.service.annotation.GetExchange;

public interface OfficeClient {
    @GetExchange("/os/v1/office/{officeId}/users/{userId}/can-alter")
    boolean canAlterOffice(@PathVariable String officeId, @PathVariable String userId);
}
