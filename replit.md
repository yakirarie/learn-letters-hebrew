# לומדים עברית (Learn Hebrew)

An interactive Progressive Web App (PWA) for learning the Hebrew alphabet, numbers, vowels, and basic vocabulary through games and exercises.

## Tech Stack

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (no framework)
- **PWA**: Service Worker (`sw.js`) + Web App Manifest (`manifest.json`)
- **APIs**: Web Speech API for Hebrew text-to-speech, Canvas API for letter tracing

## Project Structure

```
index.html      - Main entry point (all HTML, CSS, JS in one file)
manifest.json   - PWA manifest (icons, theme, name)
sw.js           - Service Worker for offline caching
README.md       - Basic documentation
```

## Running the App

The app is served via Python's built-in HTTP server:

```
python3 -m http.server 5000 --bind 0.0.0.0
```

Configured as a workflow named "Start application" on port 5000.

## Deployment

Configured as a **static** deployment with `publicDir: "."` — no build step required.

## Features

- Hebrew letters (aleph-bet) with visual and audio pronunciation
- Numbers in Hebrew
- Vowels (Nikud) practice
- Quiz/game mode
- Memory matching game
- Letter tracing with Canvas
