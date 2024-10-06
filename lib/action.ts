'use server'

import { api } from '@/convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function createTaskServerAction(vin: string) {
    const { taskId } = await convex.mutation(api.tasks.createTask, { vin })
    return taskId
}