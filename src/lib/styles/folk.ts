import type { StyleDef } from './interfaces';

export const folk: StyleDef = {
    name: 'folk',
    transitions: {
        0: { 3: 0.3, 4: 0.3, 5: 0.3, 1: 0.1 },          // I -> IV, V, vi
        3: { 0: 0.5, 4: 0.5 },                          // IV -> I, V
        4: { 3: 0.4, 0: 0.5, 5: 0.1 },                  // V -> IV, I
        5: { 3: 0.5, 0: 0.3, 4: 0.2 },                  // vi -> IV, I
        1: { 4: 0.8, 0: 0.2 }
    },
    rhythms: [
        { name: "Strum 1", length: 16, pattern: [1, 0, 0.6, 0, 1, 0, 0.6, 0, 1, 0, 0.6, 0, 1, 0, 0.6, 0] },
        { name: "Fingerstyle", length: 16, pattern: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0] }
    ],
    optimizeVoicing: (notes: number[]) => {
        return notes.sort((a, b) => a - b);
    }
};
