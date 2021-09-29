import React, { createContext } from 'react';
import { useContext } from 'react';
import { useState } from 'react';
import { useCallback } from 'react';

import api from '../services/api';

interface User {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
}

interface SignInCredentials {
    email: string;
    password: string;
}

interface AuthContextData {
    user: User;
    signIn(credentials: SignInCredentials): Promise<void>;
    signOut(): void;
    updateUser(user: Partial<User>): void;
}

interface AuthState {
    token: string;
    user: User;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function useAuth(): AuthContextData {
    const context = useContext(AuthContext);

    return context;
}

export const AuthProvider: React.FC = ({ children }) => {
    const [data, setData] = useState<AuthState>(() => {
        const token = localStorage.getItem('@GoBarber:token');
        const user = localStorage.getItem('@GoBarber:user');

        if (token && user) {
            api.defaults.headers.authorization = `Bearer ${token}`;

            return { token, user: JSON.parse(user) };
        }

        return {} as AuthState;
    });

    const signIn = useCallback(async ({ email, password }) => {
        const response = await api.post('sessions', {
            email,
            password,
        });

        const { token, user } = response.data;

        setData({ token, user });

        localStorage.setItem('@GoBarber:token', token);
        localStorage.setItem('@GoBarber:user', JSON.stringify(user));

        api.defaults.headers.authorization = `Bearer ${token}`;
    }, []);

    const signOut = useCallback(() => {
        localStorage.removeItem('@GoBarber:token');
        localStorage.removeItem('@GoBarber:user');

        setData({} as AuthState);
    }, []);

    const updateUser = useCallback(
        (updateData: Partial<User>) => {
            const user = {
                ...data.user,
                ...updateData,
            };

            setData({
                token: data.token,
                user,
            });

            localStorage.setItem('@GoBarber:user', JSON.stringify(user));
        },
        [setData, data.token],
    );

    return (
        <AuthContext.Provider
            value={{ user: data.user, signIn, signOut, updateUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};
