import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
        // [1] التعديل الأول: إصلاح المسار لتجنب خطأ 404
        base: '/', 
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        
        // [2] إزالة تعريفات process.env الخاطئة (لا حاجة لها في Vite)
        // قم بإلغاء أو حذف قسم define بالكامل:
        /* define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        }, */
        
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});
