// tailwind.config.js
module.exports = {
  darkMode: 'class', // ← This enables dark mode via a `dark` class
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust if your file structure is different
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

module.exports = {
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.98)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
