import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import { currentBrand } from "@/config/brand";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: `${currentBrand.id === "g8" ? "G8Pay" : currentBrand.shortName} | Internet Banking`,
  description: "Gerencie suas finanças com segurança e agilidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; 
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} font-sans antialiased text-base`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
