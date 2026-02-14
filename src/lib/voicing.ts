
import { type Chord, getChordMidiNotes } from './theory';

export interface VoicedChord {
    chord: Chord;
    notes: number[]; // MIDI notes
}

/**
 * Applies smart voicing to a sequence of chords to minimize voice leading distance.
 * @param chords Array of Chord objects
 * @returns Array of VoicedChord objects with optimized MIDI notes
 */
export function applySmartVoicing(chords: Chord[]): VoicedChord[] {
    if (chords.length === 0) return [];

    const voicedSequence: VoicedChord[] = [];

    // Helper: Get Inversions for a set of chords
    const getInversions = (notes: number[]) => {
        // Assumes notes are sorted or at least grouped
        // We'll generate: Root pos, 1st inv, 2nd inv
        // And for each, we'll offer 3 octave variants to allow the melody to stay centered

        const results: number[][] = [];
        const len = notes.length;
        if (len === 0) return [];

        // Normalize to one octave (0-11) for shape calculation, but we start with the actual MIDI notes
        // Actually, let's just take the input notes (usually one octave like 60, 64, 67)
        // and generate permutations.

        // Strategy:
        // 1. Get pitch classes
        // (Removed unused pcs variable)

        // 2. Generate close voicings in the center range (MIDI 48 - 72)
        // A simple triad has 3 inversions.
        // Root: 0, 4, 7
        // 1st: 4, 7, 12
        // 2nd: 7, 12, 16 

        // Let's generate base inversions relative to C (0) then transpose
        // Actually, easier:
        // Take the root position notes (e.g. 60, 64, 67)
        // Generate:
        // [60, 64, 67]
        // [64, 67, 72] (1st inv)
        // [67, 72, 76] (2nd inv)

        // And also open voicings? For now, stick to close voicings for "smooth pad" feel.

        const base = [...notes].sort((a, b) => a - b);

        // Inversions
        const i0 = [...base];
        const i1 = [base[1], base[2], base[0] + 12].sort((a, b) => a - b);
        const i2 = [base[2], base[0] + 12, base[1] + 12].sort((a, b) => a - b); // For triads

        // If 4 notes (7ths), add 3rd inversion
        let invs = [i0, i1, i2];
        if (base.length > 3) {
            const i3 = [base[3], base[0] + 12, base[1] + 12, base[2] + 12].sort((a, b) => a - b);
            invs.push(i3);
        }

        // Add octave shifts for each inversion to find best range
        const shifts = [-12, 0, 12];

        invs.forEach(inv => {
            shifts.forEach(shift => {
                const shifted = inv.map(n => n + shift);
                // Check range (Keep roughly between C3 and C6: 48 - 84)
                const avg = shifted.reduce((a, b) => a + b, 0) / shifted.length;
                if (avg > 45 && avg < 80) {
                    results.push(shifted);
                }
            });
        });

        return results;
    };

    const getAveragePitch = (notes: number[]) => notes.reduce((a, b) => a + b, 0) / notes.length;

    const calculateCost = (prevNotes: number[], currentNotes: number[]) => {
        // Calculate sum of squared distances for voice movement (assuming sorted voices? No, minimal matching)
        // Actually for pads, we want total movement minimized. 
        // Heuristic: Centroid distance + individual note movement

        const centerDist = Math.abs(getAveragePitch(prevNotes) - getAveragePitch(currentNotes));

        // Simple aggregate distance
        // Sort both and compare (naive voice mapping)
        const sPrev = [...prevNotes].sort((a, b) => a - b);
        const sCurr = [...currentNotes].sort((a, b) => a - b);

        let moveCost = 0;
        const len = Math.min(sPrev.length, sCurr.length);
        for (let i = 0; i < len; i++) {
            const diff = sCurr[i] - sPrev[i];
            moveCost += diff * diff;
        }

        // Penalize large jumps
        return moveCost + (centerDist * 10);
    };

    // 1. Process first chord
    const firstChord = chords[0];
    const firstBaseNotes = getChordMidiNotes(firstChord);
    const firstCandidates = getInversions(firstBaseNotes);

    // Pick the one closest to middle C (60)
    let bestFirst = firstCandidates[0] || firstBaseNotes;
    let minFirstDist = Infinity;

    firstCandidates.forEach(cand => {
        const dist = Math.abs(getAveragePitch(cand) - 60);
        if (dist < minFirstDist) {
            minFirstDist = dist;
            bestFirst = cand;
        }
    });

    voicedSequence.push({ chord: firstChord, notes: bestFirst });

    // 2. Process subsequent chords
    for (let i = 1; i < chords.length; i++) {
        const prevNotes = voicedSequence[i - 1].notes;
        const currChord = chords[i];
        const currBaseNotes = getChordMidiNotes(currChord);
        const candidates = getInversions(currBaseNotes);

        if (candidates.length === 0) {
            voicedSequence.push({ chord: currChord, notes: currBaseNotes });
            continue;
        }

        let bestCand = candidates[0];
        let minCost = Infinity;

        candidates.forEach(cand => {
            const cost = calculateCost(prevNotes, cand);
            if (cost < minCost) {
                minCost = cost;
                bestCand = cand;
            }
        });

        voicedSequence.push({ chord: currChord, notes: bestCand });
    }

    return voicedSequence;
}
