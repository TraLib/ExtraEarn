# ExtraEarn — Single Render.com Deployment Guide 🚀

Deploying **everything (Backend API + Admin Portal + Client Web App + 12 Games)** on **Render.com** is the **best, simplest 100% FREE solution**!

Chunki `server.js` static files aur API endpoints dono ko serve karta hai, ek single Render Web Service se sab kuch live ho jayega!

---

## 🌐 What Will Be Live On Your Free Render URL (`https://extraearn.onrender.com`)

| Service | Live URL |
| :--- | :--- |
| **👑 Admin Control Panel** | `https://extraearn.onrender.com/` |
| **📱 Client Web App** | `https://extraearn.onrender.com/app_code/` |
| **🕹️ 12 Arcade Games** | `https://extraearn.onrender.com/alice_harvest.html` (and all other games) |
| **⚡ REST API Server** | `https://extraearn.onrender.com/api` |

---

## 🛠️ Step-by-Step Render Deployment (3 Minutes)

### Step 1: Push ExtraEarn to GitHub
If you haven't pushed your code to GitHub yet:
1. Go to [GitHub.com](https://github.com) and create a new repository named `ExtraEarn`.
2. Open VS Code terminal in `e:\ExtraEarn` and run:
   ```bash
   git init
   git add .
   git commit -m "ExtraEarn full release code"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ExtraEarn.git
   git push -u origin main
   ```

---

### Step 2: Deploy Web Service on Render.com (100% Free)

1. Go to [Render.com](https://render.com) and log in.
2. Click **New +** -> Select **Web Service**.
3. Select your GitHub repository (`ExtraEarn`).
4. Enter the details:
   - **Name**: `extraearn`
   - **Region**: Oregon (US) or Singapore
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install` (or leave empty)
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Click **Create Web Service**.

🎉 Render will build your application in ~1 minute and give you your live HTTPS link:
`https://extraearn.onrender.com`

---

### Step 3: Connect Mobile Flutter App & Generate Release APK

1. Open `e:\ExtraEarn\flutter_app\lib\services\api_service.dart`.
2. Update the `baseUrl` variable to your new Render URL:
   ```dart
   static String baseUrl = "https://extraearn.onrender.com/api";
   ```
3. Open Terminal in `e:\ExtraEarn\flutter_app` and build your release APK:
   ```powershell
   cd e:\ExtraEarn\flutter_app
   flutter build apk --release
   ```
4. Your final production APK is ready at:
   `e:\ExtraEarn\flutter_app\build\app\outputs\flutter-apk\app-release.apk`
