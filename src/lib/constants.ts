export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type Note = typeof NOTES[number];

export const CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'] as const;

export type ScaleName =
    | 'ionian'
    | 'dorian'
    | 'phrygian'
    | 'lydian'
    | 'mixolydian'
    | 'natural_minor'
    | 'locrian'
    | 'harmonic_minor'
    | 'melodic_minor'
    | 'major_pentatonic'
    | 'minor_pentatonic'
    | 'blues';

export const SCALES: Record<ScaleName, number[]> = {
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

export const MODE_DISPLAY_NAMES: Record<ScaleName, string> = {
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

export interface ProgressionDef {
    name: string;
    indices: number[];
    genre: string;
}

export const PROGRESSIONS: Partial<Record<ScaleName, ProgressionDef[]>> = {
    ionian: [
        { name: "Pop Changes", indices: [0, 4, 5, 3], genre: "Pop" },
        { name: "Jazz Turnaround", indices: [1, 4, 0, 5], genre: "Jazz" },
        { name: "Doo-Wop", indices: [0, 5, 3, 4], genre: "Oldies" },
        { name: "Canon", indices: [0, 4, 5, 2, 3, 0, 3, 4], genre: "Classical" }
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
        { name: "Pop Minor", indices: [0, 5, 2, 6], genre: "Pop" },
        { name: "Sad Ballad", indices: [0, 3, 5, 4], genre: "Ballad" },
        { name: "Andalucian", indices: [0, 6, 5, 4], genre: "Flamenco" }
    ],
    locrian: [
        { name: 'Locrian Tension (i-bII)', genre: 'Dark', indices: [0, 1] }
    ],
    harmonic_minor: [
        { name: "Classical Minor", indices: [0, 3, 4, 0], genre: "Classical" },
        { name: "Vamp", indices: [0, 4], genre: "Latin" }
    ],
    melodic_minor: [
        { name: "Jazz Minor", indices: [0, 1, 4, 0], genre: "Jazz" }
    ],
    major_pentatonic: [
        { name: "Country Road", indices: [0, 4, 3, 0], genre: "Country" }, // C, A, G, C
        { name: "Simple Myx", indices: [0, 1, 2, 0], genre: "Folk" }
    ],
    minor_pentatonic: [
        { name: "Rock Riff", indices: [0, 2, 3, 0], genre: "Rock" }, // A, D, E, A
        { name: "Groove", indices: [0, 4, 3, 0], genre: "Funk" }
    ],
    blues: [
        { name: "12-Bar Blues", indices: [0, 3, 4], genre: "Blues" } // Simplified for now
    ]
};
