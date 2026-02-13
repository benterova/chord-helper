import type { ScaleName } from './constants';
import { getChords, getChordMidiNotes, type Chord } from './theory';
import { ALL_STYLES, STYLES, type Style, type MidiEvent } from './styles';

export { STYLES, type Style };
export type { MidiEvent };

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getWeightedRandom(transitions: Record<number, Record<number, number>>, currentIndex: number): number {
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

export interface GenerateOptions {
    style?: Style;
    length?: number;
}

export function generateProgression(root: string, mode: ScaleName, options: GenerateOptions = {}): Chord[] {
    const styleName = options.style || STYLES.POP;
    const length = options.length || 4; // Number of chords (bars)

    const styleDef = ALL_STYLES[styleName] || ALL_STYLES[STYLES.POP];

    // 1. Get all available chords for this key/mode
    const scaleChords = getChords(root, mode);

    // 2. Start with Tonic (usually) or look at style
    const progressionIndices = [0]; // Always start on I for stability in this demo

    let currentIndex = 0;
    const matrix = styleDef.transitions;

    // 3. Walk the matrix
    for (let i = 1; i < length; i++) {
        const nextIndex = getWeightedRandom(matrix, currentIndex);
        progressionIndices.push(nextIndex);
        currentIndex = nextIndex;
    }

    // 4. Map indices to actual chord objects
    return progressionIndices.map(idx => scaleChords[idx]);
}

export function applyRhythm(progression: Chord[], style: Style = STYLES.POP, enableRhythm: boolean = true): MidiEvent[] {
    const events: MidiEvent[] = [];
    const PPQ = 128;
    const TICKS_PER_16TH = PPQ / 4;

    const styleDef = ALL_STYLES[style] || ALL_STYLES[STYLES.POP];
    let rhythmPool = styleDef.rhythms;

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
        const midiNotes = styleDef.optimizeVoicing(rawNotes);

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
