export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        gold:  { DEFAULT:'#c9a84c', light:'#d4b56a', dark:'#a8892e' },
        dark:  { DEFAULT:'#080808', card:'#101010', surface:'#141414', border:'#222222' },
        cream: '#f0ede8',
      },
    },
  },
  plugins: [],
}