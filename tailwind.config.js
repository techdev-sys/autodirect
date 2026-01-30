/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#F8FAFC', // Slate 50
                surface: '#FFFFFF',
                primary: {
                    DEFAULT: '#2563EB', // Blue 600
                    hover: '#1D4ED8',
                    light: '#DBEAFE',
                },
                secondary: {
                    DEFAULT: '#F59E0B', // Amber 500
                    hover: '#D97706',
                    light: '#FEF3C7',
                },
                accent: '#8B5CF6',     // Violet 500
                success: '#10B981',    // Emerald 500
                slate: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                    950: '#020617',
                },
                'text-main': '#0F172A', // Slate 900
                'text-muted': '#64748B', // Slate 500
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
            boxShadow: {
                'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
                'premium-hover': '0 20px 50px -12px rgba(0, 0, 0, 0.1)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            }
        },
    },
    plugins: [],
}
