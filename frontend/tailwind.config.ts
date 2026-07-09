import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        paper: "#f7f8fb",
        line: "#d9dee8",
        forest: "#1f6f5b",
        coral: "#d45f4c",
      },
      boxShadow: {
        panel: "0 18px 60px rgba(24, 33, 47, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;

