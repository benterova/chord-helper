import type { StyleDef } from './interfaces';

export const hyperpop: StyleDef = {
    name: 'hyperpop',
    transitions: {
        // Chaos but rooted in Pop. I-vi-IV-V but fast.
        0: { 5: 0.3, 3: 0.3, 4: 0.2, 1: 0.2 },
        3: { 0: 0.4, 4: 0.4, 1: 0.2 },
        4: { 0: 0.6, 5: 0.4 },
        5: { 3: 0.5, 1: 0.3, 4: 0.2 },
        // Hyperpop likes modal interchange/chromaticism but for this matrix we stick to diatonic
        1: { 4: 0.7, 6: 0.3 },
        6: { 0: 0.5, 2: 0.5 }
    },
    rhythms: [
        { name: "Glitch 16ths", length: 16, pattern: [1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0] },
        { name: "Manic", length: 16, pattern: [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1] },
        {
            name: "Glitch Stutter",
            length: 32, // 32 steps of 32nd notes = 16 steps of 16th notes (1 bar) in time, but high res
            ticksPerStep: 16, // 32nd notes
            pattern: [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1]
        }
    ],
    optimizeVoicing: (notes: number[]) => {
        let voiced = [...notes];
        // Big Stacks.
        // Drop Root 1 octave
        if (voiced[0] > 48) voiced[0] -= 12;

        // Ensure we have a high "sheen" (if only 3 notes, duplicate root or 5th up)
        if (voiced.length < 4) {
            voiced.push(voiced[0] + 24); // Add 2 octaves up root
        }
        return voiced.sort((a, b) => a - b);
    }
};
