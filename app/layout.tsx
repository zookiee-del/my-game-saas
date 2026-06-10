import Script from 'next/script';
import type { Metadata } from "next";
import React from 'react';

export const metadata: Metadata = {
  title: "GameToolsHub | Ultimate Gaming Utility Portal",
  description: "Comprehensive Toolkit for Gamers: DPS Calculators, Build Optimizers, Boss Guides & More",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ background: "#071019", color: "#fff", fontFamily: "monospace" }} suppressHydrationWarning>
      <body style={{ margin: 0, padding: 0 }}>
        {/* Top Navigation Bar */}
        <nav style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 40px",
          borderBottom: "1px solid rgba(139,233,253,0.08)",
          background: "#0b1922"
        }}>
          <a href="/" style={{ fontSize: "20px", fontWeight: 800, color: "#8be9fd", textDecoration: "none", letterSpacing: "1px" }}>
            GAME<span style={{ color: "#50fa7b" }}>TOOLS</span>HUB
          </a>
          <div style={{ display: "flex", gap: "24px" }}>
            <a href="/" style={{ color: "#cfeffd", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>🎮 Game Tools</a>
            <a href="/blog" style={{ color: "#cfeffd", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>📖 Strategy Guides</a>
          </div>
        </nav>

        {/* Main Content Container */}
        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
          {children}
        </main>
      
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XZ4C46NWRW" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XZ4C46NWRW');
          `}
        </Script>
      </body>
    </html>
  );
}
