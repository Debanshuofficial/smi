# Configuration Guide

## Static Images Configuration

The `config.js` file now includes static image paths for placeholders and fallbacks:

```javascript
STATIC_IMAGES: {
    PLACEHOLDER: 'assets/img/placeholder.jpg',  // Generic placeholder
    LOGO: 'logo.png',                            // Institute logo
    DEFAULT_PROFILE: 'assets/img/default-profile.png', // Default profile pic
    NO_IMAGE: 'data:image/svg+xml,...'           // SVG fallback when no image
}
```

## Usage Examples

### Get Image from Database
```javascript
const staffImg = CONFIG.getImageUrl(staff.img);
// Returns: http://localhost:4000/images/staffs/img1.jpg
```

### Get Static/Placeholder Image
```javascript
const placeholder = CONFIG.getStaticImage('placeholder');
// Returns: assets/img/placeholder.jpg

const logo = CONFIG.getStaticImage('logo');
// Returns: logo.png
```

### In HTML
```html
<img src="${CONFIG.getImageUrl(item.img)}" 
     onerror="this.src='${CONFIG.getStaticImage('placeholder')}'">
```

## Deployment & Mobile Testing

The `config.js` now features **Automatic IP Detection**:

```javascript
BASE_URL: (function() {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:4000';
    return `http://${host}:4000`; // Dynamically uses your LAN IP
})(),
```

### How to test on Mobile:
1.  Connect your phone to the **same Wi-Fi** as your computer.
2.  Find your computer's IP (e.g., `192.168.0.193`).
3.  Open the website on your phone using: `http://192.168.0.193:5500`
4.  The website will **automatically** try to reach the database at `http://192.168.0.193:4000`.

**Note:** If it still doesn't load on mobile, you may need to **allow Port 4000** through your Windows Firewall.
