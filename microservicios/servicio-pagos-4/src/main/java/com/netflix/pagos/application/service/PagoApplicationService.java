package com.netflix.pagos.application.service;

import com.netflix.pagos.domain.model.Pago;
import com.netflix.pagos.infrastructure.network.NetworkService;
import org.springframework.stereotype.Service;

@Service
public class PagoApplicationService {

    private final NetworkService networkService;

    public PagoApplicationService(NetworkService networkService) {
        this.networkService = networkService;
    }

    public Pago procesarNuevoPago(double monto) {
        String ipLocal = networkService.getLocalIpAddress();
        return new Pago(monto, "APROBADO", ipLocal);
    }
}
