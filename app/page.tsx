"use client"

import React, { useState } from 'react'
import { useQuery } from 'convex/react'
import { useAuth } from '@/contexts/AuthContext'

// Convex
import { api } from '@/convex/_generated/api'

// Components
import { Toaster } from '@/components/ui/toaster'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { CreatePostForm } from '@/components/posts/CreatePostForm'
import { PostList } from '@/components/posts/PostList'
import { MediaEmbed } from '@/components/media/MediaEmbed'
import { TaskProcessor } from '@/components/tasks/TaskProcessor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const tabs = [
    { name: 'Create Post', href: '#' },
    { name: 'View Posts', href: '#' },
    { name: 'Actions', href: '#' },
    { name: 'Media', href: '#' },
]

export default function Home() {
    const { user } = useAuth()
    const posts = useQuery(api.posts.getPosts)
    const [activeTab, setActiveTab] = useState('Create Post')

    if (!user) {
        return (
            <div className="container mx-auto p-4 min-h-screen flex flex-col justify-center items-center">
                <Tabs defaultValue="login" className="w-full max-w-md">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <LoginForm />
                    </TabsContent>
                    <TabsContent value="register">
                        <RegisterForm />
                    </TabsContent>
                </Tabs>
                <Toaster />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <nav className="border-b border-gray-200">
                <div className="flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`${
                                tab.name === activeTab
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </nav>

            <div className="mt-4">
                {activeTab === 'Create Post' && <CreatePostForm />}
                {activeTab === 'View Posts' && <PostList posts={posts} />}
                {activeTab === 'Actions' && <TaskProcessor />}
                {activeTab === 'Media' && <MediaEmbed />}
            </div>
            <Toaster />
        </div>
    )
}