import bcrypt from 'bcryptjs'
import { db } from '@/server/db'
import CredentialsProvider from 'next-auth/providers/credentials'
import {
    getServerSession,
    type DefaultSession,
    type NextAuthOptions,
} from 'next-auth'

declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string
        } & DefaultSession['user']
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials.password) return null

                const user = await db.user.findUnique({
                    where: { email: credentials.email },
                })

                if (user && user.hashedPassword) {
                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user.hashedPassword
                    )
                    console.log('Password is valid:', isValid)
                    return { id: user.id, email: user.email }
                }
                return null
            },
        }),
    ],
    session: { strategy: 'jwt' },
    jwt: { secret: process.env.NEXTAUTH_SECRET },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token }) {
            if (token?.sub) {
                session.user = { id: token.sub, email: token.email }
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
    },
}

export const getServerAuthSession = () => getServerSession(authOptions)
