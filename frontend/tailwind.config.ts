import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Refined modern color palette
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // Slightly adjusted primary blue
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        secondary: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Slightly adjusted accent yellow
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        glass: {
          light: "rgba(255, 255, 255, 0.15)", // Increased transparency
          dark: "rgba(0, 0, 0, 0.3)", // Increased transparency
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Added Inter font
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))", // Refined glass gradient
        "glass-gradient-dark":
          "linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.15))", // Refined dark glass gradient
        "gradient-modern": "linear-gradient(to right, #6366f1, #0ea5e9)", // New dynamic gradient
      },
      backdropBlur: {
        xs: "3px", // Slightly increased blur
        sm: "6px",
        md: "12px",
        lg: "24px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.2)", // Reduced opacity
        "glass-sm": "0 4px 16px 0 rgba(31, 38, 135, 0.1)", // Reduced opacity
        "glass-lg": "0 16px 64px 0 rgba(31, 38, 135, 0.3)", // Reduced opacity
        modern:
          "0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 15px -3px rgba(0, 0, 0, 0.03)", // Refined modern shadow
        "modern-lg": "0 20px 40px -10px rgba(0, 0, 0, 0.2)", // Refined modern-lg shadow
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem", // Added a larger border radius
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-light": "pulseLight 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", // New pulse animation
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }, // Reduced float distance
        },
        pulseLight: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
