import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Màu hồng MoMo chủ đạo (#A50064 / #D82D8B)
        teal: {
          50: "#FFF0F7",
          100: "#FFE0EF",
          200: "#FFC2DF",
          300: "#FF94C7",
          400: "#F45CA5",
          500: "#E83E8C",
          600: "#D82D8B",
          700: "#A50064",
          800: "#8A0054",
          900: "#6E0043",
          950: "#4A002D",
        },
      },
    },
  },
  plugins: [],
};

export default config;
