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
        borderGray: "#d1d5db",
        borderLightGray: "#e5e7eb",
        borderExtraLightGray: "#f3f4f6",
        borderDarkGray: "#f3f4f6",
        borderExtraDarkGray: "#6b7280",
      },
    },
  },
  plugins: [],
}
