import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  // Basic metadata
  title: {
    default: 'ArtMap - Discover Art Through Interactive Maps & 3D Galleries',
    template: '%s | ArtMap'
  },
  description: 'Explore artworks across different locations and time periods with ArtMap. Experience immersive 3D galleries in Google Street View, discover local art, and learn about artists and their works through an interactive map interface.',
  
  // Keywords for SEO
  keywords: [
    'art discovery',
    'interactive art map',
    'street view gallery',
    '3D art experience',
    'artwork locations',
    'art history',
    'virtual gallery',
    'art exploration',
    'cultural mapping',
    'digital art tour',
    'contemporary art',
    'art collection',
    'museum experience',
    'art education',
    'location-based art'
  ],
  
  // Author and creator information
  authors: [{ name: 'ArtMap Team' }],
  creator: 'ArtMap',
  publisher: 'ArtMap',
  
  // Robots and indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Open Graph metadata for social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://artmap.app',
    title: 'ArtMap - Discover Art Through Interactive Maps & 3D Galleries',
    description: 'Explore artworks across different locations and time periods with ArtMap. Experience immersive 3D galleries in Google Street View and discover art like never before.',
    images: [
      {
        url: '/demo_images/streetView.png',
        width: 800,
        height: 500,
        alt: 'ArtMap - Interactive Art Discovery Platform',
      },
      {
        url: '/demo_images/streetViewPanel.png',
        width: 800,
        height: 500,
        alt: 'ArtMap - Interactive Art Discovery Platform',
      },
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'ArtMap - Discover Art Through Interactive Maps & 3D Galleries',
    description: 'Explore artworks across different locations and time periods. Experience immersive 3D galleries in Street View.',
    images: ['/demo_images/streetView.png', '/demo_images/streetViewPanel.png'],
    creator: '@cheng_shenghan',
  },
  
  // Additional metadata
  category: 'Art & Culture',
  classification: 'Art Discovery Platform',
  
  // App-specific metadata
  applicationName: 'ArtMap',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ArtMap',
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/icons/32*32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        url: '/icons/apple.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
