window.ChordApp = window.ChordApp || {};

(function () {
    const { NOTES, SCALES } = ChordApp.Constants;
    const { getChords, getChordMidiNotes } = ChordApp.Theory;

    // --- Data Structures ---

    const STYLES = {
        POP: 'pop',
        JAZZ: 'jazz',
        CLASSICAL: 'classical',
        DARK: 'dark'
    };

    // Transition Matrices: Probabilities of moving FROM -> TO (0-based scale degree indices)
    // Structure: { fromIndex: { toIndex: probability, ... }, ... }
    // If a transition is missing, it's assumed 0 probability (or fallback to uniform)

    const TRANSITIONS = {
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
        [STYLES.DARK]: {
            0: { 5: 0.4, 2: 0.3, 1: 0.3 }, // Favor minor movements
            1: { 4: 0.5, 6: 0.5 },
            2: { 5: 0.6, 1: 0.4 },
            5: { 1: 0.5, 3: 0.5 },
            // Locrian/Phrygian specifics handled by mode, but transitions favor tension
        }
    };

    // Rhythm Patterns
    // 'x': Play chord/note
    // '-': Sustain
    // '.': Rest (or just gap)
    // Numbers can represent velocity scalars (1 = full, 0.5 = half)
    // Structure: { ticks: [velocities per 16th note] }
    // 16 ticks per bar (4/4)

    const RHYTHMS = {
        [STYLES.POP]: [
            { name: "Whole Notes", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
            { name: "Driving 8ths", length: 16, pattern: [1, 0, 0.8, 0, 0.9, 0, 0.8, 0, 1, 0, 0.8, 0, 0.9, 0, 0.8, 0] },
            { name: "Syncopated", length: 16, pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0] } // 3-3-2 Clave-ish
        ],
        [STYLES.JAZZ]: [
            { name: "Charleston", length: 16, pattern: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0] }, // Dot-quarter, eighth
            { name: "Comping 1", length: 16, pattern: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0] }
        ]
    };

    // --- Helper Functions ---

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getWeightedRandom(transitions, currentIndex) {
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
            sum += probs[key];
            if (rand <= sum) return parseInt(key, 10);
        }

        // Fallback to last key
        return parseInt(keys[keys.length - 1], 10);
    }

    // --- Core Logic ---

    /**
     * Generates a progression of scale references (Scale Degrees).
     * @param {string} root - e.g. 'C'
     * @param {string} mode - e.g. 'ionian'
     * @param {object} options - { style, length }
     * @returns {object[]} Array of chord objects from Theory.getChords
     */
    function generateProgression(root, mode, options = {}) {
        const style = options.style || STYLES.POP;
        const length = options.length || 4; // Number of chords (bars)

        // 1. Get all available chords for this key/mode
        const scaleChords = getChords(root, mode);

        // 2. Start with Tonic (usually) or look at style
        const progressionIndices = [0]; // Always start on I for stability in this demo

        let currentIndex = 0;
        const matrix = TRANSITIONS[style] || TRANSITIONS[STYLES.POP];

        // 3. Walk the matrix
        for (let i = 1; i < length; i++) {
            // If it's the last chord and style suggests resolution, force V or IV?
            // For now, just random walk.
            const nextIndex = getWeightedRandom(matrix, currentIndex);
            progressionIndices.push(nextIndex);
            currentIndex = nextIndex;
        }

        // 4. Map indices to actual chord objects
        return progressionIndices.map(idx => scaleChords[idx]);
    }

    /**
     * Converts a chord progression into a timed MIDI event sequence.
     * @param {object[]} progression - Array of chord objects
     * @param {string} style - musical style for rhythm
     * @returns {object[]} Array of { notes: [], duration: ticks, velocity: 0-127, startTime: ticks }
     */
    function applyRhythm(progression, style = STYLES.POP) {
        const events = [];
        const PPQ = 128; // Ticks per quarter note
        const TICKS_PER_16TH = PPQ / 4;

        // Pick a rhythm pattern for the whole progression (or vary per bar?)
        // Let's pick one pattern for consistency for now.
        const rhythmPool = RHYTHMS[style] || RHYTHMS[STYLES.POP];
        const rhythm = getRandomElement(rhythmPool);

        let userExtensions = { extensions: false, variation: false };
        if (style === STYLES.JAZZ) {
            userExtensions.extensions = true; // Jazz implies 7ths
        }

        let currentTime = 0;

        progression.forEach(chord => {
            // 1 bar per chord
            const midiNotes = getChordMidiNotes(chord, userExtensions);

            // Apply Pattern
            rhythm.pattern.forEach((vel, index) => {
                if (vel > 0) {
                    // Note On
                    // Duration: determine how long until next note or rest?
                    // Simple approach: sustain until next 'x' or end of bar
                    // Better for staccato: fixed short duration?
                    // Let's do sustain-until-next-event for smooth legato, or fixed 16th for staccato?
                    // Let's use 16th note * legato factor (e.g. 0.9)

                    const duration = TICKS_PER_16TH * 3; // Sustain a bit (dotted 8th feel) or just full quarter?
                    // Actually, if pattern has many 0s, we should technically sustain?
                    // "Driving 8ths": 1, 0, 1, 0... 
                    // If we treat 0 as "sustain previous", we need a different format.
                    // If we treat 0 as "rest" or "nothing new", then we just trigger on 1.

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

    ChordApp.Engine = {
        STYLES,
        generateProgression,
        applyRhythm
    };

})();
