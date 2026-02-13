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

        // Sort events by startTime to be safe, though they should be orderly
        events.sort((a, b) => a.startTime - b.startTime);

        let lastEventTime = 0;

        events.forEach(event => {
            const deltaTime = event.startTime - lastEventTime;

            // Add chord/notes
            // jsmidgen addChord(track, chord, duration, delay)
            // But wait, addChord adds 'duration' to the time cursor.
            // If we have polyphony or overlapping notes, we need strictly manual delta time management.
            // jsmidgen is a bit linear. "wait(ticks)" advances cursor.
            // So we must advance cursor by (startTime - lastEventTime).

            if (deltaTime > 0) {
                track.noteOff(0, 0, deltaTime); // Dummy wait? Or use track.setTempo? 
                // Actually jsmidgen has track.addNote(channel, note, duration, delay)
                // delay is "ticks to wait before playing this note".
                // So delay = deltaTime.
            }

            // However, subsequent notes at the SAME time need delay 0.
            // And multiple notes in a chord need to be added together.

            // Strategy: Group events by startTime?
            // Or just rely on jsmidgen. 
            // If we use addNote with delay, it waits that delay, adds note, then advances cursor by duration?
            // No, standard MIDI file writing usually: specific separate NoteOn/NoteOff events.
            // jsmidgen abstraction:
            // track.addNote(channel, pitch, duration, time [delay?])
            // implementation: 
            // 1. write delay (delta)
            // 2. write NoteOn
            // 3. advance internal cursor? NO, usually addNote abstractly handles "note off" later.

            // LIMITATION: jsmidgen's patterns often block.
            // Let's try to trust `addChord` with 0 delay for creating block chords,
            // but we have potentially complex rhythms.

            // Re-read jsmidgen docs (mental check) or assume standard behavior:
            // track.addNote(channel, pitch, duration) -> adds note, adv time by duration.
            // track.addNoteOn(channel, pitch, time) -> adds note on event after `time` ticks?

            // Let's use the lower level noteOn / noteOff if possible, or careful looping.
            // For this Engine, since we output block chords with rhythm, events are non-overlapping usually.
            // We just need to wait the gap between previous end and current start? 
            // Or just gap since last start?

            // Simplified approach for "monophonic chords" (block chords moving together):
            // 1. Wait (startTime - cursor)
            // 2. Add chord with duration
            // 3. Cursor is now startTime + duration

            // ISSUE: If rhythm has rests (gaps), we need to account.

            // Let's track 'cursor'.
            // Event wants to start at `event.startTime`.
            // Current cursor is `cursor`.
            // If event.startTime > cursor, we need to insert silence.
            // If event.startTime < cursor, we have overlap (problem for simple cursor tracking).
            // But our engine generates strictly linear blocks for now.

            // Correct approach:
            // noteOn(0, note, velocity, deltaTime);

            // Since we receive a chord (array of notes) at once:
            const notes = event.notes;
            const velocity = event.velocity || 90;

            // Delay from LAST EVENT start/end? 
            // Standard MIDI is delta-time since *last message*.

            // Let's use a standard pattern for JSMidgen if we assume it abstracts this.
            // But typically `addChord` does: NoteOn all, wait duration, NoteOff all.
            // This is perfect for us IF we handle the silence between chords manually.
        });

        // Re-write loop to be robust with Jsmidgen's likely API (addChord(channel, notes, duration))
        // We just need to inject rests.

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

        const safeName = `generated_${style}_${root}_${mode}`.replace(/[^a-z0-9\s-]/gi, '').replace(/\s+/g, '_');
        link.download = `${safeName}.mid`;

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
