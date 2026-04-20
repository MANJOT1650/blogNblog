import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './Settings.css';

const Settings = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        bio: user?.bio || '',
        password: '',
        confirmPassword: ''
    });
    const [profilePic, setProfilePic] = useState(null);
    const [preview, setPreview] = useState(user?.profilePicture ? `http://localhost:8080${user.profilePicture}` : null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        const data = new FormData();
        if (formData.username !== user.username) data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('bio', formData.bio);
        if (formData.password) data.append('password', formData.password);
        if (profilePic) data.append('profilePic', profilePic);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:8080/api/users/me', data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Update local user state
            const updatedUser = { ...user, ...res.data, token: token }; // keep token
            setUser(updatedUser);
            localStorage.setItem('blogUser', JSON.stringify(updatedUser));
            
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            
            // If username changed, redirect to new profile URL after a delay
            if (formData.username !== user.username) {
                setTimeout(() => navigate(`/${formData.username}`), 1500);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-card">
                <h1>Settings</h1>
                
                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="profile-pic-section">
                        <div className="current-pic">
                            {preview ? (
                                <img src={preview} alt="Profile" />
                            ) : (
                                <div className="pic-placeholder">{formData.username[0]?.toUpperCase()}</div>
                            )}
                            <label htmlFor="pic-upload" className="upload-badge">
                                <Camera size={16} />
                                <input id="pic-upload" type="file" onChange={handleFileChange} hidden accept="image/*" />
                            </label>
                        </div>
                        <div className="pic-info">
                            <h3>Profile Photo</h3>
                            <p>Update your profile picture</p>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`message-banner ${message.type}`}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="input-group">
                            <label><User size={16} /> Username</label>
                            <input 
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Username"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label><Mail size={16} /> Email Address</label>
                            <input 
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                            />
                        </div>
                        <div className="input-group full-width">
                            <label>Bio</label>
                            <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                        
                        <div className="divider full-width">
                            <span>Change Password</span>
                            <p>Leave blank to keep current password</p>
                        </div>

                        <div className="input-group">
                            <label><Lock size={16} /> New Password</label>
                            <input 
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="input-group">
                            <label><Lock size={16} /> Confirm Password</label>
                            <input 
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
