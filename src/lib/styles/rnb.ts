import type { StyleDef } from './interfaces';

export const rnb: StyleDef = {
    name: 'rnb',
    transitions: {
        0: { 5: 0.3, 2: 0.3, 1: 0.2, 3: 0.2 },          // I -> vi, iii, ii
        1: { 4: 0.6, 6: 0.2, 0: 0.2 },                  // ii -> V
        2: { 5: 0.6, 3: 0.4 },                          // iii -> vi, IV
        3: { 1: 0.3, 4: 0.3, 6: 0.2, 3: 0.2 },          // IV -> ii, V
        4: { 0: 0.5, 2: 0.3, 5: 0.2 },                  // V -> I, iii (Neo-soul turnaround)
        5: { 1: 0.5, 3: 0.3, 4: 0.2 },                  // vi -> ii, IV
        6: { 2: 0.5, 0: 0.5 }
    },
    rhythms: [
        { name: "Neo Soul", length: 16, pattern: [1, 0, 0, 0.5, 0, 0, 0.8, 0, 0, 0.5, 0, 0, 1, 0, 0, 0] }, // Laid back
        { name: "Sparse", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 0, 0] }
    ],
    optimizeVoicing: (notes: number[]) => {
        const voiced = [...notes];
        // Extensions emphasis. Voicing similar to Jazz but maybe less drop-2, more clusters or shell.
        // Ensure Shell (Root, 3, 7) is clear.
        // If we have 9th, keep it on top.
        if (voiced[0] > 53) voiced[0] -= 12; // Deeper root
        return voiced.sort((a, b) => a - b);
    }
};
