import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        tailwindcss(),
        react(),
    ],
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, 'resources/js/components'),
            '@pages': path.resolve(__dirname, 'resources/js/pages'),
            '@hooks': path.resolve(__dirname, 'resources/js/hooks'),
            '@lib': path.resolve(__dirname, 'resources/js/lib'),
            '@stores': path.resolve(__dirname, 'resources/js/stores'),
            '@types': path.resolve(__dirname, 'resources/js/types'),
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
