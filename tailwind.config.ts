import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08080d",
        panel: "#111119",
        panel2: "#171722",
        line: "rgba(255,255,255,0.10)",
        violet: "#7c6af7",
        rose: "#e85d75"
      }
    }
  },
  plugins: []
};

export default config;
