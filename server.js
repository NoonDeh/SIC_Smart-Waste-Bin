const express = require('express');
const mqtt = require('mqtt');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ============================================================
// KONFIGURASI MQTT
// ============================================================
const MQTT_BROKER = process.env.MQTT_BROKER;
const MQTT_PORT = process.env.MQTT_PORT;
const MQTT_TOPIC = process.env.MQTT_TOPIC;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// MQTT CLIENT
// ============================================================
const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`);

mqttClient.on('connect', () => {
    console.log('✅ Terhubung ke HiveMQ Broker');
    mqttClient.subscribe(MQTT_TOPIC, (err) => {
        if (!err) {
            console.log(`📡 Berlangganan ke topic: ${MQTT_TOPIC}`);
        } else {
            console.error('❌ Gagal subscribe:', err);
        }
    });
});

mqttClient.on('error', (err) => {
    console.error('❌ MQTT Error:', err);
});

// Store latest data
let latestData = {
    distance: null,
    fill: null,
    status: 'WAITING',
    timestamp: null
};

// Handle MQTT messages
mqttClient.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        latestData = {
            distance: parseFloat(data.distance) || -1,
            fill: parseInt(data.fill) || -1,
            status: String(data.status || 'WAITING'),
            timestamp: new Date().toISOString()
        };
        
        // Broadcast to all connected clients
        io.emit('smartbin-data', latestData);
        console.log('📊 Data diterima:', latestData);
    } catch (e) {
        console.error('❌ Error parsing MQTT message:', e);
    }
});

// ============================================================
// SOCKET.IO - Real-time Communication
// ============================================================
io.on('connection', (socket) => {
    console.log('🔌 Client terhubung via Socket.IO');
    
    // Send latest data immediately on connection
    socket.emit('smartbin-data', latestData);
    
    socket.on('disconnect', () => {
        console.log('🔌 Client terputus');
    });
});

// ============================================================
// API ENDPOINTS
// ============================================================
app.get('/api/status', (req, res) => {
    res.json({
        connected: mqttClient.connected,
        topic: MQTT_TOPIC,
        broker: MQTT_BROKER,
        latestData: latestData
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║     🗑️ SMART WASTE BIN DASHBOARD SERVER                   ║
╠═══════════════════════════════════════════════════════════╣
║  🌐 Server running: http://localhost:${PORT}                 ║
║  📡 MQTT Broker: ${MQTT_BROKER}:${MQTT_PORT}                  ║
║  📋 Topic: ${MQTT_TOPIC}                    ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
