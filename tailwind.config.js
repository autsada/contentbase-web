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
        textError: "#dc2626",
        borderExtraLightGray: "#f3f4f6",
        borderLightGray: "#e5e7eb",
        borderGray: "#d1d5db",
        borderDarkGray: "#6b7280",
        borderExtraDarkGray: "#374151",
        // blueLighter: "#93c5fd",
        // blueLight: "#60a5fa",
        blueBase: "#3b82f6",
        // blueDark: "#2563eb",
        // blueDarker: "#1d4ed8",
      },
    },
  },
  plugins: [],
}
