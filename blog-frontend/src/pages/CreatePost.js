import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePost.css';

const CreatePost = ({ user }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please complete the post details.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    if (image) {
      formData.append('image', image);
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/');
    } catch (err) {
      setError('Failed to create post. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">
      <div className="create-card">
        <h2>Create New Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="image-upload-section">
            {preview ? (
              <div className="preview-container">
                 <img src={preview} alt="Preview" />
                 <button type="button" className="remove-btn" onClick={() => {setImage(null); setPreview(null);}}>✕</button>
              </div>
            ) : (
              <div className="upload-placeholder" onClick={() => document.getElementById('imageInput').click()}>
                <div className="icon">📷</div>
                <span>Select from computer</span>
              </div>
            )}
            <input 
              id="imageInput"
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-fields">
             <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title..."
              className="title-input"
              required
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a caption..."
              className="caption-input"
              required
            />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
            >
              <option value="General">General</option>
              <option value="Photography">Photography</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
            
            {error && <div className="error-msg">{error}</div>}
            
            <button type="submit" className="share-btn" disabled={loading}>
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;