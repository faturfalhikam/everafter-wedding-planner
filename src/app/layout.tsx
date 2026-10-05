import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EverAfter — Wedding & Engagement Planner MVP',
  description: 'Personal Project Manager cerdas untuk perencanaan pernikahan & lamaran dengan pelacakan cashflow Budget Intelligence.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full bg-[#faf9f6] text-slate-900 antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
