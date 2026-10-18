/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Palette from the Nahj dashboard reference (styles/tokens.css).
      colors: {
        primary: { DEFAULT: '#78263d', hover: '#651f33', soft: '#f8eef1' },
        page: '#f8f3ed',
        sand: { DEFAULT: '#f1e9e1', light: '#f9f5f1' },
        line: '#e8dfda',
        ink: '#30242a',
        muted: '#81747a',
        success: { DEFAULT: '#218568', soft: '#e5f2ed' },
        danger: '#c23b3b',
      },
    },
  },
  plugins: [],
};
