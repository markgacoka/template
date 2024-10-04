"use client";

import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexProvider client={convex}>
          <AuthProvider>
            <ThemeProvider attribute="light">{children}</ThemeProvider>
          </AuthProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
