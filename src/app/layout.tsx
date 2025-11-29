import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import SidebarWrapper from '@/components/app/sidebar-wrapper';
import "./globals.css";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "NammaKarya - Professional Work Platform",
  description: "Connect skilled workers with meaningful opportunities. Post jobs, find work, and build your career with NammaKarya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
      </head>
      <body className="font-body antialiased bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="flex min-h-screen">
          <SidebarWrapper>
            <main className="flex-1 overflow-auto" style={{ willChange: 'transform' }}>
              <div className="fade-in" style={{ contain: 'layout style paint' }}>
                {children}
              </div>
            </main>
          </SidebarWrapper>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
