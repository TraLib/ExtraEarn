const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Simple file-based database for persistence
const DB_FILE = path.join(__dirname, 'database.json');
let db = {
    users: [
        { id: "usr_1", name: "Hiten Patel", phone: "9876543210", coins: 2935, level: 1, status: "Active", devices: ["android_a1b2"] },
        { id: "usr_2", name: "Amit Shah", phone: "9988776655", coins: 120, level: 1, status: "Active", devices: ["android_c3d4"] },
        { id: "usr_3", name: "Kajal Mehta", phone: "9123456789", coins: 3450, level: 1, status: "Active", devices: ["android_e5f6"] },
        { id: "usr_4", name: "Dev Emulator", phone: "9000000000", coins: 2500, level: 1, status: "Banned", devices: ["emulator_x1y2"] },
        { id: "usr_5", name: "Priya Sharma", phone: "9869474296", coins: 100, level: 1, status: "Active", devices: ["android_z9w8"] }
    ],
    transactions: [],
    settings: {
        maintenanceMode: false,
        forceUpdate: false,
        adReward: 15,
        dailyCheckin: 50,
        adClicks: 0,
        adRevenue: 0.0,
        antiFraudAutoBan: false,
        appName: "ExtraEarn",
        appTitle: "Earn Daily Rewards",
        appSubtitle: "Earn coins by checking in, watching ads, and playing games!",
        primaryColor: "#10B981",
        secondaryColor: "#6366F1",
        cardColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        backgroundColor: "#F4F6FC",
        webAppEnabled: true,
        webAppUrl: "app_code/index.html"
    }
};

function loadDatabase() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            const loadedDb = JSON.parse(data);
            db = {
                users: loadedDb.users || db.users,
                transactions: loadedDb.transactions || db.transactions,
                settings: {
                    webAppEnabled: true,
                    webAppUrl: "app_code/index.html",
                    ...db.settings,
                    ...loadedDb.settings
                }
            };
        } else {
            saveDatabase();
        }
    } catch (e) {
        console.error("Error loading database:", e);
    }
}

function saveDatabase() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 4), 'utf8');
    } catch (e) {
        console.error("Error saving database:", e);
    }
}

loadDatabase();

function generateUniqueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    do {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (db.users.some(u => u.id === code));
    return code;
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] [SERVER] ${req.method} ${req.url}`);
    // Enable CORS for Flutter development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Handle REST API endpoints
    if (req.url.startsWith('/api/')) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            let jsonBody = {};
            try {
                if (body) jsonBody = JSON.parse(body);
            } catch (e) {}

            res.writeHead(200, { 'Content-Type': 'application/json' });

            // 1. GET /api/settings
            if (req.url === '/api/settings' && req.method === 'GET') {
                res.end(JSON.stringify(db.settings));
                return;
            }

            // 2. POST /api/settings
            if (req.url === '/api/settings' && req.method === 'POST') {
                db.settings = { ...db.settings, ...jsonBody };
                saveDatabase();
                res.end(JSON.stringify({ success: true, settings: db.settings }));
                return;
            }

            // 3. POST /api/auth/login
            if (req.url === '/api/auth/login' && req.method === 'POST') {
                const { phone, name } = jsonBody;
                let user = db.users.find(u => u.phone === phone);
                if (!user) {
                    user = {
                        id: generateUniqueId(),
                        name: name || "New User",
                        phone: phone,
                        coins: 100,
                        level: 1,
                        status: "Active",
                        devices: ["android_" + Math.random().toString(36).substring(7)]
                    };
                    db.users.push(user);
                    saveDatabase();
                }
                res.end(JSON.stringify({ success: true, user }));
                return;
            }

            // 3.5. POST /api/users/update (Update user profile live)
            if (req.url === '/api/users/update' && req.method === 'POST') {
                const { userId, name, phone, avatar } = jsonBody;
                const user = db.users.find(u => u.id === userId);
                if (user) {
                    if (name) user.name = name;
                    if (phone) user.phone = phone;
                    if (avatar) user.avatar = avatar;
                    saveDatabase();
                    res.end(JSON.stringify({ success: true, user }));
                } else {
                    res.end(JSON.stringify({ success: false, error: "User not found" }));
                }
                return;
            }

            // 4. POST /api/users/adjust-coins
            if (req.url === '/api/users/adjust-coins' && req.method === 'POST') {
                const { userId, amount, type, details } = jsonBody;
                const user = db.users.find(u => u.id === userId);
                if (user) {
                    // Check balance for negative amount requests (Spend/Cashout)
                    if (amount < 0 && (user.coins + amount < 0)) {
                        res.end(JSON.stringify({ success: false, error: "Not enough coins" }));
                        return;
                    }

                    // Check Daily Check-in claim limit
                    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
                    const formatter = new Intl.DateTimeFormat('en-US', options);
                    const parts = formatter.formatToParts(new Date());
                    const month = parts.find(p => p.type === 'month').value;
                    const day = parts.find(p => p.type === 'day').value;
                    const year = parts.find(p => p.type === 'year').value;
                    const istDateString = `${year}-${month}-${day}`;

                    if (type === "Daily Check-in" || details?.includes("Daily Check-in")) {
                        if (user.lastCheckInDate === istDateString) {
                            res.end(JSON.stringify({ success: false, error: "Already Claimed Today! Come back tomorrow." }));
                            return;
                        }
                        user.lastCheckInDate = istDateString;
                        user.dailyCheckins = (user.dailyCheckins || 0) + 1;
                    }

                    // Check Daily Task Limit
                    if (details && details.startsWith("Task:")) {
                        user.completedTasks = user.completedTasks || [];
                        const taskKey = `${details}_${istDateString}`;
                        if (user.completedTasks.includes(taskKey)) {
                            res.end(JSON.stringify({ success: false, error: "This task reward was already claimed today!" }));
                            return;
                        }
                        user.completedTasks.push(taskKey);
                    }

                    user.coins += amount;
                    // Log transaction
                    db.transactions.push({
                        id: "tx_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                        userId,
                        type,
                        amount,
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        status: amount < 0 ? "Pending" : "Success",
                        details: details || "",
                        redeemCode: ""
                    });
                    saveDatabase();
                    res.end(JSON.stringify({ success: true, user }));
                } else {
                    res.end(JSON.stringify({ success: false, error: "User not found" }));
                }
                return;
            }

            // 4c. POST /api/games/submit-score
            if (req.url === '/api/games/submit-score' && req.method === 'POST') {
                const { userId, score, gameName } = jsonBody;
                const user = db.users.find(u => u.id === userId);
                if (user) {
                    const parsedScore = parseInt(score);
                    if (isNaN(parsedScore) || parsedScore <= 0) {
                        res.end(JSON.stringify({ success: false, error: "Invalid score" }));
                        return;
                    }
                    if (parsedScore > 500) {
                        res.end(JSON.stringify({ success: false, error: "Score too high" }));
                        return;
                    }

                    const coinsEarned = parsedScore; 
                    user.coins += coinsEarned;
                    
                    // Log transaction
                    db.transactions.push({
                        id: "tx_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                        userId,
                        type: "Game Reward",
                        amount: coinsEarned,
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        status: "Success",
                        details: gameName ? `${gameName}: scored ${parsedScore}` : `Arcade Game: scored ${parsedScore}`,
                        redeemCode: ""
                    });
                    saveDatabase();
                    res.end(JSON.stringify({ success: true, user, coinsEarned }));
                } else {
                    res.end(JSON.stringify({ success: false, error: "User not found" }));
                }
                return;
            }

            // 4d. POST /api/users/spin-wheel
            if (req.url === '/api/users/spin-wheel' && req.method === 'POST') {
                const { userId, is2xClaim } = jsonBody;
                const user = db.users.find(u => u.id === userId);
                if (!user) {
                    res.end(JSON.stringify({ success: false, error: "User not found" }));
                    return;
                }

                const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
                const formatter = new Intl.DateTimeFormat('en-US', options);
                const parts = formatter.formatToParts(new Date());
                const month = parts.find(p => p.type === 'month').value;
                const day = parts.find(p => p.type === 'day').value;
                const year = parts.find(p => p.type === 'year').value;
                const todayStr = `${year}-${month}-${day}`;

                if (is2xClaim) {
                    // Double the last spin reward
                    if (user.pendingSpinBonus && !user.spinDoubledToday) {
                        const bonusCoins = user.pendingSpinBonus; // Give the extra 1x
                        user.coins += bonusCoins;
                        user.spinDoubledToday = true;
                        db.transactions.push({
                            id: "tx_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                            userId,
                            type: "Lucky Spin 2X",
                            amount: bonusCoins,
                            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            status: "Success",
                            details: `Lucky Spin 2X Ad Bonus (+${bonusCoins} EE Coins)`,
                            redeemCode: ""
                        });
                        saveDatabase();
                        res.end(JSON.stringify({ success: true, user, extraCoins: bonusCoins }));
                    } else {
                        res.end(JSON.stringify({ success: false, error: "2X bonus already claimed or expired." }));
                    }
                    return;
                }

                if (user.lastSpinDate === todayStr) {
                    res.end(JSON.stringify({ success: false, error: "You have already claimed your 1 Daily Spin today! Come back tomorrow." }));
                    return;
                }

                let prizeCoins = 0;
                // 1 in 5000 probability for 1000 coins
                const roll = Math.floor(Math.random() * 5000);
                if (roll === 2500) {
                    prizeCoins = 1000;
                } else {
                    const prizes = [10, 20, 30, 50, 75, 100, 125, 150, 180];
                    prizeCoins = prizes[Math.floor(Math.random() * prizes.length)];
                }

                user.lastSpinDate = todayStr;
                user.pendingSpinBonus = prizeCoins;
                user.spinDoubledToday = false;
                user.coins += prizeCoins;

                db.transactions.push({
                    id: "tx_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                    userId,
                    type: "Lucky Spin",
                    amount: prizeCoins,
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    status: "Success",
                    details: `Daily Lucky Spin (+${prizeCoins} EE Coins)`,
                    redeemCode: ""
                });

                saveDatabase();
                res.end(JSON.stringify({ success: true, user, coinsWon: prizeCoins }));
                return;
            }

            // 4e. POST /api/users/watch-ad
            if (req.url === '/api/users/watch-ad' && req.method === 'POST') {
                const { userId } = jsonBody;
                const user = db.users.find(u => u.id === userId);
                if (!user) {
                    res.end(JSON.stringify({ success: false, error: "User not found" }));
                    return;
                }

                const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
                const formatter = new Intl.DateTimeFormat('en-US', options);
                const parts = formatter.formatToParts(new Date());
                const month = parts.find(p => p.type === 'month').value;
                const day = parts.find(p => p.type === 'day').value;
                const year = parts.find(p => p.type === 'year').value;
                const todayStr = `${year}-${month}-${day}`;

                if (user.lastAdDate !== todayStr) {
                    user.lastAdDate = todayStr;
                    user.dailyAdsWatched = 0;
                }

                if ((user.dailyAdsWatched || 0) >= 15) {
                    res.end(JSON.stringify({ success: false, error: "Daily Ad Limit Reached! You have watched 15/15 ads today. Come back tomorrow!" }));
                    return;
                }

                user.dailyAdsWatched = (user.dailyAdsWatched || 0) + 1;
                const adRewardCoins = 50;
                user.coins += adRewardCoins;

                db.transactions.push({
                    id: "tx_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                    userId,
                    type: "Ad Bonus",
                    amount: adRewardCoins,
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    status: "Success",
                    details: `Watch Video Bonus Ad #${user.dailyAdsWatched}/15 (+${adRewardCoins} EE Coins)`,
                    redeemCode: ""
                });

                saveDatabase();
                res.end(JSON.stringify({ success: true, user, coinsEarned: adRewardCoins, adsWatched: user.dailyAdsWatched }));
                return;
            }

            // 4b. GET /api/users/profile
            if (req.url.startsWith('/api/users/profile') && req.method === 'GET') {
                const urlObj = new URL(req.url, `http://${req.headers.host}`);
                const userId = urlObj.searchParams.get('userId');
                const user = db.users.find(u => u.id === userId);
                if (user) {
                    res.end(JSON.stringify({ success: true, user }));
                } else {
                    res.end(JSON.stringify({ success: false, error: "User not found" }));
                }
                return;
            }

            // 5. GET /api/transactions
            if (req.url.startsWith('/api/transactions') && req.method === 'GET') {
                const urlObj = new URL(req.url, `http://${req.headers.host}`);
                const userId = urlObj.searchParams.get('userId');
                const userTxs = db.transactions.filter(t => t.userId === userId);
                res.end(JSON.stringify(userTxs));
                return;
            }

            // 6. GET /api/admin/users
            if (req.url === '/api/admin/users' && req.method === 'GET') {
                res.end(JSON.stringify(db.users));
                return;
            }

            // 7. POST /api/admin/users/ban
            if (req.url === '/api/admin/users/ban' && req.method === 'POST') {
                const { userId, status } = jsonBody;
                const user = db.users.find(u => u.id === userId);
                if (user) {
                    user.status = status;
                    saveDatabase();
                    res.end(JSON.stringify({ success: true, user }));
                } else {
                    res.end(JSON.stringify({ success: false, error: "User not found" }));
                }
                return;
            }

            // 7b. POST /api/admin/users/delete
            if (req.url === '/api/admin/users/delete' && req.method === 'POST') {
                const { userId } = jsonBody;
                const index = db.users.findIndex(u => u.id === userId);
                if (index !== -1) {
                    db.users.splice(index, 1);
                    // Also clean up their transactions
                    db.transactions = db.transactions.filter(t => t.userId !== userId);
                    saveDatabase();
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.end(JSON.stringify({ success: false, error: "User not found" }));
                }
                return;
            }

            // 8. GET /api/admin/transactions
            if (req.url === '/api/admin/transactions' && req.method === 'GET') {
                res.end(JSON.stringify(db.transactions));
                return;
            }

            // 9. POST /api/admin/transactions/status
            if (req.url === '/api/admin/transactions/status' && req.method === 'POST') {
                const { transactionId, status, redeemCode } = jsonBody;
                const tx = db.transactions.find(t => t.id === transactionId);
                if (tx) {
                    tx.status = status;
                    if (redeemCode) {
                        tx.redeemCode = redeemCode;
                    }
                    if (status === 'Rejected') {
                        // Refund coins to user
                        const user = db.users.find(u => u.id === tx.userId);
                        if (user) {
                            user.coins += Math.abs(tx.amount);
                        }
                    }
                    saveDatabase();
                    res.end(JSON.stringify({ success: true, transaction: tx }));
                } else {
                    res.end(JSON.stringify({ success: false, error: "Transaction not found" }));
                }
                return;
            }

            // 10. GET /api/app-ui (Full API-driven UI bundle with version tag)
            if (req.url === '/api/app-ui' && req.method === 'GET') {
                try {
                    const htmlPath = path.join(__dirname, 'app_code', 'index.html');
                    const cssPath = path.join(__dirname, 'app_code', 'app.css');
                    const jsPath = path.join(__dirname, 'app_code', 'app.js');
                    
                    const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
                    const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
                    const js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8') : '';

                    const htmlStat = fs.existsSync(htmlPath) ? fs.statSync(htmlPath).mtimeMs : 0;
                    const cssStat = fs.existsSync(cssPath) ? fs.statSync(cssPath).mtimeMs : 0;
                    const jsStat = fs.existsSync(jsPath) ? fs.statSync(jsPath).mtimeMs : 0;
                    const version = `ui_${htmlStat}_${cssStat}_${jsStat}`;

                    res.end(JSON.stringify({
                        success: true,
                        version,
                        settings: db.settings,
                        uiHtml: html,
                        uiCss: css,
                        uiJs: js
                    }));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
                return;
            }

            // 11. GET /api/admin/code/files (List editable app UI & server code files)
            if (req.url === '/api/admin/code/files' && req.method === 'GET') {
                try {
                    const rootFiles = fs.readdirSync(__dirname);
                    const games = rootFiles.filter(f => f.endsWith('.html') && f !== 'index.html');
                    
                    const fileList = [
                        { category: "App UI Code", path: "app_code/index.html", label: "App UI Markup (index.html)" },
                        { category: "App UI Code", path: "app_code/app.css", label: "App UI Styling (app.css)" },
                        { category: "App UI Code", path: "app_code/app.js", label: "App UI Controller (app.js)" },
                        { category: "Backend & Server", path: "server.js", label: "Backend Express Server (server.js)" },
                        { category: "Backend & Server", path: "database.json", label: "Database Storage (database.json)" },
                        ...games.map(g => ({ category: "Arcade Games", path: g, label: `Game: ${g}` }))
                    ];
                    res.end(JSON.stringify({ success: true, files: fileList }));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
                return;
            }

            // 12. GET /api/admin/code (Read source code of any app UI or server file)
            if (req.url.startsWith('/api/admin/code') && req.method === 'GET') {
                const urlObj = new URL(req.url, `http://${req.headers.host}`);
                let file = urlObj.searchParams.get('file');
                if (!file) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Missing file parameter" }));
                    return;
                }
                
                const normalizedRel = path.normalize(file).replace(/^(\.\.[\/\\])+/, '');
                const filePath = path.join(__dirname, normalizedRel);
                if (!filePath.startsWith(__dirname)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Access denied" }));
                    return;
                }

                try {
                    if (fs.existsSync(filePath)) {
                        const code = fs.readFileSync(filePath, 'utf8');
                        res.end(JSON.stringify({ success: true, file: normalizedRel, code }));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: "File not found" }));
                    }
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
                return;
            }

            // 13. POST /api/admin/code (Save code changes to app UI or server file live)
            if (req.url === '/api/admin/code' && req.method === 'POST') {
                const { file, code } = jsonBody;
                if (!file || typeof code !== 'string') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Invalid file or code content" }));
                    return;
                }

                const normalizedRel = path.normalize(file).replace(/^(\.\.[\/\\])+/, '');
                const filePath = path.join(__dirname, normalizedRel);
                if (!filePath.startsWith(__dirname)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Access denied" }));
                    return;
                }

                try {
                    fs.writeFileSync(filePath, code, 'utf8');
                    // If database.json was updated, reload in memory immediately
                    if (normalizedRel === 'database.json') {
                        loadDatabase();
                    }
                    res.end(JSON.stringify({ success: true, message: `Successfully updated ${normalizedRel} live!` }));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
                return;
            }

            // 14. GET /api/admin/games
            if (req.url === '/api/admin/games' && req.method === 'GET') {
                try {
                    const files = fs.readdirSync(__dirname);
                    const gameFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');
                    res.end(JSON.stringify(gameFiles));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
                return;
            }

            // 15. GET /api/admin/games/code
            if (req.url.startsWith('/api/admin/games/code') && req.method === 'GET') {
                const urlObj = new URL(req.url, `http://${req.headers.host}`);
                const file = urlObj.searchParams.get('file');
                if (!file || !file.endsWith('.html') || file === 'index.html') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Invalid file name" }));
                    return;
                }
                const filePath = path.join(__dirname, file);
                if (!filePath.startsWith(__dirname)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Forbidden" }));
                    return;
                }
                try {
                    if (fs.existsSync(filePath)) {
                        const code = fs.readFileSync(filePath, 'utf8');
                        res.end(JSON.stringify({ success: true, file, code }));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: "File not found" }));
                    }
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
                return;
            }

            // 16. POST /api/admin/games/code
            if (req.url === '/api/admin/games/code' && req.method === 'POST') {
                const { file, code } = jsonBody;
                if (!file || !file.endsWith('.html') || file === 'index.html') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Invalid file name" }));
                    return;
                }
                const filePath = path.join(__dirname, file);
                if (!filePath.startsWith(__dirname)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Forbidden" }));
                    return;
                }
                try {
                    fs.writeFileSync(filePath, code, 'utf8');
                    res.end(JSON.stringify({ success: true, message: "Game code saved successfully" }));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
                return;
            }

            // Endpoint not found
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Endpoint not found" }));
        });
        return;
    }

    // Serve static files (HTML, CSS, JS)
    try {
        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        let reqPath = decodeURIComponent(urlObj.pathname);
        if (reqPath.endsWith('/')) {
            reqPath += 'index.html';
        }
        let safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '').replace(/^[\/\\]+/, '');
        if (!safePath || safePath === '.') {
            safePath = 'index.html';
        }
        let filePath = path.join(__dirname, safePath);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        if (!filePath.startsWith(__dirname)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden');
            return;
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain' });
                res.end(err.code === 'ENOENT' ? 'File Not Found' : `Server Error: ${err.code}`);
            } else {
                const ext = path.extname(filePath).toLowerCase();
                const contentType = MIME_TYPES[ext] || 'application/octet-stream';
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Exception: ${e.message}`);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}/`);
});
