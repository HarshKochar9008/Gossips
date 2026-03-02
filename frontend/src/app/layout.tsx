import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Gossipps  - Best blog of the week',
  description: 'Discover the best blogs on travel, health, lifestyle, and more. Read, share, and join the conversation.',
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
