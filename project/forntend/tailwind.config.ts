// tailwind.config.ts
import { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: {
          DEFAULT: 'hsl(var(--border))', // Uses the CSS variable
        },
        // Add other custom colors if necessary
      },
    },
  },
  plugins: [],
};

export default config;
