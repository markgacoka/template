"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'
import { MainTabs } from '@/components/MainTabs'

export default function Home() {
    const { user, login, register, logout } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const { toast } = useToast()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (isSignUp) {
                await register(email, password, name)
            } else {
                await login(email, password)
            }
            toast({
                title: isSignUp ? "Sign up successful" : "Sign in successful",
                description: `Welcome${name ? `, ${name}` : ''}!`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive",
            })
        }
    }

    if (!user) {
        return (
            <div className="container mx-auto p-4 min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-background to-secondary/10">
                <div className="w-full max-w-md space-y-8">
                    <h1 className="text-4xl font-bold text-center text-primary">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h1>
                    <form onSubmit={handleAuth} className="space-y-6">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-background/50 backdrop-blur-sm"
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-background/50 backdrop-blur-sm"
                        />
                        {isSignUp && (
                            <Input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-background/50 backdrop-blur-sm"
                            />
                        )}
                        <Button type="submit" className="w-full">
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </Button>
                    </form>
                    <Button
                        variant="ghost"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="w-full text-sm text-muted-foreground hover:text-primary"
                    >
                        {isSignUp 
                            ? "Already have an account? Sign In" 
                            : "Don't have an account? Sign Up"}
                    </Button>
                </div>
                <Toaster />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Welcome, {user.name || user.email}!</h1>
                <Button onClick={logout}>Sign Out</Button>
            </div>
            <MainTabs {...user} />
            <Toaster />
        </div>
    )
}