/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    // Tema yang tersedia. Ganti urutan jika default ingin 'light'.
    themes: ['dark', 'light'],
    darkTheme: 'dark',
    base:   true,
    styled: true,
    utils:  true,
    logs:   false,
  },
}