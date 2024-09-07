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
        <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 p-6">
            {!session ? (
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Log In</h2>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault()
                            const formData = new FormData(e.currentTarget)
                            const email = formData.get('email') as string
                            const password = formData.get('password') as string
                            const res = await signIn('credentials', { redirect: false, email, password, method: 'POST' })
                            if (res?.error) {
                                toast({
                                    title: 'Login failed!',
                                    description: 'Please check your credentials.',
                                    action: <ToastAction altText="Close">Close</ToastAction>,
                                })
                            }
                        }}
                        className="p-6 bg-slate-100 rounded-lg shadow-sm"
                    >
                        <Input type="email" name="email" placeholder="Enter email" className="mb-4 w-full p-3 border border-slate-300 rounded-md" required />
                        <Input type="password" name="password" placeholder="Enter password" className="mb-4 w-full p-3 border border-slate-300 rounded-md" required />
                        <Button type="submit" className="w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white">Sign In</Button>
                    </form>
                </div>
            ) : (
                <>
                    <header className="fixed top-0 left-0 right-0 w-full flex justify-between items-center bg-white px-12 py-4 border-b border-slate-200 shadow-sm z-10">
                        <p className="text-xl font-medium">Welcome, {session.user?.email}</p>
                        <Button onClick={async () => await signOut()} className="py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white">Sign Out</Button>
                    </header>
                    <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
                        <section className="w-full mb-6 p-6 bg-slate-100 rounded-lg shadow-sm">
                            <div className="flex items-center mb-4">
                                <h3 className="text-lg font-semibold">Create a New Post</h3>
                                <TooltipProvider><Tooltip><TooltipTrigger><FaInfoCircle className="ml-2 text-slate-500" /></TooltipTrigger><TooltipContent><p>This is where you create a new post.</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>
                            <Input type="text" placeholder="Title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} className="mb-2 w-full p-3 border border-slate-300 rounded-md" />
                            <Input type="text" placeholder="Content" value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} className="mb-4 w-full p-3 border border-slate-300 rounded-md" />
                            <Button onClick={handleCreatePost} className="w-full py-2 px-4 rounded-md bg-green-600 hover:bg-green-700 text-white">Create Post</Button>
                        </section>
                        <section className="w-full mb-6">
                            <Sheet>
                                <SheetTrigger asChild><Button variant="outline" className="w-full">View Posts</Button></SheetTrigger>
                                <SheetContent>
                                    <SheetHeader><SheetTitle>All Posts</SheetTitle></SheetHeader>
                                    <div className="mt-6">
                                        {posts?.map((post: Post) => (
                                            <div key={post.id} className="border-b border-slate-300 pb-4 mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div><h3 className="font-bold text-lg">{post.title}</h3><p>{post.content}</p></div>
                                                    <div className="flex space-x-2">
                                                        <Button onClick={() => handleEditPost(post)} variant="outline">Edit</Button>
                                                        <Button onClick={async () => await deletePost.mutateAsync(post.id)} variant="destructive">Delete</Button>
                                                    </div>
                                                </div>
                                                {editingPost === post.id && (
                                                    <div className="mt-4">
                                                        <h4 className="text-lg mb-2">Edit Post</h4>
                                                        <Input type="text" placeholder="Title" value={editPostDetails.title} onChange={(e) => setEditPostDetails({ ...editPostDetails, title: e.target.value })} className="mb-2 w-full p-3 border border-slate-300 rounded-md" />
                                                        <Input type="text" placeholder="Content" value={editPostDetails.content} onChange={(e) => setEditPostDetails({ ...editPostDetails, content: e.target.value })} className="mb-4 w-full p-3 border border-slate-300 rounded-md" />
                                                        <Button onClick={handleUpdatePost} className="w-full py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white">Update Post</Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </section>
                        <section className="w-full mb-6 grid grid-cols-1 gap-4">
                            <Dialog>
                                <DialogTrigger asChild><Button variant="outline" className="w-full">Show Info Dialog</Button></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Important Information</DialogTitle></DialogHeader>
                                    <DialogDescription>Here is some realistic and important information that is relevant to the context of this application.</DialogDescription>
                                </DialogContent>
                            </Dialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" className="w-full">Open Dropdown</Button></DropdownMenuTrigger>
                                <DropdownMenuContent className="w-full">
                                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Option 1</DropdownMenuItem>
                                    <DropdownMenuItem>Option 2</DropdownMenuItem>
                                    <DropdownMenuItem>Option 3</DropdownMenuItem>
                                    <DropdownMenuItem>Option 4</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </section>
                    </div>
                </>
            )}
            <Toaster />
        </main>
    )
};