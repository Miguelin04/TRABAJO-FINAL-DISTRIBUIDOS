package com.netflix.pagos.domain.model;

import java.util.UUID;

public class Pago {
    private String idTransaccion;
    private double monto;
    private String estado;
    private String ipProcesamiento;

    public Pago(double monto, String estado, String ipProcesamiento) {
        this.idTransaccion = UUID.randomUUID().toString();
        this.monto = monto;
        this.estado = estado;
        this.ipProcesamiento = ipProcesamiento;
    }

    public String getIdTransaccion() { return idTransaccion; }
    public double getMonto() { return monto; }
    public String getEstado() { return estado; }
    public String getIpProcesamiento() { return ipProcesamiento; }
}
