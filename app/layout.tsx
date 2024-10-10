"use client";

import "@/app/globals.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from 'next-themes';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class">
          <ConvexProvider client={convex}>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ConvexProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
