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
