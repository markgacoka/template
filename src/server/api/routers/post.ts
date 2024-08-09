import { z } from 'zod'
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const postRouter = createTRPCRouter({
    getAllEntries: publicProcedure.query(async () => {
        return prisma.post.findMany()
    }),
    getById: publicProcedure.input(z.string()).query(async ({ input }) => {
        return prisma.post.findUnique({
            where: { id: input },
        })
    }),
    create: publicProcedure
        .input(
            z.object({
                title: z.string(),
                content: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const { title, content } = input
            return prisma.post.create({
                data: { title, content },
            })
        }),
    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                title: z.string(),
                content: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const { id, title, content } = input
            return prisma.post.update({
                where: { id },
                data: { title, content },
            })
        }),
    delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        return prisma.post.delete({
            where: { id: input },
        })
    }),
})
