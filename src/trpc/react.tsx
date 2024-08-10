'use client'

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import SuperJSON from 'superjson'
import { loggerLink, unstable_httpBatchStreamLink } from '@trpc/client'
import { type AppRouter } from '@/server/api/root'

export const api = createTRPCReact<AppRouter>()

// Sets up the React Query Provider and the tRPC client for use on the frontend
export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())
    const [trpcClient] = useState(() =>
        api.createClient({
            links: [
                loggerLink({
                    enabled: (_op) => process.env.NODE_ENV === 'development',
                }),                
                unstable_httpBatchStreamLink({
                    transformer: SuperJSON,
                    url: getBaseUrl() + '/api/trpc',
                }),
            ],
        })
    )

    return (
        <QueryClientProvider client={queryClient}>
            <api.Provider client={trpcClient} queryClient={queryClient}>
                {children}
            </api.Provider>
        </QueryClientProvider>
    )
}

function getBaseUrl() {
    if (typeof window !== 'undefined') return window.location.origin
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
    return `http://localhost:${process.env.PORT ?? 3000}`
}
