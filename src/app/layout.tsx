import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { SetupBanner } from "@/components/layout/setup-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: "AffiliateHunter AI",
  description: "AI agents that recruit your next 1,000 affiliate partners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-[#f8f9fc]">
            <SetupBanner />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
