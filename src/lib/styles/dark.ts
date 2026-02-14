import type { StyleDef } from './interfaces';

export const dark: StyleDef = {
    name: 'dark',
    transitions: {
        0: { 5: 0.4, 2: 0.3, 1: 0.3 }, // Favor minor movements
        1: { 4: 0.5, 6: 0.5 },
        2: { 5: 0.6, 1: 0.4 },
        5: { 1: 0.5, 3: 0.5 },
        // Locrian/Phrygian specifics handled by mode, but transitions favor tension
    },
    rhythms: [
        // Defaulting to "Sustained" or borrowing from others if not specified, 
        // but original code didn't have specific Dark rhythms in the map?
        // Checking original file... 
        // Original `RHYTHMS` object did NOT have `[STYLES.DARK]`.
        // It used fallback or maybe I missed it.
        // Wait, I see `[STYLES.DARK]` in `TRANSITIONS` but not `RHYTHMS`.
        // If I look at `applyRhythm` in `engine.ts`:
        // `let rhythmPool = RHYTHMS[style] || RHYTHMS[STYLES.POP];`
        // So it fell back to POP rhythms.
        // I'll leave it empty here and handle fallback or just add Pop rhythms?
        // Better explicit: I'll add a simple "Drone" rhythm or just copy Pop rhythms for now.
        // Actually, let's give it a "Drone" rhythm.
        { name: "Drone", length: 16, pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] }
    ],
    optimizeVoicing: (notes: number[]) => {
        const voiced = [...notes];
        // Spread wide for cinematic feel
        // Move 3rd (second note usually) up an octave?
        if (voiced.length >= 3) {
            const third = voiced[1];
            voiced.splice(1, 1);
            voiced.push(third + 12);
        }
        // Deep bass
        if (voiced[0] > 48) voiced[0] -= 12;
        return voiced.sort((a, b) => a - b);
    }
};
