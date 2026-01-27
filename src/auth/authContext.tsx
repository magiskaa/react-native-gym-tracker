import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../services/firebase";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			setUser(firebaseUser);
			setLoading(false);
		});
		return unsubscribe;
  	}, []);

	const logout = async () => {
		await signOut(auth);
	};

	return (
		<AuthContext.Provider value={{ user, loading, logout }}>
		{children}
		</AuthContext.Provider>
	);
};