import type { StyleDef } from './interfaces';

export const rock: StyleDef = {
    name: 'rock',
    transitions: {
        0: { 3: 0.3, 4: 0.3, 6: 0.2, 5: 0.2 },          // I -> IV, V, bVII (if mixo), vi
        3: { 0: 0.4, 4: 0.4, 3: 0.2 },                  // IV -> I, V
        4: { 3: 0.4, 0: 0.5, 5: 0.1 },                  // V -> IV, I
        5: { 3: 0.5, 4: 0.3, 0: 0.2 },                  // vi -> IV, V
        6: { 3: 0.4, 0: 0.4, 4: 0.2 }                   // bVII (treated as vii index here) -> IV, I
    },
    rhythms: [
        { name: "Quarter Notes", length: 16, pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] },
        { name: "Power 8ths", length: 16, pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
        { name: "Alt Rock", length: 16, pattern: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0] }
    ],
    optimizeVoicing: (notes: number[]) => {
        const voiced = [...notes];
        // Power chords preference if triad
        // If triad (1, 3, 5), maybe drop the 3rd or move it up?
        // Actually, keep it simple for now, just ensure root is grounded.
        if (voiced[0] > 50) voiced[0] -= 12;
        return voiced.sort((a, b) => a - b);
    }
};
