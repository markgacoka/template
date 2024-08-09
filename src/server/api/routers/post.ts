import { z } from 'zod'
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'

export const postRouter = createTRPCRouter({
    getAllEntries: publicProcedure.query(({ ctx }) => {
        return ctx.db.post.findMany()
    }),
    getById: publicProcedure.input(z.string()).query(({ ctx, input }) => {
        return ctx.db.post.findUnique({ where: { id: input } })
    }),
    create: protectedProcedure
        .input(z.object({ title: z.string(), content: z.string() }))
        .mutation(({ ctx, input }) => {
            return ctx.db.post.create({
                data: {
                    title: input.title,
                    content: input.content,
                    userId: ctx.session.user.id,
                },
            })
        }),
    update: protectedProcedure
        .input(
            z.object({ id: z.string(), title: z.string(), content: z.string() })
        )
        .mutation(({ ctx, input }) => {
            return ctx.db.post.update({
                where: { id: input.id },
                data: { title: input.title, content: input.content },
            })
        }),
    delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
        return ctx.db.post.delete({ where: { id: input } })
    }),
})
