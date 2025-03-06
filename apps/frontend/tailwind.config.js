const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f1fe',
          100: '#cce3fd',
          200: '#99c7fb',
          300: '#66aaf9',
          400: '#338ef7',
          500: '#0072f5', // Primary color
          600: '#005bc4',
          700: '#004493',
          800: '#002e62',
          900: '#001731',
        },
        danger: {
          50: '#fee6e6',
          100: '#fdcccc',
          200: '#fb9999',
          300: '#f96666',
          400: '#f73333',
          500: '#f50000', // Danger color
          600: '#c40000',
          700: '#930000',
          800: '#620000',
          900: '#310000',
        }
      },
    },
  },
  plugins: [],
};
