import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pixel Office - Build Your Dream Office!',
  description: 'A fun pixel art office simulation game for kids. Complete tasks, earn coins, and decorate your office!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
