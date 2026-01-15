import typography from "@tailwindcss/typography";

module.exports = {
  content: ["./hugo_stats.json"],
  plugins: [typography, require("daisyui")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', "'Helvetica Neue'", "'Arial Nova'", "'Nimbus Sans'", 'Arial', 'sans-serif'],
        serif: ["'Iowan Old Style'", "'Palatino Linotype'", "'URW Palladio L'", "P052", "serif"],
      },
    },
  },
};
