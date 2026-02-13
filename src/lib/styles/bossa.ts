import type { StyleDef } from './interfaces';

export const bossa: StyleDef = {
    name: 'bossa',
    transitions: {
        0: { 1: 0.4, 5: 0.3, 2: 0.3 },                  // I -> ii, vi
        1: { 4: 0.8, 6: 0.2 },                          // ii -> V
        2: { 5: 0.7, 1: 0.3 },                          // iii -> vi
        3: { 1: 0.4, 4: 0.4, 6: 0.2 },
        4: { 0: 0.7, 2: 0.3 },                          // V -> I
        5: { 1: 0.8, 3: 0.2 },                          // vi -> ii
        6: { 2: 0.5, 0: 0.5 }
    },
    rhythms: [
        { name: "Clave", length: 16, pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0] }
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
