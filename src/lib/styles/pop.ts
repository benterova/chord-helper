import type { StyleDef } from './interfaces';

export const pop: StyleDef = {
    name: 'pop',
    transitions: {
        0: { 4: 0.3, 5: 0.3, 3: 0.2, 1: 0.1, 2: 0.1 }, // I -> V, vi, IV
        1: { 4: 0.6, 6: 0.2, 0: 0.2 },                  // ii -> V (strong), vii
        2: { 5: 0.5, 3: 0.3, 1: 0.2 },                  // iii -> vi, IV
        3: { 0: 0.4, 4: 0.4, 1: 0.2 },                  // IV -> I, V (plagal/dominant)
        4: { 0: 0.6, 5: 0.3, 3: 0.1 },                  // V -> I (resolution), vi (deceptive)
        5: { 3: 0.4, 1: 0.4, 4: 0.2 },                  // vi -> IV, ii
        6: { 0: 0.8, 5: 0.2 }                           // vii -> I (leading tone)
    },
    rhythms: [
        { name: "Whole Notes", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { name: "Driving 8ths", length: 16, pattern: [1, 0, 0.8, 0, 0.9, 0, 0.8, 0, 1, 0, 0.8, 0, 0.9, 0, 0.8, 0] },
        { name: "Syncopated", length: 16, pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0] } // 3-3-2 Clave-ish
    ],
    optimizeVoicing: (notes: number[]) => {
        // Default behavior: just sort
        return notes.sort((a, b) => a - b);
    }
};
