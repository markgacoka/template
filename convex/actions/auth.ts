"use node"

import bcrypt from "bcryptjs";
import * as jose from 'jose';
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { Id } from '../_generated/dataModel';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export const signUpAction = action({
    args: { email: v.string(), password: v.string(), name: v.optional(v.string()) },
    handler: async (ctx, args): Promise<{ token: string; userId: string; name?: string }> => {
        const passwordHash = await bcrypt.hash(args.password, 10)
        const userId = await ctx.runMutation(api.mutations.auth.createUser, {
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
    handler: async (ctx, args): Promise<{ token: string; userId: string; name?: string }> => {
        const user = await ctx.runQuery(api.queries.auth.getUserByEmail, { email: args.email });

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
