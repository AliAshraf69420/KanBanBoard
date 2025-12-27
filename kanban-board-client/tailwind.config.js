/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // use class-based dark mode
  theme: {
    extend: {
      colors: {
        obsidian: {
          bg: "#1e1e1e",
          surface: "#252525",
          border: "#333",
          text: "#d4d4d4",
          muted: "#9a9a9a",
          accent: "#4c8bf5",
        },
      },
    },
  },
  plugins: [],
};
