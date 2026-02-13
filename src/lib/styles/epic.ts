import type { StyleDef } from './interfaces';

export const epic: StyleDef = {
    name: 'epic',
    transitions: {
        0: { 4: 0.3, 5: 0.4, 3: 0.3 },                  // I -> V, vi (minor feel), IV
        3: { 0: 0.4, 4: 0.4, 5: 0.2 },                  // IV -> I, V
        4: { 5: 0.5, 0: 0.3, 2: 0.2 },                  // V -> vi (Deceptive), I
        5: { 3: 0.5, 4: 0.3, 0: 0.2 },                  // vi -> IV, V
        2: { 5: 0.6, 0: 0.4 }                           // iii -> vi
    },
    rhythms: [
        { name: "Ostinato", length: 16, pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
        { name: "Impacts", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0] }
    ],
    optimizeVoicing: (notes: number[]) => {
        return notes.sort((a, b) => a - b);
    }
};
