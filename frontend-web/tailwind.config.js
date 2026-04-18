/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hotel: {
          dark: '#1e1b4b',
          primary: '#4f46e5',
          secondary: '#818cf8',
          accent: '#c7d2fe',
          light: '#e0e7ff'
        }
      }
    },
  },
  plugins: [],
}
