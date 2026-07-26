package com.netflix.pagos.infrastructure.controller;

import com.netflix.pagos.application.dto.PostResponseDTO;
import com.netflix.pagos.application.service.LikeService;
import com.netflix.pagos.domain.model.PostState;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final LikeService likeService;
    
    @Value("${server.port}")
    private String serverPort;

    public PostController(LikeService likeService) {
        this.likeService = likeService;
    }

    private String getNodeId() {
        return "nodo-" + serverPort;
    }

    @PostMapping("/{postId}/like")
    public PostResponseDTO likePost(@PathVariable String postId, @RequestBody Map<String, Object> payload) {
        long timestamp = payload.containsKey("timestamp") ? Long.parseLong(payload.get("timestamp").toString()) : System.currentTimeMillis();
        int version = payload.containsKey("version") ? Integer.parseInt(payload.get("version").toString()) : 1;
        
        PostState updatedState = likeService.likePost(postId, timestamp, version);
        updatedState.setNodeId(getNodeId()); // Aseguramos que se devuelva el ID correcto
        
        return new PostResponseDTO("EXITO", "Nodo DB Memoria", updatedState, "Like procesado (W)");
    }

    @GetMapping("/{postId}")
    public PostResponseDTO getPost(@PathVariable String postId) {
        PostState state = likeService.getPost(postId, getNodeId());
        state.setNodeId(getNodeId());
        return new PostResponseDTO("EXITO", "Nodo DB Memoria", state, "Lectura de estado (R)");
    }
    
    @PostMapping("/{postId}/sync")
    public PostResponseDTO syncPost(@PathVariable String postId, @RequestBody PostState state) {
        state.setNodeId(getNodeId()); // Al guardar, se marca que está en este nodo
        likeService.syncPost(state);
        return new PostResponseDTO("EXITO", "Nodo DB Memoria", state, "Sincronización Read Repair completada");
    }
}
