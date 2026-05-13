import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Do NOT set X-CSRF-TOKEN here. axios has built-in support for reading the
// XSRF-TOKEN cookie (set by Laravel on every mutating response) and sending
// it as X-XSRF-TOKEN, which Laravel also accepts. The cookie is always fresh
// — it never goes stale the way a seeded header does after session regeneration.

// Safety net: if an axios request still somehow gets a 419, reload to recover.
window.axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 419) {
            window.location.reload();
        }
        return Promise.reject(error);
    }
);
