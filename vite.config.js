import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
    ],
    base: "/pageaadmin/",
    build: {
        target: 'chrome79',
        cssTarget: 'chrome79',
        outDir: 'dist', // Ensure explicit outDir
    },
})
