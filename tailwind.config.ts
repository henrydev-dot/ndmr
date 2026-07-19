import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "rgb(var(--bg-primary-rgb) / <alpha-value>)",
        "bg-secondary": "rgb(var(--bg-secondary-rgb) / <alpha-value>)",
        "surface-card": "rgb(var(--surface-card-rgb) / <alpha-value>)",
        "surface-elevated": "rgb(var(--surface-elevated-rgb) / <alpha-value>)",
        "border-subtle": "var(--border-subtle)",
        "border-accent": "var(--border-accent)",
        accent: "rgb(var(--accent-primary-rgb) / <alpha-value>)",
        "accent-secondary": "rgb(var(--accent-secondary-rgb) / <alpha-value>)",
        "accent-deep": "rgb(var(--accent-deep-rgb) / <alpha-value>)",
        "text-primary": "rgb(var(--text-primary-rgb) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary-rgb) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted-rgb) / <alpha-value>)",
        success: "rgb(var(--success-rgb) / <alpha-value>)",
        danger: "rgb(var(--danger-rgb) / <alpha-value>)",
        warning: "rgb(var(--warning-rgb) / <alpha-value>)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 60px var(--accent-glow)",
        "glow-sm": "0 0 24px var(--accent-glow)",
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};

export default config;
