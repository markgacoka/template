"use client"

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface User {
	userId: Id<"users">;
	email: string;
	name?: string;
	token: string;
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	register: (email: string, password: string, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const signIn = useAction(api.auth.signInAction);
	const signUp = useAction(api.auth.signUpAction);

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
	}, []);

	const login = async (email: string, password: string) => {
		const result = await signIn({ email, password });
		const newUser = { userId: result.userId, email, name: result.name, token: result.token };
		localStorage.setItem('user', JSON.stringify(newUser));
		setUser(newUser);
	};

	const logout = () => {
		localStorage.removeItem('user');
		setUser(null);
	};

	const register = async (email: string, password: string, name?: string) => {
		const result = await signUp({ email, password, name });
		const newUser = { userId: result.userId, email, name, token: result.token };
		localStorage.setItem('user', JSON.stringify(newUser));
		setUser(newUser);
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, register }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}