import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

// App-wide design tokens. Components should use semantic utilities such as
// bg-primary, bg-surface, text-success, and bg-warning-soft.
const lightTheme = {
  background: "90 25% 98%",
  foreground: "164 38% 10%",
  card: "0 0% 100%",
  "card-foreground": "164 38% 10%",
  surface: "90 20% 96%",
  primary: "160 88% 20%",
  "primary-foreground": "0 0% 100%",
  "primary-soft": "154 38% 92%",
  "primary-strong": "162 82% 13%",
  "primary-strong-foreground": "48 30% 96%",
  secondary: "48 35% 94%",
  "secondary-foreground": "164 38% 12%",
  muted: "90 15% 94%",
  "muted-foreground": "158 10% 42%",
  accent: "45 72% 90%",
  "accent-foreground": "36 70% 22%",
  "accent-strong": "45 88% 62%",
  "accent-strong-foreground": "36 76% 12%",
  destructive: "0 72% 51%",
  "destructive-foreground": "0 0% 100%",
  "destructive-soft": "0 86% 95%",
  success: "142 71% 38%",
  "success-foreground": "0 0% 100%",
  "success-soft": "142 55% 92%",
  warning: "38 92% 50%",
  "warning-foreground": "36 76% 12%",
  "warning-soft": "45 95% 92%",
  info: "245 58% 51%",
  "info-foreground": "0 0% 100%",
  "info-soft": "245 75% 95%",
  border: "150 14% 86%",
  input: "150 14% 82%",
  ring: "160 88% 20%",
} as const;

const darkTheme = {
  background: "162 38% 6%",
  foreground: "48 30% 96%",
  card: "162 30% 9%",
  "card-foreground": "48 30% 96%",
  surface: "162 28% 8%",
  primary: "158 60% 48%",
  "primary-foreground": "163 45% 7%",
  "primary-soft": "159 35% 15%",
  "primary-strong": "162 82% 10%",
  "primary-strong-foreground": "48 30% 96%",
  secondary: "162 22% 15%",
  "secondary-foreground": "48 25% 94%",
  muted: "162 20% 14%",
  "muted-foreground": "153 10% 66%",
  accent: "42 45% 18%",
  "accent-foreground": "45 82% 78%",
  "accent-strong": "45 88% 62%",
  "accent-strong-foreground": "36 76% 12%",
  destructive: "0 72% 58%",
  "destructive-foreground": "0 0% 100%",
  "destructive-soft": "0 35% 16%",
  success: "142 65% 48%",
  "success-foreground": "143 80% 8%",
  "success-soft": "142 35% 15%",
  warning: "42 90% 58%",
  "warning-foreground": "36 76% 12%",
  "warning-soft": "38 42% 16%",
  info: "245 75% 70%",
  "info-foreground": "245 65% 10%",
  "info-soft": "245 30% 18%",
  border: "160 18% 20%",
  input: "160 18% 24%",
  ring: "158 60% 48%",
} as const;

function cssVariables(theme: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(theme).map(([name, value]) => ["--" + name, value]),
  );
}

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          soft: "hsl(var(--primary-soft) / <alpha-value>)",
          strong: "hsl(var(--primary-strong) / <alpha-value>)",
          "strong-foreground": "hsl(var(--primary-strong-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          strong: "hsl(var(--accent-strong) / <alpha-value>)",
          "strong-foreground": "hsl(var(--accent-strong-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          soft: "hsl(var(--destructive-soft) / <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
          soft: "hsl(var(--success-soft) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
          soft: "hsl(var(--warning-soft) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--info) / <alpha-value>)",
          foreground: "hsl(var(--info-foreground) / <alpha-value>)",
          soft: "hsl(var(--info-soft) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(({ addBase }) => {
      addBase({
        ":root": {
          ...cssVariables(lightTheme),
          "--radius": "0.75rem",
        },
        ".dark": cssVariables(darkTheme),
      });
    }),
  ],
};

export default config;
