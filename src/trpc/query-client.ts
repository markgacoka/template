import { QueryClient } from '@tanstack/react-query'
import SuperJSON from 'superjson'

// Handles data fetching (with serialization), caching, and synchronization between the client <> server
export const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { staleTime: 30 * 1000 },
            dehydrate: { serializeData: SuperJSON.serialize },
            hydrate: { deserializeData: SuperJSON.deserialize },
        },
    })
