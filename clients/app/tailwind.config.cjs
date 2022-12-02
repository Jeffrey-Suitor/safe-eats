/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/_app.tsx"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
