'use client'

import '@/styles/globals.css'
import { TRPCReactProvider } from '@/trpc/react'
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body>
                <SessionProvider>
                    <TRPCReactProvider>
                        {children}
                    </TRPCReactProvider>
                </SessionProvider>
            </body>
        </html>
    )
}
