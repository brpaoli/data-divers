/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./src/**/*.html"],
  safelist: [
    "flex",
    "min-h-screen",
    "items-center",
    "justify-center",
    "bg-[#10131c]",
    "text-4xl",
    "font-bold",
    "text-white",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
