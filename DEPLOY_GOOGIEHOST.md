# ExtraEarn — GoogieHost Deployment Guide 🚀

**GoogieHost Free Hosting** is built for PHP and static web pages, so it does **not** allow running backend Node.js applications (`node server.js`) directly on free plans.

However, you can easily host your **Entire ExtraEarn Project 100% FREE** using this setup:

---

## 🌟 100% Free Setup Strategy

| Component | Where to Host? | Cost |
| :--- | :--- | :--- |
| **Backend API (`server.js`)** | **Render.com** (Node.js Cloud) | **100% FREE** |
| **Admin & Web Client UI** | **GoogieHost** (`public_html`) | **100% FREE** |
| **Android APK** | **Your Phone / Play Store** | **FREE** |

---

## Step 1: Host Node.js Backend API on Render.com (2 Minutes)

1. Sign up for a free account at [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (or upload your project).
4. Configure settings:
   - **Name**: `extraearn-api`
   - **Environment**: `Node`
   - **Build Command**: (leave default or `npm install`)
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. Click **Create Web Service**.
6. Render will build and give you a free live SSL URL (e.g. `https://extraearn-api.onrender.com`).

---

## Step 2: Upload Web App & Arcade Games to GoogieHost

1. Log into your **GoogieHost DirectAdmin / cPanel Control Panel**.
2. Open **File Manager** -> Go to `public_html/`.
3. Upload the following files from `ExtraEarn`:
   - `index.html` (Admin Panel)
   - `app.css` & `app.js`
   - `app_code/` folder (Client Web App)
   - All 12 `.html` arcade game files (`alice_harvest.html`, `flappy_bird.html`, etc.)
4. Now your Admin Dashboard will be live at `http://yourdomain.com/index.html` and your Client Web App at `http://yourdomain.com/app_code/index.html`!

---

## Step 3: Connect Flutter App to Render Domain

1. Open `e:\ExtraEarn\flutter_app\lib\services\api_service.dart`.
2. Update `baseUrl`:
   ```dart
   static String baseUrl = "https://extraearn-api.onrender.com/api";
   ```
3. Generate Release APK:
   ```powershell
   cd e:\ExtraEarn\flutter_app
   flutter build apk --release
   ```
