import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Admin JS never loads on public pages
                    'admin': [
                        './resources/js/features/admin/components/layout/AdminLayout.jsx',
                    ],
                    // Vendor chunk for icon library
                    'vendor-icons': ['lucide-react'],
                },
            },
        },
        // Improve chunk size warnings threshold
        chunkSizeWarningLimit: 600,
    },
});
