/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "sans-serif"], // Đặt Poppins làm font mặc định
        // inter: ["Inter"],
        // taprom: ["Taprom"],
      },
      spacing: {
        "25rem": "25rem",
      },
      boxShadow: {
        custom: "0 .1875rem .25rem rgba(0, 0, 0, 0.2)",
        product: "0 .625rem 1.875rem rgba(0,0,0,.4)",
      },
    },
  },
  plugins: [],
};
