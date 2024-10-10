"use client"

import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from 'next-themes'
import { FaSun, FaMoon } from 'react-icons/fa'
import { api } from '@/convex/_generated/api'
import { Toaster } from '@/components/ui/toaster'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { CreatePostForm } from '@/components/posts/CreatePostForm'
import { PostList } from '@/components/posts/PostList'
import { MediaEmbed } from '@/components/media/MediaEmbed'
import { TaskProcessor } from '@/components/tasks/TaskProcessor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

const tabs = [
    { name: 'Create Post', href: '#' },
    { name: 'View Posts', href: '#' },
    { name: 'Actions', href: '#' },
    { name: 'Media', href: '#' },
]

export default function Home() {
    const { theme, setTheme } = useTheme()
    const { user, logout } = useAuth()
    const posts = useQuery(api.posts.getPosts, user ? { userId: user.userId } : 'skip')
    const [activeTab, setActiveTab] = useState('Create Post')

    useEffect(() => {
        if (!theme) setTheme('light')
    }, [theme, setTheme])

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
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-foreground">Welcome, {user.name || user.email}</h1>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} variant="outline">
                        {theme === 'light' ? <FaMoon className="text-foreground" /> : <FaSun className="text-foreground" />}
                    </Button>
                    <Button onClick={logout} variant="outline">Log out</Button>
                </div>
            </div>
            <nav className="border-b border-border">
                <div className="flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`${
                                tab.name === activeTab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
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