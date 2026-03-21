import type { Metadata } from "next";
import { Bebas_Neue, Black_Ops_One } from "next/font/google";
import "./globals.css";
import PageTransition from "@/components/PageTransition";
import Providers from "@/components/Providers";
import RegisterSW from "@/components/RegisterSW";
import ActivityLogger from "@/components/ActivityLogger";
import PWAInstall from "@/components/PWAInstall";
import FloatingCart from "@/components/FloatingCart";
import Header from "@/components/Header";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

const blackOpsOne = Black_Ops_One({
  variable: "--font-black-ops",
  weight: "400",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://impactomotoparts.vercel.app'),
  title: "Impacto Moto Parts | Elite em Performance",
  description: "As melhores peças e acessórios para sua moto. Alta durabilidade, performance e entrega rápida em todo Brasil.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Impacto Moto",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Impacto Moto Parts | Elite em Performance",
    description: "Peças de alta durabilidade e performance para sua moto.",
    url: "https://impactomotoparts.vercel.app",
    siteName: "Impacto Moto Parts",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: "/icon-pwa-192.png?v=4",
    shortcut: "/icon-pwa-192.png?v=4",
    apple: "/icon-pwa-192.png?v=4",
  },
};

import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${bebasNeue.variable} ${blackOpsOne.variable} antialiased`}>
        <Providers>
          <Analytics />
          <RegisterSW />
          <PWAInstall />
          <ActivityLogger />
          <Header />
          <FloatingCart />
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
