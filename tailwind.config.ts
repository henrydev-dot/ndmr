import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "surface-card": "var(--surface-card)",
        "surface-elevated": "var(--surface-elevated)",
        "border-subtle": "var(--border-subtle)",
        "border-accent": "var(--border-accent)",
        accent: "var(--accent-primary)",
        "accent-secondary": "var(--accent-secondary)",
        "accent-deep": "var(--accent-deep)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",
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
