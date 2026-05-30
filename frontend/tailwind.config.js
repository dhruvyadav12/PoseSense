/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Instrument Serif'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      colors: {
        bg: "hsl(0 0% 4%)",
        surface: "hsl(0 0% 8%)",
        muted: "hsl(0 0% 53%)",
        stroke: "hsl(0 0% 12%)",
      },
      animation: {
        "marquee-left": "marquee-left 25s linear infinite",
        "marquee-right": "marquee-right 30s linear infinite",
        "scroll-down": "scroll-down 1.5s ease-in-out infinite",
        "role-fade": "role-fade 0.4s ease-out",
      },
      keyframes: {
        "marquee-left": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "marquee-right": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        "scroll-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(200%)", opacity: "0" },
        },
        "role-fade": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}