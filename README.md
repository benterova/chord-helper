# Chord & Scale Helper

An interactive web application to explore musical scales, generate chord progressions, and download MIDI files.

## Features
- **Circle of Fifths Visualization**: Interactive SVG-based circle.
- **Chord Progressions**: Hundreds of example progressions for various styles (Pop, Jazz, Rock).
- **Generative Engine**: Create unique progressions with AI-driven logic (Pop, Jazz, Dark styles).
- **MIDI Export**: Download high-quality MIDI files with custom rhythms.
- **Offline Capable**: Works purely in the browser.

### Build & Deploy
This project uses **Vite** for building and **gh-pages** for deployment.

1.  **Install Dependencies** (if not done):
    ```bash
    bun install
    ```

2.  **Run Locally**:
    ```bash
    bun run dev
    ```

3.  **Deploy to GitHub Pages**:
    ```bash
    bun run deploy
    ```
    This command will automatically:
    - Build the project (`bun run build`) into the `dist/` folder.
    - Push the `dist/` folder to the `gh-pages` branch of your repository.

The application will be live at `https://<your-username>.github.io/<repo-name>/`.
