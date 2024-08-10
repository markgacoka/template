import bcrypt from 'bcryptjs'
import { db } from '@/server/db'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession, type DefaultSession, type NextAuthOptions } from 'next-auth'
import { addDays } from 'date-fns'

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

                if (user?.hashedPassword) {
                    const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
                    if (isValid) {
                        return { id: user.id, email: user.email }
                    }
                }                
                return null
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 60 * 60 * 24, // 24 hours
        updateAge: 15 * 60, // 15 minutes
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
        maxAge: 15 * 60, // 15 minutes
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token }) {
            const now = new Date()
            const issuedAt = (token.iat as number) * 1000
            const tokenExpirationDate = addDays(new Date(issuedAt), 1)
        
            if (now > tokenExpirationDate) {
                return {} as DefaultSession
            }
        
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
