import axios from 'axios';
import { Alert } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wmt-e-commerce.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
});

// Add Interceptor to add Token to every request
api.interceptors.request.use(
    async (config) => {
        // In a real app, you would use AsyncStorage here
        // For this demo, let's use a global variable or simpler storage if available
        if (global.userToken) {
            config.headers.Authorization = `Bearer ${global.userToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (userData) => api.post('/auth/register', userData);
export const getProducts = () => api.get('/products');
export const getOrders = () => api.get('/orders');

export default api;
