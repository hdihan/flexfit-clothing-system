import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// Upload a single image file → returns public URL
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
};

// Upload many images in parallel → returns array of public URLs (order preserved)
export const uploadImages = async (files) => {
    const list = Array.from(files);
    const urls = await Promise.all(list.map((file) => uploadImage(file)));
    return urls;
};

export default api;