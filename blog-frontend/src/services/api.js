import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

const authHeaders = (token) => ({
  headers: token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {},
});

// Auth
export const registerUser = (data) => api.post('/api/auth/register', data);
export const loginUser = (data) => api.post('/api/auth/login', data);

// Posts
export const getPosts = (token) => api.get('/api/posts', authHeaders(token));
export const createPost = (post, token) =>
  api.post('/api/posts', post, authHeaders(token));
export const deletePost = (id, token) =>
  api.delete(`/api/posts/${id}`, authHeaders(token));

// Comments
export const getComments = (postId, token) =>
  api.get(`/api/comments/post/${postId}`, authHeaders(token));
export const addComment = (comment, token) =>
  api.post('/api/comments', comment, authHeaders(token));

// Likes
export const togglePostLike = (postId, token) => {
  console.log('API togglePostLike called with postId:', postId, 'token:', !!token);
  return api.post(`/api/posts/${postId}/like`, {}, authHeaders(token));
};

export const toggleCommentLike = (commentId, token) => {
  console.log('API toggleCommentLike called with commentId:', commentId, 'token:', !!token);
  return api.post(`/api/comments/${commentId}/like`, {}, authHeaders(token));
};

// Legacy function for backward compatibility
export const toggleLike = (likeData, token) => {
  console.log('API toggleLike called with:', likeData, 'token:', !!token);
  const { targetId, targetType } = likeData;
  if (targetType === 'post') {
    return togglePostLike(targetId, token);
  } else if (targetType === 'comment') {
    return toggleCommentLike(targetId, token);
  }
  return api.post('/api/likes', likeData, authHeaders(token));
};

export default api;