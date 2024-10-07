import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const createPost = mutation({
    args: { title: v.string(), content: v.string(), userId: v.id('users') },
    handler: async (ctx, args) => {
        const postId = await ctx.db.insert('posts', {
            title: args.title,
            content: args.content,
            userId: args.userId,
        })
        return postId
    },
})

export const getPosts = query({
    args: { userId: v.id('users') },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('posts')
            .filter((q) => q.eq(q.field('userId'), args.userId))
            .collect()
    },
})

export const updatePost = mutation({
    args: { id: v.id('posts'), title: v.string(), content: v.string() },
    handler: async (ctx, args) => {
        const { id, ...updateData } = args
        await ctx.db.patch(id, updateData)
    },
})

export const deletePost = mutation({
    args: { id: v.id('posts') },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id)
    },
})
