"use client"

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TabsContent from '@/components/TabsContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { FaInfoCircle } from 'react-icons/fa';
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

import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

interface Post {
    id: string
    _id: Id<"posts">
    _creationTime: number
    title: string
    content: string
    authorId: Id<"users">
}

export default function Home() {
	const { user, login, register, logout } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [isSignUp, setIsSignUp] = useState(false);
    const { toast } = useToast()
    const posts = useQuery(api.posts.getPosts)
    const [newPost, setNewPost] = useState({ title: '', content: '' })
    const [editingPost, setEditingPost] = useState<Id<'posts'> | null>(null)
    const [editPostDetails, setEditPostDetails] = useState({
        title: '',
        content: '',
    })

    const createPost = useMutation(api.posts.createPost);
    const updatePost = useMutation(api.posts.updatePost);
    const deletePost = useMutation(api.posts.deletePost);

    if (!posts) return <div>Loading posts...</div>

    const handleCreatePost = async () => {
        if (!user?.userId) {
            toast({
                title: 'Error',
                description: 'You must be logged in to create a post.',
                variant: 'destructive',
            })
            return
        }

        try {
            await createPost({
                title: newPost.title,
                content: newPost.content,
                authorId: user.userId as Id<'users'>
            })
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
        } catch (error) {
            console.error('Error creating post:', error)
            toast({
                title: 'Error creating post',
                description: 'Please try again later.',
                variant: 'destructive',
            })
        }
    }

    const handleUpdatePost = async () => {
        if (editingPost) {
            try {
                await updatePost({ id: editingPost, ...editPostDetails });
                toast({
                    title: 'Post updated!',
                    action: <ToastAction altText="Close">Close</ToastAction>,
                });
                setEditingPost(null);
            } catch (error) {
                console.error('Error updating post:', error);
                toast({
                    title: 'Error updating post',
                    description: 'Please try again later.',
                    variant: 'destructive',
                });
            }
        }
    }

    const handleDeletePost = async (postId: Id<'posts'>) => {
        try {
            await deletePost({ id: postId });
            if (editingPost === postId) {
                setEditingPost(null);
            }
            toast({
                title: 'Post deleted!',
                description: 'Your post has been successfully deleted.',
                action: (
                    <ToastAction altText="Close" className="mt-2">
                        Close
                    </ToastAction>
                ),
            });
        } catch (error) {
            console.error('Error deleting post:', error);
            toast({
                title: 'Error deleting post',
                description: 'Please try again later.',
                variant: 'destructive',
            });
        }
    }
    const handleEditPost = (post: Post) => {
        setEditingPost(post._id as Id<'posts'>)
        setEditPostDetails({ title: post.title, content: post.content })
    }

    const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (isSignUp) {
				await register(email, password, name);
			} else {
				await login(email, password);
			}
			toast({
				title: isSignUp ? "Sign up successful" : "Sign in successful",
				description: `Welcome${name ? `, ${name}` : ''}!`,
			});
		} catch (error) {
			toast({
				title: "Error",
				description: (error as Error).message,
				variant: "destructive",
			});
		}
	};

	if (!user) {
		return (
			<div className="container mx-auto p-4 bg-background">
				<h1 className="text-2xl font-bold mb-4">{isSignUp ? "Sign Up" : "Sign In"}</h1>
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        Log In
                    </h2>
                    <form onSubmit={handleAuth} className="p-6 bg-slate-100 rounded-lg shadow-sm">
                        <Input
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mb-4 w-full p-3 border border-slate-300 rounded-md"
                            required
                        />
                        <Input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mb-4 w-full p-3 border border-slate-300 rounded-md"
                            required
                        />
                        {isSignUp && (
                            <Input
                                type="text"
                                name="name"
                                placeholder="Enter name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mb-4 w-full p-3 border border-slate-300 rounded-md"
                                required
                            />
                        )}
                        <Button
                            type="submit"
                            className="w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </Button>
                    </form>
                </div>
				<Button
					variant="link"
					onClick={() => setIsSignUp(!isSignUp)}
					className="mt-4"
				>
					{isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
				</Button>
                <Toaster />
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Welcome, {user.name || user.email}!</h1>
				<Button onClick={logout}>Sign Out</Button>
			</div>
            <>
                    <header className="fixed top-0 left-0 right-0 w-full flex justify-between items-center bg-white px-12 py-4 border-b border-slate-200 shadow-sm z-10">
                        <p className="text-xl font-medium">
                            Welcome, {user.email}
                        </p>
                        <Button
                            onClick={logout}
                            className="py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white"
                        >
                            Sign Out
                        </Button>
                    </header>
                    <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
                        <section className="w-full mb-6 p-6 bg-slate-100 rounded-lg shadow-sm">
                            <div className="flex items-center mb-4">
                                <h3 className="text-lg font-semibold">
                                    Create a New Post
                                </h3>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <FaInfoCircle className="ml-2 text-slate-500" />
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
                                className="mb-2 w-full p-3 border border-slate-300 rounded-md"
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
                                className="mb-4 w-full p-3 border border-slate-300 rounded-md"
                            />
                            <Button
                                onClick={handleCreatePost}
                                className="w-full py-2 px-4 rounded-md bg-green-600 hover:bg-green-700 text-white"
                            >
                                Create Post
                            </Button>
                        </section>
                        <section className="w-full mb-6">
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
                                        {posts.map((post) => (
                                            <div
                                                key={post._id}
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
                                                                handleEditPost({
                                                                    id: post._id,
                                                                    ...post
                                                                })
                                                            }
                                                            variant="outline"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            onClick={() =>
                                                                handleDeletePost(
                                                                    post._id
                                                                )
                                                            }
                                                            variant="destructive"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                                {editingPost === post._id && (
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
                                                            className="mb-2 w-full p-3 border border-slate-300 rounded-md"
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
                                                            className="mb-4 w-full p-3 border border-slate-300 rounded-md"
                                                        />
                                                        <Button
                                                            onClick={
                                                                handleUpdatePost
                                                            }
                                                            className="w-full py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
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
                        </section>
                        <section className="w-full mb-6 grid grid-cols-1 gap-4">
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
                        </section>
                    </div>
                </>
			<TabsContent />
            <Toaster />
		</div>
        
	);
}