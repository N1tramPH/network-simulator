import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";
import aspectRatio from "@tailwindcss/aspect-ratio";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,html}"],
  darkMode: "class",
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#ba00ff",
          secondary: "#009ad3",
          accent: "#00abff",
          neutral: "#050815",
          "base-100": "#162428",
          info: "#00d6ff",
          success: "#afef5e",
          warning: "#ff6e00",
          error: "#d60022",
        },
      },
    ],

    // base: false, // applies background color and foreground color for root element by default
  },

  plugins: [typography, forms, aspectRatio, daisyui],
};
