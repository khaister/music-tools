# KeyAtlas

A modern, interactive web application for exploring musical keys, scales, chords, intervals, and progressions. Built with Vue 3 and Vite.

## Features

- **Interactive Sheet Music:** Dynamically rendered treble and bass staves using [VexFlow](https://github.com/0xfe/vexflow).
- **Audio Playback:** Click notes on the stave or use the "Play Scale" buttons to hear the notes, powered by [Tone.js](https://tonejs.github.io/).
- **Comprehensive Key Reference:**
  - Note Reference & Fingerings
  - Intervals from the root
  - Diatonic Triads and Seventh Chords
  - Common Progressions
  - Relative and Parallel Minors
  - Modes
  - Ear Training characteristics for scale degrees
- **Modern UI:** Responsive, dark-themed interface built with Vue 3 and Vanilla CSS.
- **Print Ready:** Optimized `@media print` styles for generating clean, horizontal letter-sized reference sheets.
- **Data-Driven Architecture:** A dynamic view (`KeyDetailView.vue`) loads all key information from individual JSON files.

## Architecture

The project uses a clean, data-driven approach built on top of Vue.js to minimize code duplication and make it easy to add new musical keys.

- `src/views/HomeView.vue`: The home page grid where users select a key.
- `src/views/KeyDetailView.vue`: The dynamic view for rendering any key's reference sheet.
- `public/keys/*.json`: Data files containing all the specific information for a given key (e.g., `public/keys/e-major.json`).

*(Note: The `legacy/` directory contains the old Vanilla JS implementation, kept for reference.)*

### Adding a New Key

To add a new key, simply:

1. Create a new JSON file in the `public/keys/` directory (e.g., `public/keys/c-major.json`) following the structure of existing key files.
2. Add a link to the new key on the home page view (`src/views/HomeView.vue`) by adding a new object to the `AVAILABLE_KEYS` array.

## Running Locally

To run the application locally, you will need Node.js installed.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start the development server:

   ```sh
   npm run dev
   ```

3. Open `http://localhost:5173` (or the port Vite provides) in your browser.

## Deployment

This project is configured to be deployed automatically to GitHub Pages. The deployment is triggered whenever a new GitHub Release is created, or manually via workflow dispatch. The workflow uses Vite to build the static assets.
