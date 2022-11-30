/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/_app.tsx"],
  theme: {
    extend: {
      colors: {
        danger: "#ff6961",
        primary: {
          DEFAULT: '#FFA265',
          '50': '#FFFFFF',
          '100': '#FFFFFF',
          '200': '#FFECDF',
          '300': '#FFD3B7',
          '400': '#FFBB8E',
          '500': '#FFA265',
          '600': '#FF802D',
          '700': '#F46100',
          '800': '#BC4A00',
          '900': '#843400'
        },
      }
    }
  },
  plugins: [],
};
