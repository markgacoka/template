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
  tasks: defineTable({
    vin: v.string(),
    status: v.string(),
    progress: v.number(),
    result: v.string(),
    processedChars: v.array(v.string()),
    lastProcessedIndex: v.number(),
    timeTaken: v.number(),
  }),
});