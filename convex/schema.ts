import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        passwordHash: v.string(),
        name: v.optional(v.string()),
    }).index('by_email', ['email']),
    posts: defineTable({
        title: v.string(),
        content: v.string(),
        authorId: v.id('users'),
    }),
});
