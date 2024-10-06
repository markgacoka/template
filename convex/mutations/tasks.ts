import { mutation } from '@/convex/_generated/server'
import { v } from 'convex/values'

export const createTask = mutation({
    args: { vin: v.string() },
    handler: async (ctx, args) => {
        const taskId = await ctx.db.insert('tasks', {
            vin: args.vin,
            status: 'pending',
            progress: 0,
            result: '',
            processedChars: new Array(args.vin.length).fill(''),
            lastProcessedIndex: -1,
        })
        return { taskId }
    },
})

export const updateTaskProgress = mutation({
    args: { 
        taskId: v.id('tasks'), 
        progress: v.number(), 
        charIndex: v.number(), 
        processedChar: v.string() 
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId)
        if (!task) throw new Error('Task not found')

        const lastProcessedIndex = task.lastProcessedIndex ?? -1
        if (args.charIndex !== lastProcessedIndex + 1) {
            // Skip this update if it's not the next expected index
            return
        }

        const processedChars = [...task.processedChars]
        processedChars[args.charIndex] = args.processedChar

        await ctx.db.patch(args.taskId, {
            progress: args.progress,
            processedChars,
            lastProcessedIndex: args.charIndex,
        })
    },
})

export const completeTask = mutation({
    args: { taskId: v.id('tasks'), result: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.taskId, { 
            status: 'completed', 
            progress: 100, 
            result: args.result 
        })
    },
})
