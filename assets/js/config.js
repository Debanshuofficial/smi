// API Configuration
const CONFIG = {
    // Dynamic BASE_URL: Automatically switches between localhost and LAN IP for mobile testing
    BASE_URL: (function () {
        const host = window.location.hostname;
        // If we're on localhost, use localhost:4000
        if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:4000';
        // If we're on a LAN IP (e.g. 192.168.x.x), use that IP with port 4000
        return `http://${host}:4000`;
    })(),

    get API_BASE() { return `${this.BASE_URL}/api`; },
    get IMG_BASE() { return `${this.BASE_URL}/images/`; },

    // Static Images (Placeholders/Fallbacks)
    STATIC_IMAGES: {
        PLACEHOLDER: 'assets/img/placeholder.jpg',
        LOGO: 'logo.png',
        DEFAULT_PROFILE: 'assets/img/default-profile.png',
        NO_IMAGE: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="18"%3ENo Image%3C/text%3E%3C/svg%3E'
    },

    // API Endpoints
    ENDPOINTS: {
        STAFF: 'staff',
        NOTICES: 'notices',
        ASSETS: 'assets',
        TOPPERS: 'toppers',
        BIRTHDAYS: 'birthdays'
    },

    // Helper function to get full API URL
    getEndpoint(endpoint, params = {}) {
        let url = `${this.API_BASE}/${endpoint}`;
        const queryParams = new URLSearchParams(params);
        if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
        }
        return url;
    },

    // Helper function to get image URL
    getImageUrl(path) {
        if (!path) return this.STATIC_IMAGES.PLACEHOLDER;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        return this.IMG_BASE + path;
    },

    // Helper to get static image
    getStaticImage(name) {
        return this.STATIC_IMAGES[name.toUpperCase()] || this.STATIC_IMAGES.PLACEHOLDER;
    }
};
