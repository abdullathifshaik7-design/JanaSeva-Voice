# Production Deployment Guide - JanaSeva Voice

This document details the configuration, integration, and step-by-step commands to deploy JanaSeva Voice into a production environment.

## 1. Environment Configurations

Duplicate `.env.example` as `.env` and configure variables.

```ini
# Frontend Environment variables
VITE_APP_ENV=production
VITE_API_BASE_URL=https://janaseva-backend.railway.app
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 2. Dynamic Data Layer (LocalStorage / API Backend)
The current prototype uses an abstract localStorage data sync layer. To connect a real backend database (such as PostgreSQL or MongoDB):
1. Create REST endpoints matching the API architectures in `src/context/AppContext.jsx`.
2. Replace `localStorage.setItem` and `localStorage.getItem` queries with `fetch()` or `axios` API queries pointing to `import.meta.env.VITE_API_BASE_URL`.

## 3. Frontend Deployment (Static Sites)

We recommend **Vercel** or **Netlify** for deploying the Vite-React frontend:

### Deploy to Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Run command: `vercel`
3. Configure the build output directory as `dist` and build command as `npm run build`.

### Deploy to Netlify
1. Build the production build locally: `npm run build`
2. Upload the output `dist` folder to Netlify dashboard.

## 4. Troubleshooting Geolocation & Speech APIs
> [!WARNING]
> - **HTTPS Requirement**: The HTML5 SpeechRecognition and Geolocation APIs require a secure connection (`HTTPS`) in production. Browser API requests will fail if served over insecure `HTTP`. Ensure SSL certificates are active on your production domain.
