import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans:    ['Kalpurush', 'SolaimanLipi', ...defaultTheme.fontFamily.sans],
                bengali: ['Kalpurush', 'SolaimanLipi', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#263238',
                    dark:    '#1a2428',
                    mid:     '#37474f',
                    light:   '#eceff1',
                },
                // Admin panel keeps its own red
                red: {
                    600: '#e8001e',
                    700: '#c0001a',
                },
                breaking: '#e8001e',
                'pa-blue': '#0055a5',
                'pa-green': '#00885a',
                'pa-border': '#e0e0e0',
                'pa-light-bg': '#f4f4f4',
                'pa-light-text': '#666666',
                'pa-lighter-text': '#999999',
                'pa-dark': '#222222',
                'pa-mid': '#444444',
                // Admin dashboard design tokens
                sidebar: {
                    bg: '#0f1117',
                    hover: '#1c1f2e',
                    active: '#1a1d2e',
                    border: '#1e2130',
                    text: '#8b92a5',
                    section: '#4a5068',
                },
                status: {
                    blue: '#3b82f6',
                    'blue-light': '#eff6ff',
                    green: '#10b981',
                    'green-light': '#ecfdf5',
                    orange: '#f59e0b',
                    'orange-light': '#fffbeb',
                    purple: '#8b5cf6',
                    'purple-light': '#f5f3ff',
                    cyan: '#06b6d4',
                    'cyan-light': '#ecfeff',
                },
            },
            spacing: {
                '1.25': '0.3125rem',
                '1.75': '0.4375rem',
                '2.25': '0.5625rem',
                '2.75': '0.6875rem',
                '3.25': '0.8125rem',
                '3.75': '0.9375rem',
                '4.5': '1.125rem',
                '5.5': '1.375rem',
                '8.5': '2.125rem',
                '9.5': '2.375rem',
                '10.5': '2.625rem',
                '11.5': '2.875rem',
            },
        },
    },

    plugins: [forms],
};
