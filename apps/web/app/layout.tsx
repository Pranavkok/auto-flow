import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: "FlowMate — Automate Your Workflow",
  description: "FlowMate is a free workflow automation tool. Connect your apps, send emails, transfer Solana, and trigger webhooks — no code needed. Build automations that actually work.",
  keywords: ["FlowMate", "workflow automation", "no-code automation", "zapier alternative", "webhook automation", "solana automation"],
  metadataBase: new URL("https://0xpranav.space"),
  openGraph: {
    title: "FlowMate — Automate Your Workflow",
    description: "FlowMate is a free workflow automation tool. Connect your apps, send emails, transfer Solana, and trigger webhooks — no code needed.",
    url: "https://0xpranav.space",
    siteName: "FlowMate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowMate — Automate Your Workflow",
    description: "Free workflow automation — no code needed. Build automations that actually work.",
  },
  alternates: {
    canonical: "https://0xpranav.space",
  },
  verification: {
    google: "1KKWGi_lsT-T09S6tCS7jSynCXqcP3hh28DQseupNI8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
