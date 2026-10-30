"use client";

import { useEffect, useRef, useState } from "react";

const MQTT_TOPIC = process.env.NEXT_PUBLIC_MQTT_TOPIC || "smartbin/wokwi/stage2/data";
const POLL_INTERVAL = 4000;

const INITIAL_DATA = {
  distance: null,
  fill: null,
  status: "WAITING",
  timestamp: null,
};

export default function Dashboard() {
  const [serverConnected, setServerConnected] = useState(false);
  const [data, setData] = useState(INITIAL_DATA);
  const mqttTopic = MQTT_TOPIC;

  // Polling data ke API serverless (/api/data)
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    const fetchOnce = async () => {
      try {
        const res = await fetch("/api/data", { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!alive) return;
        setServerConnected(true);
        if (json && typeof json === "object" && json.timestamp) {
          setData(json);
        }
      } catch (e) {
        if (!alive) return;
        // Dev fallback: API mungkin belum ada di `next dev` -> data simulasi
        if (process.env.NODE_ENV === "development") {
          setServerConnected(false);
          setData((prev) => simulate(prev));
        } else {
          setServerConnected(false);
        }
      }
    };

    fetchOnce();
    const timer = setInterval(fetchOnce, POLL_INTERVAL);

    return () => {
      alive = false;
      controller.abort();
      clearInterval(timer);
    };
  }, []);

  const { distance, fill, status, timestamp } = data;

  // Styling status (identik dengan versi lama)
  let statusClass = "";
  let badgeClass = "";
  let progressClass = "";
  switch (status) {
    case "NORMAL":
      statusClass = "normal";
      badgeClass = "normal";
      progressClass = "success";
      break;
    case "HAMPIR_PENUH":
      statusClass = "warning";
      badgeClass = "warning";
      progressClass = "warning";
      break;
    case "PENUH":
      statusClass = "danger";
      badgeClass = "danger";
      progressClass = "danger";
      break;
    default:
      statusClass = "";
      badgeClass = "";
      progressClass = "";
  }

  const hasData = typeof fill === "number" && fill >= 0 && fill <= 100;
  const hasDistance = typeof distance === "number" && distance >= 0;

  const lastUpdateText = timestamp
    ? new Date(timestamp).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--";

  const indicatorText =
    status === "NORMAL"
      ? "NORMAL"
      : status === "HAMPIR_PENUH"
        ? "HAMPIR PENUH"
        : status === "PENUH"
          ? "PENUH"
          : "MENUNGGU";

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <i className="fas fa-recycle" />
            <h1>Smart Waste Bin</h1>
          </div>
          <div className="connection-status" id="connectionStatus">
            <span
              className={`status-dot ${serverConnected ? "connected" : "connecting"}`}
            />
            <span className="status-text">
              {serverConnected ? "Terhubung ke Server" : "Menghubungkan..."}
            </span>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="dashboard-main">
        {/* Status Card */}
        <div className="card status-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-chart-pie" /> Status Waste Bin
            </h2>
          </div>
          <div className="card-body">
            <div className={`status-badge ${badgeClass}`}>
              <span className="badge-text">
                {(status || "WAITING").replace("_", " ")}
              </span>
            </div>
            <div className="mqtt-info">
              <small>
                Topic: <code>{mqttTopic}</code>
              </small>
            </div>
          </div>
        </div>

        {/* Fill Level Card */}
        <div className="card fill-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-percentage" /> Kapasitas Terisi
            </h2>
          </div>
          <div className="card-body">
            <div className="fill-percentage">
              {hasData ? (
                <>
                  <span className="percentage-value">{fill}</span>
                  <span className="percentage-unit">%</span>
                </>
              ) : (
                <>
                  <span className="percentage-value error-value">ERR</span>
                  <span className="percentage-unit">%</span>
                </>
              )}
            </div>
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className={`progress-fill ${progressClass}`}
                  style={{ width: hasData ? `${fill}%` : "0%" }}
                />
              </div>
              <div className="progress-labels">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Data Card */}
        <div className="card sensor-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-ruler-vertical" /> Data Sensor
            </h2>
          </div>
          <div className="card-body">
            <div className="sensor-grid">
              <div className="sensor-item">
                <div className="sensor-icon">
                  <i className="fas fa-wave-square" />
                </div>
                <div className="sensor-info">
                  <span className="sensor-label">Jarak Sensor</span>
                  <span className={`sensor-value ${hasDistance ? "" : "error-value"}`}>
                    {hasDistance ? `${distance.toFixed(1)} cm` : "TIMEOUT/ERR"}
                  </span>
                </div>
              </div>
              <div className="sensor-item">
                <div className="sensor-icon">
                  <i className="fas fa-clock" />
                </div>
                <div className="sensor-info">
                  <span className="sensor-label">Terakhir Update</span>
                  <span
                    className={`sensor-value ${timestamp ? "" : "last-update-error"}`}
                  >
                    {lastUpdateText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bin Visualization Card */}
        <div className="card visualization-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-trash-alt" /> Visualisasi Waste Bin
            </h2>
          </div>
          <div className="card-body">
            <div className="bin-container">
              <div className="bin-visual">
                <div
                  className={`bin-fill ${progressClass}`}
                  style={{ height: hasData ? `${fill}%` : "0%" }}
                />
                <div className="bin-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="bin-labels">
                <span className="label-top">0%</span>
                <span className="label-mid">50%</span>
                <span className="label-bottom">100%</span>
              </div>
            </div>
            <div className="status-indicator">
              <div className={`indicator-light ${statusClass}`} />
              <span className="indicator-text">{indicatorText}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>🗑️ Smart Waste Bin Dashboard - Powered by MQTT & Next.js</p>
      </footer>
    </div>
  );
}

// ============================================================
// Fallback pengembangan: data simulasi ketika API belum tersedia
// ============================================================
function simulate(prev) {
  const statuses = ["NORMAL", "NORMAL", "HAMPIR_PENUH", "PENUH"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const baseFill =
    typeof prev.fill === "number" && prev.fill >= 0
      ? prev.fill
      : Math.floor(Math.random() * 60);
  let fill = baseFill + Math.floor(Math.random() * 6) - 2;
  if (fill < 0) fill = 0;
  if (fill > 100) fill = 100;
  const distance = Math.max(0, +(60 - fill * 0.5 + Math.random() * 4).toFixed(1));
  return {
    distance,
    fill,
    status,
    timestamp: new Date().toISOString(),
  };
}