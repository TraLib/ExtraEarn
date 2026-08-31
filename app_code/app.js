/* ==========================================================================
   ExtraEarn Dynamic Web Client JavaScript Controller — Pro v2.0
   ========================================================================== */

const API_BASE = window.location.origin;

// Local App State
let currentUser = null;
let currentSettings = {};
let currentActiveTab = 'tab-home';

// Arcade Games Registry
const gamesList = [
    { file: "star_catcher.html", name: "Star Catcher", icon: "fa-solid fa-star", color: "#FFB800", desc: "Catch falling stars & boost score" },
    { file: "space_dodger.html", name: "Space Dodger", icon: "fa-solid fa-rocket", color: "#3B82F6", desc: "Navigate rocket, avoid asteroids" },
    { file: "block_breaker.html", name: "Block Breaker", icon: "fa-solid fa-border-all", color: "#F59E0B", desc: "Bounce ball to smash blocks" },
    { file: "memory_match.html", name: "Memory Match", icon: "fa-solid fa-brain", color: "#8B5CF6", desc: "Match identical cyber card blocks" },
    { file: "flappy_bird.html", name: "Flappy Bird", icon: "fa-solid fa-dove", color: "#06B6D4", desc: "Fly bird between obstacles safely" },
    { file: "color_tap.html", name: "Color Tap", icon: "fa-solid fa-palette", color: "#EC4899", desc: "Tap the matching text color fast" },
    { file: "tap_speed.html", name: "Tap Speed", icon: "fa-solid fa-bolt", color: "#10B981", desc: "Fast click gold coin to gain points" },
    { file: "number_sliding.html", name: "Number Sliding", icon: "fa-solid fa-shapes", color: "#EF4444", desc: "Slide numbers to combine & score" },
    { file: "tower_blocks.html", name: "Tower Blocks", icon: "fa-solid fa-cubes", color: "#84CC16", desc: "Stack falling blocks into high tower" },
    { file: "tic_tac_toe.html", name: "Tic Tac Toe", icon: "fa-solid fa-xmark", color: "#14B8A6", desc: "Align 3 elements to defeat bot" },
    { file: "word_scramble.html", name: "Word Scramble", icon: "fa-solid fa-spell-check", color: "#6366F1", desc: "Unscramble letters to find words" },
    { file: "alice_harvest.html", name: "Alice Harvest", icon: "fa-solid fa-tractor", color: "#F97316", desc: "Harvest veggies & fruits dynamically" }
];

// DOM Elements
const screens = {
    splash: document.getElementById('splash-screen'),
    auth: document.getElementById('auth-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    gameOverlay: document.getElementById('game-overlay')
};

// -------------------------------------------------------------
// BOOTSTRAP & INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Fetch System Settings
        const settingsRes = await fetch(`${API_BASE}/api/settings`);
        currentSettings = await settingsRes.json();
        
        // 2. Check Saved User State
        const savedUserJson = localStorage.getItem("extraearn_user");
        if (savedUserJson) {
            currentUser = JSON.parse(savedUserJson);
            const verified = await refreshUserProfile();
            if (verified) {
                showScreen('dashboard');
                renderAllUI();
            } else {
                localStorage.removeItem("extraearn_user");
                showScreen('auth');
            }
        } else {
            showScreen('auth');
        }
    } catch (e) {
        console.error("Initialization error:", e);
        showScreen('auth');
    }
});

function showScreen(screenKey) {
    Object.keys(screens).forEach(key => {
        if (key === screenKey) {
            screens[key].classList.add('active');
        } else {
            screens[key].classList.remove('active');
        }
    });
}

// Fetch & sync user profile from server
async function refreshUserProfile() {
    if (!currentUser || !currentUser.id) return false;
    try {
        const res = await fetch(`${API_BASE}/api/users/profile?userId=${currentUser.id}`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
                currentUser = data.user;
                localStorage.setItem("extraearn_user", JSON.stringify(currentUser));
                updateHeaderCoins();
                return true;
            }
        }
    } catch (e) {
        console.error("Failed to sync profile:", e);
    }
    return false;
}

function updateHeaderCoins() {
    if (!currentUser) return;
    document.getElementById('header-coin-count').innerText = currentUser.coins.toLocaleString();
    document.getElementById('wallet-coin-count').innerText = currentUser.coins.toLocaleString();
    
    // Calculate approximate cash value (100 coins = ₹1)
    const cashVal = (currentUser.coins / 100).toFixed(2);
    document.getElementById('wallet-cash-value').innerText = cashVal;
    
    document.getElementById('user-name').innerText = currentUser.name || "User";
    document.getElementById('user-vip-level').innerText = `Level ${currentUser.level || 1} VIP`;
    if (currentUser.name) {
        document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.name)}`;
    }
}

// -------------------------------------------------------------
// UI RENDERERS
// -------------------------------------------------------------
function renderAllUI() {
    updateHeaderCoins();
    renderCheckinGrid();
    renderGamesGrids();
    renderTransactionsHistory();
    setupNavigation();
}

// Render 7-Day Check-in Grid
function renderCheckinGrid() {
    const container = document.getElementById('checkin-grid-container');
    if (!container) return;
    
    const days = [
        { day: 'Day 1', reward: 20 },
        { day: 'Day 2', reward: 30 },
        { day: 'Day 3', reward: 40 },
        { day: 'Day 4', reward: 50 },
        { day: 'Day 5', reward: 60 },
        { day: 'Day 6', reward: 70 },
        { day: 'Day 7', reward: 80 }
    ];
    
    const claimedCount = (currentUser.dailyCheckins || 0) % 7;

    container.innerHTML = days.map((d, idx) => {
        const isClaimed = idx < claimedCount;
        const isToday = idx === claimedCount;
        
        let classList = 'checkin-day';
        if (isClaimed) classList += ' claimed';
        if (isToday) classList += ' today';
        
        return `
            <div class="${classList}" onclick="handleCheckinClick(${idx}, ${isToday})">
                <span>${d.day}</span>
                <i class="${isClaimed ? 'fa-solid fa-check-circle' : 'fa-solid fa-coins'}"></i>
                <div class="reward-val">+${d.reward}</div>
            </div>
        `;
    }).join('');
}

async function handleCheckinClick(dayIdx, isToday) {
    if (!isToday) return;
    try {
        const res = await fetch(`${API_BASE}/api/users/adjust-coins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                amount: 50,
                type: 'earn',
                details: 'Daily Check-in Reward'
            })
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem("extraearn_user", JSON.stringify(currentUser));
            alert("🎉 +50 Coins claimed successfully!");
            renderAllUI();
        }
    } catch (e) {
        alert("Failed to claim check-in reward.");
    }
}

// Render Arcade Games Grids
function renderGamesGrids() {
    const homeGrid = document.getElementById('home-featured-games');
    const fullGrid = document.getElementById('arcade-full-grid');

    const cardHTML = (game) => `
        <div class="game-card" onclick="launchGame('${game.file}', '${game.name}')">
            <div class="game-icon-box">
                <i class="${game.icon}"></i>
            </div>
            <h5>${game.name}</h5>
            <p>${game.desc}</p>
            <div class="play-tag">
                <i class="fa-solid fa-play"></i> PLAY NOW
            </div>
        </div>
    `;

    if (homeGrid) homeGrid.innerHTML = gamesList.slice(0, 4).map(cardHTML).join('');
    if (fullGrid) fullGrid.innerHTML = gamesList.map(cardHTML).join('');
}

// Launch Arcade Game Overlays
function launchGame(file, name) {
    if (!currentUser) return;
    const url = `${API_BASE}/${file}?userId=${currentUser.id}`;
    document.getElementById('active-game-title').innerText = name;
    const iframe = document.getElementById('game-frame');
    iframe.src = url;
    showScreen('gameOverlay');
}

document.getElementById('btn-exit-game').addEventListener('click', async () => {
    document.getElementById('game-frame').src = '';
    showScreen('dashboard');
    await refreshUserProfile();
});

// Real-time score listener from games
window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'GAME_SCORE') {
        const score = event.data.score || 0;
        const coinsEarned = Math.min(score, 50); // Cap coins per session
        if (coinsEarned > 0 && currentUser) {
            try {
                await fetch(`${API_BASE}/api/users/adjust-coins`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        amount: coinsEarned,
                        type: 'earn',
                        details: `Arcade Reward (${event.data.game || 'Game'})`
                    })
                });
                await refreshUserProfile();
            } catch (e) {
                console.error("Score sync error:", e);
            }
        }
    }
});

// Render Recent Transactions History
async function renderTransactionsHistory() {
    const container = document.getElementById('wallet-history-list');
    if (!container || !currentUser) return;

    try {
        const res = await fetch(`${API_BASE}/api/transactions?userId=${currentUser.id}`);
        if (res.ok) {
            const list = await res.json();
            if (list.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--color-muted); padding: 20px;">No transactions yet</div>`;
                return;
            }
            container.innerHTML = list.slice(-5).reverse().map(tx => `
                <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 14px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <div style="font-weight: 700; color: #fff; font-size: 14px;">${tx.details || tx.type}</div>
                        <div style="font-size: 11px; color: var(--color-muted);">${new Date(tx.timestamp).toLocaleString()}</div>
                    </div>
                    <div style="font-weight: 800; font-size: 15px; color: ${tx.amount >= 0 ? 'var(--color-emerald)' : 'var(--color-rose)'};">
                        ${tx.amount >= 0 ? '+' : ''}${tx.amount} Coins
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error("Failed to fetch history:", e);
    }
}

// -------------------------------------------------------------
// NAVIGATION & TAB SWITCHING
// -------------------------------------------------------------
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            if (targetTab) switchTab(targetTab);
        });
    });

    const seeAllBtn = document.getElementById('btn-see-all-games');
    if (seeAllBtn) {
        seeAllBtn.addEventListener('click', () => switchTab('tab-games'));
    }
    
    const claimHeroBtn = document.getElementById('btn-claim-daily-hero');
    if (claimHeroBtn) {
        claimHeroBtn.addEventListener('click', () => handleCheckinClick(0, true));
    }
}

function switchTab(tabId) {
    currentActiveTab = tabId;
    
    // Update Tab Panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        if (pane.id === tabId) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });

    // Update Nav Bar Indicators
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// -------------------------------------------------------------
// AUTHENTICATION HANDLERS
// -------------------------------------------------------------
const btnSendOtp = document.getElementById('btn-send-otp');
const btnVerifyLogin = document.getElementById('btn-verify-login');

if (btnSendOtp) {
    btnSendOtp.addEventListener('click', () => {
        const name = document.getElementById('login-name').value.trim();
        const phone = document.getElementById('login-phone').value.trim();
        if (!name || !phone || phone.length !== 10) {
            alert("Please enter full name and 10-digit mobile number.");
            return;
        }
        document.getElementById('auth-form-step').style.display = 'none';
        document.getElementById('otp-form-step').style.display = 'block';
    });
}

if (btnVerifyLogin) {
    btnVerifyLogin.addEventListener('click', async () => {
        const name = document.getElementById('login-name').value.trim();
        const phone = document.getElementById('login-phone').value.trim();
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone })
            });
            const data = await res.json();
            if (res.ok && data.user) {
                currentUser = data.user;
                localStorage.setItem("extraearn_user", JSON.stringify(currentUser));
                showScreen('dashboard');
                renderAllUI();
            }
        } catch (e) {
            alert("Login failed. Please check network connection.");
        }
    });
}

// Redeem & Cashout Form Handler
const btnSubmitRedeem = document.getElementById('btn-submit-redeem');
if (btnSubmitRedeem) {
    btnSubmitRedeem.addEventListener('click', async () => {
        const amount = parseInt(document.getElementById('redeem-amount').value, 10);
        const method = document.getElementById('redeem-method').value;
        const details = document.getElementById('redeem-details').value.trim();

        if (!amount || amount < 100) {
            alert("Minimum cashout is 100 coins.");
            return;
        }
        if (!details) {
            alert("Please enter your payment account details.");
            return;
        }
        if (currentUser.coins < amount) {
            alert("Insufficient coin balance!");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/users/adjust-coins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    amount: -amount,
                    type: 'redeem',
                    details: `Redeem ${amount} coins via ${method} (${details})`
                })
            });
            const data = await res.json();
            if (data.success) {
                currentUser = data.user;
                localStorage.setItem("extraearn_user", JSON.stringify(currentUser));
                alert("✅ Cashout request submitted successfully!");
                document.getElementById('redeem-amount').value = '';
                document.getElementById('redeem-details').value = '';
                renderAllUI();
            }
        } catch (e) {
            alert("Failed to submit cashout request.");
        }
    });
}

// Share & Copy Referral Code
const btnCopyRef = document.getElementById('btn-copy-ref');
if (btnCopyRef) {
    btnCopyRef.addEventListener('click', () => {
        const codeInput = document.getElementById('ref-code-input');
        codeInput.select();
        document.execCommand('copy');
        alert("Referral code copied to clipboard!");
    });
}
