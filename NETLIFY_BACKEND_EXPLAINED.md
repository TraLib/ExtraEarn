# Netlify Backend & Database Guide 💡

## ❓ Can Netlify run Express Backend (`server.js`)?

**YES**, Netlify can run Express applications using **Netlify Serverless Functions** (`serverless-http`).

However, there is **1 Important Difference** between traditional hosting (Render/VPS) and Netlify:

---

## ⚠️ Important Difference: Local File Storage (`database.json`)

### 1. Traditional Node.js Hosting (Render.com / VPS / cPanel)
- Runs `node server.js` continuously 24/7 in memory.
- Writes to local `database.json` directly when users earn coins or sign up.
- **Code changes required**: **0%** (Works out of the box).

---

### 2. Netlify Serverless Functions (100% Netlify Deployment)
- Netlify runs your code in short serverless containers (AWS Lambda).
- The file system on Netlify Functions is **read-only / temporary (ephemeral)**.
- **Result**: If a user earns coins or registers, Netlify Functions **cannot save changes to a local `database.json` file** because the temporary server turns off after each request.

---

## 🛠️ How to deploy 100% Netlify Only (With Free Cloud Database)

If you want **Netlify ONLY** (without Render), you simply connect a **Free Cloud Database** (like MongoDB Atlas Free Tier):

1. **Free Cloud Database**: Sign up for free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free 512MB database).
2. **Netlify Function Wrapper**: Wrap `server.js` using `serverless-http`.
3. **Deploy to Netlify**:
   - `netlify.toml` redirects `/api/*` to `.netlify/functions/api`.

---

## 🎯 Summary Recommendation

| Goal | Best Platform | Database Used | Setup Time |
| :--- | :--- | :--- | :--- |
| **Quickest & Easiest (Zero code change)** | **Netlify (Frontend) + Render (Backend)** | Local `database.json` | 2 Minutes |
| **Netlify 100% Single Host** | **Netlify Only (Serverless Functions)** | MongoDB Atlas (Free Cloud DB) | 10 Minutes |
