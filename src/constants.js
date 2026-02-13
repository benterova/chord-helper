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
        aeolian: [0, 2, 3, 5, 7, 8, 10], // Natural Minor
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
        aeolian: 'Minor (Aeolian)',
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
            { name: 'Pop (I-V-vi-IV)', genre: 'Pop', indices: [0, 4, 5, 3] },
            { name: 'Jazz ii-V-I', genre: 'Jazz', indices: [1, 4, 0] },
            { name: 'Doo-Wop (I-vi-IV-V)', genre: 'Oldies', indices: [0, 5, 3, 4] }
        ],
        dorian: [
            { name: 'So What (i-VII)', genre: 'Jazz', indices: [0, 6] },
            { name: 'Dorian Vamp (i-IV)', genre: 'Funk', indices: [0, 3] },
            { name: 'Funk Groove (i-IV)', genre: 'Funk', indices: [0, 3] }
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
        aeolian: [
            { name: 'Andalusian (i-VII-VI-V)', genre: 'Flamenco', indices: [0, 6, 5, 4] },
            { name: 'Plagal (i-iv-i)', genre: 'Hymn', indices: [0, 3, 0] },
            { name: 'ii-V-i (Jazz Minor)', genre: 'Jazz', indices: [1, 4, 0] }
        ],
        locrian: [
            { name: 'Locrian Tension (i-bII)', genre: 'Dark', indices: [0, 1] }
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
