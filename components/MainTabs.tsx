import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Id } from '../convex/_generated/dataModel'
import { useToast } from '@/components/ui/use-toast'
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
import { ToastAction } from './ui/toast'
import { User } from '@/components/interfaces/user'
import { useRouter } from 'next/navigation'
import { createTaskServerAction } from '../app/actions'
import { useTaskProcessor } from '../app/useTaskProcessor'

const tabs = [
    { name: 'Create Post', href: '#', current: true },
    { name: 'View Posts', href: '#', current: false },
    { name: 'Actions', href: '#', current: false },
    { name: 'Media', href: '#', current: false },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export function MainTabs(user: User) {
    const [activeTab, setActiveTab] = useState('Create Post')
    const [newPost, setNewPost] = useState({ title: '', content: '' })
    const [vin, setVin] = useState('')
    const [taskId, setTaskId] = useState<Id<'tasks'> | null>(null)
    const { toast } = useToast()
    const router = useRouter()

    const posts = useQuery(api.queries.posts.getPosts)
    const createPost = useMutation(api.mutations.posts.createPost)
    const taskProgress = useQuery(api.queries.tasks.getTaskProgress, taskId ? { taskId } : 'skip')

    useTaskProcessor(taskId)

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
            toast({
                 title: 'Error creating post',
                description: 'Please try again later.',
                variant: 'destructive',
            })
        }
    } 

    const handleCreateTask = async () => {
        try {
            const newTaskId = await createTaskServerAction(vin)
            setTaskId(newTaskId as Id<'tasks'>)
            toast({ title: 'Task created', description: 'Your VIN processing task has been created.' })
            router.refresh()
        } catch (error) {
            console.error('Error creating task:', error)
            toast({ title: 'Error creating task', description: 'Please try again later.', variant: 'destructive' })
        }
    }

    return (
        <div>
            <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                    Select a tab
                </label>
                <select
                    id="tabs"
                    name="tabs"
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                    {tabs.map((tab) => (
                        <option key={tab.name}>{tab.name}</option>
                    ))}
                </select>
            </div>
            <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <a
                                key={tab.name}
                                href={tab.href}
                                onClick={() => setActiveTab(tab.name)}
                                className={classNames(
                                    tab.name === activeTab
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                                )}
                            >
                                {tab.name}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="mt-4">
                {activeTab === 'Create Post' && (
                    <div className="space-y-4">
                        <Input
                            placeholder="Post Title"
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        />
                        <Input
                            placeholder="Post Content"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        />
                        <Button onClick={handleCreatePost} className="w-full">Create Post</Button>
                    </div>
                )}

                {activeTab === 'View Posts' && (
                    <div className="space-y-4 overflow-y-auto">
                        {posts ? (
                            posts.map((post) => (
                                <div key={post._id} className="p-4 border rounded-md">
                                    <h3 className="font-bold">{post.title}</h3>
                                    <p>{post.content}</p>
                                </div>
                            ))
                        ) : (
                            Array(3).fill(null).map((_, i) => (
                                <div key={i} className="p-4 border rounded-md animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'Actions' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">Show Info Dialog</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Important Information</DialogTitle>
                                    </DialogHeader>
                                    <DialogDescription>
                                        Here is some realistic and important information that is relevant to the context of this application.
                                    </DialogDescription>
                                </DialogContent>
                            </Dialog>

                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="w-full">View Posts</Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>All Posts</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6">
                                        {posts ? (
                                            posts.map((post) => (
                                                <div key={post._id} className="border-b border-gray-200 pb-4 mb-4">
                                                    <h3 className="font-bold">{post.title}</h3>
                                                    <p>{post.content}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="animate-pulse space-y-4">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" className="w-full">Hover for Info</Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>This is a helpful tooltip!</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full">Open Dropdown</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Option 1</DropdownMenuItem>
                                    <DropdownMenuItem>Option 2</DropdownMenuItem>
                                    <DropdownMenuItem>Option 3</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="mt-8 space-y-4">
                            <Input
                                placeholder="Enter VIN"
                                value={vin}
                                onChange={(e) => setVin(e.target.value)}
                            />
                            <Button onClick={handleCreateTask} className="w-full">Process VIN</Button>
                            {taskProgress && (
                                <div>
                                    <Progress value={taskProgress.progress} className="mb-2" />
                                    <div className="flex flex-wrap gap-1">
                                        {taskProgress.processedChars.map((char, index) => (
                                            <div key={index} className="w-8 h-8 border flex items-center justify-center">
                                                {char || '_'}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-2">Status: {taskProgress.status}</p>
                                    <p>Result: {taskProgress.result}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'Media' && (
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <video controls className="w-full">
                                <source src="https://example.com/sample-video.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div>
                            <img src="https://example.com/sample-image.jpg" alt="Sample" className="w-full h-auto" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}