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
    default: "Pattu's D.Garage | Die-Cast Collection Showroom",
    template: "%s | Pattu's D.Garage",
  },
  description:
    "A personal digital showroom for precision die-cast model cars. Featuring 1:64, 1:43, and 1:18 scale replicas from Mini GT, Inno64, Hot Wheels Premium, and more.",
  keywords: [
    "Die-Cast",
    "Model Cars",
    "1:64 Scale",
    "Mini GT",
    "Inno64",
    "Hot Wheels",
    "Car Collection",
    "Digital Showroom",
    "Pattu D.Garage",
  ],
  authors: [{ name: "Pattu" }],
  creator: "Pattu's D.Garage",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Pattu's D.Garage | Die-Cast Collection Showroom",
    description:
      "A personal curated catalogue of precision die-cast model cars.",
    siteName: "Pattu's D.Garage",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pattu's D.Garage | Die-Cast Collection",
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
