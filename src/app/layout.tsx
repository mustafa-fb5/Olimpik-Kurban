import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteDataInit } from "@/components/site-data-init";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Olimpik Kurban - Güvenilir Kurban İbadeti",
  description:
    "Olimpik Kurban - İslami usullere uygun, güvenilir kurban ibadeti hizmeti. Hissenizi hemen ayırtın.",
  keywords: [
    "kurban",
    "hisse",
    "kurban bayramı",
    "kurban kesim",
    "bağış hisse",
    "olimpik kurban",
  ],
  authors: [{ name: "Olimpik Kurban - Gören Besicilik" }],
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Olimpik Kurban",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Olimpik Kurban - Güvenilir Kurban İbadeti",
    description:
      "İslami usullere uygun, hijyenik tesislerde, veteriner hekim kontrolünde güvenilir kurban ibadeti.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 font-sans text-slate-900">
        <TooltipProvider>
          <SiteDataInit />
          {children}
        </TooltipProvider>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
