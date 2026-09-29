import { ViewTransition } from "react";
import { Baloo_2, Fredoka } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/lib/store";
import { LapisEfek, StikerPopup } from "@/components/UI";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

// Huruf judul yang bulat & tebal, ramah anak.
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata = {
  title: "CatMath Adventure 🐱 Belajar Perkalian & Pembagian",
  description:
    "Aplikasi belajar perkalian dan pembagian 1–10 untuk anak SD, penuh animasi dan kucing lucu bersama Mimi.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#b9e3ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${fredoka.variable} ${baloo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <GameProvider>
          <ViewTransition default="halaman">{children}</ViewTransition>
          <StikerPopup />
          <LapisEfek />
        </GameProvider>
        <div className="butiran" aria-hidden="true" />
      </body>
    </html>
  );
}
