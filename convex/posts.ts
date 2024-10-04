import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createPost = mutation({
    args: { 
        title: v.string(), 
        content: v.string(),
        authorId: v.id('users')
    },
    handler: async (ctx, args) => {
        const newPostId = await ctx.db.insert('posts', {
            title: args.title,
            content: args.content,
            authorId: args.authorId
        })
        return newPostId
    },
})

export const getPosts = query({
    handler: async (ctx) => {
        return await ctx.db.query('posts').collect()
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
