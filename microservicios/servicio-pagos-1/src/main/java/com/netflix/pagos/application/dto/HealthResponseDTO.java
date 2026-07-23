package com.netflix.pagos.application.dto;

public class HealthResponseDTO {
    private String status;

    public HealthResponseDTO(String status) {
        this.status = status;
    }

    public String getStatus() { return status; }
}
