/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Overpass", "Arial", "sans-serif"],
      },
      colors: {
        textRegular: "#525252",
        textLight: "#737373",
        textExtraLight: "#a3a3a3",
        textDark: "#404040",
        textExtraDark: "#262626",
      },
    },
  },
  plugins: [],
}
