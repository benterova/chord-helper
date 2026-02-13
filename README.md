# Chord & Scale Helper

A visual, interactive tool for exploring musical scales, modes, and chord progressions. Designed to help musicians and producers create harmonic content quickly.

## Features

- **Interactive Circle of 5ths**: Visualize the relationship between keys.
- **7 Modes Supported**: Ionian (Major), Dorian, Phrygian, Lydian, Mixolydian, Aeolian (Minor), and Locrian.
- **Smart Chord Generation**: Automatically generates chords diatonic to the selected scale.
- **Progression Library**: Includes common progressions for Pop, Jazz, R&B, and more.
- **Advanced MIDI Tools**:
    - **Smart Voicing**: Smooth voice leading for professional-sounding chords.
    - **Extensions (7th/9th)**: Add color to your chords with a single toggle.
    - **2-Bar Loops**: Automatically generates musical variations with turnarounds.
    - **Download MIDI**: Export your progressions directly to your DAW.
- **Local First**: Runs entirely in the browser with no server required.

## Usage

1.  Open `index.html` in any modern web browser.
2.  Select a **Key** and **Scale** (Mode).
3.  Explore the chords in the "Chords in Key" panel.
4.  Try the **Example Progressions** or enable the advanced toggles:
    - **Add 7th/9th + Variation**: For lush, complex harmonies.
    - **Smart Voicing**: For smooth, pianistic transitions.
    - **2-Bar Loop**: To create a full musical phrase.
5.  Click **Download MIDI** to save the progression.

## Technologies

- Vanilla JavaScript (ES Modules, Namespace Pattern)
- CSS3 (Variables, Grid, Flexbox)
- SVG for data visualization
- `jsmidgen` for MIDI generation

## License

MIT
