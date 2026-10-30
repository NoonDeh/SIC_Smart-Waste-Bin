/**
 * SMART WASTE BIN DASHBOARD - Client Application
 * Connects to Socket.IO and updates UI with real-time MQTT data
 */

// ============================================================
// SOCKET.IO CONNECTION
// ============================================================
const socket = io();

// ============================================================
// DOM ELEMENTS
// ============================================================
const connectionStatus = document.getElementById('connectionStatus');
const statusBadge = document.getElementById('statusBadge');
const fillPercentage = document.getElementById('fillPercentage');
const fillProgress = document.getElementById('fillProgress');
const fillProgressBar = document.getElementById('fillProgressBar');
const distanceValue = document.getElementById('distanceValue');
const lastUpdate = document.getElementById('lastUpdate');
const binFill = document.getElementById('binFill');
const statusIndicator = document.getElementById('statusIndicator');
const mqttTopic = document.getElementById('mqttTopic');

// ============================================================
// UPDATE FUNCTIONS
// ============================================================
function updateConnectionStatus(connected) {
    const statusDot = connectionStatus.querySelector('.status-dot');
    const statusText = connectionStatus.querySelector('.status-text');
    
    if (connected) {
        statusDot.className = 'status-dot connected';
        statusText.textContent = 'Terhubung ke Server';
    } else {
        statusDot.className = 'status-dot error';
        statusText.textContent = 'Terputus dari Server';
    }
}

function updateUI(data) {
    const { distance, fill, status, timestamp } = data;
    
    // Determine status styling
    let statusClass = '';
    let badgeClass = '';
    let progressClass = '';
    
    switch (status) {
        case 'NORMAL':
            statusClass = 'normal';
            badgeClass = 'normal';
            progressClass = 'success';
            break;
        case 'HAMPIR_PENUH':
            statusClass = 'warning';
            badgeClass = 'warning';
            progressClass = 'warning';
            break;
        case 'PENUH':
            statusClass = 'danger';
            badgeClass = 'danger';
            progressClass = 'danger';
            break;
        default:
            statusClass = '';
            badgeClass = '';
            progressClass = '';
    }
    
    // Update Status Badge
    statusBadge.className = `status-badge ${badgeClass}`;
    statusBadge.querySelector('.badge-text').textContent = 
        status.replace('_', ' ') || 'MENUNGGU DATA';
    
    // Update Fill Percentage
    if (fill >= 0 && fill <= 100) {
        fillPercentage.innerHTML = `
            <span class="percentage-value">${fill}</span>
            <span class="percentage-unit">%</span>
        `;
        fillProgress.style.width = `${fill}%`;
        fillProgress.className = `progress-fill ${progressClass}`;
        binFill.style.height = `${fill}%`;
        binFill.className = `bin-fill ${progressClass === '' ? '' : progressClass}`;
    } else {
        fillPercentage.innerHTML = `
            <span class="percentage-value error-value">ERR</span>
            <span class="percentage-unit">%</span>
        `;
        fillProgress.style.width = '0%';
        fillProgress.className = 'progress-fill';
        binFill.style.height = '0%';
        binFill.className = 'bin-fill';
    }
    
    // Update Distance
    if (distance >= 0) {
        distanceValue.textContent = `${distance.toFixed(1)} cm`;
        distanceValue.classList.remove('error-value');
    } else {
        distanceValue.textContent = 'TIMEOUT/ERR';
        distanceValue.classList.add('error-value');
    }
    
    // Update Last Update Time
    if (timestamp) {
        const date = new Date(timestamp);
        lastUpdate.textContent = date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        lastUpdate.classList.remove('last-update-error');
    } else {
        lastUpdate.textContent = '--';
        lastUpdate.classList.add('last-update-error');
    }
    
    // Update Status Indicator
    const indicatorLight = statusIndicator.querySelector('.indicator-light');
    const indicatorText = statusIndicator.querySelector('.indicator-text');
    
    indicatorLight.className = `indicator-light ${statusClass}`;
    indicatorText.textContent = status === 'NORMAL' ? 'NORMAL' : 
                                status === 'HAMPIR_PENUH' ? 'HAMPIR PENUH' :
                                status === 'PENUH' ? 'PENUH' : 'MENUNGGU';
}

// ============================================================
// SOCKET.IO EVENT HANDLERS
// ============================================================
socket.on('connect', () => {
    console.log('🔌 Terhubung ke Socket.IO Server');
    updateConnectionStatus(true);
});

socket.on('disconnect', () => {
    console.log('🔌 Terputus dari Socket.IO Server');
    updateConnectionStatus(false);
});

socket.on('smartbin-data', (data) => {
    console.log('📊 Data diterima:', data);
    updateUI(data);
});

// ============================================================
// INITIAL STATUS
// ============================================================
console.log('🗑️ Smart Waste Bin Dashboard loaded');
console.log('📡 Menunggu data dari MQTT broker...');

// Set initial MQTT topic display
mqttTopic.textContent = 'smartbin/wokwi/stage2/data';
