/* ==========================================================================
   ExtraEarn Dynamic Web Client JavaScript Controller — Pro v2.5 Live
   ========================================================================== */

const API_BASE = window.location.origin;

// Local App State
let currentUser = null;
let currentSettings = {};
let currentActiveTab = 'tab-home';

// Custom Toast System (NO raw API host URLs displayed in popups!)
function showToast(message, type = "success", icon = null) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `custom-toast ${type}`;
    
    let iconClass = icon || (type === "success" ? "fa-solid fa-circle-check" : type === "error" ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-bell");
    let iconColor = type === "success" ? "var(--color-emerald)" : type === "error" ? "var(--color-rose)" : "var(--color-primary)";

    toast.innerHTML = `
        <i class="${iconClass}" style="font-size: 18px; color: ${iconColor};"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// Custom Modal Dialog (Replaces native browser alert)
function showAppModal(title, message, iconClass = "fa-solid fa-gift") {
    const modal = document.getElementById("app-modal");
    if (!modal) {
        showToast(message, "success");
        return;
    }
    
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-message").innerText = message;
    
    const iconBadge = document.getElementById("modal-icon-badge");
    if (iconBadge) {
        iconBadge.innerHTML = `<i class="${iconClass}"></i>`;
    }
    
    modal.style.display = "flex";
}

const btnCloseModal = document.getElementById("btn-modal-close");
if (btnCloseModal) {
    btnCloseModal.addEventListener("click", () => {
        const modal = document.getElementById("app-modal");
        if (modal) modal.style.display = "none";
    });
}

// Auto Detect Mobile Display Size & Orientation Engine
function autoDetectDisplaySize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;

    const root = document.documentElement;
    const body = document.body;

    // Set dynamic viewport height variable (fixes mobile browser 100vh bug)
    const vh = height * 0.01;
    root.style.setProperty('--vh', `${vh}px`);
    root.style.setProperty('--screen-width', `${width}px`);
    root.style.setProperty('--screen-height', `${height}px`);

    body.classList.remove('display-small', 'display-medium', 'display-large', 'display-landscape');

    if (width <= 360) {
        body.classList.add('display-small');
    } else if (width <= 480) {
        body.classList.add('display-medium');
    } else {
        body.classList.add('display-large');
    }

    if (isLandscape && height < 500) {
        body.classList.add('display-landscape');
    }
}

window.addEventListener('resize', autoDetectDisplaySize);
window.addEventListener('orientationchange', autoDetectDisplaySize);
autoDetectDisplaySize();

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
    loadCachedSettingsAndTheme();

    try {
        await syncApiUiBundle();
        
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
        console.error("Initialization background sync error:", e);
        if (!currentUser) showScreen('auth');
    }
});

function loadCachedSettingsAndTheme() {
    try {
        const cachedStr = localStorage.getItem("extraearn_cached_ui");
        if (cachedStr) {
            const data = JSON.parse(cachedStr);
            currentSettings = data.settings || {};
            applyDynamicThemeAndBranding(currentSettings);
        }
    } catch (e) {
        console.error("Cache load error:", e);
    }
}

async function syncApiUiBundle() {
    try {
        const res = await fetch(`${API_BASE}/api/app-ui`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.settings) {
                currentSettings = data.settings;
                localStorage.setItem("extraearn_cached_ui", JSON.stringify(data));
                applyDynamicThemeAndBranding(currentSettings);
            }
        }
    } catch (e) {
        console.warn("API UI sync offline/failed, using cached UI:", e);
    }
}

function applyDynamicThemeAndBranding(settings) {
    if (!settings) return;
    const root = document.documentElement;
    if (settings.primaryColor) root.style.setProperty('--color-primary', settings.primaryColor);
    if (settings.secondaryColor) root.style.setProperty('--color-secondary', settings.secondaryColor);
    if (settings.cardColor) root.style.setProperty('--card-bg-solid', settings.cardColor);
    if (settings.borderColor) root.style.setProperty('--card-border', settings.borderColor);
    if (settings.backgroundColor) root.style.setProperty('--app-bg', settings.backgroundColor);

    const splashName = document.getElementById('splash-app-name');
    if (splashName && settings.appName) splashName.innerText = settings.appName;

    const splashSub = document.getElementById('splash-app-subtitle');
    if (splashSub && settings.appSubtitle) splashSub.innerText = settings.appSubtitle;
}

function showScreen(screenKey) {
    Object.keys(screens).forEach(key => {
        if (key === screenKey) {
            screens[key].classList.add('active');
        } else {
            screens[key].classList.remove('active');
        }
    });
}

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
    
    const cashVal = (currentUser.coins / 100).toFixed(2);
    document.getElementById('wallet-cash-value').innerText = cashVal;
    
    document.getElementById('user-name').innerText = currentUser.name || "User";
    document.getElementById('user-vip-level').innerText = `Level ${currentUser.level || 1} VIP`;
    if (currentUser.name) {
        document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.name)}`;
    }
}

// -------------------------------------------------------------
// CHECK-IN LIMIT GUARD (1 claim per calendar day per user)
// -------------------------------------------------------------
function isAlreadyClaimedToday() {
    if (!currentUser || !currentUser.lastCheckInDate) return false;
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;
    const year = parts.find(p => p.type === 'year').value;
    const todayStr = `${year}-${month}-${day}`;
    return currentUser.lastCheckInDate === todayStr;
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

function renderCheckinGrid() {
    const container = document.getElementById('checkin-grid-container');
    if (!container || !currentUser) return;
    
    const days = [
        { day: 'Day 1', reward: 20 },
        { day: 'Day 2', reward: 30 },
        { day: 'Day 3', reward: 40 },
        { day: 'Day 4', reward: 50 },
        { day: 'Day 5', reward: 60 },
        { day: 'Day 6', reward: 70 },
        { day: 'Day 7', reward: 100 }
    ];
    
    const claimedToday = isAlreadyClaimedToday();
    const checkins = currentUser.dailyCheckins || 0;
    const currentStreakIdx = claimedToday ? Math.max(0, (checkins - 1) % 7) : checkins % 7;

    const heroBtn = document.getElementById('btn-claim-daily-hero');
    const statusBadge = document.getElementById('checkin-status-badge');

    if (heroBtn) {
        if (claimedToday) {
            heroBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> CLAIMED TODAY ✔`;
            heroBtn.style.background = "rgba(16, 185, 129, 0.2)";
            heroBtn.style.color = "var(--color-emerald)";
            heroBtn.style.border = "1px solid var(--color-emerald)";
        } else {
            heroBtn.innerHTML = `<i class="fa-solid fa-calendar-check"></i> CLAIM DAILY CHECK-IN (+50)`;
            heroBtn.style.background = "var(--color-primary)";
            heroBtn.style.color = "#000";
            heroBtn.style.border = "none";
        }
    }

    if (statusBadge) {
        statusBadge.innerText = claimedToday ? "Claimed Today ✔ (Next tomorrow)" : "Available to Claim!";
        statusBadge.style.color = claimedToday ? "var(--color-emerald)" : "var(--color-primary)";
    }

    container.innerHTML = days.map((d, idx) => {
        let isClaimed = idx < currentStreakIdx || (idx === currentStreakIdx && claimedToday);
        let isToday = idx === currentStreakIdx && !claimedToday;
        
        let classList = 'checkin-day';
        if (isClaimed) classList += ' claimed';
        if (isToday) classList += ' today';
        
        return `
            <div class="${classList}" onclick="handleCheckinClick(${idx}, ${isToday})">
                <span>${d.day}</span>
                <i class="${isClaimed ? 'fa-solid fa-check-circle' : 'fa-solid fa-coins'}"></i>
                <div class="reward-val">${isClaimed ? 'Claimed' : '+' + d.reward}</div>
            </div>
        `;
    }).join('');
}

async function handleCheckinClick(dayIdx, isToday) {
    if (isAlreadyClaimedToday()) {
        showToast("You have already claimed today's daily reward! Come back tomorrow.", "warning", "fa-solid fa-clock");
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/api/users/adjust-coins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                amount: 50,
                type: 'Daily Check-in',
                details: 'Daily Check-in Streak Reward'
            })
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem("extraearn_user", JSON.stringify(currentUser));
            showAppModal("🎉 Daily Reward Claimed!", "Awesome! +50 gold coins added to your vault. Come back tomorrow for your next streak bonus!", "fa-solid fa-gift");
            renderAllUI();
        } else {
            showToast(data.error || "Check-in already claimed today!", "warning", "fa-solid fa-clock");
        }
    } catch (e) {
        showToast("Failed to claim check-in reward. Check connection.", "error");
    }
}

// Tasks Offerwall Claims
async function handleTaskClaim(taskId, amount, taskTitle) {
    if (!currentUser) return;
    try {
        const res = await fetch(`${API_BASE}/api/users/adjust-coins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                amount: amount,
                type: 'earn',
                details: `Task: ${taskTitle}`
            })
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem("extraearn_user", JSON.stringify(currentUser));
            showAppModal("🎉 Task Completed!", `Awesome! You earned +${amount} coins for completing "${taskTitle}".`, "fa-solid fa-trophy");
            renderAllUI();
        } else {
            showToast(data.error || "This task reward was already claimed today!", "warning", "fa-solid fa-bell");
        }
    } catch (e) {
        showToast("Failed to claim task reward.", "error");
    }
}

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

window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'GAME_SCORE') {
        const score = event.data.score || 0;
        const coinsEarned = Math.min(score, 50);
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
        claimHeroBtn.onclick = () => handleCheckinClick(0, true);
    }
}

function switchTab(tabId) {
    currentActiveTab = tabId;
    
    document.querySelectorAll('.tab-pane').forEach(pane => {
        if (pane.id === tabId) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// -------------------------------------------------------------
// AUTHENTICATION & CASHOUT HANDLERS
// -------------------------------------------------------------
const btnSendOtp = document.getElementById('btn-send-otp');
const btnVerifyLogin = document.getElementById('btn-verify-login');

if (btnSendOtp) {
    btnSendOtp.addEventListener('click', () => {
        const name = document.getElementById('login-name').value.trim();
        const phone = document.getElementById('login-phone').value.trim();
        if (!name || !phone || phone.length !== 10) {
            showToast("Please enter full name and 10-digit mobile number.", "warning");
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
                showToast(`Welcome back, ${currentUser.name}!`, "success");
            }
        } catch (e) {
            showToast("Login failed. Please check network connection.", "error");
        }
    });
}

const btnSubmitRedeem = document.getElementById('btn-submit-redeem');
if (btnSubmitRedeem) {
    btnSubmitRedeem.addEventListener('click', async () => {
        const amount = parseInt(document.getElementById('redeem-amount').value, 10);
        const method = document.getElementById('redeem-method').value;
        const details = document.getElementById('redeem-details').value.trim();

        if (!amount || amount < 100) {
            showToast("Minimum cashout threshold is 100 coins.", "warning");
            return;
        }
        if (!details) {
            showToast("Please enter your payment account / UPI details.", "warning");
            return;
        }
        if (currentUser.coins < amount) {
            showToast("Insufficient coin balance in vault!", "error");
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
                showAppModal("✅ Cashout Request Submitted!", `Your withdrawal request of ${amount} coins via ${method} has been submitted for admin processing.`, "fa-solid fa-circle-check");
                document.getElementById('redeem-amount').value = '';
                document.getElementById('redeem-details').value = '';
                renderAllUI();
            }
        } catch (e) {
            showToast("Failed to submit cashout request.", "error");
        }
    });
}

const btnCopyRef = document.getElementById('btn-copy-ref');
if (btnCopyRef) {
    btnCopyRef.addEventListener('click', () => {
        const codeInput = document.getElementById('ref-code-input');
        codeInput.select();
        document.execCommand('copy');
        showToast("Referral code copied to clipboard!", "success", "fa-solid fa-copy");
    });
}

const btnShareWhatsapp = document.getElementById('btn-share-whatsapp');
if (btnShareWhatsapp) {
    btnShareWhatsapp.addEventListener('click', () => {
        const text = `Hey! Join ExtraEarn app and claim free daily cash rewards & games! Use my referral code: EXTRA2026`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    });
}
