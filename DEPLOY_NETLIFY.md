# ExtraEarn — Netlify + Render Deployment Guide ⚡

Hosting ExtraEarn on **Netlify** is a **GREAT choice**! Netlify is super fast, 100% free, and gives you instant SSL certificates.

---

## 🌟 The Perfect Combo (Netlify + Render)

| Component | Platform | Why? | Cost |
| :--- | :--- | :--- | :--- |
| **Frontend & 12 Games** | **Netlify** | Super fast static site hosting with instant Drag & Drop | **FREE** |
| **Backend API (`server.js`)** | **Render.com** | 24/7 Node.js server execution for database & authentication | **FREE** |

---

## Step 1: Deploy Frontend & Games to Netlify (1 Minute Drag & Drop)

1. Go to [Netlify.com](https://www.netlify.com) and log in.
2. Go to **Sites** -> Scroll down to **"Drag and drop your site folder here"**.
3. Drag & Drop your `ExtraEarn` folder into Netlify.
4. Netlify will deploy your site in 10 seconds and give you a live link like:
   `https://extraearn-app.netlify.app`
5. Now:
   - **Admin Dashboard**: `https://extraearn-app.netlify.app/index.html`
   - **Client Web App**: `https://extraearn-app.netlify.app/app_code/index.html`

---

## Step 2: Deploy Backend API to Render.com

Since Netlify is for frontend/static files, run `server.js` on Render for free:

1. Go to [Render.com](https://render.com) -> **New Web Service**.
2. Connect your project / GitHub.
3. Set **Start Command**: `node server.js`.
4. Click **Create Web Service**.
5. Render gives you your live API URL:
   `https://extraearn-api.onrender.com`

---

## Step 3: Update Flutter App API URL

1. Open `e:\ExtraEarn\flutter_app\lib\services\api_service.dart`.
2. Update `baseUrl`:
   ```dart
   static String baseUrl = "https://extraearn-api.onrender.com/api";
   ```
3. Build release APK:
   ```powershell
   cd e:\ExtraEarn\flutter_app
   flutter build apk --release
   ```
