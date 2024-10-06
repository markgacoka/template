import { query, mutation } from "@/convex/_generated/server";
import { v } from "convex/values";
import { Id } from "@/convex/_generated/dataModel";

export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();
    },
});

export const getUserById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

export const insertUser = mutation({
    args: { email: v.string(), passwordHash: v.string(), name: v.optional(v.string()) },
    handler: async (ctx, args): Promise<Id<"users">> => {
        return await ctx.db.insert("users", {
            email: args.email,
            passwordHash: args.passwordHash,
            name: args.name,
        });
    },
});