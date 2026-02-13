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
            // 1. Get the notes for this chord (Root, 3rd, 5th, 7th, 9th)
            const rootNote = scaleNotes[index];
            const thirdNote = scaleNotes[(index + 2) % 7];
            const fifthNote = scaleNotes[(index + 4) % 7];
            const seventhNote = scaleNotes[(index + 6) % 7];
            const ninthNote = scaleNotes[(index + 1) % 7]; // 9th is same note class as 2nd ((i+8)%7 == (i+1)%7)

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

            // Major Triad
            if (distThird === 4 && distFifth === 7) {
                quality = 'major';
                romanCase = 'upper';
            }
            // Minor Triad
            else if (distThird === 3 && distFifth === 7) {
                quality = 'minor';
                suffix = 'm';
                romanCase = 'lower';
            }
            // Diminished Triad
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
        generateVariationSequence
    };
})();
