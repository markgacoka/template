"use client"

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { useToast } from './ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Id } from '../convex/_generated/dataModel'

interface Post {
    _id: string
    title: string
    content: string
    authorId: string
}

const tabs = [
    { name: 'Scrollable List', href: '#', current: true },
    { name: 'Action Buttons', href: '#', current: false },
    { name: 'Create Post', href: '#', current: false },
    { name: 'Media', href: '#', current: false },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function TabsContent() {
    const [activeTab, setActiveTab] = useState(tabs[0].name)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    const { user } = useAuth()
    const posts = useQuery(api.posts.getPosts) || []
    const createPost = useMutation(api.posts.createPost)
    const { toast } = useToast()

    const handleCreatePost = () => {
        if (!user) {
            toast({
                title: 'Error',
                description: 'You must be logged in to create a post.',
                variant: 'destructive',
            })
            return
        }

        createPost({ 
            title, 
            content, 
            authorId: user.userId as Id<"users"> 
        })
            .then(() => {
                toast({
                    title: 'Post created!',
                    description: 'Your new post has been successfully created.',
                })
                setTitle('')
                setContent('')
            })
            .catch((error) => {
                console.error('Error creating post:', error)
                toast({
                    title: 'Error creating post',
                    description: 'Please try again later.',
                    variant: 'destructive',
                })
            })
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
                {activeTab === 'Scrollable List' && (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {posts.map((post: Post) => (
                            <div key={post._id} className="p-4 border rounded-md">
                                <h3 className="font-bold">{post.title}</h3>
                                <p>{post.content}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'Action Buttons' && (
                    <div className="space-y-4">
                        <Button
                            onClick={() => toast({ title: 'Action performed' })}
                        >
                            Perform Action
                        </Button>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button>Open Sheet</Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Sheet Title</SheetTitle>
                                </SheetHeader>
                                <div className="py-4">
                                    Sheet content goes here
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                )}

                {activeTab === 'Create Post' && (
                    <div className="space-y-4">
                        <Input
                            placeholder="Post title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Input
                            placeholder="Post content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <Button onClick={handleCreatePost}>Create Post</Button>
                    </div>
                )}

                {activeTab === 'Media' && (
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <video controls className="w-full">
                                <source
                                    src="/path-to-your-video.mp4"
                                    type="video/mp4"
                                />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div className="flex-1">
                            <img
                                src="/path-to-your-image.jpg"
                                alt="Sample image"
                                className="w-full"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}