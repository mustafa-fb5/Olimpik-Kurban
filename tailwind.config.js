/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        whatsapp: "#25D366",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "hero-bg": "hero-bg 24s ease-in-out infinite",
        "glow": "glow-scale 24s ease-in-out infinite",
        "glow-reverse": "glow-scale-reverse 24s ease-in-out infinite",
        "badge-pulse": "badge-pulse 4s ease-in-out infinite",
        "scroll-bob": "scroll-bob 2s linear infinite",
        "red-pulse": "red-pulse 1.5s linear infinite",
        "wa-pulse": "wa-pulse 4s ease-in-out infinite",
      },
      keyframes: {
        "hero-bg": {
          "0%, 100%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
        },
        "glow-scale": {
          "0%, 100%": { transform: "scale(0.9)" },
          "50%": { transform: "scale(1.1)" },
        },
        "glow-scale-reverse": {
          "0%, 100%": { transform: "scale(1.1)" },
          "50%": { transform: "scale(0.9)" },
        },
        "badge-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(52, 211, 153, 0.3)" },
          "50%": { boxShadow: "0 0 16px rgba(52, 211, 153, 0.8)" },
        },
        "scroll-bob": {
          "0%": { opacity: "0.5", transform: "translateY(0)" },
          "25%": { opacity: "0.8", transform: "translateY(6px)" },
          "50%": { opacity: "0.5", transform: "translateY(0)" },
          "75%": { opacity: "0.2", transform: "translateY(-6px)" },
          "100%": { opacity: "0.5", transform: "translateY(0)" },
        },
        "red-pulse": {
          "0%": { boxShadow: "0 0 4px 0 rgba(239, 68, 68, 0.8)" },
          "100%": { boxShadow: "0 0 8px 2px rgba(239, 68, 68, 0.3)" },
        },
        "wa-pulse": {
          "0%, 100%": { boxShadow: "0 4px 16px rgba(37, 211, 102, 0.3)" },
          "50%": { boxShadow: "0 4px 24px rgba(37, 211, 102, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};

