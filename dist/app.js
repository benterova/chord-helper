window.ChordApp = window.ChordApp || {};

(function () {
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

    // Scale intervals (semitones from root)
    const SCALES = {
        ionian: [0, 2, 4, 5, 7, 9, 11], // Major
        dorian: [0, 2, 3, 5, 7, 9, 10],
        phrygian: [0, 1, 3, 5, 7, 8, 10],
        lydian: [0, 2, 4, 6, 7, 9, 11],
        mixolydian: [0, 2, 4, 5, 7, 9, 10],
        natural_minor: [0, 2, 3, 5, 7, 8, 10], // Natural Minor (Aeolian)
        locrian: [0, 1, 3, 5, 6, 8, 10],
        harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
        melodic_minor: [0, 2, 3, 5, 7, 9, 11],
        major_pentatonic: [0, 2, 4, 7, 9],
        minor_pentatonic: [0, 3, 5, 7, 10],
        blues: [0, 3, 5, 6, 7, 10]
    };

    // Map display names to keys
    const MODE_DISPLAY_NAMES = {
        ionian: 'Major (Ionian)',
        dorian: 'Dorian',
        phrygian: 'Phrygian',
        lydian: 'Lydian',
        mixolydian: 'Mixolydian',
        natural_minor: 'Natural Minor',
        locrian: 'Locrian',
        harmonic_minor: 'Harmonic Minor',
        melodic_minor: 'Melodic Minor',
        major_pentatonic: 'Major Pentatonic',
        minor_pentatonic: 'Minor Pentatonic',
        blues: 'Blues'
    };

    // Common Progressions for demo purposes
    // NOTE: Uses 'indices' array (0-based scale degree index) for compatibility
    const PROGRESSIONS = {
        ionian: [
            { name: "Pop Changes", indices: [0, 4, 5, 3], genre: "Pop" },
            { name: "Jazz Turnaround", indices: [1, 4, 0, 5], genre: "Jazz" },
            { name: "Doo-Wop", indices: [0, 5, 3, 4], genre: "Oldies" },
            { name: "Canon", indices: [0, 4, 5, 2, 3, 0, 3, 4], genre: "Classical" }
        ],
        dorian: [
            { name: 'So What (i-VII)', genre: 'Jazz', indices: [0, 6] },
            { name: 'Santana (i-IV)', genre: 'Rock', indices: [0, 3] },
            { name: 'Funk Groove (i-IV-i-VII)', genre: 'Funk', indices: [0, 3, 0, 6] }
        ],
        phrygian: [
            { name: 'Phrygian Vamp (i-II)', genre: 'Metal', indices: [0, 1] }
        ],
        lydian: [
            { name: 'Lydian Dream (I-II)', genre: 'Cinematic', indices: [0, 1] }
        ],
        mixolydian: [
            { name: 'Classic Rock (I-bVII-IV)', genre: 'Rock', indices: [0, 6, 3] }
        ],
        natural_minor: [
            { name: "Pop Minor", indices: [0, 5, 2, 6], genre: "Pop" },
            { name: "Sad Ballad", indices: [0, 3, 5, 4], genre: "Ballad" },
            { name: "Andalucian", indices: [0, 6, 5, 4], genre: "Flamenco" }
        ],
        locrian: [
            { name: 'Locrian Tension (i-bII)', genre: 'Dark', indices: [0, 1] }
        ],
        harmonic_minor: [
            { name: "Classical Minor", indices: [0, 3, 4, 0], genre: "Classical" },
            { name: "Vamp", indices: [0, 4], genre: "Latin" }
        ],
        melodic_minor: [
            { name: "Jazz Minor", indices: [0, 1, 4, 0], genre: "Jazz" }
        ],
        major_pentatonic: [
            { name: "Country Road", indices: [0, 4, 3, 0], genre: "Country" }, // C, A, G, C
            { name: "Simple Myx", indices: [0, 1, 2, 0], genre: "Folk" }
        ],
        minor_pentatonic: [
            { name: "Rock Riff", indices: [0, 2, 3, 0], genre: "Rock" }, // A, D, E, A
            { name: "Groove", indices: [0, 4, 3, 0], genre: "Funk" }
        ],
        blues: [
            { name: "12-Bar Blues", indices: [0, 3, 4], genre: "Blues" } // Simplified for now
        ]
    };

    ChordApp.Constants = {
        NOTES,
        CIRCLE_OF_FIFTHS,
        SCALES,
        MODE_DISPLAY_NAMES,
        PROGRESSIONS
    };
})();
window.ChordApp = window.ChordApp || {};

(function () {
    const { NOTES, SCALES } = ChordApp.Constants;

    function getScaleNotes(root, mode) {
        const rootIndex = NOTES.indexOf(root);
        const intervals = SCALES[mode.toLowerCase()]; // handle case insensitivity
        if (!intervals) return [];

        return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
    }

    function getChords(root, mode) {
        const scaleNotes = getScaleNotes(root, mode);

        return scaleNotes.map((note, index) => {
            const len = scaleNotes.length;
            // 1. Get the notes for this chord (Root, 3rd, 5th, 7th, 9th)
            const rootNote = scaleNotes[index];
            const thirdNote = scaleNotes[(index + 2) % len];
            const fifthNote = scaleNotes[(index + 4) % len];
            const seventhNote = scaleNotes[(index + 6) % len];
            const ninthNote = scaleNotes[(index + 1) % len]; // 9th is same note class as 2nd

            // 2. Calculate intervals from Root to determine quality
            const rIndex = NOTES.indexOf(rootNote);
            const tIndex = NOTES.indexOf(thirdNote);
            const fIndex = NOTES.indexOf(fifthNote);
            const sIndex = NOTES.indexOf(seventhNote);
            const nIndex = NOTES.indexOf(ninthNote);

            // Handle chromatic wrapping
            let distThird = (tIndex - rIndex + 12) % 12;
            let distFifth = (fIndex - rIndex + 12) % 12;
            let distSeventh = (sIndex - rIndex + 12) % 12;
            let distNinth = (nIndex - rIndex + 12) % 12;

            let quality = 'unknown';
            let suffix = '';
            let romanCase = 'lower'; // default
            let symbol = '';

            // Check Triads & Extended
            if (distThird === 4 && distFifth === 7) {
                quality = 'major';
                romanCase = 'upper';
            }
            else if (distThird === 3 && distFifth === 7) {
                quality = 'minor';
                suffix = 'm';
                romanCase = 'lower';
            }
            else if (distThird === 3 && distFifth === 6) {
                quality = 'dim';
                suffix = 'dim';
                romanCase = 'lower';
                symbol = '°';
            }
            // Augmented Triad
            else if (distThird === 4 && distFifth === 8) {
                quality = 'aug';
                suffix = 'aug';
                romanCase = 'upper';
                symbol = '+';
            }

            // 3. Generate Roman Numeral
            const baseRoman = getRomanNumeral(index + 1);
            let roman = romanCase === 'upper' ? baseRoman : baseRoman.toLowerCase();
            roman += symbol;

            return {
                root: rootNote,
                chordName: rootNote + suffix,
                roman: roman,
                quality: quality,
                degree: index + 1,
                intervals: {
                    third: distThird,
                    fifth: distFifth,
                    seventh: distSeventh,
                    ninth: distNinth
                }
            };
        });
    }

    function getRomanNumeral(num) {
        const map = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII' };
        return map[num];
    }

    function getChordMidiNotes(chord, options = {}) {
        const noteMap = { 'C': 60, 'C#': 61, 'D': 62, 'D#': 63, 'E': 64, 'F': 65, 'F#': 66, 'G': 67, 'G#': 68, 'A': 69, 'A#': 70, 'B': 71 };
        let rootMidi = noteMap[chord.root];

        let intervals = [0]; // Always root

        if (chord.intervals) {
            // Use calculated intervals if available (more accurate to mode)
            intervals.push(chord.intervals.third);
            intervals.push(chord.intervals.fifth);

            if (options.extensions) {
                intervals.push(chord.intervals.seventh);

                // Add 9th only if variation requested (adds color)
                if (options.variation) {
                    intervals.push(chord.intervals.ninth + 12); // 9th is usually played an octave up
                }
            }
        } else {
            // Fallback for basic triads if intervals missing
            intervals.push(4, 7);
            if (chord.quality === 'minor') intervals = [0, 3, 7];
            if (chord.quality === 'dim') intervals = [0, 3, 6];
            if (chord.quality === 'aug') intervals = [0, 4, 8];
        }

        return intervals.map(i => rootMidi + i);
    }

    function getChordNotes(chord) {
        // Re-calculate notes based on intervals and root
        const rootIndex = NOTES.indexOf(chord.root);
        if (rootIndex === -1) return [];

        let intervals = [0]; // Root
        if (chord.intervals) {
            intervals.push(chord.intervals.third);
            intervals.push(chord.intervals.fifth);
            // We could add 7th/9th but usually circle shows triads. 
            // Let's stick to triad for the basic hover.
        } else {
            // Fallback
            intervals.push(4, 7);
            if (chord.quality === 'minor') intervals = [0, 3, 7];
            if (chord.quality === 'dim') intervals = [0, 3, 6];
            if (chord.quality === 'aug') intervals = [0, 4, 8];
        }

        return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
    }

    function generateVariationSequence(indices, chords, useVariation, useExtensions, useVoicing) {
        const selectedChords = indices.map(i => chords[i]);

        // Helper to apply extensions to a chord if requested
        const applyExtensions = (chord, degree) => {
            if (!useExtensions) return { noteOptions: { extensions: false, variation: false }, suffix: '' };

            let noteOptions = { extensions: true, variation: false };
            let suffix = '7'; // Default to 7th

            // Smart 9ths: Add 9th only to stable degrees (I, II, IV, V, vi)
            // Avoid III (usually Phrygian-like in Major, can be flat 9) and VII (Locrian, definitely flat 9 dissonant)
            // Ideally we check intervals, but degree heuristic is okay for Diatonic Major/Minor usage.
            // In Major: 1, 2, 4, 5, 6 are safe-ish. 3 (min7b9 usually avoided), 7 (m7b5b9 avoided).

            if ([1, 2, 4, 5, 6].includes(degree)) {
                noteOptions.variation = true; // Add 9th
                suffix = '9';
            }

            // Adjust suffix string based on quality for display
            if (chord.quality === 'major') suffix = suffix === '7' ? 'maj7' : 'maj9';
            else if (chord.quality === 'minor') suffix = suffix === '7' ? 'm7' : 'm9';
            else if (chord.quality === 'dim') suffix = suffix === '7' ? 'dim7' : 'dim7'; // simplified
            else if (chord.quality === 'aug') suffix = suffix === '7' ? 'aug7' : 'aug9';

            return { noteOptions, suffix };
        };

        // Helper: Calculate average pitch of a note array
        const getAveragePitch = (notes) => notes.reduce((a, b) => a + b, 0) / notes.length;

        // Helper: Get Inversions for a set of MIDI notes
        // Returns array of [RootPos, 1stInv, 2ndInv] (all MIDI arrays)
        const getInversions = (notes) => {
            // Assumes notes are sorted [lowest, ..., highest]
            // Root Position: [n1, n2, n3, (n4...)]
            // 1st Inversion: [n2, n3, (n4...), n1 + 12]
            // 2nd Inversion: [n3, (n4...), n1 + 12, n2 + 12]
            // For simplicity, we just rotate the lowest note up an octave.

            const rootPos = [...notes];

            const firstInv = [...notes];
            const lowest1 = firstInv.shift();
            firstInv.push(lowest1 + 12);
            firstInv.sort((a, b) => a - b);

            const secondInv = [...firstInv];
            const lowest2 = secondInv.shift();
            secondInv.push(lowest2 + 12);
            secondInv.sort((a, b) => a - b);

            // We could go to 3rd inversion for 7th chords, but let's stick to these 3 for stability.
            // If it's a 9th chord (5 notes), logic holds (rotate lowest).

            return [rootPos, firstInv, secondInv];
        };

        // 2-Bar Loop Logic OR Standard logic, generate full sequence first
        const loopCount = useVariation ? 2 : 1;
        const fullSequence = [];

        for (let bar = 1; bar <= loopCount; bar++) {
            selectedChords.forEach((chord, i) => {
                let currentChord = chord;

                // Variation in Bar 2, Last Chord (Turnaround)
                if (useVariation && bar === 2 && i === selectedChords.length - 1) {
                    const degreeV = chords.find(c => c.degree === 5);
                    const degreeI = chords.find(c => c.degree === 1);

                    if (chord.degree !== 5 && degreeV) {
                        currentChord = degreeV;
                    } else if (chord.degree === 5 && degreeI) {
                        currentChord = degreeI;
                    }
                }

                const { noteOptions, suffix } = applyExtensions(currentChord, currentChord.degree);

                // Get basic notes (Root position)
                let baseNotes = getChordMidiNotes(currentChord, noteOptions);

                // Ideally we center the first chord around C4 (60)
                // getChordMidiNotes returns notes in octave 4 (starts at ~48-59).
                // Let's ensure standard range.

                const chordObj = {
                    ...currentChord,
                    chordName: useExtensions ? currentChord.root + suffix : currentChord.chordName,
                    midiNotes: baseNotes,
                    durationMultiplier: 1,
                    originalNotes: baseNotes // For reference
                };

                fullSequence.push(chordObj);
            });
        }

        // Apply Voice Leading (if requested)
        if (useVoicing && fullSequence.length > 0) {

            // Helper: Get all valid inversions and octave shifts for a chord
            // Returns array of arrays of notes
            const getCandidates = (originalNotes) => {
                const results = [];
                // 1. Generate inversions in base octave
                const inversions = getInversions(originalNotes);

                // 2. For each inversion, generate octave shifts (+/- 1 octave)
                inversions.forEach(inv => {
                    // Original octave
                    results.push(inv);
                    // Down 1 octave
                    results.push(inv.map(n => n - 12));
                    // Up 1 octave
                    results.push(inv.map(n => n + 12));
                });

                // 3. Filter by Range
                // Hard limits: Lowest note must be >= 41 (F2), Highest <= 84 (C6)
                // Middle C is 60. F2 (41) is low E string on bass/low piano.
                return results.filter(notes => {
                    const min = Math.min(...notes);
                    const max = Math.max(...notes);
                    return min >= 41 && max <= 84;
                });
            };

            // Helper: Calculate cost of transition
            // Cost = (Voice Movement)^2 + (Center Gravity Distance * weight)
            const calculateCost = (prevNotes, currentNotes) => {
                // 1. Voice Movement Cost
                // Sort both to compare low-to-low, high-to-high (simplistic but effective for block chords)
                const sortedPrev = [...prevNotes].sort((a, b) => a - b);
                const sortedCurr = [...currentNotes].sort((a, b) => a - b);

                // Match length? (Should be same usually, if not, trunc/pad? Just use min length)
                // If counts differ (triad vs 7th), align by "center of mass" or just compare common indices.
                // For simplicity, let's assume similiar density. If not, just sum of min differences.

                let moveCost = 0;
                const count = Math.min(sortedPrev.length, sortedCurr.length);
                for (let i = 0; i < count; i++) {
                    // Squared distance penalizes big jumps more than many small ones
                    const diff = sortedCurr[i] - sortedPrev[i];
                    moveCost += (diff * diff);
                }

                // If sizes differ, penalize slightly?
                if (sortedPrev.length !== sortedCurr.length) moveCost += 5;

                // 2. Centering Cost
                // Pull towards Middle C (60)
                const avg = getAveragePitch(currentNotes);
                const distFromCenter = Math.abs(avg - 60);
                // Weight: .5 means 1 semitone off center is worth 0.5 movement points. 
                // We want strict centering to avoid drift.
                const centerCost = (distFromCenter * distFromCenter) * 0.1;

                return moveCost + centerCost;
            };

            // Force first chord to be centered near Middle C (60)
            const firstCandidates = getCandidates(fullSequence[0].originalNotes);
            let bestFirst = firstCandidates[0];
            let minDist = 9999;
            firstCandidates.forEach(cand => {
                const dist = Math.abs(getAveragePitch(cand) - 60);
                if (dist < minDist) {
                    minDist = dist;
                    bestFirst = cand;
                }
            });
            fullSequence[0].midiNotes = bestFirst;

            // Iterate through rest
            for (let i = 1; i < fullSequence.length; i++) {
                const prevNotes = fullSequence[i - 1].midiNotes;

                const candidates = getCandidates(fullSequence[i].originalNotes);

                if (candidates.length === 0) {
                    // Fallback if no valid candidates found (unlikely), stick to orig or last valid
                    fullSequence[i].midiNotes = fullSequence[i].originalNotes;
                    continue;
                }

                let bestCand = candidates[0];
                let minCost = 999999;

                candidates.forEach(cand => {
                    const cost = calculateCost(prevNotes, cand);
                    if (cost < minCost) {
                        minCost = cost;
                        bestCand = cand;
                    }
                });

                fullSequence[i].midiNotes = bestCand;
            }
        }

        return fullSequence;
    }

    ChordApp.Theory = {
        getScaleNotes,
        getChords,
        getChordMidiNotes,
        getChordNotes,
        generateVariationSequence
    };
})();
window.ChordApp = window.ChordApp || {};

(function () {
    const { getChordMidiNotes } = ChordApp.Theory;

    function downloadProgressionMidi(name, sequence, root, mode, options = {}) {
        const PPQ = 128; // Ticks per Quarter Note

        if (typeof Midi === 'undefined') {
            console.error("jsmidgen library not loaded");
            return;
        }

        const file = new Midi.File();
        const track = new Midi.Track();
        file.addTrack(track);

        // ... (Duration logic remains default for now)
        let defaultDuration = PPQ;

        sequence.forEach(chord => {
            const notes = chord.midiNotes; // Pre-calculated by Theory
            const duration = defaultDuration;

            try {
                track.addChord(0, notes, duration);
            } catch (e) {
                console.error("addChord failed", e);
                notes.forEach(n => track.addNote(0, n, duration));
            }
        });

        const bytes = file.toBytes();
        const byteArray = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            byteArray[i] = bytes.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;

        const safeName = name.replace(/[^a-z0-9\s-]/gi, '').replace(/\s+/g, '_');
        const safeRoot = root.replace('#', 's'); // Handle sharp in filename
        const safeMode = mode.toLowerCase();

        // Generate Filename Tags
        let tags = [];
        if (options.isExtension) tags.push('ext');
        if (options.isVoicing) tags.push('voiced');

        // Loop suffix
        if (options.isVariation) {
            tags.push('2bar_loop');
        } else {
            // Standard loop
            tags.push('loop');
        }

        const tagString = tags.length > 0 ? '_' + tags.join('_') : '';
        link.download = `${safeRoot}_${safeMode}_${safeName}${tagString}.mid`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function downloadGeneratedMidi(name, events, root, mode, style) {
        if (typeof Midi === 'undefined') {
            console.error("jsmidgen library not loaded");
            return;
        }

        const file = new Midi.File();
        const track = new Midi.Track();
        file.addTrack(track);

        // Sort events by startTime to be safe
        events.sort((a, b) => a.startTime - b.startTime);

        let cursor = 0;

        events.forEach(event => {
            const gap = event.startTime - cursor;

            if (gap > 0) {
                // Advance cursor without playing
                // noteOff(0, 0, gap) is a hack to burn time? 
                // Or track.note(channel, pitch, duration) with pitch 0? No.
                // jsmidgen doesn't have explicit "rest".
                // But passing a 'delay' param to addChord might work if it supports it?
                // Looking at library source (simulated): addChord(channel, chord, duration, delay)
                // If we pass delay=gap, it waits gap, then plays chord.

                try {
                    track.addChord(0, event.notes, event.duration, gap);
                } catch (e) {
                    // fallback
                    event.notes.forEach((n, i) => {
                        // Only first note waits the gap
                        const d = (i === 0) ? gap : 0;
                        track.addNote(0, n, event.duration, d);
                    });
                }
            } else {
                // No gap, just add
                try {
                    track.addChord(0, event.notes, event.duration);
                } catch (e) {
                    event.notes.forEach(n => track.addNote(0, n, event.duration));
                }
            }

            cursor = event.startTime + event.duration;
        });

        const bytes = file.toBytes();
        const byteArray = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            byteArray[i] = bytes.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;

        const safeName = name.replace(/#/g, 's').replace(/[^a-z0-9\s-]/gi, '').replace(/\s+/g, '_');
        const safeRoot = root.replace(/#/g, 's');
        link.download = `generated_${safeName}_${style}_${safeRoot}_${mode}.mid`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    ChordApp.Midi = {
        downloadProgressionMidi,
        downloadGeneratedMidi
    };
})();
window.ChordApp = window.ChordApp || {};

(function () {
    const { NOTES, SCALES } = ChordApp.Constants;
    const { getChords, getChordMidiNotes } = ChordApp.Theory;

    // --- Data Structures ---

    const STYLES = {
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

    function optimizeVoicing(notes, style) {
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
            const nextIndex = getWeightedRandom(matrix, currentIndex);
            progressionIndices.push(nextIndex);
            currentIndex = nextIndex;
        }

        // 4. Map indices to actual chord objects
        return progressionIndices.map(idx => scaleChords[idx]);
    }

    /**
     *   **Rock**: Straight 8ths, driving.
     *   **Hyperpop**: Glitchy, fast 16ths, chaotic rests.
     *   **J-Pop**: Driving but syncopated 16th streams.
     *   **Future Bass**: "Wub" chords (sustain with gaps, or dotted 8th note stabs).
     *   **Bossa**: Clave-based, syncopated bass.
     *   **Folk**: Strumming patterns (Root-strum-strum).
     */
    function applyRhythm(progression, style = STYLES.POP, enableRhythm = true) {
        const events = [];
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
window.ChordApp = window.ChordApp || {};

(function () {
    const { CIRCLE_OF_FIFTHS, MODE_DISPLAY_NAMES, PROGRESSIONS } = ChordApp.Constants;
    const { generateProgression, applyRhythm, STYLES } = ChordApp.Engine;



    function initControls(notes, initialRoot, initialMode, onRootChange, onModeChange) {
        const keySelect = document.getElementById('key-select');
        const scaleSelect = document.getElementById('scale-type-select');

        // Populate Keys
        notes.forEach(note => {
            const option = document.createElement('option');
            option.value = note;
            option.textContent = note;
            keySelect.appendChild(option);
        });

        // Populate Scales with Groups
        const { MODE_DISPLAY_NAMES } = ChordApp.Constants;

        const standardModes = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'natural_minor', 'locrian'];
        const otherScales = ['harmonic_minor', 'melodic_minor', 'major_pentatonic', 'minor_pentatonic', 'blues'];

        const createGroup = (label, keys) => {
            const group = document.createElement('optgroup');
            group.label = label;
            keys.forEach(key => {
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = MODE_DISPLAY_NAMES[key];
                group.appendChild(opt);
            });
            return group;
        };

        scaleSelect.appendChild(createGroup('Standard Modes', standardModes));
        scaleSelect.appendChild(createGroup('Other Scales', otherScales));

        keySelect.value = initialRoot;
        scaleSelect.value = initialMode;

        keySelect.onchange = (e) => onRootChange(e.target.value);
        scaleSelect.onchange = (e) => onModeChange(e.target.value);

        // Create Tooltip Element if not exists
        if (!document.getElementById('chord-tooltip')) {
            const tooltip = document.createElement('div');
            tooltip.id = 'chord-tooltip';
            document.body.appendChild(tooltip);
        }

        // Init Generator UI
        initGeneratorControls(initialRoot, initialMode);
    }

    function initGeneratorControls(root, mode) {
        // Find a place to inject. Let's look for 'progressions-list' parent or similar.
        const progContainer = document.getElementById('progressions-list');
        if (!progContainer) return;

        // Create Container for Generator
        const genContainer = document.createElement('div');
        genContainer.className = 'generator-container';
        genContainer.style.marginTop = '40px';
        genContainer.style.padding = '20px';
        genContainer.style.background = 'var(--bg-secondary)';
        genContainer.style.borderRadius = '12px';
        genContainer.innerHTML = `
            <h3 style="margin-top:0;">Generative Engine</h3>
            <div class="controls" style="display:flex; gap:15px; margin-bottom:15px;">
                <label>
                    Style:
                    <select id="gen-style">
                        ${Object.values(STYLES).map(style => {
            let label = style.charAt(0).toUpperCase() + style.slice(1);
            if (style === 'rnb') label = 'R&B';
            if (style === 'lofi') label = 'Lo-Fi';
            if (style === 'bossa') label = 'Bossa Nova';
            if (style === 'jpop') label = 'J-Pop';
            if (style === 'hyperpop') label = 'Hyperpop';
            if (style === 'future') label = 'Future Bass';
            return `<option value="${style}">${label}</option>`;
        }).join('')}
                    </select>
                </label>
                <label>
                    Length:
                    <select id="gen-length">
                        <option value="4">4 Bars</option>
                        <option value="8">8 Bars</option>
                        <option value="16">16 Bars (Long)</option>
                        <option value="32">32 Bars (Huge)</option>
                        <option value="64">64 Bars (Epic)</option>
                    </select>
                </label>
                <label style="display:flex; align-items:center; cursor:pointer;">
                    <input type="checkbox" id="gen-rhythm" checked style="margin-right:5px;">
                    Enable Rhythm
                </label>
                <button id="btn-generate" class="midi-btn" style="background:var(--accent-color);">Generate New</button>
            </div>
            <div id="gen-result" style="margin-bottom:15px; min-height:50px;"></div>
            <button id="btn-download-gen" class="midi-btn" disabled>Download Generated MIDI</button>
        `;

        progContainer.parentNode.insertBefore(genContainer, progContainer.nextSibling);

        // Bind Events
        document.getElementById('btn-generate').onclick = () => {
            const style = document.getElementById('gen-style').value;
            const length = parseInt(document.getElementById('gen-length').value, 10);

            // Get current global state (from UI closure or passed args? Args are initial only...)
            // We need current root/mode. 
            // HACK: Read from DOM or exposing state? 
            // Ideally explicit state passing. But 'render' receives state.
            // Let's store latest state in a closure var or read DOM.
            const currentRoot = document.getElementById('key-select').value;
            const currentMode = document.getElementById('scale-type-select').value;
            const enableRhythm = document.getElementById('gen-rhythm').checked;

            const progression = generateProgression(currentRoot, currentMode, { style, length });
            const events = applyRhythm(progression, style, enableRhythm);

            renderGeneratedResult(progression, events, style, currentRoot, currentMode);
        };
    }

    function renderGeneratedResult(progression, events, style, root, mode) {
        const resultDiv = document.getElementById('gen-result');
        const downloadBtn = document.getElementById('btn-download-gen');

        const chordNames = progression.map(c => c.chordName).join(' - ');
        const romanNames = progression.map(c => c.roman).join(' - ');

        resultDiv.innerHTML = `
            <div style="font-size:1.1em; font-weight:bold; margin-bottom:5px;">${chordNames}</div>
            <div style="color:var(--text-secondary); font-size:0.9em;">${romanNames}</div>
        `;

        downloadBtn.disabled = false;
        downloadBtn.onclick = () => {
            const progString = progression.map(c => c.chordName).join('-');
            ChordApp.Midi.downloadGeneratedMidi(progString, events, root, mode, style);
        };
    }

    function render(state, chords, onMidiDownload) {
        if (!chords || !Array.isArray(chords)) {
            console.warn("Render called with invalid chords", chords);
            return;
        }
        renderCircle(state, chords);
        renderScaleDegrees(chords);
        renderChordsList(chords);
        renderProgressions(state, chords, onMidiDownload);
    }

    function renderCircle(state, chords) {
        const container = document.getElementById('circle-container');
        container.innerHTML = '';

        if (!chords) return;

        const size = 500;
        const center = size / 2;
        const radius = 200;
        const thickness = 80;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
        svg.style.width = "100%";
        svg.style.height = "100%";

        const angleStep = 360 / 12;

        CIRCLE_OF_FIFTHS.forEach((note, index) => {
            const startAngle = (index * angleStep) - 90 - (angleStep / 2);
            const endAngle = startAngle + angleStep;

            const chordData = chords.find(c => c.root === note);

            let color = 'var(--inactive-color)';
            if (chordData) {
                if (chordData.quality === 'major') color = 'var(--major-color)';
                else if (chordData.quality === 'minor') color = 'var(--minor-color)';
                else if (chordData.quality === 'dim') color = 'var(--dim-color)';
                else if (chordData.quality === 'aug') color = 'var(--aug-color)';
            }

            const path = createSectorPath(center, center, radius, radius - thickness, startAngle, endAngle);

            const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathEl.setAttribute("d", path);
            pathEl.setAttribute("fill", color);
            pathEl.setAttribute("stroke", "var(--bg-color)");
            pathEl.setAttribute("stroke-width", "2");
            pathEl.classList.add("sector");

            // Interaction for Tooltip
            if (chordData) {
                pathEl.style.cursor = 'pointer'; // Show it's interactive

                pathEl.addEventListener('mouseenter', (e) => {
                    const tooltip = document.getElementById('chord-tooltip');
                    if (!tooltip) return;

                    const notes = ChordApp.Theory.getChordNotes(chordData);
                    tooltip.innerHTML = `<div style="font-weight:bold; margin-bottom:2px;">${chordData.chordName}</div>
                                         <div style="color:var(--text-secondary); font-size:0.85em;">${notes.join(' - ')}</div>`;

                    tooltip.style.display = 'block';
                });

                pathEl.addEventListener('mousemove', (e) => {
                    const tooltip = document.getElementById('chord-tooltip');
                    if (!tooltip) return;

                    // Position just above/right of cursor using fixed positioning
                    // Add small offset so mouse isn't covering it
                    tooltip.style.left = (e.clientX + 15) + 'px';
                    tooltip.style.top = (e.clientY + 15) + 'px';
                });

                pathEl.addEventListener('mouseleave', () => {
                    const tooltip = document.getElementById('chord-tooltip');
                    if (tooltip) tooltip.style.display = 'none';
                });
            }

            svg.appendChild(pathEl);

            // Text Label
            const midAngle = (startAngle + endAngle) / 2;
            const textRadius = radius - (thickness / 2);
            const textX = center + textRadius * Math.cos(midAngle * Math.PI / 180);
            const textY = center + textRadius * Math.sin(midAngle * Math.PI / 180);

            const textGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

            const noteText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            noteText.setAttribute("x", textX);
            noteText.setAttribute("y", textY);
            noteText.setAttribute("text-anchor", "middle");
            noteText.setAttribute("dominant-baseline", "middle");
            noteText.setAttribute("fill", chordData ? "#000" : "var(--text-secondary)");
            noteText.setAttribute("font-weight", "bold");
            noteText.setAttribute("font-size", "18");
            noteText.textContent = note;

            textGroup.appendChild(noteText);

            if (chordData) {
                const romanText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                romanText.setAttribute("x", textX);
                romanText.setAttribute("y", textY + 20);
                romanText.setAttribute("text-anchor", "middle");
                romanText.setAttribute("dominant-baseline", "middle");
                romanText.setAttribute("fill", "#000");
                romanText.setAttribute("font-size", "14");
                romanText.textContent = chordData.roman;
                textGroup.appendChild(romanText);

                noteText.setAttribute("y", textY - 10);
            }

            svg.appendChild(textGroup);
        });

        const centerText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        centerText.setAttribute("x", center);
        centerText.setAttribute("y", center);
        centerText.setAttribute("text-anchor", "middle");
        centerText.setAttribute("dominant-baseline", "middle");
        centerText.setAttribute("fill", "var(--text-primary)");
        centerText.setAttribute("font-size", "24");

        const { MODE_DISPLAY_NAMES } = ChordApp.Constants;
        const modeName = MODE_DISPLAY_NAMES[state.mode] || state.mode;

        centerText.textContent = `${state.root} ${modeName}`;
        svg.appendChild(centerText);

        container.appendChild(svg);
    }

    function createSectorPath(cx, cy, rOuter, rInner, startAngle, endAngle) {
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = cx + rOuter * Math.cos(startRad);
        const y1 = cy + rOuter * Math.sin(startRad);
        const x2 = cx + rOuter * Math.cos(endRad);
        const y2 = cy + rOuter * Math.sin(endRad);

        const x3 = cx + rInner * Math.cos(endRad);
        const y3 = cy + rInner * Math.sin(endRad);
        const x4 = cx + rInner * Math.cos(startRad);
        const y4 = cy + rInner * Math.sin(startRad);

        return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;
    }

    function renderScaleDegrees(chords) {
        const container = document.getElementById('scale-degrees');
        container.innerHTML = '';

        chords.forEach(chord => {
            const div = document.createElement('div');
            div.className = 'note-badge';
            div.innerHTML = `
                <span class="note-name">${chord.root}</span>
                <span class="note-degree">${chord.degree}</span>
            `;
            container.appendChild(div);
        });
    }

    function renderChordsList(chords) {
        const container = document.getElementById('chords-list');
        container.innerHTML = '';

        chords.forEach(chord => {
            const div = document.createElement('div');
            div.className = `chord-item ${chord.quality}`;
            div.innerHTML = `
                <div class="chord-info">
                    <span class="chord-name">${chord.chordName}</span>
                </div>
                <span class="chord-roman">${chord.roman}</span>
            `;
            container.appendChild(div);
        });
    }

    function renderProgressions(state, chords, onMidiDownload) {
        const container = document.getElementById('progressions-list');
        container.innerHTML = '';

        const progs = PROGRESSIONS[state.mode] || [];

        if (progs.length === 0) {
            container.innerHTML = '<div class="no-progs">No example progressions for this mode yet.</div>';
            return;
        }

        // Check global toggle state
        const toggleVariation = document.getElementById('variation-toggle');
        const isVariation = toggleVariation ? toggleVariation.checked : false;

        const toggleExtension = document.getElementById('extension-toggle');
        const isExtension = toggleExtension ? toggleExtension.checked : false;

        const toggleVoicing = document.getElementById('voicing-toggle');
        const isVoicing = toggleVoicing ? toggleVoicing.checked : false;

        // Re-attach listeners
        if (toggleVariation) {
            toggleVariation.onchange = () => renderProgressions(state, chords, onMidiDownload);
        }
        if (toggleExtension) {
            toggleExtension.onchange = () => renderProgressions(state, chords, onMidiDownload);
        }
        if (toggleVoicing) {
            toggleVoicing.onchange = () => renderProgressions(state, chords, onMidiDownload);
        }

        progs.forEach(prog => {
            // Use Theory to get the display sequence
            const sequence = ChordApp.Theory.generateVariationSequence(prog.indices, chords, isVariation, isExtension, isVoicing);

            // Format for display
            // If variation is long, maybe truncate or show in a nice grid? 
            // For now, let's just list them nicely. If > 8 chords, maybe create a grid.

            let displayChords = sequence.map(c => c.chordName);

            // If it's the standard loop (not variation), we just show the base progression once to keep it clean
            // If it IS variation, show the interesting parts (maybe the last 4 bars?)
            // Actually user asked: "show what the extended version's progression looks like".
            // So we should show all of them, or a representative set.

            let chordsHtml = '';
            if (isVariation) {
                // Show "Bar 1: ... | Bar 2: ..."
                const half = Math.ceil(displayChords.length / 2);
                const bar1 = displayChords.slice(0, half).join(' - ');
                const bar2 = displayChords.slice(half).join(' - ');

                chordsHtml = `
                    <div style="font-size: 0.9em; opacity: 0.8;">Bar 1: ${bar1}</div>
                    <div style="font-weight: 600;">Bar 2: ${bar2}</div>
                `;
            } else {
                chordsHtml = `<div class="prog-chords">${displayChords.join(' - ')}</div>`;
            }

            const div = document.createElement('div');
            div.className = 'progression-item';
            div.innerHTML = `
                <div class="prog-info">
                    <div class="prog-header" style="display: flex; gap: 10px; align-items: center; margin-bottom: 0.5rem;">
                         <div class="prog-name" style="margin:0">${prog.name}</div>
                         ${prog.genre ? `<span class="genre-badge">${prog.genre}</span>` : ''}
                    </div>
                    ${chordsHtml}
                </div>
            `;

            const btn = document.createElement('button');
            btn.className = 'midi-btn';
            btn.textContent = 'Download MIDI';

            btn.onclick = () => {
                onMidiDownload(prog.name, sequence, {
                    isVariation,
                    isExtension,
                    isVoicing
                });
            };

            div.appendChild(btn);
            container.appendChild(div);
        });
    }

    ChordApp.UI = {
        initControls,
        render
    };
})();
window.ChordApp = window.ChordApp || {};

(function () {
    const { NOTES } = ChordApp.Constants;
    const { getChords } = ChordApp.Theory;
    const { initControls, render } = ChordApp.UI;
    const { downloadProgressionMidi } = ChordApp.Midi;

    const state = {
        root: 'C',
        mode: 'ionian' // Default to Ionian (Major)
    };

    function update() {
        // derive data
        const chords = getChords(state.root, state.mode);

        // render
        render(state, chords, (name, sequence, options) => {
            downloadProgressionMidi(name, sequence, state.root, state.mode, options);
        });
    }

    // Event Handlers
    function handleRootChange(newRoot) {
        state.root = newRoot;
        update();
    }

    function handleModeChange(newMode) {
        state.mode = newMode;
        update();
    }

    // Boot
    document.addEventListener('DOMContentLoaded', () => {
        initControls(NOTES, state.root, state.mode, handleRootChange, handleModeChange);
        update();
    });
})();
