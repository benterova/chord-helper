import React, { useState, useEffect } from 'react';
import { audioEngine } from '../lib/audio';
import { type Chord } from '../lib/theory';
import { PROGRESSIONS } from '../lib/constants';
import { useMusicTheory } from '../lib/MusicTheoryContext';
import { applyRhythm, STYLES, type Style } from '../lib/engine';
import { downloadGeneratedMidi } from '../lib/midi';

export const ProgressionList: React.FC = () => {
    const { root, chords, mode } = useMusicTheory();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [useRhythm, setUseRhythm] = useState(true);

    const matchProgressions = PROGRESSIONS[mode] || [];

    useEffect(() => {
        return audioEngine.subscribe(id => setPlayingId(id));
    }, []);

    // Helpers
    const getProgressionChords = (indices: number[]): (Chord | undefined)[] => {
        return indices.map(idx => chords.find(c => c.degree === idx + 1));
    };

    const getStyleFromGenre = (genre: string): Style => {
        const g = genre.toLowerCase();
        if (g.includes('jazz')) return STYLES.JAZZ;
        if (g.includes('rock') || g.includes('metal')) return STYLES.ROCK;
        if (g.includes('funk') || g.includes('r&b')) return STYLES.RNB;
        if (g.includes('cinematic')) return STYLES.EPIC;
        if (g.includes('dark')) return STYLES.DARK;
        if (g.includes('bossa')) return STYLES.BOSSA;
        if (g.includes('lofi')) return STYLES.LOFI;
        return STYLES.POP;
    };

    const handlePlay = (progIndex: number) => {
        const id = `prog-${progIndex}`;

        if (playingId === id) {
            audioEngine.stop();
            return;
        }

        const prog = matchProgressions[progIndex];
        const progChords = getProgressionChords(prog.indices).filter((c): c is Chord => !!c);

        if (progChords.length === 0) return;

        const style = getStyleFromGenre(prog.genre);
        // Use a default rhythm or simple chords if the genre doesn't strongly imply a rhythm?
        // Actually, let's use the engine's applyRhythm to get consistent behavior with metronome.
        const events = applyRhythm(progChords, style, useRhythm);

        // Convert to sequence for audio engine
        const secondsPerTick = 0.5 / 128; // Standard 120bpm assumption for conversion? No, applyRhythm output is in ticks.
        // Wait, playProgression expects { notes, duration (seconds) }.
        // The Generator.tsx converts mapping ticks to seconds.
        // It uses: const secondsPerTick = 0.5 / 128;  (assuming 120bpm? 60/120 = 0.5s per beat. 128 ticks per beat.)

        const sorted = [...events].sort((a, b) => a.startTime - b.startTime);
        const sequence: { notes: number[], duration: number }[] = [];

        let lastEnd = 0;
        sorted.forEach(ev => {
            const gap = ev.startTime - lastEnd;
            if (gap > 0) {
                sequence.push({ notes: [], duration: gap * secondsPerTick });
            }
            sequence.push({ notes: ev.notes, duration: ev.duration * secondsPerTick });
            lastEnd = ev.startTime + ev.duration;
        });

        audioEngine.playProgression(sequence, id);
    };

    const handleStop = () => {
        audioEngine.stop();
    };

    const handleExport = (progIndex: number) => {
        const prog = matchProgressions[progIndex];
        const progChords = getProgressionChords(prog.indices).filter((c): c is Chord => !!c);
        if (progChords.length === 0) return;

        const style = getStyleFromGenre(prog.genre);
        const events = applyRhythm(progChords, style, true); // Export with rhythm

        downloadGeneratedMidi(prog.name, events, root, mode, style);
    };

    // New Aero Icons
    const Icons = {
        Play: <span style={{ textShadow: '0 0 5px rgba(255,255,255,0.8)' }}>▶</span>,
        Stop: <span style={{ textShadow: '0 0 5px rgba(255,0,0,0.5)' }}>■</span>,
        Music: <span style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }}>🎵</span>
    };

    const isCurrentPlaying = selectedId !== null && playingId === `prog-${selectedId}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>

            {/* Aero Toolbar */}
            <div className="aero-toolbar">
                <div className="aero-toolbar-group">
                    {isCurrentPlaying ? (
                        <button className="aero-toolbar-btn" onClick={handleStop}>
                            <span style={{ color: '#cc0000', fontSize: '1.2em' }}>{Icons.Stop}</span>
                            <span>Stop</span>
                        </button>
                    ) : (
                        <button
                            className="aero-toolbar-btn"
                            onClick={() => selectedId !== null && handlePlay(selectedId)}
                            disabled={selectedId === null}
                        >
                            <span style={{ color: selectedId !== null ? '#00cc00' : '#888', fontSize: '1.2em' }}>{Icons.Play}</span>
                            <span>Play</span>
                        </button>
                    )}
                </div>
                <div className="aero-toolbar-separator"></div>
                <div className="aero-toolbar-group">
                    <button
                        className={`aero-toolbar-btn ${useRhythm ? 'active' : ''}`}
                        onClick={() => setUseRhythm(!useRhythm)}
                        style={{ minWidth: '100px' }}
                    >
                        <span style={{ fontSize: '1.2em' }}>🥁</span>
                        <span>Rhythm: {useRhythm ? 'ON' : 'OFF'}</span>
                    </button>
                </div>
                <div className="aero-toolbar-separator"></div>
                <div className="aero-toolbar-group">
                    <button
                        className="aero-toolbar-btn"
                        onClick={() => selectedId !== null && handleExport(selectedId)}
                        disabled={selectedId === null}
                    >
                        <span style={{ fontSize: '1.2em', opacity: selectedId !== null ? 1 : 0.5 }}>📤</span>
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Aero List Header */}
            <div className="aero-list-header">
                <div style={{ flex: 1, paddingLeft: '10px' }}>Name</div>
                <div style={{ width: '80px' }}>Key</div>
                <div style={{ width: '120px' }}>Style</div>
            </div>

            {/* Aero List Content */}
            <div className="aero-list-container">
                {matchProgressions.map((prog, idx) => {
                    const isSelected = selectedId === idx;
                    const isPlaying = playingId === `prog-${idx}`;

                    return (
                        <div
                            key={idx}
                            className={`aero-list-row ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedId(idx)}
                            onDoubleClick={() => handlePlay(idx)}
                        >
                            <div className="aero-list-icon">
                                {isPlaying ? <span className="pulse-anim">🔊</span> : Icons.Music}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ fontWeight: '600', color: '#003366' }}>{prog.name}</div>
                                <div style={{ fontSize: '0.8em', color: '#555' }}>
                                    {prog.indices.map(i => chords.find(c => c.degree === i + 1)?.roman).join(' - ')}
                                </div>
                            </div>
                            <div style={{ width: '80px', display: 'flex', alignItems: 'center', color: '#005580' }}>
                                {root} {mode}
                            </div>
                            <div style={{ width: '120px', display: 'flex', alignItems: 'center', color: '#666', fontStyle: 'italic', fontSize: '0.9em' }}>
                                {prog.genre || 'Pop'}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Status Bar */}
            <div className="aero-status-bar">
                {matchProgressions.length} items  |  {selectedId !== null ? '1 item selected' : ''}
            </div>
        </div>
    );
};
