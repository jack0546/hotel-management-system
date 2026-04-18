# Installation Guide - Smart AI Hotel Management System

This document provides step-by-step instructions for installing and running the entire ecosystem locally.

## 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB (running locally on port 27017 or use a MongoDB Atlas URI)
- npm or yarn

## 2. Backend Installation (Node.js/Express)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` to `.env` and fill in your keys (Stripe, OpenAI, MongoDB):
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`*

## 3. Web Frontend Installation (Next.js)
1. Navigate to the web frontend directory:
   ```bash
   cd frontend-web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The web app will run on `http://localhost:3000`*

## 4. Mobile App Installation (React Native / Expo)
1. Ensure you have the Expo CLI installed globally (`npm install -g expo-cli`).
2. Navigate to the mobile app directory:
   ```bash
   cd mobile-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Expo server:
   ```bash
   npx expo start
   ```
   *Scan the generated QR code using the Expo Go app on your physical mobile device to view the app, or press `a` or `i` to open in an emulator.*

## Testing the AI and WhatsApp Features
To fully test the AI assistant and WhatsApp features:
1. Obtain an OpenAI API Key and add it to your backend `.env`.
2. Configure a Twilio or Meta WhatsApp Developer account and update your `WA_TOKEN` in the `.env`.
