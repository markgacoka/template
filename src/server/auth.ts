import {
    getServerSession,
    type DefaultSession,
    type NextAuthOptions,
} from 'next-auth'
import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string
        } & DefaultSession['user']
    }
}

const PASSWORD_HASH = await bcrypt.hash('1234', 10)

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (credentials) => {
                if (!credentials || !credentials.password) {
                    return null
                }

                const user = await db.user.findUnique({
                    where: { email: credentials.email },
                })

                if (!user) {
                    return null
                }

                const isValid = await bcrypt.compare(
                    credentials.password,
                    PASSWORD_HASH
                )

                if (!isValid) {
                    return null
                }

                return { id: user.id, name: user.name, email: user.email }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token }) {
            if (token?.sub) {
                const user = await db.user.findUnique({
                    where: { id: token.sub },
                })
                if (user) {
                    session.user = {
                        ...session.user,
                        id: user.id,
                    }
                }
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
