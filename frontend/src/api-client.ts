import { client } from './client/client.gen'

// Base URL configuration based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

client.setConfig({
    baseUrl: API_BASE_URL
})

// Request interceptor to automatically attach the Firebase token to every request
client.interceptors.request.use((request, options) => {
    const token = localStorage.getItem('access_token')
    
    if (token) {
        request.headers.set('Authorization', `Bearer ${token}`)
    }
    
    return request
})
