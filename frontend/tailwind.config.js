/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        wiki: {
          link: '#0645AD',
          linkVisited: '#0b0080',
          border: '#a2a9b1',
          panel: '#f8f9fa',
          infobox: '#eaecf0',
          text: '#202122',
          subtle: '#54595d',
          bg: '#ffffff',
        },
      },
      fontFamily: {
        body: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        serifHead: ['Georgia', '"Linux Libertine"', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
};
