// ============================================================
// API Route Next.js (Vercel Serverless Function)
// End-point polling yang mengambil data terbaru dari MQTT.
// Varian cache in-memory mempercepat warm call & mengurangi
// jumlah koneksi MQTT baru dari cold start.
// ============================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MQTT_BROKER = process.env.MQTT_BROKER || "broker.hivemq.com";
const MQTT_PORT = parseInt(process.env.MQTT_PORT || "1883", 10);
const MQTT_TOPIC = process.env.MQTT_TOPIC || "smartbin/wokwi/stage2/data";
const FETCH_TIMEOUT = 8000;

// Cache in-memory (per instance fungsi)
let cache = { data: null, at: 0 };
const CACHE_MS = 3000;

async function fetchLatestFromMqtt() {
  const { default: mqtt } = await import("mqtt");
  return new Promise((resolve) => {
    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        client.end(true);
      } catch (e) {
        /* ignore */
      }
      resolve(value);
    };

    const timer = setTimeout(() => done(null), FETCH_TIMEOUT);
    const url = `mqtt://${MQTT_BROKER}:${MQTT_PORT}`;
    const client = mqtt.connect(url, {
      connectTimeout: 5000,
      reconnectPeriod: 0,
      clean: true,
    });

    client.on("connect", () => {
      client.subscribe(MQTT_TOPIC, (err) => {
        if (err) done(null);
      });
    });
    client.on("error", () => done(null));
    client.on("message", (topic, message) => {
      try {
        const raw = JSON.parse(message.toString());
        done({
          distance: parseFloat(raw.distance) ?? -1,
          fill: parseInt(raw.fill, 10) ?? -1,
          status: String(raw.status || "WAITING"),
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        done(null);
      }
    });
  });
}

export async function GET() {
  try {
    const now = Date.now();
    if (cache.data && now - cache.at < CACHE_MS) {
      return Response.json(cache.data, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const fresh = await fetchLatestFromMqtt();
    if (fresh) {
      cache = { data: fresh, at: now };
      return Response.json(fresh, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    // MQTT belum memberi pesan: kembalikan cache lama atau data "WAITING"
    const payload = cache.data || {
      distance: null,
      fill: null,
      status: "WAITING",
      timestamp: null,
    };
    return Response.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return Response.json(
      { distance: null, fill: null, status: "WAITING", timestamp: null },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}