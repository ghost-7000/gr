import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Tajawal', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#1B5E20',
                    light: '#2E7D32',
                    lighter: '#4CAF50',
                },
                gold: {
                    DEFAULT: '#D4AF37',
                    dark: '#B8860B',
                },
                dark: '#0F172A',
            }
        },
    },
    plugins: [],
};
export default config;
