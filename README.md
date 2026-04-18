# blogNblog 📸💬

**blogNblog** is a state-of-the-art, content-driven social platform inspired by Instagram. It delivers a seamless, real-time social experience, integrating a high-performance **Spring Boot** backend with a premium, responsive **React** frontend.

---

## 🚀 Key Features

### 📨 Real-Time Direct Messaging
Experience instantaneous communication with **WebSocket-powered DMs**. Supported by the **STOMP** protocol, our chat system features conversation isolation, real-time delivery, and a persistent chat history.

### 🎭 Instagram-Inspired UI/UX
- **Dynamic Feed**: A sleek, scrollable feed for photos and blog content.
- **Premium Themes**: Sophisticated **Light Mode** and an **Ultra-Dark Mode** (#000000) for a cinematic experience.
- **Responsive Design**: Fully optimized for mobile and desktop interactions.

### 📸 Multimedia Content
- **Photo Uploads**: Support for multipart image uploads for both posts and user profiles.
- **Static Asset Serving**: High-efficiency serving of media files directly from the backend.

### 👥 Social Ecosystem
- **Follow System**: Live user relationship management (Follow/Unfollow) with real-time count updates.
- **Engagement**: High-speed Like and Comment systems on every post.
- **Profiles**: Personalized user profiles featuring a post grid, bio, and social stats.

### 🔐 Enterprise-Grade Security
- **JWT Authentication**: Secure, token-based stateless authentication.
- **Safe Assets**: Path-based authorization protecting user assets while allowing public media visibility.
- **Data Privacy**: Automatic password exclusion from all API responses.

---

## 🛠️ Tech Stack

- **Backend**: Java 21, Spring Boot 3.2, Spring Security (JWT), Spring Data JPA, MySQL, WebSocket (STOMP).
- **Frontend**: React, Axios, SockJS, StompJS, Vanilla CSS (Glassmorphism).
- **Database**: MySQL 8.0+.

---

## 🏃 Getting Started

### 1. Database Setup
Create a MySQL database named `blog_app`. You can find the complete schema script in:
[demo/schema.sql](file:///e:/blogNblog/demo/schema.sql)

### 2. Backend Configuration
Update `demo/src/main/resources/application.properties` with your MySQL credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/blog_app
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

Run the backend:
```bash
cd demo
mvn spring-boot:run
```

### 3. Frontend Setup
Install dependencies and start the development server:
```bash
cd blog-frontend
npm install
npm run dev
```

---

## 📁 Project Structure

- `demo/`: Spring Boot backend application.
  - `src/main/java/com/example/blog_app/config/`: Security, WebSocket, and Web configurations.
  - `src/main/java/com/example/blog_app/model/`: JPA Entities (User, Post, Follow, Message, etc.).
  - `uploads/`: Centralized storage for user-uploaded media.
- `blog-frontend/`: React frontend application.
  - `src/pages/`: Main application pages (Home, Profile, Chat, Auth).
  - `src/services/`: API and WebSocket connection services.

---

## 📸 Final Look

| Modern Feed (Dark Mode) | 1-to-1 Messaging |
|:---:|:---:|
| ![Feed](https://via.placeholder.com/400x300?text=Premium+Feed+UI) | ![Chat](https://via.placeholder.com/400x300?text=Real-time+Chat+UI) |

---

## ⚖️ License
This project is licensed under the MIT License - see the LICENSE file for details.
