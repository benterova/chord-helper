import type { StyleDef } from './interfaces';

export const jazz: StyleDef = {
    name: 'jazz',
    transitions: {
        0: { 5: 0.3, 1: 0.3, 3: 0.2, 4: 0.2 },          // I -> vi, ii
        1: { 4: 0.9, 6: 0.1 },                          // ii -> V (classic ii-V)
        2: { 5: 0.8, 1: 0.2 },                          // iii -> vi (iii-vi-ii-V)
        3: { 1: 0.4, 4: 0.3, 6: 0.3 },                  // IV -> ii, V
        4: { 0: 0.8, 2: 0.1, 5: 0.1 },                  // V -> I
        5: { 1: 0.9, 3: 0.1 },                          // vi -> ii
        6: { 2: 0.5, 0: 0.5 }                           // vii -> iii
    },
    rhythms: [
        { name: "Charleston", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0] }, // Dot-quarter, eighth
        { name: "Comping 1", length: 16, pattern: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0] },
        { name: "Swing 4", length: 16, pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] },
        {
            name: "Triplet Feel",
            length: 12, // 12 notes per bar (12/8 feel)
            ticksPerStep: 43, // 128 PPQ / 3 ~= 42.66. Using 43. 12 * 43 = 516 (approx 512). slightly rush/drag but works for feel.
            pattern: [
                1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1 // Ride pattern feel
            ]
        }
    ],
    optimizeVoicing: (notes: number[]) => {
        const voiced = [...notes];
        // Drop 2 Voicing Strategy (simplified)
        // Take the second highest note and drop it an octave
        if (voiced.length >= 4) {
            // Sort
            voiced.sort((a, b) => a - b);
            const secondHighest = voiced[voiced.length - 2];
            // Remove it
            voiced.splice(voiced.length - 2, 1);
            // Add octave down
            voiced.unshift(secondHighest - 12);
        }

        // Ensure Bass Root is deep
        // If root (lowest) is > 55 (G2), drop it octave
        if (voiced[0] > 55) {
            voiced[0] -= 12;
        }
        return voiced.sort((a, b) => a - b);
    }
};
