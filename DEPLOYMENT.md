# SMI Website - Production Ready

## Deployed URLs
- Frontend: http://localhost:5500
- Backend API: http://localhost:4000

## File Structure Optimizations
✅ **Consolidated JavaScript Files:**
  - `config.js` - Centralized API endpoints and image URL management
  - `script.js` - All data loading (slider, notices, staff, toppers, birthdays, facilities)
  - Removed: `staff_loader.js` (merged into script.js)

## Performance Optimizations
✅ Conditional infinite scroll (3+ items)
✅ Card loading animations
✅ Hover borders (top, left, bottom)
✅ Scroll performance (backdrop-filter reduced, will-change, translateZ)
✅ Loading screen with pulsing logo
✅ Image lazy loading optimizations
✅ Preload critical assets (CSS, fonts, logo)
✅ Removed unnecessary duplicate files

## Run Instructions
```bash
# Terminal 1 - Backend
cd server
node server.js

# Terminal 2 - Frontend
node frontend_server.js
```

## Configuration
- All API URLs managed in: `assets/js/config.js`
- Easy to update for production deployment
- Single source of truth for endpoints

## Database
- Location: `server/smi.db`
- Populated with staff (DD/MM/YYYY format), notices, assets, students, toppers
