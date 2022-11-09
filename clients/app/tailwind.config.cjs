/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/_app.tsx"],
  theme: {
    extend: {
      colors: {
        danger: "#ff6961",
        primary: "#FF8A3C",
      },
    },
  },
  plugins: [],
};
