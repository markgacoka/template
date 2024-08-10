'use client'

import { api } from '@/trpc/react'
import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

import { FaInfoCircle } from 'react-icons/fa'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Post {
    id: string
    title: string
    content: string
}

export default function Home() {
    const utils = api.useUtils()
    const { toast } = useToast()
    const { data: session, status } = useSession()
    const { data: posts, error } = api.post.getAllEntries.useQuery()
    const [newPost, setNewPost] = useState({ title: '', content: '' })
    const [editingPost, setEditingPost] = useState<string | null>(null)
    const [editPostDetails, setEditPostDetails] = useState({
        title: '',
        content: '',
    })

    const createPost = api.post.create.useMutation({
        onSuccess: () => utils.post.getAllEntries.invalidate(),
    })

    const updatePost = api.post.update.useMutation({
        onSuccess: async () => {
            await utils.post.getAllEntries.invalidate()
            setEditingPost(null)
            toast({
                title: 'Post updated!',
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
        },
    })

    const deletePost = api.post.delete.useMutation({
        onSuccess: async () => {
            await utils.post.getAllEntries.invalidate()
            if (editingPost) {
                setEditingPost(null)
            }
        },
    })

    if (status === 'loading') return null
    if (error) return <div>Error loading posts</div>

    const handleCreatePost = async () => {
        await createPost.mutateAsync(newPost)
        setNewPost({ title: '', content: '' })
        toast({
            title: 'Post created!',
            description: 'Your new post has been successfully created.',
            action: (
                <ToastAction altText="Close" className="mt-2">
                    Close
                </ToastAction>
            ),
        })
    }

    const handleEditPost = (post: Post) => {
        setEditingPost(post.id)
        setEditPostDetails({ title: post.title, content: post.content })
    }

    const handleUpdatePost = async () => {
        if (editingPost) {
            await updatePost.mutateAsync({
                id: editingPost,
                ...editPostDetails,
            })
            toast({
                title: 'Post updated!',
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 p-4">
            <div className="flex flex-col items-center gap-4 w-full max-w-lg">
                {!session ? (
                    <div className="w-full">
                        <h2 className="text-2xl mb-4 text-center">Log In</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault()
                                const formData = new FormData(e.currentTarget)
                                const email = formData.get('email') as string
                                const password = formData.get(
                                    'password'
                                ) as string
                                const res = await signIn('credentials', {
                                    redirect: false,
                                    email,
                                    password,
                                    method: 'POST',
                                })
                                if (res?.error) {
                                    toast({
                                        title: 'Login failed!',
                                        description:
                                            'Please check your credentials.',
                                        action: (
                                            <ToastAction altText="Close">
                                                Close
                                            </ToastAction>
                                        ),
                                    })
                                }
                            }}
                        >
                            <Input
                                type="email"
                                name="email"
                                placeholder="Enter email"
                                className="mb-4 w-full p-3"
                                required
                            />
                            <Input
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                className="mb-4 w-full p-3"
                                required
                            />
                            <Button type="submit" className="w-full">
                                Sign In
                            </Button>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="w-full text-center">
                            <p className="text-2xl">
                                Logged in as {session.user?.email}
                            </p>
                            <Button
                                onClick={async () => await signOut()}
                                className="mt-4 w-full"
                                variant="destructive"
                            >
                                Sign Out
                            </Button>
                        </div>
                        <div className="w-full mt-6">
                            <div className="flex items-center">
                                <h3 className="text-xl">Create a New Post</h3>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <FaInfoCircle className="ml-2 text-sm" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                This is where you create a new
                                                post.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Input
                                type="text"
                                placeholder="Title"
                                value={newPost.title}
                                onChange={(e) =>
                                    setNewPost({
                                        ...newPost,
                                        title: e.target.value,
                                    })
                                }
                                className="mb-2 w-full"
                            />
                            <Input
                                type="text"
                                placeholder="Content"
                                value={newPost.content}
                                onChange={(e) =>
                                    setNewPost({
                                        ...newPost,
                                        content: e.target.value,
                                    })
                                }
                                className="mb-4 w-full"
                            />
                            <Button
                                onClick={handleCreatePost}
                                className="w-full"
                                variant="default"
                            >
                                Create Post
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 mt-6">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        View Posts
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>All Posts</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6">
                                        {posts?.map((post: Post) => (
                                            <div
                                                key={post.id}
                                                className="border-b border-slate-300 pb-4 mb-4"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg">
                                                            {post.title}
                                                        </h3>
                                                        <p>{post.content}</p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            onClick={() =>
                                                                handleEditPost(
                                                                    post
                                                                )
                                                            }
                                                            variant="outline"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            onClick={async () =>
                                                                await deletePost.mutateAsync(
                                                                    post.id
                                                                )
                                                            }
                                                            variant="destructive"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                                {editingPost === post.id && (
                                                    <div className="mt-4">
                                                        <h4 className="text-lg mb-2">
                                                            Edit Post
                                                        </h4>
                                                        <Input
                                                            type="text"
                                                            placeholder="Title"
                                                            value={
                                                                editPostDetails.title
                                                            }
                                                            onChange={(e) =>
                                                                setEditPostDetails(
                                                                    {
                                                                        ...editPostDetails,
                                                                        title: e
                                                                            .target
                                                                            .value,
                                                                    }
                                                                )
                                                            }
                                                            className="mb-2 w-full"
                                                        />
                                                        <Input
                                                            type="text"
                                                            placeholder="Content"
                                                            value={
                                                                editPostDetails.content
                                                            }
                                                            onChange={(e) =>
                                                                setEditPostDetails(
                                                                    {
                                                                        ...editPostDetails,
                                                                        content:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }
                                                                )
                                                            }
                                                            className="mb-4 w-full"
                                                        />
                                                        <Button
                                                            onClick={
                                                                handleUpdatePost
                                                            }
                                                            className="w-full"
                                                        >
                                                            Update Post
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Show Info Dialog
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Important Information
                                        </DialogTitle>
                                    </DialogHeader>
                                    <DialogDescription>
                                        Here is some realistic and important
                                        information that is relevant to the
                                        context of this application.
                                    </DialogDescription>
                                </DialogContent>
                            </Dialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Open Dropdown
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-full">
                                    <DropdownMenuLabel>
                                        Options
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        Option 1
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Option 2
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Option 3
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Option 4
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </>
                )}
            </div>
            <Toaster />
        </main>
    )
}
