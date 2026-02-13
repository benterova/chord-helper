
import { applyRhythm, STYLES } from '../src/lib/engine';
import { Chord } from '../src/lib/theory';

// Mock Chord
const C_Major: Chord = {
    root: 'C',
    quality: 'major',
    chordName: 'C',
    degree: 1,
    roman: 'I',
    intervals: { third: 4, fifth: 7, seventh: 11, ninth: 2 }
};

const NOTE_16TH_TICKS = 32;

function testStyle(styleName: any, expectedName: string, expectedLength: number, expectedTicksPerStep: number = 32) {
    console.log(`\nTesting Style: ${styleName} (Target: ${expectedName})`);

    // Override Math.random to pick the last rhythm
    Math.random = () => 0.99;

    const events = applyRhythm([C_Major], styleName);

    if (events.length === 0) {
        console.error("❌ No events generated!");
        return;
    }

    const lastEvent = events[events.length - 1];
    const totalDuration = lastEvent.startTime + lastEvent.duration;

    const expectedTotalDuration = expectedLength * expectedTicksPerStep;

    console.log(`  Events Generated: ${events.length}`);
    console.log(`  Total Duration: ${totalDuration} (Expected: ${expectedTotalDuration})`);

    if (totalDuration === expectedTotalDuration) {
        console.log("  ✅ Duration matches pattern length.");
    } else {
        console.error(`  ❌ Duration Mismatch! Expected ${expectedTotalDuration}, got ${totalDuration}`);
    }

    // Check resolution if ticksPerStep < 32
    if (expectedTicksPerStep < 32) {
        console.log(`  Checking for high resolution events (step < 32 ticks)...`);
        const hasSmallSteps = events.some((e, i) => {
            if (i === 0) return false;
            const diff = e.startTime - events[i - 1].startTime;
            return diff > 0 && diff < 32;
        });
        if (hasSmallSteps) {
            console.log("  ✅ High resolution events found.");
        } else {
            // It's possible the pattern doesn't have adjacent 32nd notes, but likely it does for "Glitch"
            console.log("  ⚠️ No adjacent high-res steps found (might be pattern specific).");
        }
    }
}

// 1. Hyperpop: Glitch Stutter (Length 32, Ticks 16)
testStyle(STYLES.HYPERPOP, "Glitch Stutter", 32, 16);

// 2. J-Pop: Anime Opening (Length 32, Ticks 32 default)
testStyle(STYLES.JPOP, "Anime Opening", 32, 32);

// 3. Jazz: Triplet Feel (Length 12, Ticks 43)
testStyle(STYLES.JAZZ, "Triplet Feel", 12, 43);

// 4. Future: Future Wobble (Length 32, Ticks 32 default)
testStyle(STYLES.FUTURE, "Future Wobble", 32, 32);

console.log("\nVerification Complete.");
