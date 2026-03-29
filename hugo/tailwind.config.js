import typography from "@tailwindcss/typography";

module.exports = {
  content: ["./hugo_stats.json"],
  plugins: [typography, require("daisyui")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lexend', 'system-ui', 'sans-serif'],
        serif: ["'DM Sans'", "'Iowan Old Style'", "'Palatino Linotype'", 'serif'],
        mono: ["'Fragment Mono'", 'ui-monospace', "'Cascadia Code'", "'Source Code Pro'", 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
};
