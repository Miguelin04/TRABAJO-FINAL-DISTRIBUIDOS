const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const fetchStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/status`);
    if (!response.ok) throw new Error('Error de red');
    return await response.json();
  } catch (error) {
    console.error("Error al obtener status:", error);
    return null;
  }
};

export const likePost = async (postId = "post-123") => {
  try {
    const response = await fetch(`${API_URL}/api/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId })
    });
    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error("Error al dar like:", error);
    return { data: null, status: 500 };
  }
};

export const getPost = async (postId = "post-123") => {
  try {
    const response = await fetch(`${API_URL}/api/posts/${postId}`);
    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error("Error al obtener post:", error);
    return { data: null, status: 500 };
  }
};
