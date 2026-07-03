import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bowmenn — Logistics Made Simple",
  description: "Connect with verified drivers, track your cargo, and manage deliveries — all from one platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased overflow-x-hidden`}>
      <body className="font-sans min-h-full flex flex-col overflow-x-hidden">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
