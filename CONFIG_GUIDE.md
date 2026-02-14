# Configuration Guide

This guide explains how to configure the Suresh Memorial Institute project for hosting across different servers.

## Server Separation

The project is designed to be hosted on two distinct servers:
1.  **Backend Server**: Hosts the `server` folder, the SQLite database, and images.
2.  **Frontend Server**: Hosts the HTML, CSS, and client-side JavaScript files.

## 1. Backend Configuration (API & Images)

The backend server details are managed in `assets/js/config.js`.

### API_SERVER_URL
This is the single variable used to attach the frontend to your database. It defines where the API and images are located.

```javascript
const CONFIG = {
    // The URL of your remote backend server
    API_SERVER_URL: 'https://smi.hsvikrant.dpdns.org',
    
    // Derived paths (do not change unless server structure changes)
    get API_BASE() { return `${this.API_SERVER_URL}/api`; },
    get IMG_BASE() { return `${this.API_SERVER_URL}/images/`; },
}
```

## 2. Image Handling

### Remote Images (from Database)
Images stored in the database are served from the **Backend Server**. Use the helper function to get the full URL:
```javascript
const imageUrl = CONFIG.getImageUrl(item.img); 
// Results in: https://smi.hsvikrant.dpdns.org/images/your-image.jpg
```

### Static Assets (Local)
Logos and theme-related icons are stored locally on the **Frontend Server**.
```javascript
const logo = CONFIG.getStaticImage('logo');
// Results in: logo.png (relative to the frontend root)
```

## 3. Dynamic Endpoints
All data fetches automatically use the `API_SERVER_URL`. To get a new endpoint:
```javascript
const url = CONFIG.getEndpoint('staff'); 
// Results in: https://smi.hsvikrant.dpdns.org/api/staff
```

---

## Deployment Summary
- **Backend**: Upload the `server` folder to your server pointing at `https://smi.hsvikrant.dpdns.org`. Ensure CORS is enabled (already configured in `server.js`).
- **Frontend**: Upload everything else (index.html, assets/, etc.) to your web hosting. No changes are needed to the HTML files if `config.js` is correct.
