package com.netflix.pagos.domain.model;

public class PostState {
    private String postId;
    private int likes;
    private long timestamp;
    private int version;
    private String nodeId;

    public PostState() {}

    public PostState(String postId, int likes, long timestamp, int version, String nodeId) {
        this.postId = postId;
        this.likes = likes;
        this.timestamp = timestamp;
        this.version = version;
        this.nodeId = nodeId;
    }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }
    
    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }
    
    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    
    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }
    
    public String getNodeId() { return nodeId; }
    public void setNodeId(String nodeId) { this.nodeId = nodeId; }
}
