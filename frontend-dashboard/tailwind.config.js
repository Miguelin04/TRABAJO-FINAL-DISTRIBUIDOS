/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: 'var(--color-netflix-red)',
          dark: 'var(--color-netflix-dark)',
          darker: 'var(--color-netflix-darker)',
          gray: 'var(--color-netflix-gray)',
          light: 'var(--color-netflix-light)'
        }
      }
    },
  },
  plugins: [],
}
