# ExtraEarn — Run & Deploy Instructions

This guide provides all the terminal commands needed to run the Node.js API server, expose it to a public tunnel, run/test the Flutter application on a phone, and build the final release APK.

---

## 1. Run the Node.js API & Admin Server
First, start the backend server that manages the database, API endpoints, and admin dashboard.

**Command:**
```powershell
# Navigate to the root directory
cd e:\ExtraEarn

# Start the server
node server.js
```
*   **Local URL:** `http://localhost:3000/` (Admin Dashboard)
*   **Local API URL:** `http://localhost:3000/api`

---

## 2. Expose the Server to Your Physical Phone (Choose A or B)
To access the server on your physical phone, you must expose your local port 3000 to the internet.

### Option A: Using Localtunnel (No Account Required)
**Command:**
```powershell
# Open a new terminal and run
npx localtunnel --port 3000
```
1. This will output a link (e.g., `https://vast-friends-cheer.loca.lt`).
2. **First-time bypass:** Open that link on your physical phone's browser once. It will ask for an IP address. Enter your computer's public IP address (you can find it by visiting `https://api.ipify.org` on your computer) and tap **Click to Continue**.
3. Once bypassed in the browser, your phone's app can communicate with it directly.

### Option B: Using ngrok (Requires Free Account)
**Step 1: One-time setup (Add Authtoken)**
If you haven't already, sign up at [ngrok.com](https://ngrok.com/), copy your token from your dashboard, and run:
```powershell
npx ngrok config add-authtoken <YOUR_NGROK_AUTHTOKEN_HERE>
```

**Step 2: Start the Tunnel**
```powershell
npx ngrok http 3000
```
1. This will open a terminal interface showing a Forwarding URL (e.g., `https://xxxx-xx-xx.ngrok-free.app`).
2. Open that URL on your phone's browser once to bypass the initial warning, or use it directly as your API URL.

---

## 3. Start the Android Emulator (Optional)
If you want to start a configured Android Emulator from the command line:

**Step 1: Get the list of your configured emulators**
```powershell
flutter emulators
```

**Step 2: Launch the emulator by its ID**
```powershell
flutter emulators --launch <EMULATOR_ID>
# Example: flutter emulators --launch Pixel_6_API_33
```

---

## 4. Run the Flutter Mobile Application
Connect your physical phone via USB (with USB Debugging enabled) or open an emulator, then execute these commands.

**Command:**
```powershell
# Navigate to the flutter app folder
cd e:\ExtraEarn\flutter_app

# Fetch dependencies (if needed)
flutter pub get

# Run the app in debug mode
flutter run
```

---

## 4. Build the Production Release APK
When you are ready to share the app or publish it, build the final optimized release APK.

**Command:**
```powershell
# Build release APK
cd e:\ExtraEarn\flutter_app
flutter build apk --release
```
*   **Output Path:** `e:\ExtraEarn\flutter_app\build\app\outputs\flutter-apk\app-release.apk`
