package com.netflix.pagos.application.service;

import com.netflix.pagos.domain.model.PostState;
import com.netflix.pagos.domain.repository.PostRepository;
import com.netflix.pagos.infrastructure.network.NetworkService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LikeService {

    private final NetworkService networkService;
    private final PostRepository postRepository;

    public LikeService(NetworkService networkService, PostRepository postRepository) {
        this.networkService = networkService;
        this.postRepository = postRepository;
    }

    public PostState likePost(String postId, long timestamp, int version) {
        String nodeId = "nodo-db-1"; // Se sobrescribirá en el controller leyendo application.properties o entorno
        
        Optional<PostState> optionalPost = postRepository.findById(postId);
        PostState currentPost;
        
        if (optionalPost.isEmpty()) {
            currentPost = new PostState(postId, 1, timestamp, version, nodeId);
        } else {
            currentPost = optionalPost.get();
            // Last Write Wins (local resolution)
            if (timestamp > currentPost.getTimestamp() || 
               (timestamp == currentPost.getTimestamp() && version > currentPost.getVersion())) {
                currentPost.setLikes(currentPost.getLikes() + 1);
                currentPost.setTimestamp(timestamp);
                currentPost.setVersion(version);
                currentPost.setNodeId(nodeId);
            }
        }

        return postRepository.save(currentPost);
    }

    public PostState getPost(String postId, String fallbackNodeId) {
        return postRepository.findById(postId)
                .orElse(new PostState(postId, 0, 0, 0, fallbackNodeId));
    }
    
    public void syncPost(PostState state) {
        postRepository.save(state);
    }
}
