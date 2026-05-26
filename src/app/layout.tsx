import type { Metadata } from 'next';
import { Geist, Instrument_Serif } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Sean Tan',
  description:
    'Sean Tan — Senior software engineer at Constructor.io, CTO of Jobless Club. Singaporean indie hacker and side quester.',
  metadataBase: new URL('https://seantanyurong.com'),
  openGraph: {
    title: 'Sean Tan',
    description:
      'Senior software engineer at Constructor.io, CTO of Jobless Club. Singaporean indie hacker and side quester.',
    url: 'https://seantanyurong.com',
    siteName: 'Sean Tan',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-neutral-900">{children}</body>
    </html>
  );
}
