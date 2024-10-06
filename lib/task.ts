import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api'
import { useEffect, useCallback } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Id } from '../convex/_generated/dataModel'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

let vinQueue: any
let Worker: any

if (typeof window === 'undefined') {
    const { Queue, Worker } = require('bullmq')
    const Redis = require('ioredis')

    const redis = new Redis(process.env.NEXT_PUBLIC_REDIS_URL!, {
        maxRetriesPerRequest: null
    })

    vinQueue = new Queue('vin-processing', { 
        connection: redis,
        defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: true,
        }
    })

    new Worker('vin-processing', async (job: any) => {
        const { taskId, vin } = job.data

        for (let i = 0; i < vin.length; i++) {
            // Simulate processing each character
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            await convex.mutation(api.tasks.updateTaskProgress, {
                taskId,
                progress: ((i + 1) / vin.length) * 100,
                charIndex: i,
                processedChar: vin[i].toUpperCase(),
            })

            await job.updateProgress(((i + 1) / vin.length) * 100)
        }

        await convex.mutation(api.tasks.completeTask, {
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

export function taskProcessor(taskId: Id<'tasks'> | null) {
    const updateTaskProgress = useMutation(api.tasks.updateTaskProgress)
    const completeTask = useMutation(api.tasks.completeTask)
    const task = useQuery(api.tasks.getTaskProgress, taskId ? { taskId } : 'skip')

    const processTask = useCallback(async () => {
        if (!taskId || !task || !task.vin) return

        const vin = task.vin
        for (let i = 0; i < vin.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            await updateTaskProgress({
                taskId,
                progress: ((i + 1) / vin.length) * 100,
                charIndex: i,
                processedChar: vin[i].toUpperCase(),
            })
        }

        await completeTask({
            taskId,
            result: `Processed VIN: ${vin.toUpperCase()}`,
        })
    }, [taskId, task, updateTaskProgress, completeTask])

    useEffect(() => {
        if (taskId && task && task.status === 'pending') {
            processTask()
        }
    }, [taskId, task, processTask])

    return { task }
}