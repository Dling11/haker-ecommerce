/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Poppins"', "system-ui", "sans-serif"],
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "rgb(var(--color-brand-50) / <alpha-value>)",
          100: "rgb(var(--color-brand-100) / <alpha-value>)",
          500: "rgb(var(--color-brand-500) / <alpha-value>)",
          700: "rgb(var(--color-brand-700) / <alpha-value>)",
          900: "rgb(var(--color-brand-900) / <alpha-value>)",
        },
        accent: {
          100: "rgb(var(--color-accent-100) / <alpha-value>)",
          500: "rgb(var(--color-accent-500) / <alpha-value>)",
          600: "rgb(var(--color-accent-600) / <alpha-value>)",
        },
        ink: {
          50: "rgb(var(--color-ink-50) / <alpha-value>)",
          100: "rgb(var(--color-ink-100) / <alpha-value>)",
          300: "rgb(var(--color-ink-300) / <alpha-value>)",
          500: "rgb(var(--color-ink-500) / <alpha-value>)",
          700: "rgb(var(--color-ink-700) / <alpha-value>)",
          900: "rgb(var(--color-ink-900) / <alpha-value>)",
        },
        surface: {
          base: "rgb(var(--color-surface-base) / <alpha-value>)",
          panel: "rgb(var(--color-surface-panel) / <alpha-value>)",
          muted: "rgb(var(--color-surface-muted) / <alpha-value>)",
          sidebar: "rgb(var(--color-surface-sidebar) / <alpha-value>)",
        },
      },
      boxShadow: {
        soft: "0 20px 45px rgba(18, 24, 38, 0.08)",
        panel: "0 18px 45px rgba(18, 24, 38, 0.08)",
      },
    },
  },
  plugins: [],
}
