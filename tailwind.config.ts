import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        bone: "#f4f1ea",
        fog: "#a7a29a",
        line: "rgba(244, 241, 234, 0.12)",
        ember: "#d8b36a",
        slate: "#93a3ad",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        editorial: ["var(--font-playfair)", "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 0 80px rgba(216, 179, 106, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
