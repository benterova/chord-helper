import type { StyleDef } from './interfaces';

export const blues: StyleDef = {
    name: 'blues',
    transitions: {
        0: { 3: 0.4, 4: 0.3, 0: 0.3 },                  // I -> IV, V, I (12-bar-ish tendencies)
        3: { 0: 0.5, 4: 0.2, 3: 0.3 },                  // IV -> I, V
        4: { 3: 0.5, 0: 0.5 },                          // V -> IV, I
        // Minimal usage of other degrees in standard blues, but allowed for jazz-blues
        1: { 4: 0.8, 0: 0.2 },
        5: { 1: 0.5, 3: 0.5 }
    },
    rhythms: [
        { name: "Shuffle", length: 16, pattern: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1] }, // Approximation of shuffle
        { name: "Slow 12/8", length: 16, pattern: [1, 0, 0, 0, 0.8, 0, 0, 0, 0.9, 0, 0, 0, 0.8, 0, 0, 0] }
    ],
    optimizeVoicing: (notes: number[]) => {
        return notes.sort((a, b) => a - b);
    }
};
