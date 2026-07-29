import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL,
  timeout: 20000,
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  health: () => client.get('/health').then((r) => r.data),

  translate: (payload) => client.post('/translate', payload).then((r) => r.data),

  voice: (payload) => client.post('/voice', payload).then((r) => r.data),

  weather: (payload) => client.post('/weather', payload).then((r) => r.data),

  pesticide: (payload) => client.post('/pesticide', payload).then((r) => r.data),

  market: (payload) => client.post('/market', payload).then((r) => r.data),

  schemes: (payload) => client.post('/schemes', payload).then((r) => r.data),

  location: (payload) => client.post('/location', payload).then((r) => r.data),

  history: (params) => client.get('/history', { params }).then((r) => r.data),

  analytics: () => client.get('/history/analytics').then((r) => r.data),
};

export default api;
