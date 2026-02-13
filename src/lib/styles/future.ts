import type { StyleDef } from './interfaces';

export const future: StyleDef = {
    name: 'future',
    transitions: {
        // Kawaii Future Bass: IV-V-iii-vi heavily used too. Lydian (IV start) focus.
        0: { 3: 0.5, 4: 0.3, 5: 0.2 },
        3: { 4: 0.6, 0: 0.2, 1: 0.2 },
        4: { 2: 0.5, 0: 0.4, 5: 0.1 },
        2: { 5: 0.8, 3: 0.2 },
        5: { 3: 0.5, 1: 0.3, 4: 0.2 },
        1: { 4: 0.8, 6: 0.2 },
        6: { 0: 0.5, 2: 0.5 }
    },
    rhythms: [
        { name: "Wub Sustain", length: 16, pattern: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0.5, 0, 1, 0, 0, 0] }, // Sidechain feel logic needed given sustain
        { name: "Super Saw Rhythm", length: 16, pattern: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0] }, // 3-3-2 + extra
        {
            name: "Future Wobble",
            length: 32,
            pattern: [
                1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0,
                0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0
            ]
        }
    ],
    optimizeVoicing: (notes: number[]) => {
        let voiced = [...notes];
        // Future Bass loves "Super Saws" - essentially 7th/9th chords clustered in mid-high register + Bass.
        // Drop Root 1 octave
        if (voiced[0] > 48) voiced[0] -= 12;

        // Ensure we have a high "sheen" (if only 3 notes, duplicate root or 5th up)
        if (voiced.length < 4) {
            voiced.push(voiced[0] + 24); // Add 2 octaves up root
        }
        return voiced.sort((a, b) => a - b);
    }
};
