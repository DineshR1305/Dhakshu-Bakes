# Dhakshu Bakes Production Deployment Guide

## Production Environment Variables

Ensure the following secrets and environment variables are set in production (e.g. Render / Railway / Vercel):

- `DATABASE_URL`: Managed PostgreSQL Connection String
- `DATABASE_USERNAME`: Database user
- `DATABASE_PASSWORD`: Database password
- `JWT_SECRET`: 256-bit secure secret key
- `RAZORPAY_KEY_ID`: Live Razorpay Key ID
- `RAZORPAY_KEY_SECRET`: Live Razorpay Key Secret
- `SPRING_PROFILES_ACTIVE`: `prod`

## Frontend Deployment (Vercel / Netlify)
1. Set root directory to `frontend`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable `VITE_API_BASE_URL` to your production backend URL.
