package com.netflix.pagos.domain.repository;

import com.netflix.pagos.domain.model.PostState;
import java.util.Optional;

public interface PostRepository {
    PostState save(PostState post);
    Optional<PostState> findById(String postId);
}
