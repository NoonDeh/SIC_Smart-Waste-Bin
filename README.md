# 🗑️ Smart Waste Bin Dashboard

Web Dashboard untuk monitoring Smart Waste Bin secara real-time menggunakan Node.js, MQTT, dan Socket.IO.

## Fitur

- 📡 **Koneksi MQTT Real-time** - Menghubungi broker HiveMQ dan menerima data langsung
- 🔄 **Update Otomatis** - Dashboard update secara real-time via Socket.IO
- 📊 **Visualisasi Data** - Menampilkan persentase kapasitas, jarak sensor, dan status
- 🎨 **Desain Modern** - UI yang bersih dan responsif

## Struktur Project

```
smart-waste-dashboard/
├── server.js           # Server Node.js dengan MQTT & Socket.IO
├── package.json        # Konfigurasi dependencies
├── public/
│   ├── index.html      # Halaman Dashboard
│   ├── css/
│   │   └── style.css   # Styling CSS
│   └── js/
│       └── app.js      # Client-side JavaScript
└── README.md
```

## Instalasi

1. **Install Node.js** (jika belum ada)

2. **Install dependencies:**
   ```bash
   cd smart-waste-dashboard
   npm install
   ```

3. **Jalankan server:**
   ```bash
   npm start
   ```

4. **Buka browser** di `http://localhost:3000`

## Konfigurasi MQTT

| Parameter     | Default                    |
|---------------|----------------------------|
| Broker        | `broker.hivemq.com`        |
| Port          | `1883`                     |
| Topic         | `smartbin/wokwi/stage2/data` |

Untuk mengubah konfigurasi, edit file `server.js`:
```javascript
const MQTT_BROKER = 'broker.hivemq.com';
const MQTT_PORT = 1883;
const MQTT_TOPIC = 'smartbin/wokwi/stage2/data';
```

## Format Data MQTT

Dashboard menerima data dalam format JSON:
```json
{
  "distance": 12.5,
  "fill": 65,
  "status": "NORMAL"
}
```

### Status Values
- `NORMAL` - Kapasitas normal (< 70%)
- `HAMPIR_PENUH` - Hampir penuh (70-90%)
- `PENUH` - Penuh (> 90%)
- `SENSOR_ERROR` - Error pada sensor
- `WAITING` - Menunggu data

## API Endpoints

| Endpoint        | Method | Deskripsi                    |
|-----------------|--------|------------------------------|
| `/api/status`   | GET    | Status koneksi MQTT & data    |
| `/api/health`   | GET    | Health check server          |

## Teknologi

- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MQTT.js** - MQTT client library
- **Socket.IO** - Real-time communication
- **Vanilla JS** - Client-side logic

## Screenshoot

```
╔═══════════════════════════════════════════════════════════╗
║     🗑️ SMART WASTE BIN DASHBOARD SERVER                   ║
╠═══════════════════════════════════════════════════════════╣
║  🌐 Server running: http://localhost:3000                 ║
║  📡 MQTT Broker: broker.hivemq.com:1883                   ║
║  📋 Topic: smartbin/wokwi/stage2/data                     ║
╚═══════════════════════════════════════════════════════════╝
```

## Lisensi

MIT License
