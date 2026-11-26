import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Màu thương hiệu chủ đạo #C61F2B (RGB 198, 31, 43) đồng bộ toàn app
        teal: {
          50: "#FFF5F6",
          100: "#FDE8EA",
          200: "#FCD0D3",
          300: "#F7A6AC",
          400: "#F2747D",
          500: "#E84551",
          600: "#D92B38",
          700: "#C61F2B",
          800: "#A81823",
          900: "#8A121B",
          950: "#54080E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
