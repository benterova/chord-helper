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

    ChordApp.Midi = {
        downloadProgressionMidi
    };
})();
