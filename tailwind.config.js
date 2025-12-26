/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['"Courier New"', 'Courier', 'monospace'],
                sans: ['"Inter"', 'sans-serif'],
            },
            colors: {
                'cyber-black': '#000000',
                'neon-blue': '#00f3ff',
                'neon-pink': '#ff00ff',
            },
            animation: {
                'rgb-flow': 'rgbFlow 5s linear infinite',
                'levitate': 'levitate 3s ease-in-out infinite',
            },
            keyframes: {
                rgbFlow: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '100%': { backgroundPosition: '100% 50%' },
                },
                levitate: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
