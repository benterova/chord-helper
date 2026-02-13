window.ChordApp = window.ChordApp || {};

(function () {
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

    // Scale intervals (semitones from root)
    const SCALES = {
        ionian: [0, 2, 4, 5, 7, 9, 11], // Major
        dorian: [0, 2, 3, 5, 7, 9, 10],
        phrygian: [0, 1, 3, 5, 7, 8, 10],
        lydian: [0, 2, 4, 6, 7, 9, 11],
        mixolydian: [0, 2, 4, 5, 7, 9, 10],
        natural_minor: [0, 2, 3, 5, 7, 8, 10], // Natural Minor (Aeolian)
        locrian: [0, 1, 3, 5, 6, 8, 10],
        harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
        melodic_minor: [0, 2, 3, 5, 7, 9, 11],
        major_pentatonic: [0, 2, 4, 7, 9],
        minor_pentatonic: [0, 3, 5, 7, 10],
        blues: [0, 3, 5, 6, 7, 10]
    };

    // Map display names to keys
    const MODE_DISPLAY_NAMES = {
        ionian: 'Major (Ionian)',
        dorian: 'Dorian',
        phrygian: 'Phrygian',
        lydian: 'Lydian',
        mixolydian: 'Mixolydian',
        natural_minor: 'Natural Minor',
        locrian: 'Locrian',
        harmonic_minor: 'Harmonic Minor',
        melodic_minor: 'Melodic Minor',
        major_pentatonic: 'Major Pentatonic',
        minor_pentatonic: 'Minor Pentatonic',
        blues: 'Blues'
    };

    // Common Progressions for demo purposes
    const PROGRESSIONS = {
        ionian: [
            { name: "Pop Changes", sequence: ["I", "V", "vi", "IV"], genre: "Pop" },
            { name: "Jazz Turnaround", sequence: ["ii", "V", "I", "vi"], genre: "Jazz" },
            { name: "Doo-Wop", sequence: ["I", "vi", "IV", "V"], genre: "Oldies" },
            { name: "Canon", sequence: ["I", "V", "vi", "iii", "IV", "I", "IV", "V"], genre: "Classical" }
        ],
        dorian: [
            { name: 'So What (i-VII)', genre: 'Jazz', indices: [0, 6] },
            { name: 'Santana (i-IV)', genre: 'Rock', indices: [0, 3] },
            { name: 'Funk Groove (i-IV-i-VII)', genre: 'Funk', indices: [0, 3, 0, 6] }
        ],
        phrygian: [
            { name: 'Phrygian Vamp (i-II)', genre: 'Metal', indices: [0, 1] }
        ],
        lydian: [
            { name: 'Lydian Dream (I-II)', genre: 'Cinematic', indices: [0, 1] }
        ],
        mixolydian: [
            { name: 'Classic Rock (I-bVII-IV)', genre: 'Rock', indices: [0, 6, 3] }
        ],
        natural_minor: [
            { name: "Pop Minor", sequence: ["i", "VI", "III", "VII"], genre: "Pop" },
            { name: "Sad Ballad", sequence: ["i", "iv", "VI", "V"], genre: "Ballad" },
            { name: "Andalucian", sequence: ["i", "VII", "VI", "V"], genre: "Flamenco" }
        ],
        locrian: [
            { name: 'Locrian Tension (i-bII)', genre: 'Dark', indices: [0, 1] }
        ],
        harmonic_minor: [
            { name: "Classical Minor", sequence: ["i", "iv", "V", "i"], genre: "Classical" },
            { name: "Vamp", sequence: ["i", "V"], genre: "Latin" }
        ],
        melodic_minor: [
            { name: "Jazz Minor", sequence: ["i", "ii", "V", "i"], genre: "Jazz" }
        ],
        major_pentatonic: [
            { name: "Country Road", sequence: [0, 4, 3, 0], genre: "Country" }, // C, A, G, C
            { name: "Simple Myx", sequence: [0, 1, 2, 0], genre: "Folk" }
        ],
        minor_pentatonic: [
            { name: "Rock Riff", sequence: [0, 2, 3, 0], genre: "Rock" }, // A, D, E, A
            { name: "Groove", sequence: [0, 4, 3, 0], genre: "Funk" }
        ],
        blues: [
            { name: "12-Bar Blues", sequence: [0, 3, 4], genre: "Blues" } // Simplified for now
        ]
    };

    ChordApp.Constants = {
        NOTES,
        CIRCLE_OF_FIFTHS,
        SCALES,
        MODE_DISPLAY_NAMES,
        PROGRESSIONS
    };
})();
