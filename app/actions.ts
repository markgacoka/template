'use server'

import { api } from '../convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function createTaskServerAction(vin: string) {
    const { taskId } = await convex.mutation(api.mutations.tasks.createTask, { vin })
    // We'll handle the job processing on the client side to avoid BullMQ issues
    return taskId
}