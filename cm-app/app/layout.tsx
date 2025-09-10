import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes'
import { ThemeProvider } from "@/components/providers/theme-provider";
import Script from "next/script";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Compete-Monkey | Multiplayer Typing Game & Typing Test Arena",
  description: "Compete-Monkey is a fast, fun, and gamified multiplayer typing game. Challenge friends or players worldwide in real-time typing races, improve your typing speed and accuracy, and climb the leaderboards. Perfect for typists, students, and anyone looking to boost their typing skills.",
  keywords: [
    "typing game",
    "multiplayer typing",
    "typing test",
    "typing speed",
    "typing competition",
    "online typing",
    "typing practice",
    "typing race",
    "improve typing",
    "typing arena",
    "Compete-Monkey"
  ],
  openGraph: {
    title: "Compete-Monkey | Multiplayer Typing Game & Typing Test Arena",
    description: "Join Compete-Monkey to race against others in real-time typing competitions. Track your progress, improve your skills, and have fun!",
    url: "https://compete-monkey.vercel.app",
    siteName: "Compete-Monkey",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Compete-Monkey Multiplayer Typing Game",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compete-Monkey | Multiplayer Typing Game & Typing Test Arena",
    description: "Race your friends and improve your typing speed with Compete-Monkey, the ultimate multiplayer typing competition.",
    images: [
      {
        url: "https://compete-monkey.vercel.app/og-image.png",
        alt: "Compete-Monkey Multiplayer Typing Game",
        width: 1200,
        height: 630,
      }
    ],
    site: "@compete_monkey",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
    }}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-13NTTMSJXH"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-13NTTMSJXH');
          `}
          </Script>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
