import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DieCast Vault | Luxury Precision Model Car Showroom",
    template: "%s | DieCast Vault",
  },
  description:
    "A modern digital showroom for curated premium die-cast model cars. Featuring Mini GT, Inno64, Ignition Model, Tarmac Works, and 1:64 / 1:43 / 1:18 precision scale replicas.",
  keywords: [
    "DieCast",
    "Model Cars",
    "1:64 Scale",
    "Mini GT",
    "Inno64",
    "Ignition Model",
    "Porsche",
    "Car Collection",
    "Digital Showroom",
  ],
  authors: [{ name: "DieCast Vault Curator" }],
  creator: "DieCast Vault",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://diecast-vault.vercel.app",
    title: "DieCast Vault | Luxury Precision Model Car Showroom",
    description:
      "A curated digital catalogue of premium precision die-cast model cars.",
    siteName: "DieCast Vault",
  },
  twitter: {
    card: "summary_large_image",
    title: "DieCast Vault | Luxury Model Car Showroom",
    description: "Curated collection of 1:64, 1:43 & 1:18 die-cast models.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${sansFont.variable} ${monoFont.variable}`}>
      <body className="min-h-screen bg-[#09090b] text-zinc-100 antialiased flex flex-col font-sans selection:bg-rose-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
