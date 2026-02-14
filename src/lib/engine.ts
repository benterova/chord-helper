import type { ScaleName } from './constants';
import { getChords, getChordMidiNotes, getBorrowedChords, type Chord } from './theory';
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

    // 1b. Get borrowed chords
    const borrowedChords = getBorrowedChords(root, mode);

    // 2. Start with Tonic (usually) or look at style
    let firstIndex = 0;
    if (styleDef.startingChordProbabilities) {
        firstIndex = getWeightedRandom(styleDef.startingChordProbabilities as any, -1);
    } else {
        const defaultStarts = { 0: 0.6, 3: 0.1, 4: 0.1, 5: 0.1 };
        firstIndex = getWeightedRandom(defaultStarts as any, -1);
    }
    if (firstIndex >= scaleChords.length) firstIndex = 0;

    const progressionIndices = [firstIndex];
    let currentIndex = firstIndex;
    const matrix = styleDef.transitions; // Dict<number, Dict<number, prob>>

    // 3. Walk the matrix
    for (let i = 1; i < length; i++) {
        // Chance to borrow a chord? (Only if we have them and we are not in a strict constrained style?)
        // Let's say 15% chance, but only if we are on a stable chord (I, IV, V)
        const canBorrow = borrowedChords.length > 0 && Math.random() < 0.15;

        if (canBorrow) {
            // Pick a random borrowed chord
            const bIndex = Math.floor(Math.random() * borrowedChords.length);
            // We use a fake index > 100 to represent borrowed
            progressionIndices.push(100 + bIndex);

            // Borrowed chords usually resolve to I, IV, or V.
            // Let's force the NEXT chord (if exists) to be stable indices [0, 3, 4]
            // We set 'currentIndex' to something generic like 0 or 4 so the next iteration picks a logical follower
            // If we set it to 4 (Dominant), it likely goes to I.
            // If we set to 0 (Tonic), it goes anywhere.
            // Let's set it to 4 to encourage resolution.
            currentIndex = 4;
        } else {
            let nextIndex = getWeightedRandom(matrix, currentIndex);
            if (nextIndex >= scaleChords.length) nextIndex = nextIndex % scaleChords.length;

            progressionIndices.push(nextIndex);
            currentIndex = nextIndex;
        }
    }

    return progressionIndices.map(idx => {
        if (idx >= 100) return borrowedChords[idx - 100] || scaleChords[0];
        return scaleChords[idx];
    });
}

function gaussianRandom(mean: number, stdDev: number): number {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
}

export function applyRhythm(progression: Chord[], style: Style = STYLES.POP, enableRhythm: boolean = true): MidiEvent[] {
    const events: MidiEvent[] = [];
    const PPQ = 128;
    const TICKS_PER_16TH = PPQ / 4;

    const styleDef = ALL_STYLES[style] || ALL_STYLES[STYLES.POP];
    let rhythmPool = styleDef.rhythms;

    if (!enableRhythm) {
        rhythmPool = [{ name: "Sustained", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }];
    }

    // Select a Main Rhythm and a Fill Rhythm
    const mainRhythm = getRandomElement(rhythmPool);
    const fillRhythm = rhythmPool.length > 1
        ? rhythmPool.find(r => r !== mainRhythm) || mainRhythm
        : mainRhythm;

    let userExtensions = { extensions: false, variation: false };
    const extensiveStyles: Style[] = [STYLES.JAZZ, STYLES.RNB, STYLES.LOFI, STYLES.BOSSA, STYLES.FUTURE, STYLES.JPOP, STYLES.HYPERPOP];
    if (extensiveStyles.includes(style)) {
        userExtensions.extensions = true;
    }

    let currentTime = 0;
    const DEFAULT_TICKS_PER_STEP = TICKS_PER_16TH;

    progression.forEach((chord, barIndex) => {
        // Determine if this bar is a "fill" bar (every 4th bar, or last bar)
        const isFill = (barIndex + 1) % 4 === 0 || barIndex === progression.length - 1;
        const currentRhythm = (isFill && enableRhythm) ? fillRhythm : mainRhythm;

        // 1. CHORD VOICING
        const rawNotes = getChordMidiNotes(chord, userExtensions);
        const uniqueNotes = Array.from(new Set(rawNotes)); // dedupe
        const midiNotes = styleDef.optimizeVoicing(uniqueNotes);

        const stepTicks = currentRhythm.ticksPerStep || DEFAULT_TICKS_PER_STEP;

        // Apply Chord Pattern
        currentRhythm.pattern.forEach((vel, index) => {
            if (vel > 0) {
                let stepsToNext = 1;
                for (let f = index + 1; f < currentRhythm.pattern.length; f++) {
                    if (currentRhythm.pattern[f] > 0) break;
                    stepsToNext++;
                }
                const noteDuration = stepsToNext * stepTicks;

                // Humanize Velocity
                const humanVel = Math.min(127, Math.max(1, Math.floor(vel * 100 + gaussianRandom(0, 5))));

                // Humanize Timing (Micro-offset) - minimal
                const humanTime = Math.max(0, currentTime + (index * stepTicks) + (enableRhythm ? gaussianRandom(0, 3) : 0));

                events.push({
                    notes: midiNotes,
                    velocity: humanVel,
                    duration: noteDuration * 0.95, // slight gap for articulation
                    startTime: humanTime
                });
            }
        });

        // 2. BASSLINE (Simulated)
        if (enableRhythm) {
            const rootNote = midiNotes[0]; // Lowest note of voicing usually
            // Find a deep bass note (approx MIDI 36-48 [C1-C2])
            let bassNote = rootNote;
            while (bassNote > 48) bassNote -= 12;
            while (bassNote < 36) bassNote += 12;

            // Bass Pattern: Simple Root on One, maybe Fifth on Three
            // Or follow kick drum philosophy.
            // Let's do a simple pattern based on style
            const bassPattern = [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]; // Root on 1 and 3 (16th steps: 0 and 8)

            if (style === STYLES.ROCK || style === STYLES.POP) {
                // 8th notes
                // bassPattern could be more driving
            }

            bassPattern.forEach((bVel, bIdx) => {
                if (bVel > 0) {
                    const isOne = bIdx === 0;
                    const velocity = isOne ? 110 : 90;

                    events.push({
                        notes: [bassNote],
                        velocity: velocity,
                        duration: stepTicks * 2,
                        startTime: currentTime + (bIdx * stepTicks)
                    });
                }
            });
        }

        // Advance
        currentTime += (currentRhythm.length * stepTicks);
    });

    return events;
}


