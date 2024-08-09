import Link from 'next/link'
import { api } from '@/trpc/server'
import { getServerAuthSession } from '@/server/auth'

export default async function Home() {
    const session = await getServerAuthSession()
    const posts = await api.post.getAllEntries()

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <div className="flex flex-col items-center gap-2">
                <ul>
                    {posts?.map((post: any) => (
                        <li key={post.id}>{post.title}</li>
                    ))}
                </ul>

                <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-center text-2xl text-white">
                        {session && (
                            <span>Logged in as {session.user?.name}</span>
                        )}
                    </p>
                    <Link
                        href={
                            session ? '/api/auth/signout' : '/api/auth/signin'
                        }
                        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                    >
                        {session ? 'Sign out' : 'Sign in'}
                    </Link>
                </div>
            </div>
        </main>
    )
}
