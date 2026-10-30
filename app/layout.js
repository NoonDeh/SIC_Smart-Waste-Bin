import "./globals.css";

export const metadata = {
  title: "🗑️ Smart Waste Bin Monitor",
  description: "Dashboard real-time Smart Waste Bin berbasis MQTT (Next.js + Vercel)",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}