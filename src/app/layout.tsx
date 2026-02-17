import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "GRMC - تحويل مخلفات الرخام إلى تحف فنية",
  description: "شركة رائدة في مجال إعادة تدوير الرخام، نقدم منتجات عالية الجودة صديقة للبيئة بأسعار تنافسية في سلطنة عمان",
  keywords: "GRMC, رخام, إعادة تدوير, صبغ, عمان, عبري, منتجات بيئية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className="min-h-screen flex flex-col antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Header />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
            <Toaster
              position="top-center"
              richColors
              dir="rtl"
              toastOptions={{
                style: { fontFamily: 'Tajawal, sans-serif' },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
