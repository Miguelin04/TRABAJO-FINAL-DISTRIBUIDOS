package com.netflix.pagos.application.dto;

import com.netflix.pagos.domain.model.Pago;

public class PagoResponseDTO {
    private String status;
    private String servicio;
    private Pago datosTransaccion;
    private String mensaje;

    public PagoResponseDTO(String status, String servicio, Pago datosTransaccion, String mensaje) {
        this.status = status;
        this.servicio = servicio;
        this.datosTransaccion = datosTransaccion;
        this.mensaje = mensaje;
    }

    public String getStatus() { return status; }
    public String getServicio() { return servicio; }
    public Pago getDatos_transaccion() { return datosTransaccion; }
    public String getMensaje() { return mensaje; }
}
