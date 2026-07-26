package com.netflix.pagos.application.dto;

import com.netflix.pagos.domain.model.PostState;

public class PostResponseDTO {
    private String status;
    private String servicio;
    private PostState postState;
    private String mensaje;

    public PostResponseDTO(String status, String servicio, PostState postState, String mensaje) {
        this.status = status;
        this.servicio = servicio;
        this.postState = postState;
        this.mensaje = mensaje;
    }

    public String getStatus() { return status; }
    public String getServicio() { return servicio; }
    public PostState getPostState() { return postState; }
    public String getMensaje() { return mensaje; }
}
