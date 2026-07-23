import os
import shutil

base_dir = "microservicios/servicio-pagos-1"
src_dir = os.path.join(base_dir, "src")
if os.path.exists(src_dir):
    shutil.rmtree(src_dir)

packages = [
    "src/main/java/com/netflix/pagos/application/dto",
    "src/main/java/com/netflix/pagos/application/service",
    "src/main/java/com/netflix/pagos/domain/model",
    "src/main/java/com/netflix/pagos/domain/exception",
    "src/main/java/com/netflix/pagos/infrastructure/controller",
    "src/main/java/com/netflix/pagos/infrastructure/network",
    "src/main/java/com/netflix/pagos/config",
    "src/main/resources"
]

for p in packages:
    os.makedirs(os.path.join(base_dir, p), exist_ok=True)

# pom.xml
pom_content = """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.2</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.netflix</groupId>
    <artifactId>pagos</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>servicio-pagos</name>
    <description>Microservicio de Pagos para la Práctica 16</description>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
"""
with open(os.path.join(base_dir, "pom.xml"), "w", encoding="utf-8") as f:
    f.write(pom_content)

# application.properties
props = "server.port=9001\n"
with open(os.path.join(base_dir, "src/main/resources/application.properties"), "w", encoding="utf-8") as f:
    f.write(props)

# PagosApplication.java
app_java = """package com.netflix.pagos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PagosApplication {
    public static void main(String[] args) {
        SpringApplication.run(PagosApplication.class, args);
    }
}
"""
with open(os.path.join(base_dir, "src/main/java/com/netflix/pagos/PagosApplication.java"), "w", encoding="utf-8") as f:
    f.write(app_java)

# domain/model/Pago.java
pago_model = """package com.netflix.pagos.domain.model;

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
"""
with open(os.path.join(base_dir, "src/main/java/com/netflix/pagos/domain/model/Pago.java"), "w", encoding="utf-8") as f:
    f.write(pago_model)

# application/dto/PagoResponseDTO.java
dto_java = """package com.netflix.pagos.application.dto;

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
"""
with open(os.path.join(base_dir, "src/main/java/com/netflix/pagos/application/dto/PagoResponseDTO.java"), "w", encoding="utf-8") as f:
    f.write(dto_java)

# application/dto/HealthResponseDTO.java
health_dto = """package com.netflix.pagos.application.dto;

public class HealthResponseDTO {
    private String status;

    public HealthResponseDTO(String status) {
        this.status = status;
    }

    public String getStatus() { return status; }
}
"""
with open(os.path.join(base_dir, "src/main/java/com/netflix/pagos/application/dto/HealthResponseDTO.java"), "w", encoding="utf-8") as f:
    f.write(health_dto)

# infrastructure/network/NetworkService.java
net_service = """package com.netflix.pagos.infrastructure.network;

import org.springframework.stereotype.Service;
import java.net.InetAddress;
import java.net.UnknownHostException;

@Service
public class NetworkService {
    public String getLocalIpAddress() {
        try {
            return InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException e) {
            return "Desconocida";
        }
    }
}
"""
with open(os.path.join(base_dir, "src/main/java/com/netflix/pagos/infrastructure/network/NetworkService.java"), "w", encoding="utf-8") as f:
    f.write(net_service)

# application/service/PagoApplicationService.java
app_service = """package com.netflix.pagos.application.service;

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
"""
with open(os.path.join(base_dir, "src/main/java/com/netflix/pagos/application/service/PagoApplicationService.java"), "w", encoding="utf-8") as f:
    f.write(app_service)

# infrastructure/controller/PagosController.java
controller = """package com.netflix.pagos.infrastructure.controller;

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
"""
with open(os.path.join(base_dir, "src/main/java/com/netflix/pagos/infrastructure/controller/PagosController.java"), "w", encoding="utf-8") as f:
    f.write(controller)

# infrastructure/controller/HealthController.java
health_controller = """package com.netflix.pagos.infrastructure.controller;

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
"""
with open(os.path.join(base_dir, "src/main/java/com/netflix/pagos/infrastructure/controller/HealthController.java"), "w", encoding="utf-8") as f:
    f.write(health_controller)
