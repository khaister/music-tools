# Music Tools

A modern, interactive web application for exploring musical keys, scales, chords, intervals, and progressions.

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
- **Modern UI:** Responsive, dark-themed interface built with Vanilla CSS.
- **Print Ready:** Optimized `@media print` styles for generating clean, horizontal letter-sized reference sheets.
- **Data-Driven Architecture:** A single `key.html` template dynamically loads all key information from individual JSON files.

## Architecture

The project uses a clean, data-driven approach to minimize code duplication and make it easy to add new musical keys.

- `index.html`: The home page grid where users select a key.
- `key.html`: The single, dynamic template page for rendering any key's reference sheet.
- `shared.js`: Handles fetching the key data, populating the DOM, initializing audio, and rendering the VexFlow staves.
- `keys/*.json`: Data files containing all the specific information for a given key (e.g., `keys/e-major.json`).

### Adding a New Key

To add a new key, simply:

1. Create a new JSON file in the `keys/` directory (e.g., `keys/c-major.json`) following the structure of existing key files.
2. Add a link to the new key on the home page (`index.html`) using the format `key.html?name=c-major`.

## Running Locally

Because the application fetches data from local JSON files, it needs to be run through a local web server to avoid CORS issues.

You can use any simple HTTP server. For example, using Python 3:

```sh
python -m http.server 3000
```

Then open `http://localhost:3000` in your browser.

## Deployment

This project is configured to be deployed automatically to GitHub Pages. The deployment is triggered whenever a new GitHub Release is created.
