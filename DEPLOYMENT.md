# SMI Website - Deployment Guide

This project is optimized for deployment where the frontend and backend are hosted on separate environments.

## Architecture
- **Backend (API & Database)**: Hosted at `https://smi.hsvikrant.dpdns.org`
- **Frontend (Web Application)**: Hosted on your primary web server.

## 1. Backend Deployment
1.  Upload the `server` folder to your backend server.
2.  Install dependencies: `npm install`
3.  Start the server: `node server.js`
4.  The server provides:
    -   API endpoints at `/api/*`
    -   Static image delivery at `/images/*`

## 2. Frontend Deployment
1.  Configure `assets/js/config.js` with your backend URL:
    ```javascript
    API_SERVER_URL: 'https://smi.hsvikrant.dpdns.org'
    ```
2.  Upload the root directory contents (excluding the `server` folder) to your web server.
3.  Ensure the following files/folders are included:
    -   `index.html`
    -   `assets/` (which includes your JS and CSS)
    -   `logo.png` and other static images.

## Performance & Optimization Features
- ✅ **Centralized Config**: Change the database connection in one place (`config.js`).
- ✅ **Cross-Origin Ready**: Backend server has CORS enabled for separate domain hosting.
- ✅ **Optimized Loading**: Lazy loading, preloads, and conditional infinite scrolls are active.
- ✅ **Automatic Fault Tolerance**: Fallback images and error handling for missing assets.

## Local Development (Failsafe)
To run locally for testing:
1.  Start backend: `cd server && node server.js`
2.  Start frontend: `node frontend_server.js` (or use VS Code Live Server)
3.  Update `config.js` `API_SERVER_URL` to `http://localhost:4000` temporarily.
