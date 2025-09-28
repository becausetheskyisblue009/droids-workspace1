import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeToggle from "./theme-toggle";

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
  themeColor: "#0ea5e9",
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
        <ThemeToggle />
        {/* SW registration on client */}
        <script dangerouslySetInnerHTML={{__html: `if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/sw.js').catch(()=>{});});}`}} />
      </body>
    </html>
  );
}
