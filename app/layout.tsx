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
        <div
          id="theme-segment"
          className="fixed top-3 right-3 z-50 flex items-center gap-0.5 rounded-lg border border-[--border]/60 bg-background/70 backdrop-blur p-0.5"
          role="group"
          aria-label="Theme selection"
        >
          <button
            data-theme="dark"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-[--foreground]/10"
            type="button"
            aria-pressed="false"
            title="Dark"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span className="label">DARK</span>
          </button>
          <button
            data-theme="light"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-[--foreground]/10"
            type="button"
            aria-pressed="false"
            title="Light"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span className="label">LIGHT</span>
          </button>
          <button
            data-theme="system"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-[--foreground]/10"
            type="button"
            aria-pressed="false"
            title="System"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M8 20h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span className="label">SYSTEM</span>
          </button>
        </div>
        {/* SW registration on client */}
        <script dangerouslySetInnerHTML={{__html: `
          if (typeof window !== 'undefined') {
            const root = document.documentElement;
            const seg = document.getElementById('theme-segment');
            const btns = seg ? Array.from(seg.querySelectorAll('button[data-theme]')) : [];
            const apply = (t) => { if (t==='system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t); };
            const paint = (t) => {
              btns.forEach(b => {
                const active = b.getAttribute('data-theme') === t;
                b.setAttribute('aria-pressed', String(active));
                b.classList.toggle('bg-[--foreground]', active);
                b.classList.toggle('text-[--background]', active);
                const s = b.querySelector('.label');
                if (s) s.classList.toggle('hidden', !active);
              });
            };
            let t = 'system';
            apply(t); paint(t);
            seg && seg.addEventListener('click', (e) => {
              const target = e.target.closest('button[data-theme]');
              if (!target) return;
              t = target.getAttribute('data-theme');
              apply(t); paint(t);
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
