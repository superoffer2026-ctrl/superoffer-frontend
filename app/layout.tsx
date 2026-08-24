import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://superoffer.net'),
  title: 'SuperOffer | AI-Powered International University Admissions',
  description:
    'SuperOffer is an AI-powered reverse admissions platform. Universities discover you — not the other way around. Build one profile, receive personalised offers from universities, lenders, and consultants worldwide.',
  alternates: { canonical: 'https://superoffer.net/' },
  openGraph: {
    type: 'website',
    url: 'https://superoffer.net/',
    title: 'SuperOffer | AI-Powered International University Admissions',
    description:
      'Build one student profile. Receive personalised university admission offers, education loans, and expert guidance — all in one place.',
    siteName: 'SuperOffer'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SuperOffer | AI-Powered International University Admissions',
    description:
      'Build one student profile. Receive personalised university admission offers, education loans, and expert guidance — all in one place.'
  }
};

export const viewport: Viewport = {
  themeColor: '#087a50',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Written at container start-up by runtime-config.sh; sets window.SUPER_OFFER_API_URL. */}
        <Script src="/config.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
