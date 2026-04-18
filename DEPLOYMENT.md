# Deployment Guide - Smart AI Hotel Management System

This guide outlines how to deploy the ecosystem into a production environment.

## 1. Environment Preparation
Ensure you have externalized all state and secrets. Your production environment requires:
- A cloud MongoDB provider (e.g. MongoDB Atlas)
- Production keys for Stripe, OpenAI, and WhatsApp/Twilio

## 2. Backend Deployment (Render / Railway)
The Node.js/Express backend easily deploys to platforms like Render or Railway.
1. Create a Web Service connected to your repository on Render.
2. Select the Node environment.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Map all the `.env` variables from `.env.example` into the service's Environment Variables section.

## 3. Web Frontend Deployment (Vercel)
Vercel is the optimal host for Next.js applications.
1. Import your repository to Vercel.
2. Ensure the "Root Directory" is set to `frontend-web`.
3. Framework Preset: Next.js
4. Add the backend API URL (e.g., `NEXT_PUBLIC_API_URL`) to your Vercel Environment Variables.
5. Click **Deploy**.

## 4. Mobile App Deployment (Expo EAS)
We use Expo Application Services (EAS) to build and publish the mobile app.
1. Install EAS CLI globally: `npm install -g eas-cli`
2. Login to your Expo account: `eas login`
3. Initialize EAS: `eas build:configure`
4. To build for Android:
   ```bash
   eas build --platform android
   ```
5. To build for iOS:
   ```bash
   eas build --platform ios
   ```
6. Download the resulting `.aab` or `.ipa` files and submit them to the Google Play Store and Apple App Store.

## 5. Security & Maintenance
- Enable automatic backups on MongoDB Atlas.
- Use Cloudflare or Vercel edge networks to prevent DDoS.
- Periodically update dependencies inside `package.json` for security patches.
