import type { StyleDef } from './interfaces';

export const jpop: StyleDef = {
    name: 'jpop',
    transitions: {
        // Royal Road (IV-V-iii-vi) = 3 -> 4 -> 2 -> 5
        0: { 3: 0.4, 4: 0.2, 5: 0.2, 1: 0.2 },
        3: { 4: 0.6, 0: 0.2, 1: 0.2 },                  // IV -> V (strongest in Jpop)
        4: { 2: 0.5, 0: 0.3, 5: 0.2 },                  // V -> iii (Royal Road)
        2: { 5: 0.8, 0: 0.1, 1: 0.1 },                  // iii -> vi (Royal Road)
        5: { 3: 0.4, 1: 0.4, 4: 0.2 },                  // vi -> IV (Komuro), ii
        1: { 4: 0.8, 0: 0.2 },
        6: { 2: 0.5, 0: 0.5 }
    },
    rhythms: [
        { name: "Driving Anime", length: 16, pattern: [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0] },
        { name: "Melodic Stream", length: 16, pattern: [1, 0.5, 1, 0, 1, 0.5, 1, 0, 1, 0.5, 1, 0, 1, 0.5, 1, 0] },
        {
            name: "Anime Opening",
            length: 32,
            pattern: [
                1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, // Bar 1: Tresillo-ish
                1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0  // Bar 2: Fill
            ]
        }
    ],
    optimizeVoicing: (notes: number[]) => {
        const voiced = [...notes];
        // Big Stacks. J-Pop loves piano voicings (Left Hand Octaves, Right Hand shell+melody).
        // Drop Root 1 octave
        if (voiced[0] > 48) voiced[0] -= 12;

        // Ensure we have a high "sheen" (if only 3 notes, duplicate root or 5th up)
        if (voiced.length < 4) {
            voiced.push(voiced[0] + 24); // Add 2 octaves up root
        }
        return voiced.sort((a, b) => a - b);
    }
};
