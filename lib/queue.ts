import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

let vinQueue: any
let Worker: any

if (typeof window === 'undefined') {
    const { Queue, Worker } = require('bullmq')
    const Redis = require('ioredis')

    const redis = new Redis(process.env.NEXT_PUBLIC_REDIS_URL!)

    vinQueue = new Queue('vin-processing', { connection: redis })

    new Worker('vin-processing', async (job: any) => {
        const { taskId, vin } = job.data

        for (let i = 0; i < vin.length; i++) {
            // Simulate processing each character
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            await convex.mutation(api.mutations.tasks.updateTaskProgress, {
                taskId,
                progress: ((i + 1) / vin.length) * 100,
                charIndex: i,
                processedChar: vin[i].toUpperCase(),
            })

            await job.updateProgress(((i + 1) / vin.length) * 100)
        }

        await convex.mutation(api.mutations.tasks.completeTask, {
            taskId,
            result: `Processed VIN: ${vin.toUpperCase()}`,
        })
    }, { connection: redis })
}

export async function addVinJob(taskId: string, vin: string) {
    if (typeof window === 'undefined') {
        await vinQueue.add('process-vin', { taskId, vin })
    } else {
        console.error('addVinJob can only be called on the server side')
    }
}