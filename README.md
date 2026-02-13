# Chord & Scale Helper

An interactive web application to explore musical scales, generate chord progressions, and download MIDI files.

## Features
- **Circle of Fifths Visualization**: Interactive SVG-based circle.
- **Chord Progressions**: Hundreds of example progressions for various styles (Pop, Jazz, Rock).
- **Generative Engine**: Create unique progressions with AI-driven logic (Pop, Jazz, Dark styles).
- **MIDI Export**: Download high-quality MIDI files with custom rhythms.
- **Offline Capable**: Works purely in the browser.

## How to Build & Deploy

This project is designed to run statically without a backend server. However, to bypass browser security restrictions (CORS) when running locally via `file://`, we bundle the scripts.

### Build Script
Run the included build script to package the application:

```bash
./build.sh
```

This will:
1.  Download dependencies (`jsmidgen.js`) if needed.
2.  Combine source files into `dist/app.js`.

### GitHub Pages Deployment
1.  Run `./build.sh`.
2.  Commit the generated `dist/` directory.
3.  Push to GitHub.
4.  Enable GitHub Pages in your repository settings (Source: `main` branch).

The application will be live at `https://<your-username>.github.io/<repo-name>/`.
