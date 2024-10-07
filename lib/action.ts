'use server'

import { api } from '@/convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'
import { Id } from "@/convex/_generated/dataModel"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function createTaskServerAction(vin: string, userId: Id<"users">) {
    const { taskId } = await convex.mutation(api.tasks.createTask, {
        vin,
        userId
    })
    return taskId
}