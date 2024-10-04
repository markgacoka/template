import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from '../_generated/dataModel';
import bcrypt from "bcryptjs";
import * as jose from 'jose';
import { signInAction } from "../actions/auth";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export const createUser = mutation({
  args: { email: v.string(), passwordHash: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      throw new Error("User already exists");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: args.passwordHash,
      name: args.name,
    });

    return userId;
  },
});

export const signIn = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

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

export const verifyToken = mutation({
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