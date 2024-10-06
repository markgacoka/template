"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { User } from '@/components/interfaces/user';

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	register: (email: string, password: string, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const signIn = useAction(api.actions.auth.signInAction);
	const signUp = useAction(api.actions.auth.signUpAction);
	const [token, setToken] = useState<string | null>(null);
	const refreshToken = useMutation(api.mutations.auth.refreshToken);

	const userResult = useQuery(api.queries.auth.getUser, token ? { token } : 'skip');

	useEffect(() => {
		if (userResult === null) {
			logout();
		} else if (userResult) {
			setUser(userResult);
		}
	}, [userResult]);

	useEffect(() => {
		const storedToken = localStorage.getItem('token');
		if (storedToken) {
			setToken(storedToken);
		}
	}, []);

	useEffect(() => {
		const refreshTokenInterval = setInterval(async () => {
			if (token) {
				try {
					const newToken = await refreshToken({ token });
					setToken(newToken);
					localStorage.setItem('token', newToken);
				} catch (error) {
					console.error('Failed to refresh token:', error);
					logout();
				}
			}
		}, 15 * 60 * 1000); // Refresh every 15 minutes

		return () => clearInterval(refreshTokenInterval);
	}, [token, refreshToken]);

	const login = async (email: string, password: string) => {
		const maxRetries = 3;
		let retries = 0;
		while (retries < maxRetries) {
			try {
				const result = await signIn({ email, password });
				localStorage.setItem('token', result.token);
				setToken(result.token);
				setUser({ userId: result.userId, email, name: result.name });
				return;
			} catch (error) {
				console.error('Login failed:', error);
				retries++;
				if (retries >= maxRetries) {
					throw error;
				}
				await new Promise(resolve => setTimeout(resolve, 1000 * retries));
			}
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		setToken(null);
		setUser(null);
	};

	const register = async (email: string, password: string, name?: string) => {
		const maxRetries = 3;
		let retries = 0;
		while (retries < maxRetries) {
			try {
				const result = await signUp({ email, password, name });
				localStorage.setItem('token', result.token);
				setToken(result.token);
				setUser({ userId: result.userId, email, name });
				return;
			} catch (error) {
				console.error('Registration failed:', error);
				retries++;
				if (retries >= maxRetries) {
					throw error;
				}
				await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
			}
		}
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