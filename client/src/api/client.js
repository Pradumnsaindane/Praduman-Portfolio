import axios from 'axios';

const TOKEN_KEY = 'portfolio_token';

// In production, set VITE_API_URL to the Render API URL + /api.
// In dev it falls back to /api, which the Vite proxy forwards to :5000.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach the JWT (if any) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If a token expires or is rejected, clear it so the app can send the user to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(err);
  }
);

export { TOKEN_KEY };
export default api;
