# Experiment: MyBlogs - Enhanced Full-Stack Blog Application

This project, rebranded as **MyBlogs**, is an enhanced version of a full-stack blog application. It integrates a **Spring Boot** backend with a **React** frontend and a **MySQL** database. The application features a robust set of blogging tools including category support, real-time search, reading time estimation, and a global **Dark/Light Mode** theme system.

---

## 🎯 Objectives
- To rebrand the application and enhance user experience through modern UI/UX.
- To implement **Category Support** for organizing blog posts.
- To provide **Real-time Search and Filtering** capabilities for content discovery.
- To calculate and display **Estimated Reading Time** based on content length.
- To implement a **Global Dark/Light Mode** theme system with persistent user preferences.
- To maintain backend integrity by updating the database schema and controllers.

---

## 🛠️ Tech Stack & Tools Used
- **Frontend:** React.js, CSS Modules, React Router
- **Backend:** Java, Spring Boot, Spring Data JPA, Spring Security (JWT)
- **Database:** MySQL
- **Tooling:** VS Code, MySQL Workbench, Maven

---

## 🗂️ Step-by-Step Implementation & Feature Overview

### 1. Branding & Identity
The application was renamed from "Modern Blog" to **MyBlogs**. This involved updating the primary branding in the `Navbar` component and the document title in `public/index.html`.

### 2. Global Dark & Light Mode
A comprehensive theme system was implemented:
- **State Management:** A theme state was added to the root `App.js`, initialized from `localStorage`.
- **CSS Variables:** The entire UI was refactored to use CSS variables defined in `index.css` for background colors, text colors, and component borders.
- **Toggle Mechanism:** A theme switcher button in the Navbar allows users to toggle between ☀️ Light and 🌙 Dark modes instantly.
- **Persistence:** High-quality theme preference preservation ensures the selected mode sticks across sessions.

### 3. Category & Reading Time Support
- **Backend Updates:** The `Post` entity was updated to include a `category` field, and the `PostController` was modified to handle this data.
- **Frontend Metadata:** Each post card now displays its category as a stylized badge and shows an estimated reading time (calculated based on an average reading speed of 200 words per minute).

### 4. Search & Filtering
- **Real-time Search:** A search bar on the Home page allows users to filter posts by Title or Content as they type.
- **Author Filtering:** A "My Posts" toggle was added to allow users to isolate their own contributions from the global feed.

### 5. Interaction & Engagement
- **Likes & Comments:** Users can like posts and add comments to engage with content. The UI provides immediate feedback for these actions.
- **Post Management:** Authenticated users can create new posts with categories and delete their own posts.

---

## 📸 Screenshots

| Login Page | Latest Posts |
|:---:|:---:|
| ![Login Page](ss/Screenshot%20(52).png) | ![Latest Posts](ss/Screenshot%20(53).png) |

| Create New Post | Post Details & Comments |
|:---:|:---:|
| ![Create Post](ss/Screenshot%20(54).png) | ![Post Details](ss/Screenshot%20(55).png) |

---

## 💡 Key Learnings
- **Global State & Themes:** Learning to manage application-wide styling using CSS variables and React state.
- **Content Metadata:** Implementation of value-added features like reading time estimation and categorization.
- **Dynamic Filtering:** Building interactive search and filter bars that enhance content discoverability.
- **Full-Stack Schema Updates:** Managing the end-to-end flow of adding new fields from the database through the REST API to the UI.

---
