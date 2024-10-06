import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Progress } from '@/components/ui/progress'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { VinInput } from './VinInput'
import { FiEdit2, FiSave, FiX, FiTrash2, FiClock, FiCheckCircle, FiLoader } from 'react-icons/fi'

export function TaskProcessor() {
    const [taskId, setTaskId] = useState<Id<'tasks'> | null>(null)
    const [editingPost, setEditingPost] = useState<Id<'posts'> | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editContent, setEditContent] = useState('')
    const updateTaskProgress = useMutation(api.tasks.updateTaskProgress)
    const completeTask = useMutation(api.tasks.completeTask)
    const updatePost = useMutation(api.posts.updatePost)
    const deletePost = useMutation(api.posts.deletePost)
    const task = useQuery(api.tasks.getTaskProgress, taskId ? { taskId } : 'skip')
    const posts = useQuery(api.posts.getPosts) || []
    const allTasks = useQuery(api.tasks.getAllTasks) || []

    useEffect(() => {
        if (task && task.status === 'pending') {
            processTask()
        }
    }, [task])

    const processTask = async () => {
        if (!task || !task.vin || !taskId) return

        const vin = task.vin
        const startTime = Date.now()
        for (let i = 0; i < vin.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            await updateTaskProgress({
                taskId,
                progress: ((i + 1) / vin.length) * 100,
                charIndex: i,
                processedChar: vin[i].toUpperCase(),
                timeTaken: (Date.now() - startTime) / 1000,
            })
        }
        const endTime = Date.now()
        const timeTaken = (endTime - startTime) / 1000 // in seconds

        await completeTask({
            taskId,
            result: `Processed VIN: ${vin.toUpperCase()}`,
            timeTaken,
        })
    }

    const handleEditPost = (post: { _id: Id<'posts'>, title: string, content: string }) => {
        setEditingPost(post._id)
        setEditTitle(post.title)
        setEditContent(post.content)
    }

    const handleSaveEdit = async () => {
        if (editingPost) {
            await updatePost({ id: editingPost, title: editTitle, content: editContent })
            setEditingPost(null)
        }
    }

    const handleCancelEdit = () => {
        setEditingPost(null)
        setEditTitle('')
        setEditContent('')
    }

    const handleDeletePost = async (postId: Id<'posts'>) => {
        await deletePost({ id: postId })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <FiCheckCircle className="text-green-500" />
            case 'pending':
                return <FiLoader className="text-yellow-500 animate-spin" />
            default:
                return null
        }
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-4">Actions</h2>
            <div className="grid grid-cols-2 gap-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            Open Dialog
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Important Information</DialogTitle>
                            <DialogDescription>
                                Here is some realistic and important information that is relevant
                                to the context of this application.
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                            View Posts
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>All Posts</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
                            {posts.map((post) => (
                                <div key={post._id} className="bg-white shadow-md rounded-lg p-6">
                                    {editingPost === post._id ? (
                                        <div className="space-y-4">
                                            <Input
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                placeholder="Post Title"
                                                className="text-lg font-semibold"
                                            />
                                            <Textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                placeholder="Post Content"
                                                rows={4}
                                                className="w-full"
                                            />
                                            <div className="flex justify-end space-x-2">
                                                <Button onClick={handleCancelEdit} variant="outline" size="sm">
                                                    <FiX className="mr-2" /> Cancel
                                                </Button>
                                                <Button onClick={handleSaveEdit} size="sm">
                                                    <FiSave className="mr-2" /> Save
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                                            <p className="text-gray-600 mb-4">{post.content}</p>
                                            <div className="flex justify-end space-x-2">
                                                <Button onClick={() => handleEditPost(post)} variant="outline" size="sm">
                                                    <FiEdit2 className="mr-2" /> Edit
                                                </Button>
                                                <Button onClick={() => handleDeletePost(post._id)} variant="destructive" size="sm">
                                                    <FiTrash2 className="mr-2" /> Delete
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" className="w-full">
                                Hover for Info
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>This is a helpful tooltip!</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full">
                            Open Dropdown
                        </Button>
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

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Tasks</h3>
                <div className="space-y-4">
                    {allTasks.map((task) => (
                        <div key={task._id} className="bg-white shadow-sm rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">VIN: {task.vin}</span>
                                {getStatusIcon(task.status)}
                            </div>
                            <Progress value={task.progress} className="w-full mb-2" />
                            <div className="flex justify-between text-sm">
                                <span>Progress: {task.progress.toFixed(2)}%</span>
                                <span>Status: {task.status}</span>
                            </div>
                            {task.status === 'completed' && (
                                <div className="mt-2 text-sm text-gray-600">
                                    <p>{task.result}</p>
                                    <p><FiClock className="inline mr-1" /> Time taken: {task.timeTaken?.toFixed(2)}s</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Create New Task</h3>
                <VinInput onTaskCreated={(id) => setTaskId(id as Id<'tasks'>)} />
            </div>
        </div>
    )
}