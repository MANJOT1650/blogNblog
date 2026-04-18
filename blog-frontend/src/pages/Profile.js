import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getProfile, updateProfile } from '../services/api';
import './Profile.css';

const Profile = ({ user: currentUser }) => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [profRes, postsRes] = await Promise.all([
                axios.get(`http://localhost:8080/api/users/${username}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`http://localhost:8080/api/posts`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setProfile(profRes.data);
            setPosts(postsRes.data.filter(p => p.author === username));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [username]);

    const handleFollowToggle = async () => {
        if (!profile || isProcessing) return;
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = profile.isFollowing ? 'unfollow' : 'follow';
            await axios.post(`http://localhost:8080/api/users/${username}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchProfileData(); // Refresh counts and status
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!profile) return <div className="not-found">User not found</div>;

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="profile-avatar">
                   {profile.profilePicture ? (
                       <img src={`http://localhost:8080${profile.profilePicture}`} alt={profile.username} />
                   ) : (
                       <div className="avatar-placeholder">{profile.username[0].toUpperCase()}</div>
                   )}
                </div>
                <section className="profile-info">
                    <div className="profile-username-row">
                        <h1>{profile.username}</h1>
                        {currentUser.username === profile.username ? (
                            <button className="edit-profile">Edit Profile</button>
                        ) : (
                            <button 
                                className={`follow-btn-main ${profile.isFollowing ? 'unfollow' : 'follow'}`}
                                onClick={handleFollowToggle}
                                disabled={isProcessing}
                            >
                                {isProcessing ? '...' : (profile.isFollowing ? 'Following' : 'Follow')}
                            </button>
                        )}
                        <button className="options-btn">⚙️</button>
                    </div>
                    <div className="profile-stats">
                        <span><strong>{posts.length}</strong> posts</span>
                        <span><strong>{profile.followersCount || 0}</strong> followers</span>
                        <span><strong>{profile.followingCount || 0}</strong> following</span>
                    </div>
                    <div className="profile-bio">
                        <p>{profile.bio || "No bio yet."}</p>
                    </div>
                </section>
            </header>

            <div className="profile-tabs">
                <span className="active">POSTS</span>
                <span>SAVED</span>
                <span>TAGGED</span>
            </div>

            <div className="posts-grid">
                {posts.map(post => (
                    <div className="grid-item" key={post.id}>
                        {post.imageUrl ? (
                            <img src={`http://localhost:8080${post.imageUrl}`} alt={post.title} />
                        ) : (
                            <div className="post-text-fallback">{post.title}</div>
                        )}
                        <div className="grid-item-overlay">
                            <span>❤️ {post.likes}</span>
                            <span>💬 0</span>
                        </div>
                    </div>
                ))}
            </div>
            {posts.length === 0 && (
                <div className="empty-posts">
                    <div className="icon">📷</div>
                    <h2>No Posts Yet</h2>
                </div>
            )}
        </div>
    );
};

export default Profile;
