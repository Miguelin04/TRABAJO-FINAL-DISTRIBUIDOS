package com.netflix.pagos.infrastructure.repository;

import com.netflix.pagos.domain.model.PostState;
import com.netflix.pagos.domain.repository.PostRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryPostRepository implements PostRepository {
    
    // Almacenamiento distribuido simulado en memoria
    private final ConcurrentHashMap<String, PostState> storage = new ConcurrentHashMap<>();

    @Override
    public PostState save(PostState post) {
        storage.put(post.getPostId(), post);
        return post;
    }

    @Override
    public Optional<PostState> findById(String postId) {
        return Optional.ofNullable(storage.get(postId));
    }
}
