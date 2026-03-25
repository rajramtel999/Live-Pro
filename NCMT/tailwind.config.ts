import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "on-primary-fixed": "#002114",
        "on-secondary": "#ffffff",
        "tertiary": "#712ae2",
        "surface-variant": "#dce2f7",
        "on-surface-variant": "#3d4a42",
        "outline": "#6d7a72",
        "on-secondary-fixed": "#00174b",
        "secondary-fixed": "#dbe1ff",
        "on-tertiary-fixed": "#25005a",
        "secondary": "#0051d5",
        "tertiary-fixed": "#eaddff",
        "tertiary-container": "#8a4cfc",
        "inverse-surface": "#293040",
        "secondary-container": "#316bf3",
        "outline-variant": "#bccac0",
        "on-surface": "#141b2b",
        "on-error-container": "#93000a",
        "surface-container": "#e9edff",
        "on-background": "#141b2b",
        "tertiary-fixed-dim": "#d2bbff",
        "on-tertiary-container": "#fffbff",
        "inverse-primary": "#68dba9",
        "secondary-fixed-dim": "#b4c5ff",
        "error-container": "#ffdad6",
        "primary-fixed": "#85f8c4",
        "primary-container": "#00855d",
        "on-primary": "#ffffff",
        "background": "#f9f9ff",
        "surface-container-low": "#f1f3ff",
        "on-tertiary": "#ffffff",
        "error": "#ba1a1a",
        "surface-tint": "#006c4a",
        "surface-container-high": "#e1e8fd",
        "inverse-on-surface": "#edf0ff",
        "on-primary-fixed-variant": "#005137",
        "surface": "#f9f9ff",
        "surface-container-highest": "#dce2f7",
        "surface-dim": "#d3daef",
        "surface-bright": "#f9f9ff",
        "on-tertiary-fixed-variant": "#5a00c6",
        "on-secondary-container": "#fefcff",
        "surface-container-lowest": "#ffffff",
        "on-primary-container": "#f5fff7",
        "primary": "#006948",
        "primary-fixed-dim": "#68dba9",
        "on-secondary-fixed-variant": "#003ea8",
        "on-error": "#ffffff"
      },
      fontFamily: {
        "headline": ["var(--font-plus-jakarta)", 'sans-serif'],
        "body": ["var(--font-inter)", 'sans-serif'],
        "label": ["var(--font-inter)", 'sans-serif']
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
export default config;
