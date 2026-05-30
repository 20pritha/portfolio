import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        maroon: '#8B2635',
        cream: '#FAF7F2',
      },
      boxShadow: {
        soft: '0 18px 60px rgba(139, 38, 53, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
