import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Seed from meta tag on first load; Inertia's finish event keeps it fresh
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

// Intercept 419 responses and reload so the user gets a fresh CSRF token
window.axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 419) {
            if (confirm('Session expired. Reload the page?')) {
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);
