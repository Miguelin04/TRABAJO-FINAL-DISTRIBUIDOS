package com.netflix.pagos.infrastructure.controller;

import com.netflix.pagos.application.dto.HealthResponseDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health")
    public HealthResponseDTO healthCheck() {
        return new HealthResponseDTO("UP");
    }
}
