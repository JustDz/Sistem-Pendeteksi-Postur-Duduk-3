// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // pastikan mencakup semua file yang kamu gunakan
  ],
  theme: {
    extend: {
      colors: {
        "heading-clr": "#F8F7E5",
        "body-clr": "#1D1D1D",
        "btn-clr": "#D397B1",
        "first-bg": "#697D70",
        "second-bg": "#eae6e0",
      },
      backgroundImage: {
        noise: 'url("/src/assets/noise.png")',
      },
      fontFamily: {
        main: ["Roseford", "serif"],
        heading: ["Freudian", "cursive"],
        text: ["Eczar", "sans-serif"],
      },
    },
  },
  plugins: [],
};
