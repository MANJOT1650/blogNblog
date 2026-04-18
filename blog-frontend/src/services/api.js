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
export const createPost = (formData, token) =>
  api.post('/api/posts', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
export const deletePost = (id, token) =>
  api.delete(`/api/posts/${id}`, authHeaders(token));

// Comments
export const getComments = (postId, token) =>
  api.get(`/api/comments/post/${postId}`, authHeaders(token));
export const addComment = (comment, token) =>
  api.post('/api/comments', comment, authHeaders(token));

// Likes
export const togglePostLike = (postId, token) => 
  api.post(`/api/posts/${postId}/like`, {}, authHeaders(token));

export const toggleCommentLike = (commentId, token) => 
  api.post(`/api/comments/${commentId}/like`, {}, authHeaders(token));

// Messages
export const getMessages = (username, token) =>
  api.get(`/api/messages/${username}`, authHeaders(token));

// Users
export const getProfile = (username, token) =>
  api.get(`/api/users/${username}`, authHeaders(token));
export const updateProfile = (formData, token) =>
  api.post('/api/users/me', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export default api;