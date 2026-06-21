/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0A0A0F",
          50: "#F0F0FF",
          100: "#E0E0F5",
          200: "#C0C0E8",
          400: "#8080C0",
          600: "#4040A0",
          800: "#202060",
          900: "#0A0A30",
        },
        signal: {
          DEFAULT: "#00FF87",
          dim: "#00CC6A",
          glow: "rgba(0,255,135,0.15)",
        },
        accent: {
          DEFAULT: "#FF6B6B",
          blue: "#60A5FA",
          purple: "#A78BFA",
          amber: "#FBBF24",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-right": "slideRight 0.3s ease forwards",
        "shimmer": "shimmer 1.5s infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(0,255,135,0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(0,255,135,0.5)" },
        },
        slideRight: {
          from: { transform: "translateX(-10px)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};
