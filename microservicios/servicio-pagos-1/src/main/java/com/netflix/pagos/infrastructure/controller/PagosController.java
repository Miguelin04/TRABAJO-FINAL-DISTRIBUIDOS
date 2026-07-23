package com.netflix.pagos.infrastructure.controller;

import com.netflix.pagos.application.dto.PagoResponseDTO;
import com.netflix.pagos.application.service.PagoApplicationService;
import com.netflix.pagos.domain.model.Pago;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PagosController {

    private final PagoApplicationService pagoApplicationService;

    public PagosController(PagoApplicationService pagoApplicationService) {
        this.pagoApplicationService = pagoApplicationService;
    }

    @GetMapping("/")
    public PagoResponseDTO realizarPago(@RequestParam(defaultValue = "15.99") double monto) {
        Pago nuevoPago = pagoApplicationService.procesarNuevoPago(monto);
        
        return new PagoResponseDTO(
                "EXITO",
                "Microservicio de Pagos (Caso Netflix)",
                nuevoPago,
                "Pago procesado correctamente por este integrante."
        );
    }
}
