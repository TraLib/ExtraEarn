/* ==========================================================================
   ExtraEarn Live Web Admin Dashboard Controller
   ========================================================================== */

const API_BASE = window.location.origin; // e.g. http://localhost:3000

// In-memory cache of dashboard data
let currentSettings = {};
let allUsers = [];
let allTransactions = [];

// Log events helper
function logEvent(tag, message, color = "text-muted") {
    const consoleBox = document.getElementById("admin-console");
    const miniConsoleBox = document.getElementById("admin-overview-mini-log");
    const now = new Date().toLocaleTimeString();
    
    [consoleBox, miniConsoleBox].forEach(box => {
        if (!box) return;
        const line = document.createElement("div");
        line.className = `console-line ${color}`;
        line.innerHTML = `[${now}] <strong>[${tag}]</strong> ${message}`;
        box.appendChild(line);
        box.scrollTop = box.scrollHeight;
    });
}

// Fetch settings from API
async function fetchSettings() {
    try {
        const res = await fetch(`${API_BASE}/api/settings`);
        currentSettings = await res.json();
        
        // Sync UI inputs with fetched settings
        document.getElementById('toggle-maintenance').checked = currentSettings.maintenanceMode || false;
        document.getElementById('toggle-force-update').checked = currentSettings.forceUpdate || false;
        document.getElementById('toggle-anti-fraud').checked = currentSettings.antiFraudAutoBan || false;
        document.getElementById('toggle-web-app-enabled').checked = currentSettings.webAppEnabled || false;
        document.getElementById('web-app-url-val').value = currentSettings.webAppUrl || 'app_code/index.html';
        document.getElementById('web-app-url-container').style.display = currentSettings.webAppEnabled ? 'block' : 'none';
        document.getElementById('ad-reward-val').value = currentSettings.adReward || 15;
        document.getElementById('checkin-reward-val').value = currentSettings.dailyCheckin || 50;
        
        // Sync Branding UI inputs
        document.getElementById('app-name-val').value = currentSettings.appName || 'ExtraEarn';
        document.getElementById('app-title-val').value = currentSettings.appTitle || 'Earn Daily Rewards';
        document.getElementById('app-subtitle-val').value = currentSettings.appSubtitle || 'Earn coins by checking in, watching ads, and playing games!';
        
        if (currentSettings.primaryColor) document.getElementById('color-primary').value = currentSettings.primaryColor;
        if (currentSettings.secondaryColor) document.getElementById('color-secondary').value = currentSettings.secondaryColor;
        if (currentSettings.cardColor) document.getElementById('color-card').value = currentSettings.cardColor;
        if (currentSettings.borderColor) document.getElementById('color-border').value = currentSettings.borderColor;
        if (currentSettings.backgroundColor) document.getElementById('color-bg').value = currentSettings.backgroundColor;
        
        updateColorLabels();
        
        document.getElementById('admin-ad-revenue').innerText = `₹${(currentSettings.adRevenue || 0).toFixed(2)}`;
        
        logEvent("API", "Fetched latest configuration settings.");
        refreshStatsGrid();
    } catch (e) {
        logEvent("ERROR", "Failed to fetch settings from API.", "text-danger");
        console.error(e);
    }
}

function updateColorLabels() {
    document.getElementById('label-primary').innerText = document.getElementById('color-primary').value.toUpperCase();
    document.getElementById('label-secondary').innerText = document.getElementById('color-secondary').value.toUpperCase();
    document.getElementById('label-card').innerText = document.getElementById('color-card').value.toUpperCase();
    document.getElementById('label-border').innerText = document.getElementById('color-border').value.toUpperCase();
    document.getElementById('label-bg').innerText = document.getElementById('color-bg').value.toUpperCase();
}

// Fetch users from API
async function fetchUsers() {
    try {
        const res = await fetch(`${API_BASE}/api/admin/users`);
        allUsers = await res.json();
        renderUsersTable();
        refreshStatsGrid();
        logEvent("API", `Fetched ${allUsers.length} user records.`);
    } catch (e) {
        logEvent("ERROR", "Failed to fetch users from API.", "text-danger");
        console.error(e);
    }
}

// Fetch transactions from API
async function fetchTransactions() {
    try {
        const res = await fetch(`${API_BASE}/api/admin/transactions`);
        allTransactions = await res.json();
        renderPayoutsTable();
        renderTransactionsTable();
        refreshStatsGrid();
        logEvent("API", `Fetched ${allTransactions.length} transaction entries.`);
    } catch (e) {
        logEvent("ERROR", "Failed to fetch transactions from API.", "text-danger");
        console.error(e);
    }
}

// Refresh stats grid values
function refreshStatsGrid() {
    // Total users
    document.getElementById('admin-total-users').innerText = allUsers.length;
    
    // Coin Pool (Sum of all user coins)
    const coinPool = allUsers.reduce((sum, u) => sum + (u.coins || 0), 0);
    document.getElementById('admin-coin-pool').innerText = coinPool.toLocaleString();

    // Pending Payouts Count and Total Value
    const pendingTxs = allTransactions.filter(t => t.amount < 0 && t.status === 'Pending');
    document.getElementById('admin-pending-payouts').innerText = pendingTxs.length;
    
    const pendingTotalCoins = pendingTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const pendingTotalINR = pendingTotalCoins / 100;
    document.getElementById('admin-payout-value').innerText = `₹${pendingTotalINR.toFixed(2)} to review`;
    if (document.getElementById('pending-cashout-badge')) document.getElementById('pending-cashout-badge').innerText = `${pendingTxs.length} Pending`;
    if (document.getElementById('pending-cashout-badge-dept')) document.getElementById('pending-cashout-badge-dept').innerText = `${pendingTxs.length} Pending Requests`;
}

// Update settings to API
async function updateSettingsFromWeb() {
    const maintenanceMode = document.getElementById('toggle-maintenance').checked;
    const forceUpdate = document.getElementById('toggle-force-update').checked;
    const antiFraudAutoBan = document.getElementById('toggle-anti-fraud').checked;
    const adReward = parseInt(document.getElementById('ad-reward-val').value) || 15;
    const dailyCheckin = parseInt(document.getElementById('checkin-reward-val').value) || 50;

    const webAppEnabled = document.getElementById('toggle-web-app-enabled').checked;
    const webAppUrl = document.getElementById('web-app-url-val').value;

    const appName = document.getElementById('app-name-val').value;
    const appTitle = document.getElementById('app-title-val').value;
    const appSubtitle = document.getElementById('app-subtitle-val').value;
    const primaryColor = document.getElementById('color-primary').value;
    const secondaryColor = document.getElementById('color-secondary').value;
    const cardColor = document.getElementById('color-card').value;
    const borderColor = document.getElementById('color-border').value;
    const backgroundColor = document.getElementById('color-bg').value;

    const bodyData = {
        maintenanceMode,
        forceUpdate,
        antiFraudAutoBan,
        adReward,
        dailyCheckin,
        appName,
        appTitle,
        appSubtitle,
        primaryColor,
        secondaryColor,
        cardColor,
        borderColor,
        backgroundColor,
        webAppEnabled,
        webAppUrl
    };

    try {
        const res = await fetch(`${API_BASE}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });
        const data = await res.json();
        if (data.success) {
            currentSettings = data.settings;
            logEvent("SETTINGS", "Configuration saved and synced to API.", "text-green");
        }
    } catch (e) {
        logEvent("ERROR", "Failed to save configuration settings.", "text-danger");
    }
}

// Ban / Unban user
async function toggleUserBan(userId, currentStatus) {
    const targetStatus = currentStatus === 'Active' ? 'Banned' : 'Active';
    try {
        const res = await fetch(`${API_BASE}/api/admin/users/ban`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, status: targetStatus })
        });
        const data = await res.json();
        if (data.success) {
            logEvent("SECURITY", `User ${userId} status updated to: ${targetStatus}`, targetStatus === 'Banned' ? "text-danger" : "text-green");
            fetchUsers();
        }
    } catch (e) {
        logEvent("ERROR", "Failed to update user ban status.", "text-danger");
    }
}

// Approve / Reject Payouts
async function updatePayoutStatus(transactionId, status) {
    let redeemCode = undefined;
    if (status === 'Success') {
        const tx = allTransactions.find(t => t.id === transactionId);
        if (tx && (tx.type === 'Redeem Code Request' || (tx.details && tx.details.includes('Google Play')))) {
            redeemCode = prompt("Please enter the Google Play Redeem Code:");
            if (redeemCode === null) {
                // User cancelled the prompt, so don't approve
                return;
            }
            if (!redeemCode.trim()) {
                alert("Redeem Code cannot be empty for approval!");
                return;
            }
        }
    }

    try {
        const res = await fetch(`${API_BASE}/api/admin/transactions/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId, status, redeemCode })
        });
        const data = await res.json();
        if (data.success) {
            logEvent("PAYOUT", `Payout request ${transactionId} ${status.toUpperCase()}!${redeemCode ? ' Code: ' + redeemCode : ''}`, status === 'Success' ? "text-green" : "text-danger");
            // Refresh users and transactions to update UI coins
            fetchTransactions();
            fetchUsers();
        }
    } catch (e) {
        logEvent("ERROR", "Failed to update payout status.", "text-danger");
    }
}

// Create Mock User
async function createNewMockUser() {
    const names = ["Ronak Vyas", "Priya Sharma", "Rajesh Patel", "Sita Rami", "Nikunj Vala"];
    const name = names[Math.floor(Math.random() * names.length)];
    const phone = "9" + Math.floor(100000000 + Math.random() * 900000000);
    
    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone })
        });
        const data = await res.json();
        if (data.success) {
            logEvent("USER", `Created mock user: ${name} (${phone})`, "text-green");
            fetchUsers();
        }
    } catch (e) {
        logEvent("ERROR", "Failed to create mock user.", "text-danger");
    }
}

// Send broadcast announcement
async function broadcastNotification(event) {
    event.preventDefault();
    const title = document.getElementById("admin-push-title").value;
    const msg = document.getElementById("admin-push-msg").value;

    try {
        // Send via server settings to save
        const res = await fetch(`${API_BASE}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                broadcastTitle: title,
                broadcastMsg: msg,
                broadcastTime: new Date().toISOString()
            })
        });
        const data = await res.json();
        if (data.success) {
            logEvent("BROADCAST", `FCM broadcast dispatched: "${title} - ${msg}"`, "text-green");
            document.getElementById("admin-push-title").value = '';
            document.getElementById("admin-push-msg").value = '';
        }
    } catch (e) {
        logEvent("ERROR", "Failed to broadcast notification.", "text-danger");
    }
}

// Render users table
function renderUsersTable() {
    const tbody = document.getElementById("admin-users-tbody");
    if (!tbody) return;
    
    if (allUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No users found.</td></tr>`;
        return;
    }

    tbody.innerHTML = allUsers.map(u => {
        const statusClass = u.status === 'Active' ? 'status-active' : 'status-banned';
        const statusText = u.status === 'Active' ? 'Active' : 'Banned';
        const buttonText = u.status === 'Active' ? 'Ban' : 'Unban';
        const buttonClass = u.status === 'Active' ? 'btn-danger' : 'btn-success';

        return `
            <tr>
                <td><code>${u.id}</code></td>
                <td><strong>${u.name}</strong></td>
                <td>+91 ${u.phone}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="text-gold font-bold">${u.coins}</span>
                        <button class="btn btn-secondary btn-xs" onclick="const amt = prompt('Enter coins adjustment (e.g. 500 to add, -500 to subtract):'); if(amt) adjustUserCoins('${u.id}', parseInt(amt))" style="padding: 2px 6px; font-size: 10px;">
                            <i class="fa-solid fa-pen"></i> Edit
                        </button>
                    </div>
                </td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn ${buttonClass} btn-sm" onclick="toggleUserBan('${u.id}', '${u.status}')">
                            ${buttonText}
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser('${u.id}')">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Render payouts table
function renderPayoutsTable() {
    const tbody = document.getElementById("admin-withdrawals-tbody");
    if (!tbody) return;
    
    const pendingTxs = allTransactions.filter(t => t.amount < 0 && t.status === 'Pending');

    if (pendingTxs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No pending cashouts to approve. Request cashout inside the Mobile Wallet.</td></tr>`;
        return;
    }

    tbody.innerHTML = pendingTxs.map(t => {
        const amountINR = Math.abs(t.amount) / 100;
        const detailsParts = t.details.split(':');
        const method = detailsParts[0] || 'UPI';
        const targetId = detailsParts[1] || 'n/a';
        
        // Find username
        const user = allUsers.find(u => u.id === t.userId);
        const username = user ? user.name : `User (${t.userId})`;

        return `
            <tr>
                <td>
                    <strong>${username}</strong>
                    <div style="font-size:10px; color:gray;">ID: ${t.userId}</div>
                </td>
                <td><span style="text-transform:uppercase;" class="badge badge-info">${method}</span></td>
                <td><code>${targetId}</code></td>
                <td class="text-red font-bold">₹${amountINR.toFixed(2)} (${Math.abs(t.amount)} Coins)</td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-success btn-xs" onclick="updatePayoutStatus('${t.id}', 'Success')">Approve</button>
                        <button class="btn btn-danger btn-xs" onclick="updatePayoutStatus('${t.id}', 'Rejected')">Reject</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Render transactions history table
function renderTransactionsTable() {
    const tbody = document.getElementById("admin-transactions-tbody");
    if (!tbody) return;

    if (allTransactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No transactions found.</td></tr>`;
        return;
    }

    // Sort by timestamp desc or just slice the last 15 elements reversed (newest first)
    const sortedTxs = [...allTransactions].reverse().slice(0, 15);

    tbody.innerHTML = sortedTxs.map(t => {
        // Find username
        const user = allUsers.find(u => u.id === t.userId);
        const username = user ? user.name : `User (${t.userId})`;
        
        let amountClass = 'text-success';
        let amountPrefix = '+';
        if (t.amount < 0) {
            amountClass = 'text-danger';
            amountPrefix = '';
        }

        return `
            <tr>
                <td>
                    <strong>${username}</strong>
                    <div style="font-size:9px; color:gray;">ID: ${t.userId}</div>
                </td>
                <td><span class="badge ${t.type.includes('Game') ? 'badge-info' : 'badge-warning'}">${t.type}</span></td>
                <td class="${amountClass} font-bold">${amountPrefix}${t.amount} Coins</td>
                <td style="font-size:11px; color:#aaa;">${t.timestamp}</td>
                <td style="font-size:12px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${t.details || ''}">
                    ${t.details || '<span class="text-muted">n/a</span>'}
                </td>
            </tr>
        `;
    }).join('');
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
    fetchSettings();
    fetchUsers();
    fetchTransactions();
    fetchGames();
    
    // Poll updates every 5 seconds to keep the admin dashboard fresh and alive
    setInterval(() => {
        fetchSettings();
        fetchUsers();
        fetchTransactions();
    }, 5000);
});

let allGames = [];
let selectedGameFile = null;

// Fetch available games
async function fetchGames() {
    try {
        const res = await fetch(`${API_BASE}/api/admin/games`);
        allGames = await res.json();
        renderGameListButtons(allGames);
        logEvent("GAMES", `Fetched ${allGames.length} game files.`);
    } catch (e) {
        logEvent("ERROR", "Failed to fetch games list.", "text-danger");
    }
}

// Render game buttons
function renderGameListButtons(games) {
    const container = document.getElementById("game-list-buttons");
    if (!container) return;
    
    if (games.length === 0) {
        container.innerHTML = `<span class="text-muted">No game files found on server.</span>`;
        return;
    }
    
    container.innerHTML = games.map(game => {
        const activeClass = selectedGameFile === game ? 'btn-primary' : 'btn-secondary';
        return `<button class="btn ${activeClass}" onclick="openGameEditor('${game}')"><i class="fa-solid fa-file-code"></i> ${game}</button>`;
    }).join('');
}

// Open game editor
async function openGameEditor(filename) {
    selectedGameFile = filename;
    document.getElementById("editing-game-title").innerText = filename;
    document.getElementById("game-editor-box").style.display = "block";
    const textarea = document.getElementById("game-code-textarea");
    textarea.value = "Loading game source code...";
    textarea.disabled = true;
    
    // Update active button highlights
    renderGameListButtons(allGames);
    
    try {
        const res = await fetch(`${API_BASE}/api/admin/games/code?file=${encodeURIComponent(filename)}`);
        const data = await res.json();
        if (data.success) {
            textarea.value = data.code;
            textarea.disabled = false;
            logEvent("EDITOR", `Loaded code for ${filename} successfully.`, "text-green");
        } else {
            textarea.value = `Error loading code: ${data.error}`;
        }
    } catch (e) {
        textarea.value = `Error fetching game code: ${e.message}`;
        logEvent("ERROR", `Failed to load code for ${filename}.`, "text-danger");
    }
}

// Save game code
async function saveGameCode() {
    if (!selectedGameFile) return;
    const code = document.getElementById("game-code-textarea").value;
    
    try {
        const res = await fetch(`${API_BASE}/api/admin/games/code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: selectedGameFile, code })
        });
        const data = await res.json();
        if (data.success) {
            logEvent("DEPLOY", `Successfully deployed code changes for ${selectedGameFile} live!`, "text-green");
            alert(`Changes for ${selectedGameFile} saved and deployed live!`);
        } else {
            logEvent("ERROR", `Failed to save ${selectedGameFile}: ${data.error}`, "text-danger");
            alert(`Failed to save: ${data.error}`);
        }
    } catch (e) {
        logEvent("ERROR", `Error saving game: ${e.message}`, "text-danger");
        alert(`Error saving game: ${e.message}`);
    }
}

// Close game editor
function closeGameEditor() {
    selectedGameFile = null;
    document.getElementById("game-editor-box").style.display = "none";
    document.getElementById("game-code-textarea").value = "";
    fetchGames();
}

// Adjust coins for user
async function adjustUserCoins(userId, amount) {
    if (isNaN(amount) || amount === 0) return;
    try {
        const res = await fetch(`${API_BASE}/api/users/adjust-coins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, amount, type: "Admin Adjustment", details: "Changed by admin dashboard" })
        });
        const data = await res.json();
        if (data.success) {
            logEvent("COINS", `Adjusted coins for user ${userId} by ${amount > 0 ? '+' : ''}${amount}.`, "text-gold");
            fetchUsers();
        }
    } catch (e) {
        logEvent("ERROR", "Failed to adjust user coins.", "text-danger");
    }
}

// Delete user record
async function deleteUser(userId) {
    if (!confirm(`Are you sure you want to delete user ${userId}? This will also remove all their transaction logs.`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/admin/users/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await res.json();
        if (data.success) {
            logEvent("USER", `Deleted user ${userId}.`, "text-danger");
            fetchUsers();
            fetchTransactions();
        }
    } catch (e) {
        logEvent("ERROR", "Failed to delete user.", "text-danger");
    }
}

// ==========================================================================
// APP UI & BACKEND LIVE CODE STUDIO CONTROLLER
// ==========================================================================
let currentStudioFile = 'app_code/index.html';

// Open Studio Modal
async function openStudioModal() {
    const modal = document.getElementById("studio-modal");
    if (modal) {
        modal.style.display = "flex";
        await populateStudioGamesDropdown();
        await loadStudioFile(currentStudioFile);
    }
}

// Close Studio Modal
function closeStudioModal() {
    const modal = document.getElementById("studio-modal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Populate Games in Studio Dropdown
async function populateStudioGamesDropdown() {
    try {
        const res = await fetch(`${API_BASE}/api/admin/games`);
        if (res.ok) {
            const games = await res.json();
            const dropdown = document.getElementById("studio-game-select");
            if (dropdown && Array.isArray(games)) {
                dropdown.innerHTML = `<option value="" disabled selected>Select Game File...</option>` +
                    games.map(g => `<option value="${g}">🎮 ${g}</option>`).join("");
            }
        }
    } catch (e) {
        console.error("Error loading studio games:", e);
    }
}

// Load Studio File into Editor
async function loadStudioFile(filePath) {
    if (!filePath) return;
    currentStudioFile = filePath;

    // Update active tab buttons
    document.querySelectorAll(".studio-file-tab").forEach(tab => {
        if (tab.getAttribute("data-file") === filePath) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });

    const activeLabel = document.getElementById("studio-active-filename");
    if (activeLabel) activeLabel.innerText = filePath;

    const editor = document.getElementById("studio-code-editor");
    if (editor) {
        editor.value = "Loading code from API server...";
        try {
            const res = await fetch(`${API_BASE}/api/admin/code?file=${encodeURIComponent(filePath)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    editor.value = data.code;
                    updateStudioCharCount();
                } else {
                    editor.value = `// Error: ${data.error}`;
                }
            }
        } catch (e) {
            editor.value = `// Connection Error: ${e.message}`;
        }
    }
}

// Save Studio Code Live to API
async function saveStudioCode() {
    const editor = document.getElementById("studio-code-editor");
    if (!editor || !currentStudioFile) return;

    const code = editor.value;
    try {
        const res = await fetch(`${API_BASE}/api/admin/code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: currentStudioFile, code })
        });
        const data = await res.json();
        if (data.success) {
            logEvent("STUDIO", `Successfully saved and deployed ${currentStudioFile} live to API!`, "text-green");
            alert(`🚀 Live API Deployment Successful!\n${data.message}`);
            refreshStudioPreview();
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (e) {
        alert(`Failed to save code: ${e.message}`);
    }
}

// Refresh Live Preview Frame
function refreshStudioPreview() {
    const iframe = document.getElementById("studio-preview-iframe");
    if (iframe) {
        iframe.src = `app_code/index.html?t=${Date.now()}`;
    }
}

// Character and line count indicator
function updateStudioCharCount() {
    const editor = document.getElementById("studio-code-editor");
    const countSpan = document.getElementById("studio-char-count");
    if (editor && countSpan) {
        const lines = editor.value.split('\n').length;
        const chars = editor.value.length;
        countSpan.innerText = `${lines} lines | ${chars} chars`;
    }
}

// Add event listener for real-time line count
document.addEventListener("DOMContentLoaded", () => {
    const editor = document.getElementById("studio-code-editor");
    if (editor) {
        editor.addEventListener("input", updateStudioCharCount);
    }
});

// Insert quick code snippets
function insertStudioSnippet(type) {
    const editor = document.getElementById("studio-code-editor");
    if (!editor) return;

    let snippet = "";
    if (type === "card") {
        snippet = `\n<!-- New Live Dynamic Card -->\n<div class="card-bg-solid margin-top-md" style="padding: 16px; border-radius: 16px; border: 1px solid var(--card-border);">\n    <h3 style="color: #fff; font-size: 16px;">✨ Custom Dynamic Title</h3>\n    <p style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">Dynamic API-driven UI block configured by Admin.</p>\n</div>\n`;
    } else if (type === "button") {
        snippet = `\n<button class="btn btn-primary btn-block margin-top-md" onclick="alert('Action Triggered!')">\n    <i class="fa-solid fa-bolt"></i> Live Action Button\n</button>\n`;
    }

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const val = editor.value;
    editor.value = val.substring(0, start) + snippet + val.substring(end);
    updateStudioCharCount();
}
