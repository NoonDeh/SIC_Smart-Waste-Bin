# 🗑️ Smart Waste Bin Dashboard (Next.js)

Web Dashboard untuk monitoring Smart Waste Bin secara real-time. Dibangun dengan **Next.js 14 (App Router)** sehingga dapat **di-deploy gratis ke Vercel**.

## Fitur

- 📡 **Data metabol dari HiveMQ** — API Route Next.js (`/api/data`) berlangganan ke topik MQTT `smartbin/wokwi/stage2/data`, mem-parse payload JSON, dan mengembalikannya sebagai respons HTTP.
- 🔄 **Polling otomatis** — Client memanggil `/api/data` tiap beberapa detik sehingga UI selalu menampilkan data terbaru (tanpa WebSocket, kompatibel dengan serverless Vercel).
- 📊 **Visualisasi lengkap** — badge status, progress bar kapasitas, jarak sensor, indikator lampu, & animasi tempat sampah.
- 🎨 **Desain card modern** — 4 kartu: Status, Kapasitas, Sensor, Visualisasi.

## Struktur Project (Next.js App Router)

```
smart-waste-dashboard/
├── app/
│   ├── layout.js              # Root layout (metadata, lang)
│   ├── page.js                # Halaman utama
│   ├── globals.css            # Semua styling dashboard
│   ├── components/
│   │   └── Dashboard.js       # Komponen client (polling + render UI)
│   └── api/
│       └── data/
│           └── route.js       # API serverless: subscribe MQTT → JSON
├── next.config.js
├── package.json
├── .env                       # Konfigurasi MQTT
└── README.md
```

## Konfigurasi MQTT (`.env`)

```env
MQTT_BROKER=broker.hivemq.com
MQTT_PORT=1883
MQTT_TOPIC=smartbin/wokwi/stage2/data
NEXT_PUBLIC_MQTT_TOPIC=smartbin/wokwi/stage2/data
```

## Format Data MQTT (dikirim oleh Wokwi/ESP32)

```json
{
  "distance": 12.5,
  "fill": 65,
  "status": "NORMAL"
}
```

Status: `NORMAL` | `HAMPIR_PENUH` | `PENUH` | `SENSOR_ERROR` | `WAITING`

## Menjalankan Lokal

```bash
npm install
npm run dev        # buka http://localhost:3000
```

## Deploy ke Vercel (gratis)

### Opsi 1 — Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### Opsi 2 — Dashboard Vercel
1. Push repo ke GitHub.
2. Buka https://vercel.com/new → Import repository.
3. Framework preset: **Next.js** (otomatis terdeteksi).
4. Tambahkan Environment Variables (MQTT_BROKER, MQTT_PORT, MQTT_TOPIC).
5. Klik **Deploy**.

Setiap push ke `main` akan otomatis redeploy.

## Cara Kerja Data Real-time

```
ESP32/Wokwi ──publish──▶ HiveMQ (broker.hivemq.com)
                             │
                             ▼ subscribe
                    /api/data (Vercel Serverless, Node.js)
                             │ JSON {distance, fill, status}
                             ▼ polling tiap 4 detik
                    Dashboard (client component)
```

> Catatan: Karena Vercel serverless tidak mendukung WebSocket persisten, dashboard menggunakan **polling HTTP**. Interval polling bisa diubah `POLL_INTERVAL` di `app/components/Dashboard.js`.

## API

| Endpoint     | Method | Deskripsi                                    |
|--------------|--------|----------------------------------------------|
| `/api/data`  | GET    | Data terbaru dari broker MQTT (JSON)         |
| `/`          | GET    | Dashboard UI                                 |

## Lisensi

MIT License