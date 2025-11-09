/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./pages/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {
    colors: {
      brand:{50:"#eef6ff",100:"#d9ebff",200:"#b7d7ff",300:"#8bbdff",400:"#5b9dff",500:"#2f7dff",600:"#1c5fe0",700:"#164bb3",800:"#143f8f",900:"#14356f"},
      ink:{50:"#f8fafc",100:"#eef2f7",200:"#e3e8f0",300:"#cdd6e1",400:"#9aa8bb",500:"#5b6b7a",600:"#3f4b59",700:"#2f3945",800:"#232b35",900:"#1b2129"}
    },
    boxShadow:{ soft:'0 10px 20px rgba(17, 24, 39, 0.08)' }
  }},
  plugins: [],
}