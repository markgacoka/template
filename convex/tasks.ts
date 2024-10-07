import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const createTask = mutation({
    args: { vin: v.string(), userId: v.id('users') },
    handler: async (ctx, args) => {
        const taskId = await ctx.db.insert('tasks', {
            vin: args.vin,
            status: 'pending',
            progress: 0,
            result: '',
            processedChars: new Array(args.vin.length).fill(''),
            lastProcessedIndex: -1,
            timeTaken: 0,
            userId: args.userId,
        })
        return { taskId }
    },
})

export const updateTaskProgress = mutation({
    args: { 
        taskId: v.id('tasks'), 
        progress: v.number(), 
        charIndex: v.number(), 
        processedChar: v.string(),
        timeTaken: v.number(),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId)
        if (!task) throw new Error('Task not found')

        const lastProcessedIndex = task.lastProcessedIndex ?? -1
        if (args.charIndex !== lastProcessedIndex + 1) {
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
    args: { taskId: v.id('tasks'), result: v.string(), timeTaken: v.number() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.taskId, { 
            status: 'completed', 
            progress: 100, 
            result: args.result,
            timeTaken: args.timeTaken
        })
    },
})

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
            lastProcessedIndex: task.lastProcessedIndex ?? -1,
        }
    },
})

export const getPendingTasks = query({
    handler: async (ctx) => {
        return await ctx.db
            .query('tasks')
            .filter((q) => q.eq(q.field('status'), 'pending'))
            .collect()
    },
})

export const getAllTasks = query({
    args: { userId: v.id('users') },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('tasks')
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .collect()
    },
})

export const deleteTask = mutation({
    args: { taskId: v.id('tasks') },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.taskId)
    },
})
