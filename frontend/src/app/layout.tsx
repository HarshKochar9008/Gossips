import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Zodex - Blog Platform',
  description: 'A modern, secure blogging platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app-body antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
