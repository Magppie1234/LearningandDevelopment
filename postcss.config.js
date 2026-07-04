const path = require('path')

// `next dev <dir>` sets the app directory but leaves process.cwd() at the
// launcher's location, so point Tailwind at this project's config explicitly
// rather than relying on cwd-based auto-discovery.
module.exports = {
  plugins: {
    tailwindcss: { config: path.join(__dirname, 'tailwind.config.cjs') },
    autoprefixer: {},
  },
}
