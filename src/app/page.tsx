'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { api } from '@/trpc/react'

interface Post {
    id: string
    title: string
    content: string
}

export default function Home() {
    const { data: session } = useSession()
    const { data: posts, isLoading, error } = api.post.getAllEntries.useQuery()
    const [newPost, setNewPost] = useState({ title: '', content: '' })
    const [editingPost, setEditingPost] = useState<string | null>(null)
    const [editPostDetails, setEditPostDetails] = useState({
        title: '',
        content: '',
    })

    const utils = api.useUtils()
    const createPost = api.post.create.useMutation({
        onSuccess: () => utils.post.getAllEntries.invalidate(),
    })

    const updatePost = api.post.update.useMutation({
        onSuccess: () => {
            utils.post.getAllEntries.invalidate()
            setEditingPost(null)
        },
    })

    const deletePost = api.post.delete.useMutation({
        onSuccess: () => {
            utils.post.getAllEntries.invalidate()
            if (editingPost) {
                setEditingPost(null)
            }
        },
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error loading posts</div>

    const handleCreatePost = () => {
        createPost.mutate(newPost)
        setNewPost({ title: '', content: '' })
    }

    const handleEditPost = (post: Post) => {
        setEditingPost(post.id)
        setEditPostDetails({ title: post.title, content: post.content })
    }

    const handleUpdatePost = () => {
        if (editingPost) {
            updatePost.mutate({ id: editingPost, ...editPostDetails })
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white p-4">
            <div className="flex flex-col items-center gap-4 w-full max-w-xl">
                {!session ? (
                    <div>
                        <h2 className="text-xl">Log In</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                const formData = new FormData(e.currentTarget)
                                const email = formData.get('email')
                                const password = formData.get('password')
                                signIn('credentials', { redirect: false, email, password })
                            }}
                        >
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter email"
                                className="mb-4 w-full p-2 text-black"
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                className="mb-4 w-full p-2 text-black"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full rounded bg-blue-500 px-4 py-2 text-white"
                            >
                                Sign In
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="w-full text-center">
                            <p className="text-2xl">
                                Logged in as {session.user?.email}
                            </p>
                            <button
                                onClick={() => signOut()}
                                className="mt-4 rounded bg-red-500 px-4 py-2 text-white"
                            >
                                Sign Out
                            </button>
                        </div>
                        <ul className="mt-6 w-full">
                            {posts?.map((post: Post) => (
                                <li
                                    key={post.id}
                                    className="border-b border-white pb-4"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg">
                                                {post.title}
                                            </h3>
                                            <p>{post.content}</p>
                                        </div>
                                        {session && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleEditPost(post)
                                                    }
                                                    className="rounded bg-yellow-500 px-4 py-2 text-white"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deletePost.mutate(
                                                            post.id
                                                        )
                                                    }
                                                    className="rounded bg-red-500 px-4 py-2 text-white"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {session && !editingPost && (
                    <div className="mt-6 w-full">
                        <h3 className="text-xl">Create a New Post</h3>
                        <input
                            type="text"
                            placeholder="Title"
                            value={newPost.title}
                            onChange={(e) =>
                                setNewPost({
                                    ...newPost,
                                    title: e.target.value,
                                })
                            }
                            className="mb-2 w-full p-2 text-black"
                        />
                        <input
                            type="text"
                            placeholder="Content"
                            value={newPost.content}
                            onChange={(e) =>
                                setNewPost({
                                    ...newPost,
                                    content: e.target.value,
                                })
                            }
                            className="mb-4 w-full p-2 text-black"
                        />
                        <button
                            onClick={handleCreatePost}
                            className="w-full rounded bg-green-500 px-4 py-2 text-white"
                        >
                            Create Post
                        </button>
                    </div>
                )}

                {session && editingPost && (
                    <div className="mt-6 w-full">
                        <h3 className="text-xl">Edit Post</h3>
                        <input
                            type="text"
                            placeholder="Title"
                            value={editPostDetails.title}
                            onChange={(e) =>
                                setEditPostDetails({
                                    ...editPostDetails,
                                    title: e.target.value,
                                })
                            }
                            className="mb-2 w-full p-2 text-black"
                        />
                        <input
                            type="text"
                            placeholder="Content"
                            value={editPostDetails.content}
                            onChange={(e) =>
                                setEditPostDetails({
                                    ...editPostDetails,
                                    content: e.target.value,
                                })
                            }
                            className="mb-4 w-full p-2 text-black"
                        />
                        <button
                            onClick={handleUpdatePost}
                            className="w-full rounded bg-blue-500 px-4 py-2 text-white"
                        >
                            Update Post
                        </button>
                    </div>
                )}
            </div>
        </main>
    )
}
