"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface User {
	userId: string;
	email: string;
	name?: string;
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	register: (email: string, password: string, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const signIn = useAction(api.actions.auth.signInAction)
	const signUp = useAction(api.actions.auth.signUpAction)
	const [token, setToken] = useState<string | null>(null)

	const userResult = useQuery(api.queries.auth.getUser, token ? { token } : 'skip')

	useEffect(() => {
		const storedToken = localStorage.getItem('token');
		if (storedToken) {
			setToken(storedToken);
		}
	}, []);

	useEffect(() => {
		if (userResult) {
			setUser(userResult);
		}
	}, [userResult]);

	const login = async (email: string, password: string) => {
		const result = await signIn({ email, password });
		localStorage.setItem('token', result.token);
		setToken(result.token);
		setUser({ userId: result.userId, email, name: undefined });
	};

	const logout = () => {
		localStorage.removeItem('token');
		setToken(null);
		setUser(null);
	};

	const register = async (email: string, password: string, name?: string) => {
		const result = await signUp({ email, password, name });
		localStorage.setItem('token', result.token);
		setToken(result.token);
		setUser({ userId: result.userId, email, name });
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, register }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};