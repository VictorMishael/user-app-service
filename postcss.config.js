export default {
  plugins: {
    // Must run first: it inlines the @import graph in src/styles/index.css so
    // Tailwind sees a single file and can resolve @apply inside every partial.
    "postcss-import": {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
