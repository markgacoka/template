import { query } from '.././_generated/server'

export const getPosts = query({
    handler: async (ctx) => {
        return await ctx.db.query('posts').collect()
    },
})