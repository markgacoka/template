import { v } from "convex/values";
import { Id } from '../_generated/dataModel';
import * as jose from 'jose';
import { query } from "../_generated/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export const getUser = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    try {
      const { payload } = await jose.jwtVerify(args.token, JWT_SECRET);
      const userId = payload.userId as Id<'users'>;
      const user = await ctx.db.get(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return { userId: user._id, email: user.email, name: user.name };
    } catch (error) {
      throw new Error('Invalid token');
    }
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query('users').withIndex('by_email', (q) => q.eq('email', args.email)).unique();
    return user;
  },
});

