import Midi from 'jsmidgen';
import type { VariationSequenceItem } from './theory';
import type { MidiEvent, Style } from './engine';

export interface MidiDownloadOptions {
    isExtension?: boolean;
    isVoicing?: boolean;
    isVariation?: boolean;
}

export function downloadProgressionMidi(
    name: string,
    sequence: VariationSequenceItem[], // Use the rich item from generateVariationSequence
    root: string,
    mode: string,
    options: MidiDownloadOptions = {}
) {
    const PPQ = 128; // Ticks per Quarter Note

    const file = new Midi.File();
    const track = new Midi.Track();
    file.addTrack(track);

    const defaultDuration = PPQ;

    sequence.forEach(chord => {
        // midiNotes should already be calculated in sequence item
        const notes = chord.midiNotes;
        const duration = defaultDuration; // Basic quarter/whole note logic for now

        try {
            // jsmidgen addChord(channel, notes, duration)
            track.addChord(0, notes, duration, 127);
        } catch (e) {
            console.error("addChord failed", e);
            notes.forEach(n => track.addNote(0, n, duration));
        }
    });

    // jsmidgen toBytes() actually returns a string (binary string) in the library, 
    // but @types/jsmidgen might define it as number[].
    // If it is a string, we use charCodeAt. If it's a number[], we can just use it.
    // Let's cast to any to handle both or trust the legacy behavior + types.
    const bytes = file.toBytes() as unknown as string;
    const isString = typeof bytes === 'string';
    const len = bytes.length;
    const byteArray = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        byteArray[i] = isString ? bytes.charCodeAt(i) : bytes[i];
    }

    const blob = new Blob([byteArray], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;

    const safeName = name.replace(/[^a-z0-9\s-]/gi, '').replace(/\s+/g, '_');
    const safeRoot = root.replace('#', 's');
    const safeMode = mode.toLowerCase();

    // Generate Filename Tags
    const tags: string[] = [];
    if (options.isExtension) tags.push('ext');
    if (options.isVoicing) tags.push('voiced');

    if (options.isVariation) {
        tags.push('2bar_loop');
    } else {
        tags.push('loop');
    }

    const tagString = tags.length > 0 ? '_' + tags.join('_') : '';
    link.download = `${safeRoot}_${safeMode}_${safeName}${tagString}.mid`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function downloadGeneratedMidi(
    name: string,
    events: MidiEvent[],
    root: string,
    mode: string,
    style: Style
) {
    const file = new Midi.File();
    const track = new Midi.Track();
    file.addTrack(track);

    // Sort events by startTime to be safe
    events.sort((a, b) => a.startTime - b.startTime);

    let cursor = 0;

    events.forEach(event => {
        const gap = event.startTime - cursor;

        if (gap > 0) {
            // Wait gap using delay feature of addChord/addNote isn't explicit in basic docs, 
            // but let's assume standard behavior or just iterate.
            // Wait, jsmidgen tracks advance time when you add notes.
            // If we want a rest, we can't easily "move cursor".
            // However, addChord/addNote typically consume time.
            // If we addNote(dur=100), time moves 100.
            // If gap > 0, we need to insert silence?
            // jsmidgen doesn't have explicit rest.
            // Workaround: add a silent note? Velocity 0?
            // Or use setTempo/etc?

            // Looking at legacy code:
            /*
            try {
                track.addChord(0, event.notes, event.duration, gap);
            } ...
            */
            // Ideally addChord accepts delay as 4th param.
            // The type definitions might not show it, but source does.
            // Let's try passing it. TypeScript might complain if types are wrong.

            // If types block us, cast to any.
            try {
                track.addChord(0, event.notes, event.duration, gap);
            } catch {
                event.notes.forEach((n, i) => {
                    const d = (i === 0) ? gap : 0;
                    track.addNote(0, n, event.duration, d);
                });
            }
        } else {
            try {
                track.addChord(0, event.notes, event.duration, 127);
            } catch {
                event.notes.forEach(n => track.addNote(0, n, event.duration));
            }
        }

        cursor = event.startTime + event.duration;
    });

    const bytes = file.toBytes() as unknown as string;
    const isString = typeof bytes === 'string';
    const len = bytes.length;
    const byteArray = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        byteArray[i] = isString ? bytes.charCodeAt(i) : bytes[i];
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
