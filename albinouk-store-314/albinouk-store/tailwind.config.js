/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#ff7a1a",
          orangeLight: "#ff9142",
          orangeDeep: "#e85d00",
          black: "#0a0a0a",
          card: "#141414",
          border: "#232323",
        },
      },
      fontFamily: {
        display: ["Cairo", "sans-serif"],
        body: ["Tajawal", "sans-serif"],
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        floaty: { "0%,100%": { transform: "translateY(0) rotate(20deg)" }, "50%": { transform: "translateY(-14px) rotate(35deg)" } },
      },
      animation: {
        fadeUp: "fadeUp 0.55s cubic-bezier(.2,.8,.2,1) both",
        floaty: "floaty 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
