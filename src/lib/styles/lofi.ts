import type { StyleDef } from './interfaces';

export const lofi: StyleDef = {
    name: 'lofi',
    transitions: {
        0: { 1: 0.3, 5: 0.3, 3: 0.2, 2: 0.2 },          // I -> ii, vi
        1: { 4: 0.7, 6: 0.3 },                          // ii -> V
        2: { 5: 0.6, 3: 0.4 },                          // iii -> vi
        3: { 1: 0.3, 4: 0.3, 0: 0.4 },                  // IV -> ii, V, I (Plagal)
        4: { 0: 0.5, 2: 0.3, 5: 0.2 },                  // V -> I
        5: { 1: 0.5, 3: 0.3, 4: 0.2 },
        6: { 2: 0.5, 0: 0.5 }
    },
    rhythms: [
        { name: "Chill", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0.5, 0, 0, 0.6, 0, 0, 0, 0, 0.5, 0] },
        { name: "Late Night", length: 16, pattern: [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0.5, 0, 0, 0, 0, 0] }
    ],
    optimizeVoicing: (notes: number[]) => {
        let voiced = [...notes];
        // Extensions emphasis. Voicing similar to Jazz but maybe less drop-2, more clusters or shell.
        // Ensure Shell (Root, 3, 7) is clear.
        // If we have 9th, keep it on top.
        if (voiced[0] > 53) voiced[0] -= 12; // Deeper root
        return voiced.sort((a, b) => a - b);
    }
};
