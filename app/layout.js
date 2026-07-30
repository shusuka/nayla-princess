import { Fredoka } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/lib/store";
import { StikerPopup } from "@/components/UI";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata = {
  title: "CatMath Adventure 🐱 Belajar Perkalian & Pembagian",
  description:
    "Aplikasi belajar perkalian dan pembagian 1–10 untuk anak SD, penuh animasi dan kucing lucu bersama Mimi.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#6ec6ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${fredoka.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <GameProvider>
          {children}
          <StikerPopup />
        </GameProvider>
      </body>
    </html>
  );
}
