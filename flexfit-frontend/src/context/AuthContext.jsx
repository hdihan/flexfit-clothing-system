import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('userInfo');
        if (stored) setUser(JSON.parse(stored));
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        toast.success(`Welcome back, ${data.name}!`);
        return data;
    };

    const register = async (name, email, password, role = 'customer') => {
        const { data } = await api.post('/auth/register', { name, email, password, role });
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        toast.success('Account created!');
        return data;
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        toast.success('Logged out');
    };

    const updateUser = (updatedData) => {
        const merged = { ...user, ...updatedData };
        localStorage.setItem('userInfo', JSON.stringify(merged));
        setUser(merged);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);