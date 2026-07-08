const { colors, rounded, spacing } = require("./lib/theme.ts");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      borderRadius: rounded,
      spacing,
    },
  },
  plugins: [],
};
