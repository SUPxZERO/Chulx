// =============================================================================
// Chulx — Vite Configuration
// =============================================================================
// React + TypeScript + TailwindCSS 4 + Laravel Vite Plugin
// =============================================================================

import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.tsx',           // React entry point
            ],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            // Path aliases — keep in sync with tsconfig.json
            '@':           resolve(__dirname, 'resources/js'),
            '@components': resolve(__dirname, 'resources/js/components'),
            '@pages':      resolve(__dirname, 'resources/js/pages'),
            '@hooks':      resolve(__dirname, 'resources/js/hooks'),
            '@stores':     resolve(__dirname, 'resources/js/stores'),
            '@lib':        resolve(__dirname, 'resources/js/lib'),
            '@types':      resolve(__dirname, 'resources/js/types'),
            '@locales':    resolve(__dirname, 'resources/js/locales'),
        },
    },

    server: {
        // Vite dev server config for Docker/HMR
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: {
            host: 'localhost',
        },
        watch: {
            ignored: ['**/storage/framework/views/**', '**/vendor/**'],
        },
    },

    build: {
        // Optimize chunk splitting
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-query': ['@tanstack/react-query'],
                    'vendor-maps':  ['@react-google-maps/api'],
                    'vendor-motion': ['framer-motion'],
                },
            },
        },
    },
});
