import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Healthcare palette
        navy: {
          DEFAULT: '#1E3A5F',
          50: '#E8EDF3',
          100: '#C5D1E0',
          200: '#9EB3C9',
          300: '#7795B2',
          400: '#507AA0',
          500: '#1E3A5F',
          600: '#1A3354',
          700: '#152B48',
          800: '#11233C',
          900: '#0C1A2E',
        },
        slate: {
          DEFAULT: '#64748B',
        },
        teal: {
          DEFAULT: '#0D9488',
          50: '#E6F7F6',
          100: '#CCEFED',
          200: '#99DFDB',
          300: '#66CFC9',
          400: '#33BFB7',
          500: '#0D9488',
          600: '#0B7A70',
          700: '#096058',
          800: '#074640',
          900: '#052C28',
        },
        amber: {
          DEFAULT: '#F59E0B',
        },
        rose: {
          DEFAULT: '#E11D48',
        },
        emerald: {
          DEFAULT: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
