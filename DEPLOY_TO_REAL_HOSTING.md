# ExtraEarn — Real Hosting Deployment Guide 🚀

This guide explains step-by-step how to deploy your **ExtraEarn Node.js Backend & Web App** to your own real web hosting (cPanel Hosting or VPS Server).

---

## Option 1: Deploying on cPanel Hosting (Hostinger, Namecheap, GoDaddy, etc.)

If your web hosting provides a **cPanel** dashboard or **Node.js Selector / Setup Node.js App**:

### Step 1: Zip your project files
Create a `.zip` file of your project folder (`ExtraEarn`).
**Include these files & folders:**
- `server.js`
- `database.json`
- `index.html`
- `app.css`
- `app.js`
- `app_code/`
- All 12 `.html` game files (`star_catcher.html`, `alice_harvest.html`, `flappy_bird.html`, etc.)

---

### Step 2: Upload Files & Create Node.js App in cPanel
1. Log into your **cPanel / Hosting Control Panel**.
2. Open **"File Manager"** -> navigate to `public_html` (or your subdomain folder, e.g., `api.yourdomain.com`).
3. Upload and extract your `.zip` file.
4. Go back to cPanel home and search for **"Setup Node.js App"** (or **"Node.js Manager"**).
5. Click **Create Application**:
   - **Node.js Version**: Select `18.x` or `20.x`
   - **Application Mode**: `Production`
   - **Application Root**: `public_html` (or your folder name)
   - **Application URL**: Select your domain (e.g., `https://yourdomain.com` or `https://api.yourdomain.com`)
   - **Application Startup File**: `server.js`
6. Click **Create** / **Save**.
7. Click **"RESTART APPLICATION"** or **"RUN JS SCRIPT"**.

---

## Option 2: Deploying on VPS Server (Hostinger VPS, DigitalOcean, AWS EC2, Linode)

If you have a **Linux VPS (Ubuntu)** server:

### Step 1: Connect via SSH
Open Terminal / PowerShell on your PC and run:
```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: Install Node.js, Nginx & PM2 Process Manager
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Install PM2 (Keeps your Node.js server running 24/7 forever)
sudo npm install -g pm2
```

### Step 3: Copy Project Files to Server
Upload your project files to `/var/www/extraearn` via FTP/FileZilla or git clone.

### Step 4: Start Node.js Server with PM2
```bash
cd /var/www/extraearn

# Start server.js in background
pm2 start server.js --name "extraearn-api"

# Make PM2 auto-restart on server reboot
pm2 save
pm2 startup
```

### Step 5: Configure Nginx & SSL Certificate (HTTPS)
1. Configure Nginx to forward port `80` / `443` to `http://localhost:3000`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $host_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
2. Enable Free SSL using Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 📱 Step 3: Connect Your Flutter Mobile App to Real Domain

Once your hosting is live and you have your domain URL (e.g. `https://api.yourdomain.com`):

1. Open `e:\ExtraEarn\flutter_app\lib\services\api_service.dart` in VS Code.
2. Change the `baseUrl` variable to your real hosting domain:
   ```dart
   static String baseUrl = "https://api.yourdomain.com/api";
   ```
3. Rebuild the release APK:
   ```powershell
   cd e:\ExtraEarn\flutter_app
   flutter build apk --release
   ```
   Your release APK location: `e:\ExtraEarn\flutter_app\build\app\outputs\flutter-apk\app-release.apk`
