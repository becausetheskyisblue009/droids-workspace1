import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pomodoro Timer",
  description: "Simple and clean Pomodoro timer",
  manifest: "/manifest.webmanifest",
  applicationName: "Pomodoro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <button
          id="theme-toggle"
          className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 rounded-xl border border-[--border]/60 bg-background/70 backdrop-blur px-3 py-2 text-sm"
          type="button"
          aria-label="Toggle theme"
        >
          Theme
        </button>
        {/* SW registration on client */}
        <script dangerouslySetInnerHTML={{__html: `
          if (typeof window !== 'undefined') {
            const root = document.documentElement;
            const apply = (t) => { if (t==='system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t); };
            let t = 'system';
            apply(t);
            window.addEventListener('click', (e) => {
              const btn = document.getElementById('theme-toggle');
              if (!btn) return;
              if (e.target === btn || btn.contains(e.target)) {
                t = t === 'system' ? 'dark' : t === 'dark' ? 'light' : 'system';
                apply(t);
              }
            });
          }
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(()=>{}); });
          }
        `}} />
      </body>
    </html>
  );
}
