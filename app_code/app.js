/* ==========================================================================
   ExtraEarn Dynamic Web Client JavaScript Controller
   ========================================================================== */

const API_BASE = window.location.origin;

// Local App State
let currentUser = null;
let currentSettings = {};
let selectedWithdrawMethod = null;

// Dom Cache
const screens = {
    splash: document.getElementById('splash-screen'),
    auth: document.getElementById('auth-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    gameFrame: document.getElementById('game-frame-screen'),
    scratch: document.getElementById('scratch-dialog')
};

// -------------------------------------------------------------
// BOOTSTRAP & INITIALIZATION
// -------------------------------------------------------------
async function initApp() {
    try {
        // 1. Fetch System Settings
        const settingsRes = await fetch(`${API_BASE}/api/settings`);
        currentSettings = await settingsRes.json();
        
        // Apply branding & themes dynamically
        applyBrandingTheme(currentSettings);

        // 2. Check Authentication State
        const savedUserJson = localStorage.getItem("extraearn_user");
        if (savedUserJson) {
            currentUser = JSON.parse(savedUserJson);
            // Verify and refresh profile from server
            const profileSuccess = await refreshUserProfile();
            if (profileSuccess) {
                showScreen('dashboard');
                switchTab('home');
            } else {
                localStorage.removeItem("extraearn_user");
                showScreen('auth');
            }
        } else {
            showScreen('auth');
        }
    } catch (e) {
        console.error("Initialization error:", e);
        // Fallback to auth if server fetching fails temporarily
        showScreen('auth');
    }
}

// Helper to switch screens
function showScreen(screenKey) {
    Object.keys(screens).forEach(key => {
        if (key === screenKey) {
            screens[key].classList.add('active');
        } else {
            screens[key].classList.remove('active');
        }
    });
}

// Apply colors from database dynamically
function applyBrandingTheme(settings) {
    const root = document.documentElement;
    if (settings.primaryColor) root.style.setProperty('--color-primary', settings.primaryColor);
    if (settings.backgroundColor) root.style.setProperty('--bg-color', settings.backgroundColor);
    if (settings.cardColor) root.style.setProperty('--card-bg', settings.cardColor);
    if (settings.borderColor) root.style.setProperty('--border-color', settings.borderColor);
    if (settings.secondaryColor) root.style.setProperty('--color-secondary', settings.secondaryColor);

    // Apply names & subtitle
    document.title = settings.appTitle || "ExtraEarn Pro";
    document.getElementById('splash-app-name').innerText = settings.appName || "ExtraEarn";
    document.getElementById('splash-app-subtitle').innerText = settings.appSubtitle || "TURN TIME INTO REAL COINS";
    
    // Set Action Card texts
    document.getElementById('checkin-subtitle').innerText = `+${settings.dailyCheckin || 50} Coins Daily`;
    document.getElementById('ad-subtitle').innerText = `+${settings.adReward || 15} Coins Instant`;
}

// -------------------------------------------------------------
// USER INTERFACES & AUTHENTICATION
// -------------------------------------------------------------
const btnSendOtp = document.getElementById('btn-send-otp');
const btnVerifyLogin = document.getElementById('btn-verify-login');
const btnBackAuth = document.getElementById('btn-back-auth');
const btnGoogleLogin = document.getElementById('btn-google-login');

btnSendOtp.addEventListener('click', () => {
    const name = document.getElementById('login-name').value.trim();
    const phone = document.getElementById('login-phone').value.trim();

    if (!name || !phone || phone.length !== 10) {
        alert("Please enter a valid name and 10-digit phone number.");
        return;
    }

    // Mock send OTP
    document.getElementById('auth-form-step').style.display = 'none';
    document.getElementById('otp-form-step').style.display = 'block';
    console.log(`[AUTH] Sent dummy OTP to +91${phone}`);
});

btnBackAuth.addEventListener('click', () => {
    document.getElementById('auth-form-step').style.display = 'block';
    document.getElementById('otp-form-step').style.display = 'none';
});

btnVerifyLogin.addEventListener('click', async () => {
    const name = document.getElementById('login-name').value.trim();
    const phone = document.getElementById('login-phone').value.trim();
    const otp = document.getElementById('login-otp').value.trim();

    if (!otp) {
        alert("Please enter the OTP verification code.");
        return;
    }

    await performLogin(name, phone);
});

btnGoogleLogin.addEventListener('click', async () => {
    // Google sign-in simulation
    await performLogin("K Kajal Mehta", "9876543210");
});

async function performLogin(name, phone) {
    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone })
        });
        const data = await res.json();
        if (data.success && data.user) {
            currentUser = data.user;
            localStorage.setItem("extraearn_user", JSON.stringify(currentUser));
            updateHeaderUI();
            showScreen('dashboard');
            switchTab('home');
        } else {
            alert(data.error || "Login verification failed.");
        }
    } catch (e) {
        alert("Server error during verification. Make sure backend is running.");
    }
}

async function refreshUserProfile() {
    if (!currentUser) return false;
    try {
        const res = await fetch(`${API_BASE}/api/users/profile?userId=${currentUser.id}`);
        const data = await res.json();
        if (data.success && data.user) {
            // Check status
            if (data.user.status === 'Banned') {
                alert("This account is banned due to anti-fraud policy violations.");
                return false;
            }
            currentUser = data.user;
            localStorage.setItem("extraearn_user", JSON.stringify(currentUser));
            updateHeaderUI();
            return true;
        }
    } catch (e) {
        console.error("Failed to refresh user profile:", e);
    }
    return false;
}

function updateHeaderUI() {
    if (!currentUser) return;
    document.getElementById('user-name').innerText = currentUser.name;
    document.getElementById('header-coin-count').innerText = currentUser.coins;
    document.getElementById('wallet-coin-count').innerText = currentUser.coins;
    document.getElementById('wallet-cash-equivalent').innerText = `₹${(currentUser.coins / 100).toFixed(2)}`;
    document.getElementById('user-invite-code').innerText = `E-${currentUser.id}`;
    
    // Generate avatar initials
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&color=fff`;
}

// -------------------------------------------------------------
// TAB NAVIGATION
// -------------------------------------------------------------
const navItems = document.querySelectorAll('.app-navbar .nav-item');
const tabPanes = document.querySelectorAll('.tab-pane');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const tabKey = item.getAttribute('data-tab');
        switchTab(tabKey);
    });
});

async function switchTab(tabKey) {
    // Highlight Nav
    navItems.forEach(nav => {
        if (nav.getAttribute('data-tab') === tabKey) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });

    // Toggle Panes
    tabPanes.forEach(pane => {
        if (pane.id === `tab-${tabKey}`) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });

    // Actions depending on tab loaded
    if (tabKey === 'home') {
        renderArcadeGames();
    } else if (tabKey === 'wallet') {
        await refreshUserProfile();
        renderWithdrawMethods();
        renderTransactionHistory();
    }
}

// -------------------------------------------------------------
// REWARD ACTIONS (DAILY CHECK-IN, VIDEO AD, SCRATCH CARD)
// -------------------------------------------------------------
document.getElementById('btn-daily-checkin').addEventListener('click', async () => {
    try {
        const res = await fetch(`${API_BASE}/api/users/adjust-coins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                amount: currentSettings.dailyCheckin || 50,
                type: "Daily Check-in",
                details: "Claimed daily login rewards"
            })
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem("extraearn_user", JSON.stringify(currentUser));
            updateHeaderUI();
            alert(`Awesome! You successfully claimed +${currentSettings.dailyCheckin || 50} coins check-in bonus!`);
        } else {
            alert(data.error || "Check-in failed.");
        }
    } catch (e) {
        alert("Failed to submit check-in request.");
    }
});

// Ad simulation
document.getElementById('btn-watch-ad').addEventListener('click', () => {
    // Show loading ad simulator overlay
    const adOverlay = document.createElement('div');
    adOverlay.style.position = 'fixed';
    adOverlay.style.top = '0';
    adOverlay.style.left = '0';
    adOverlay.style.width = '100vw';
    adOverlay.style.height = '100vh';
    adOverlay.style.backgroundColor = '#000';
    adOverlay.style.zIndex = '500';
    adOverlay.style.display = 'flex';
    adOverlay.style.flexDirection = 'column';
    adOverlay.style.justifyContent = 'center';
    adOverlay.style.alignItems = 'center';
    adOverlay.innerHTML = `
        <div style="text-align: center; color: #fff; padding: 20px;">
            <i class="fa-solid fa-rectangle-ad" style="font-size: 64px; color: var(--color-primary); margin-bottom: 20px; animation: pulse 1.5s infinite;"></i>
            <h3>Interactive Video Ad</h3>
            <p style="font-size:12px; color:#aaa; margin: 10px 0 30px 0;">Reward credits in <span id="ad-timer" style="font-weight:bold; color:#fff;">5</span> seconds...</p>
            <div style="width: 200px; height: 4px; background: #222; border-radius: 2px; overflow:hidden; margin: 0 auto;">
                <div id="ad-progress" style="width: 0%; height: 100%; background: var(--color-primary); transition: width 1s linear;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(adOverlay);

    let timeLeft = 5;
    const progress = document.getElementById('ad-progress');
    const timerText = document.getElementById('ad-timer');
    
    // Animate progress bar
    setTimeout(() => { progress.style.width = '100%'; }, 50);

    const interval = setInterval(async () => {
        timeLeft--;
        timerText.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            document.body.removeChild(adOverlay);
            await creditAdReward();
        }
    }, 1000);
});

async function creditAdReward() {
    try {
        const res = await fetch(`${API_BASE}/api/users/adjust-coins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                amount: currentSettings.adReward || 15,
                type: "Video Ad Reward",
                details: "Watched high EPM programmatic video ad"
            })
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem("extraearn_user", JSON.stringify(currentUser));
            updateHeaderUI();
            alert(`Success! You earned +${currentSettings.adReward || 15} coins for watching the video ad.`);
        } else {
            alert(data.error || "Ad reward request failed.");
        }
    } catch (e) {
        alert("Failed to submit ad reward credits.");
    }
}

// -------------------------------------------------------------
// INTERACTIVE CANVAS SCRATCH CARD
// -------------------------------------------------------------
const scratchDialog = document.getElementById('scratch-dialog');
const scratchCanvas = document.getElementById('scratch-canvas');
const scratchCtx = scratchCanvas.getContext('2d');
const btnCloseScratch = document.getElementById('btn-close-scratch');
let isDrawingScratch = false;
let scratchedPercentage = 0;
let scratchRewardCredited = false;
let randomScratchPrize = 0;

document.getElementById('btn-scratch-card').addEventListener('click', () => {
    // Generate random prize
    randomScratchPrize = Math.floor(Math.random() * 40) + 15; // 15 to 55 Coins
    document.getElementById('scratch-prize-value').innerText = `${randomScratchPrize} Coins`;
    
    // Set up canvas
    scratchCtx.globalCompositeOperation = 'source-over';
    
    // Draw silver coating
    scratchCtx.fillStyle = '#8e8e9f';
    scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    
    // Add grid/text on silver coating
    scratchCtx.fillStyle = '#222';
    scratchCtx.font = 'bold 16px Plus Jakarta Sans';
    scratchCtx.textAlign = 'center';
    scratchCtx.fillText('SCRATCH HERE', scratchCanvas.width / 2, scratchCanvas.height / 2 + 5);

    scratchRewardCredited = false;
    scratchedPercentage = 0;
    btnCloseScratch.style.display = 'none';
    
    scratchDialog.classList.add('active');
});

// Canvas scratch action listeners
scratchCanvas.addEventListener('mousedown', startScratch);
scratchCanvas.addEventListener('touchstart', startScratch);
scratchCanvas.addEventListener('mousemove', scratch);
scratchCanvas.addEventListener('touchmove', scratch);
scratchCanvas.addEventListener('mouseup', endScratch);
scratchCanvas.addEventListener('touchend', endScratch);

function startScratch(e) {
    isDrawingScratch = true;
    scratch(e);
}

function endScratch() {
    isDrawingScratch = false;
}

function scratch(e) {
    if (!isDrawingScratch) return;
    e.preventDefault();

    const rect = scratchCanvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, 22, 0, Math.PI * 2);
    scratchCtx.fill();

    checkScratchProgress();
}

function checkScratchProgress() {
    if (scratchRewardCredited) return;

    const imgData = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;

    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparentCount++;
    }

    scratchedPercentage = (transparentCount / (pixels.length / 4)) * 100;

    if (scratchedPercentage > 45) {
        scratchRewardCredited = true;
        // Erase fully
        scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
        creditScratchReward();
    }
}

async function creditScratchReward() {
    try {
        const res = await fetch(`${API_BASE}/api/users/adjust-coins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                amount: randomScratchPrize,
                type: "Scratch Card Reward",
                details: `Earned from lucky scratch bonus`
            })
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem("extraearn_user", JSON.stringify(currentUser));
            updateHeaderUI();
            btnCloseScratch.style.display = 'block';
        }
    } catch (e) {
        console.error(e);
        alert("Failed to sync scratch card coins.");
        btnCloseScratch.style.display = 'block';
    }
}

btnCloseScratch.addEventListener('click', () => {
    scratchDialog.classList.remove('active');
});

// -------------------------------------------------------------
// ARCADE LOBBY GAMES LOADER
// -------------------------------------------------------------
const gamesList = [
    { file: "star_catcher.html", name: "Star Catcher", icon: "fa-solid fa-star", color: "#FFD54A", desc: "Catch falling stars & boost score" },
    { file: "space_dodger.html", name: "Space Dodger", icon: "fa-solid fa-rocket", color: "#3B82F6", desc: "Navigate rocket, avoid asteroids" },
    { file: "block_breaker.html", name: "Block Breaker", icon: "fa-solid fa-border-all", color: "#F59E0B", desc: "Bounce ball to smash blocks" },
    { file: "memory_match.html", name: "Memory Match", icon: "fa-solid fa-brain", color: "#A855F7", desc: "Match identical cyber card blocks" },
    { file: "flappy_bird.html", name: "Flappy Bird", icon: "fa-solid fa-dove", color: "#06B6D4", desc: "Fly bird between obstacles safely" },
    { file: "color_tap.html", name: "Color Tap", icon: "fa-solid fa-palette", color: "#EC4899", desc: "Tap the matching text color fast" },
    { file: "tap_speed.html", name: "Tap Speed", icon: "fa-solid fa-bolt", color: "#10B981", desc: "Fast click gold coin to gain points" },
    { file: "number_sliding.html", name: "Number Sliding", icon: "fa-solid fa-shapes", color: "#EF4444", desc: "Slide numbers to combine & score" },
    { file: "tower_blocks.html", name: "Tower Blocks", icon: "fa-solid fa-cubes", color: "#84CC16", desc: "Stack falling blocks into high tower" },
    { file: "tic_tac_toe.html", name: "Tic Tac Toe", icon: "fa-solid fa-xmark", color: "#14B8A6", desc: "Align 3 elements to defeat bot" },
    { file: "word_scramble.html", name: "Word Scramble", icon: "fa-solid fa-spell-check", color: "#6366F1", desc: "Unscramble letters to find words" },
    { file: "alice_harvest.html", name: "Alice Harvest", icon: "fa-solid fa-tractor", color: "#F97316", desc: "Harvest veggies & fruits dynamically" }
];

function renderArcadeGames() {
    const container = document.getElementById('arcade-games-grid');
    if (!container) return;

    container.innerHTML = gamesList.map(game => {
        return `
            <div class="game-card-item" style="--game-theme: ${game.color};" onclick="launchGame('${game.file}', '${game.name}')">
                <div class="game-card-left">
                    <div class="game-icon-box"><i class="${game.icon}"></i></div>
                    <div class="game-text-box">
                        <h4>${game.name}</h4>
                        <p>${game.desc}</p>
                    </div>
                </div>
                <button class="game-play-badge">PLAY</button>
            </div>
        `;
    }).join('');
}

function launchGame(file, name) {
    if (!currentUser) return;
    
    // Construct game launch URL
    const url = `${API_BASE}/${file}?userId=${currentUser.id}`;
    
    document.getElementById('game-frame-title').innerText = name;
    document.getElementById('game-live-score').innerText = '0';
    
    const iframe = document.getElementById('game-iframe');
    iframe.src = url;
    
    // Open game screen
    showScreen('gameFrame');
}

// Exit game frame action
document.getElementById('btn-exit-game').addEventListener('click', async () => {
    document.getElementById('game-iframe').src = '';
    showScreen('dashboard');
    switchTab('home');
    
    // Refresh user balance immediately
    await refreshUserProfile();
});

// Listen to scores submitted inside the game iframe
window.addEventListener('message', async (event) => {
    // If the game sends score updates, let's catch it!
    if (event.data && event.data.type === 'SCORE_SUBMITTED') {
        document.getElementById('game-live-score').innerText = event.data.score;
        // Profile update
        await refreshUserProfile();
    }
});

// -------------------------------------------------------------
// WALLET REDEEM & PAYOUT OPERATIONS
// -------------------------------------------------------------
const withdrawMethods = ['UPI', 'Paytm', 'Google Play Gift Card', 'Bank Transfer'];

function renderWithdrawMethods() {
    const container = document.getElementById('withdraw-methods-container');
    if (!container) return;

    container.innerHTML = withdrawMethods.map(method => {
        const activeClass = selectedWithdrawMethod === method ? 'active' : '';
        return `
            <button class="withdraw-method-btn ${activeClass}" onclick="selectWithdrawMethod('${method}')">
                ${method}
            </button>
        `;
    }).join('');
}

window.selectWithdrawMethod = function(method) {
    selectedWithdrawMethod = method;
    renderWithdrawMethods();
    
    const inputForm = document.getElementById('withdraw-inputs');
    inputForm.style.display = 'flex';
    
    const detailInput = document.getElementById('withdraw-details');
    if (method === 'UPI') {
        detailInput.placeholder = 'Enter your UPI Address (e.g. name@upi)';
    } else if (method === 'Paytm' || method === 'Google Play Gift Card') {
        detailInput.placeholder = 'Enter Paytm Mobile Number';
    } else {
        detailInput.placeholder = 'Enter Account Number & IFSC details';
    }
};

document.getElementById('btn-submit-payout').addEventListener('click', async () => {
    if (!selectedWithdrawMethod) {
        alert("Please select a payout option first.");
        return;
    }

    const details = document.getElementById('withdraw-details').value.trim();
    const amount = parseInt(document.getElementById('withdraw-amount').value);

    if (!details || isNaN(amount) || amount <= 0) {
        alert("Please enter valid payout details and coin amount.");
        return;
    }

    if (amount < 1000) {
        alert("Minimum withdrawal is 1,000 Coins (₹10).");
        return;
    }

    if (currentUser.coins < amount) {
        alert("Insufficient coin balance for this withdrawal request.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/users/adjust-coins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                amount: -amount,
                type: `${selectedWithdrawMethod} Cashout`,
                details: `Redeem request: ${details}`
            })
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem("extraearn_user", JSON.stringify(currentUser));
            updateHeaderUI();
            
            // Clean inputs
            document.getElementById('withdraw-details').value = '';
            document.getElementById('withdraw-amount').value = '';
            
            alert("Your payout request has been successfully submitted! It is now pending review.");
            
            renderTransactionHistory();
        } else {
            alert(data.error || "Cashout submission failed.");
        }
    } catch (e) {
        alert("Failed to submit cashout transaction.");
    }
});

// Render user-specific transactions
async function renderTransactionHistory() {
    const container = document.getElementById('user-transaction-list');
    if (!container || !currentUser) return;

    try {
        const res = await fetch(`${API_BASE}/api/transactions?userId=${currentUser.id}`);
        const txs = await res.json();
        
        if (txs.length === 0) {
            container.innerHTML = `<div class="text-center text-muted" style="padding: 20px 0; text-align:center; font-size:12px;">No transaction history.</div>`;
            return;
        }

        // Sort descending
        const sorted = txs.reverse();

        container.innerHTML = sorted.map(tx => {
            let amountClass = 'text-green';
            let prefix = '+';
            if (tx.amount < 0) {
                amountClass = 'text-red';
                prefix = '';
            }

            let statusClass = 'status-success';
            if (tx.status === 'Pending') statusClass = 'status-pending';
            if (tx.status === 'Rejected') statusClass = 'status-rejected';

            return `
                <div class="tx-item">
                    <div class="tx-meta">
                        <h5>${tx.type}</h5>
                        <p>${tx.timestamp}</p>
                        <span class="tx-status-badge ${statusClass}">${tx.status}</span>
                    </div>
                    <span class="tx-amount ${amountClass}">${prefix}${tx.amount} Coins</span>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = `<div class="text-center text-red" style="padding: 20px 0;">Failed to fetch history logs.</div>`;
    }
}

// -------------------------------------------------------------
// INVITE & REFERRAL SHARE AND COPY
// -------------------------------------------------------------
document.getElementById('btn-copy-invite').addEventListener('click', () => {
    if (!currentUser) return;
    const inviteCode = `E-${currentUser.id}`;
    navigator.clipboard.writeText(inviteCode).then(() => {
        alert("Invite code copied to clipboard!");
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
});

document.getElementById('btn-share-invite').addEventListener('click', () => {
    if (!currentUser) return;
    const shareText = `Hey! Download ExtraEarn and play games to get free paytm cash. Use my referral code E-${currentUser.id} to get 250 bonus coins instantly! Link: ${window.location.origin}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'ExtraEarn Invite',
            text: shareText,
            url: window.location.origin
        }).catch(err => console.log(err));
    } else {
        // Fallback copy share text
        navigator.clipboard.writeText(shareText).then(() => {
            alert("Invite share message copied to clipboard! Paste it to your friends.");
        });
    }
});

// FAQ accordions
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
        item.classList.toggle('open');
    });
});

// Direct Whatsapp support click helper
document.getElementById('btn-support-whatsapp').addEventListener('click', () => {
    const waUrl = "https://wa.me/919999999999?text=" + encodeURIComponent("Hello ExtraEarn Support, I have a question regarding my payouts.");
    window.open(waUrl, '_blank');
});

// Initialize application on loaded
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(initApp, 1000); // 1s delayed splash feel
});
