/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-black': '#0A0A0A',
        'brand-dark-grey': '#1C1C1C',
        'brand-light-grey': '#EDEDED',
        'brand-white': '#FFFFFF',
        'brand-red': '#D32F2F',
      },
    },
  },
  plugins: [],
};
