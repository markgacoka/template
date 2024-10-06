"use node"

import bcrypt from "bcryptjs";
import * as jose from 'jose';
import { v } from "convex/values";
import { api } from "@/convex/_generated/api";
import { action, ActionCtx } from "@/convex/_generated/server";
import { Id } from "@/convex/_generated/dataModel";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export const signUpAction = action({
    args: { email: v.string(), password: v.string(), name: v.optional(v.string()) },
    handler: async (ctx: ActionCtx, args): Promise<{ token: string; userId: string; name?: string }> => {
        const passwordHash = await bcrypt.hash(args.password, 10)
        const userId = await ctx.runMutation(api.users.insertUser, {
            email: args.email,
            passwordHash,
            name: args.name,
        });

        const token = await new jose.SignJWT({ userId })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1d')
            .sign(JWT_SECRET);

        return { token, userId, name: args.name };
    },
});

export const signInAction = action({
    args: { email: v.string(), password: v.string() },
    handler: async (ctx: ActionCtx, args): Promise<{ token: string; userId: string; name?: string }> => {
        const user = await ctx.runQuery(api.users.getUserByEmail, { email: args.email });

        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(args.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }

        const token = await new jose.SignJWT({ userId: user._id })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1d')
            .sign(JWT_SECRET);

        return { token, userId: user._id, name: user.name };
    },
});

export const createUser = action({
    args: { email: v.string(), passwordHash: v.string(), name: v.optional(v.string()) },
    handler: async (ctx: ActionCtx, args): Promise<Id<"users">> => {
        const existingUser = await ctx.runQuery(api.users.getUserByEmail, { email: args.email });

        if (existingUser) {
            throw new Error("User already exists");
        }

        const userId = await ctx.runMutation(api.users.insertUser, {
            email: args.email,
            passwordHash: args.passwordHash,
            name: args.name,
        });

        return userId;
    },
});

export const signIn = action({
    args: { email: v.string(), password: v.string() },
    handler: async (ctx: ActionCtx, args): Promise<{ token: string; userId: Id<"users">; email: string; name?: string }> => {
        const user = await ctx.runQuery(api.users.getUserByEmail, { email: args.email });

        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(args.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }

        const token = await new jose.SignJWT({ userId: user._id })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('2h')
            .sign(JWT_SECRET);

        return { token, userId: user._id, email: user.email, name: user.name };
    },
});

export const refreshToken = action({
    args: { token: v.string() },
    handler: async (ctx: ActionCtx, args): Promise<string> => {
        try {
            const { payload } = await jose.jwtVerify(args.token, JWT_SECRET);
            const userId = payload.userId as Id<'users'>;
            const user = await ctx.runQuery(api.users.getUserById, { userId });
            if (!user) {
                throw new Error('User not found');
            }
            const newToken = await new jose.SignJWT({ userId: user._id })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('1h')
                .sign(JWT_SECRET);
            return newToken;
        } catch (error) {
            throw new Error('Invalid token');
        }
    },
});

export const verifyToken = action({
    args: { token: v.string() },
    handler: async (ctx: ActionCtx, args): Promise<{ userId: Id<"users">; email: string; name?: string }> => {
        try {
            const { payload } = await jose.jwtVerify(args.token, JWT_SECRET);
            const userId = payload.userId as Id<'users'>;
            const user = await ctx.runQuery(api.users.getUserById, { userId });
            if (!user) {
                throw new Error('User not found');
            }
            return { userId: user._id, email: user.email, name: user.name };
        } catch (error) {
            throw new Error('Invalid token');
        }
    },
});

