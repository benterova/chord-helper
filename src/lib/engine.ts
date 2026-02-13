import type { ScaleName } from './constants';
import { getChords, getChordMidiNotes, type Chord } from './theory';

export const STYLES = {
    POP: 'pop',
    JAZZ: 'jazz',
    BLUES: 'blues',
    RNB: 'rnb',
    ROCK: 'rock',
    LOFI: 'lofi',
    EPIC: 'epic',
    BOSSA: 'bossa',
    FOLK: 'folk',
    HYPERPOP: 'hyperpop',
    JPOP: 'jpop',
    FUTURE: 'future',
    DARK: 'dark'
} as const;

export type Style = typeof STYLES[keyof typeof STYLES];

// Transition Matrices: Probabilities of moving FROM -> TO (0-based scale degree indices)
type TransitionMatrix = Record<number, Record<number, number>>;

export const TRANSITIONS: Record<string, TransitionMatrix> = {
    [STYLES.POP]: {
        0: { 4: 0.3, 5: 0.3, 3: 0.2, 1: 0.1, 2: 0.1 }, // I -> V, vi, IV
        1: { 4: 0.6, 6: 0.2, 0: 0.2 },                  // ii -> V (strong), vii
        2: { 5: 0.5, 3: 0.3, 1: 0.2 },                  // iii -> vi, IV
        3: { 0: 0.4, 4: 0.4, 1: 0.2 },                  // IV -> I, V (plagal/dominant)
        4: { 0: 0.6, 5: 0.3, 3: 0.1 },                  // V -> I (resolution), vi (deceptive)
        5: { 3: 0.4, 1: 0.4, 4: 0.2 },                  // vi -> IV, ii
        6: { 0: 0.8, 5: 0.2 }                           // vii -> I (leading tone)
    },
    [STYLES.JAZZ]: {
        0: { 5: 0.3, 1: 0.3, 3: 0.2, 4: 0.2 },          // I -> vi, ii
        1: { 4: 0.9, 6: 0.1 },                          // ii -> V (classic ii-V)
        2: { 5: 0.8, 1: 0.2 },                          // iii -> vi (iii-vi-ii-V)
        3: { 1: 0.4, 4: 0.3, 6: 0.3 },                  // IV -> ii, V
        4: { 0: 0.8, 2: 0.1, 5: 0.1 },                  // V -> I
        5: { 1: 0.9, 3: 0.1 },                          // vi -> ii
        6: { 2: 0.5, 0: 0.5 }                           // vii -> iii
    },
    [STYLES.BLUES]: {
        0: { 3: 0.4, 4: 0.3, 0: 0.3 },                  // I -> IV, V, I (12-bar-ish tendencies)
        3: { 0: 0.5, 4: 0.2, 3: 0.3 },                  // IV -> I, V
        4: { 3: 0.5, 0: 0.5 },                          // V -> IV, I
        // Minimal usage of other degrees in standard blues, but allowed for jazz-blues
        1: { 4: 0.8, 0: 0.2 },
        5: { 1: 0.5, 3: 0.5 }
    },
    [STYLES.RNB]: {
        0: { 5: 0.3, 2: 0.3, 1: 0.2, 3: 0.2 },          // I -> vi, iii, ii
        1: { 4: 0.6, 6: 0.2, 0: 0.2 },                  // ii -> V
        2: { 5: 0.6, 3: 0.4 },                          // iii -> vi, IV
        3: { 1: 0.3, 4: 0.3, 6: 0.2, 3: 0.2 },          // IV -> ii, V
        4: { 0: 0.5, 2: 0.3, 5: 0.2 },                  // V -> I, iii (Neo-soul turnaround)
        5: { 1: 0.5, 3: 0.3, 4: 0.2 },                  // vi -> ii, IV
        6: { 2: 0.5, 0: 0.5 }
    },
    [STYLES.ROCK]: {
        0: { 3: 0.3, 4: 0.3, 6: 0.2, 5: 0.2 },          // I -> IV, V, bVII (if mixo), vi
        3: { 0: 0.4, 4: 0.4, 3: 0.2 },                  // IV -> I, V
        4: { 3: 0.4, 0: 0.5, 5: 0.1 },                  // V -> IV, I
        5: { 3: 0.5, 4: 0.3, 0: 0.2 },                  // vi -> IV, V
        6: { 3: 0.4, 0: 0.4, 4: 0.2 }                   // bVII (treated as vii index here) -> IV, I
    },
    [STYLES.LOFI]: {
        0: { 1: 0.3, 5: 0.3, 3: 0.2, 2: 0.2 },          // I -> ii, vi
        1: { 4: 0.7, 6: 0.3 },                          // ii -> V
        2: { 5: 0.6, 3: 0.4 },                          // iii -> vi
        3: { 1: 0.3, 4: 0.3, 0: 0.4 },                  // IV -> ii, V, I (Plagal)
        4: { 0: 0.5, 2: 0.3, 5: 0.2 },                  // V -> I
        5: { 1: 0.5, 3: 0.3, 4: 0.2 },
        6: { 2: 0.5, 0: 0.5 }
    },
    [STYLES.EPIC]: {
        0: { 4: 0.3, 5: 0.4, 3: 0.3 },                  // I -> V, vi (minor feel), IV
        3: { 0: 0.4, 4: 0.4, 5: 0.2 },                  // IV -> I, V
        4: { 5: 0.5, 0: 0.3, 2: 0.2 },                  // V -> vi (Deceptive), I
        5: { 3: 0.5, 4: 0.3, 0: 0.2 },                  // vi -> IV, V
        2: { 5: 0.6, 0: 0.4 }                           // iii -> vi
    },
    [STYLES.BOSSA]: {
        0: { 1: 0.4, 5: 0.3, 2: 0.3 },                  // I -> ii, vi
        1: { 4: 0.8, 6: 0.2 },                          // ii -> V
        2: { 5: 0.7, 1: 0.3 },                          // iii -> vi
        3: { 1: 0.4, 4: 0.4, 6: 0.2 },
        4: { 0: 0.7, 2: 0.3 },                          // V -> I
        5: { 1: 0.8, 3: 0.2 },                          // vi -> ii
        6: { 2: 0.5, 0: 0.5 }
    },
    [STYLES.FOLK]: {
        0: { 3: 0.3, 4: 0.3, 5: 0.3, 1: 0.1 },          // I -> IV, V, vi
        3: { 0: 0.5, 4: 0.5 },                          // IV -> I, V
        4: { 3: 0.4, 0: 0.5, 5: 0.1 },                  // V -> IV, I
        5: { 3: 0.5, 0: 0.3, 4: 0.2 },                  // vi -> IV, I
        1: { 4: 0.8, 0: 0.2 }
    },
    [STYLES.HYPERPOP]: {
        // Chaos but rooted in Pop. I-vi-IV-V but fast.
        0: { 5: 0.3, 3: 0.3, 4: 0.2, 1: 0.2 },
        3: { 0: 0.4, 4: 0.4, 1: 0.2 },
        4: { 0: 0.6, 5: 0.4 },
        5: { 3: 0.5, 1: 0.3, 4: 0.2 },
        // Hyperpop likes modal interchange/chromaticism but for this matrix we stick to diatonic
        1: { 4: 0.7, 6: 0.3 },
        6: { 0: 0.5, 2: 0.5 }
    },
    [STYLES.JPOP]: {
        // Royal Road (IV-V-iii-vi) = 3 -> 4 -> 2 -> 5
        0: { 3: 0.4, 4: 0.2, 5: 0.2, 1: 0.2 },
        3: { 4: 0.6, 0: 0.2, 1: 0.2 },                  // IV -> V (strongest in Jpop)
        4: { 2: 0.5, 0: 0.3, 5: 0.2 },                  // V -> iii (Royal Road)
        2: { 5: 0.8, 0: 0.1, 1: 0.1 },                  // iii -> vi (Royal Road)
        5: { 3: 0.4, 1: 0.4, 4: 0.2 },                  // vi -> IV (Komuro), ii
        1: { 4: 0.8, 0: 0.2 },
        6: { 2: 0.5, 0: 0.5 }
    },
    [STYLES.FUTURE]: {
        // Kawaii Future Bass: IV-V-iii-vi heavily used too. Lydian (IV start) focus.
        0: { 3: 0.5, 4: 0.3, 5: 0.2 },
        3: { 4: 0.6, 0: 0.2, 1: 0.2 },
        4: { 2: 0.5, 0: 0.4, 5: 0.1 },
        2: { 5: 0.8, 3: 0.2 },
        5: { 3: 0.5, 1: 0.3, 4: 0.2 },
        1: { 4: 0.8, 6: 0.2 },
        6: { 0: 0.5, 2: 0.5 }
    },
    [STYLES.DARK]: {
        0: { 5: 0.4, 2: 0.3, 1: 0.3 }, // Favor minor movements
        1: { 4: 0.5, 6: 0.5 },
        2: { 5: 0.6, 1: 0.4 },
        5: { 1: 0.5, 3: 0.5 },
        // Locrian/Phrygian specifics handled by mode, but transitions favor tension
    }
};

export interface RhythmPattern {
    name: string;
    length: number;
    pattern: number[];
}

export const RHYTHMS: Record<string, RhythmPattern[]> = {
    [STYLES.POP]: [
        { name: "Whole Notes", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { name: "Driving 8ths", length: 16, pattern: [1, 0, 0.8, 0, 0.9, 0, 0.8, 0, 1, 0, 0.8, 0, 0.9, 0, 0.8, 0] },
        { name: "Syncopated", length: 16, pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0] } // 3-3-2 Clave-ish
    ],
    [STYLES.JAZZ]: [
        { name: "Charleston", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0] }, // Dot-quarter, eighth
        { name: "Comping 1", length: 16, pattern: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0] },
        { name: "Swing 4", length: 16, pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] }
    ],
    [STYLES.BLUES]: [
        { name: "Shuffle", length: 16, pattern: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1] }, // Approximation of shuffle
        { name: "Slow 12/8", length: 16, pattern: [1, 0, 0, 0, 0.8, 0, 0, 0, 0.9, 0, 0, 0, 0.8, 0, 0, 0] }
    ],
    [STYLES.RNB]: [
        { name: "Neo Soul", length: 16, pattern: [1, 0, 0, 0.5, 0, 0, 0.8, 0, 0, 0.5, 0, 0, 1, 0, 0, 0] }, // Laid back
        { name: "Sparse", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 0, 0] }
    ],
    [STYLES.ROCK]: [
        { name: "Quarter Notes", length: 16, pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] },
        { name: "Power 8ths", length: 16, pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
        { name: "Alt Rock", length: 16, pattern: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0] }
    ],
    [STYLES.LOFI]: [
        { name: "Chill", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0.5, 0, 0, 0.6, 0, 0, 0, 0, 0.5, 0] },
        { name: "Late Night", length: 16, pattern: [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0.5, 0, 0, 0, 0, 0] }
    ],
    [STYLES.EPIC]: [
        { name: "Ostinato", length: 16, pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
        { name: "Impacts", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0] }
    ],
    [STYLES.BOSSA]: [
        { name: "Clave", length: 16, pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0] }
    ],
    [STYLES.FOLK]: [
        { name: "Strum 1", length: 16, pattern: [1, 0, 0.6, 0, 1, 0, 0.6, 0, 1, 0, 0.6, 0, 1, 0, 0.6, 0] },
        { name: "Fingerstyle", length: 16, pattern: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0] }
    ],
    [STYLES.HYPERPOP]: [
        { name: "Glitch 16ths", length: 16, pattern: [1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0] },
        { name: "Manic", length: 16, pattern: [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1] }
    ],
    [STYLES.JPOP]: [
        { name: "Driving Anime", length: 16, pattern: [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0] },
        { name: "Melodic Stream", length: 16, pattern: [1, 0.5, 1, 0, 1, 0.5, 1, 0, 1, 0.5, 1, 0, 1, 0.5, 1, 0] }
    ],
    [STYLES.FUTURE]: [
        { name: "Wub Sustain", length: 16, pattern: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0.5, 0, 1, 0, 0, 0] }, // Sidechain feel logic needed given sustain
        { name: "Super Saw Rhythm", length: 16, pattern: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0] } // 3-3-2 + extra
    ]
};

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getWeightedRandom(transitions: TransitionMatrix, currentIndex: number): number {
    const probs = transitions[currentIndex] || {};
    const keys = Object.keys(probs);

    if (keys.length === 0) {
        // Fallback: pick any valid degree (0-6) except maybe current
        let next = Math.floor(Math.random() * 7);
        if (next === currentIndex) next = (next + 1) % 7;
        return next;
    }

    const rand = Math.random();
    let sum = 0;

    // Normalize if needed, but assuming sum ~= 1.0 or just linear check
    for (const key of keys) {
        sum += probs[parseInt(key)];
        if (rand <= sum) return parseInt(key, 10);
    }

    // Fallback to last key
    return parseInt(keys[keys.length - 1], 10);
}

export function optimizeVoicing(notes: number[], style: Style): number[] {
    // Simple voicing optimizer
    // 1. Ensure root is in bass (move down octave if needed)
    // 2. Spread cluster chords

    // Clone array
    let voiced = [...notes];

    if (style === STYLES.JAZZ) {
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
    } else if (style === STYLES.DARK) {
        // Spread wide for cinematic feel
        // Move 3rd (second note usually) up an octave?
        if (voiced.length >= 3) {
            const third = voiced[1];
            voiced.splice(1, 1);
            voiced.push(third + 12);
        }
        // Deep bass
        if (voiced[0] > 48) voiced[0] -= 12;
    } else if (style === STYLES.RNB || style === STYLES.LOFI || style === STYLES.BOSSA) {
        // Extensions emphasis. Voicing similar to Jazz but maybe less drop-2, more clusters or shell.
        // Ensure Shell (Root, 3, 7) is clear.
        // If we have 9th, keep it on top.
        if (voiced[0] > 53) voiced[0] -= 12; // Deeper root
    } else if (style === STYLES.ROCK) {
        // Power chords preference if triad
        // If triad (1, 3, 5), maybe drop the 3rd or move it up?
        // Actually, keep it simple for now, just ensure root is grounded.
        if (voiced[0] > 50) voiced[0] -= 12;
    } else if (style === STYLES.FUTURE || style === STYLES.JPOP || style === STYLES.HYPERPOP) {
        // Big Stacks. J-Pop loves piano voicings (Left Hand Octaves, Right Hand shell+melody).
        // Future Bass loves "Super Saws" - essentially 7th/9th chords clustered in mid-high register + Bass.

        // Drop Root 1 octave
        if (voiced[0] > 48) voiced[0] -= 12;

        // Ensure we have a high "sheen" (if only 3 notes, duplicate root or 5th up)
        if (voiced.length < 4) {
            voiced.push(voiced[0] + 24); // Add 2 octaves up root
        }
    }

    return voiced.sort((a, b) => a - b);
}

export interface GenerateOptions {
    style?: Style;
    length?: number;
}

export function generateProgression(root: string, mode: ScaleName, options: GenerateOptions = {}): Chord[] {
    const style = options.style || STYLES.POP;
    const length = options.length || 4; // Number of chords (bars)

    // 1. Get all available chords for this key/mode
    const scaleChords = getChords(root, mode);

    // 2. Start with Tonic (usually) or look at style
    const progressionIndices = [0]; // Always start on I for stability in this demo

    let currentIndex = 0;
    const matrixOrUndefined = TRANSITIONS[style];
    const matrix = matrixOrUndefined || TRANSITIONS[STYLES.POP];


    // 3. Walk the matrix
    for (let i = 1; i < length; i++) {
        const nextIndex = getWeightedRandom(matrix, currentIndex);
        progressionIndices.push(nextIndex);
        currentIndex = nextIndex;
    }

    // 4. Map indices to actual chord objects
    return progressionIndices.map(idx => scaleChords[idx]);
}

export interface MidiEvent {
    notes: number[];
    velocity: number;
    duration: number;
    startTime: number;
}

export function applyRhythm(progression: Chord[], style: Style = STYLES.POP, enableRhythm: boolean = true): MidiEvent[] {
    const events: MidiEvent[] = [];
    const PPQ = 128;
    const TICKS_PER_16TH = PPQ / 4;

    let rhythmPool = RHYTHMS[style] || RHYTHMS[STYLES.POP];

    // If rhythm is disabled, override with a simple Whole Note pattern
    if (!enableRhythm) {
        rhythmPool = [{ name: "Sustained", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }];
    }

    const rhythm = getRandomElement(rhythmPool);

    let userExtensions = { extensions: false, variation: false };
    if (style === STYLES.JAZZ || style === STYLES.RNB || style === STYLES.LOFI ||
        style === STYLES.BOSSA || style === STYLES.FUTURE || style === STYLES.JPOP || style === STYLES.HYPERPOP) {
        userExtensions.extensions = true;
    }

    let currentTime = 0;

    progression.forEach(chord => {
        const rawNotes = getChordMidiNotes(chord, userExtensions);
        const midiNotes = optimizeVoicing(rawNotes, style);

        // Apply Pattern
        rhythm.pattern.forEach((vel, index) => {
            if (vel > 0) {
                // Note On
                // Let's treat current pattern as triggers.
                // Duration = find next trigger index or end of bar
                let stepsToNext = 1;
                for (let f = index + 1; f < rhythm.pattern.length; f++) {
                    if (rhythm.pattern[f] > 0) break;
                    stepsToNext++;
                }

                const noteDuration = stepsToNext * TICKS_PER_16TH;

                events.push({
                    notes: midiNotes,
                    velocity: Math.floor(vel * 100), // Scale 0-1 to 0-127 (roughly)
                    duration: noteDuration,
                    startTime: currentTime + (index * TICKS_PER_16TH)
                });
            }
        });

        currentTime += (16 * TICKS_PER_16TH); // Advance 1 bar
    });

    return events;
}
