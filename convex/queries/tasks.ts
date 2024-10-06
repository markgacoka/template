import { query } from '@/convex/_generated/server'
import { v } from 'convex/values'

export const getTaskProgress = query({
    args: { taskId: v.id('tasks') },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId)
        if (!task) throw new Error('Task not found')
        return {
            progress: task.progress,
            processedChars: task.processedChars,
            result: task.result,
            status: task.status,
            vin: task.vin,
            lastProcessedIndex: task.lastProcessedIndex ?? -1, // Add this line
        }
    },
})

export const getPendingTasks = query({
    handler: async (ctx) => {
        return await ctx.db
            .query('tasks')
            .filter(q => q.eq(q.field('status'), 'pending'))
            .collect()
    },
})