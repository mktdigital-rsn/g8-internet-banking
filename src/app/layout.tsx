import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import { currentBrand } from "@/config/brand";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: `${currentBrand.name} | Internet Banking`,
  description: "Gerencie suas finanças com segurança e agilidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; 
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} ${instrumentSans.variable} ${ibmPlexMono.variable} ${currentBrand.themeClass} font-sans antialiased text-base`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
