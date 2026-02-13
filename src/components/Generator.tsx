import React, { useState, useEffect } from 'react';
import { STYLES, type Style, generateProgression, applyRhythm, type MidiEvent } from '../lib/engine';
import { downloadGeneratedMidi } from '../lib/midi';
import type { Chord } from '../lib/theory';
import { audioEngine } from '../lib/audio';
import useLocalStorage from '../hooks/useLocalStorage';

interface GeneratorProps {
    root: string;
    mode: string;
}

interface SavedProgression {
    id: string;
    name: string;
    timestamp: number;
    chords: Chord[];
    events: MidiEvent[];
    root: string;
    mode: string;
    style: Style;
}

export const Generator: React.FC<GeneratorProps> = ({ root, mode }) => {
    // Core State
    const [style, setStyle] = useState<Style>(STYLES.POP);
    const [length, setLength] = useState(4);
    const [enableRhythm, setEnableRhythm] = useState(true);

    const [generatedProgression, setGeneratedProgression] = useState<Chord[] | null>(null);
    const [generatedEvents, setGeneratedEvents] = useState<MidiEvent[] | null>(null);

    // Playback State
    const [playingId, setPlayingId] = useState<string | null>(null);

    // Saved Progressions State
    const [savedProgressions, setSavedProgressions] = useLocalStorage<SavedProgression[]>('saved_progressions', []);
    const [isSavedOpen, setIsSavedOpen] = useState(false); // Accordion state

    React.useEffect(() => {
        return audioEngine.subscribe(id => setPlayingId(id));
    }, []);

    // 1. Auto-Generate on Mount and Root/Mode Change
    useEffect(() => {
        handleGenerate();
    }, [root, mode]);

    // 2. React to Rhythm Toggle (without changing chords)
    useEffect(() => {
        if (generatedProgression) {
            const events = applyRhythm(generatedProgression, style, enableRhythm);
            setGeneratedEvents(events);
        }
    }, [enableRhythm]);

    const handleGenerate = () => {
        const progression = generateProgression(root, mode as any, { style, length });
        const events = applyRhythm(progression, style, enableRhythm);
        setGeneratedProgression(progression);
        setGeneratedEvents(events);
    };

    const handleSave = () => {
        if (!generatedProgression || !generatedEvents) return;

        const newProgression: SavedProgression = {
            id: crypto.randomUUID(),
            name: `${root} ${mode} ${style} - ${new Date().toLocaleTimeString()}`,
            timestamp: Date.now(),
            chords: generatedProgression,
            events: generatedEvents,
            root,
            mode,
            style
        };

        setSavedProgressions([newProgression, ...savedProgressions]);
        setIsSavedOpen(true); // Auto-open to show success
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedProgressions(savedProgressions.filter(p => p.id !== id));
    };

    const handleDownload = (progression: { events: MidiEvent[]; root: string; mode: string; style: Style; chords: Chord[] }) => {
        if (!progression.events) return;
        const name = progression.chords.map(c => c.chordName).join('-');
        downloadGeneratedMidi(name, progression.events, progression.root, progression.mode, progression.style);
    };

    const handlePlay = (id: string, events: MidiEvent[]) => {
        if (playingId === id) {
            audioEngine.stop();
            return;
        }

        // Conversion Logic (same as before)
        const secondsPerTick = 0.5 / 128;
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

    const styleLabels: Record<string, string> = {
        [STYLES.RNB]: 'R&B',
        [STYLES.LOFI]: 'Lo-Fi',
        [STYLES.BOSSA]: 'Bossa Nova',
        [STYLES.JPOP]: 'J-Pop',
        [STYLES.FUTURE]: 'Future Bass',
    };

    return (
        <div className="generator-container">
            <h3>Generative Engine</h3>

            <div className="generator-controls">
                <label className="control-label">
                    <span>Style</span>
                    <select value={style} onChange={(e) => setStyle(e.target.value as Style)}>
                        {Object.values(STYLES).map(s => {
                            let label = styleLabels[s] || (s.charAt(0).toUpperCase() + s.slice(1));
                            return <option key={s} value={s}>{label}</option>;
                        })}
                    </select>
                </label>

                <label className="control-label">
                    <span>Length</span>
                    <select value={length} onChange={(e) => setLength(parseInt(e.target.value, 10))}>
                        <option value="4">4 Bars</option>
                        <option value="8">8 Bars</option>
                        <option value="16">16 Bars (Long)</option>
                        <option value="32">32 Bars (Huge)</option>
                        <option value="64">64 Bars (Epic)</option>
                    </select>
                </label>

                <label className="checkbox-label" style={{ marginBottom: '0.5rem' }}>
                    <input type="checkbox" checked={enableRhythm} onChange={(e) => setEnableRhythm(e.target.checked)} />
                    <span>Enable Rhythm</span>
                </label>

                <button
                    onClick={handleGenerate}
                    className="midi-btn accent"
                    style={{ marginLeft: 'auto' }}
                >
                    Generate New
                </button>
            </div>

            {generatedProgression && (
                <div style={{ marginBottom: '15px', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '1.1em', fontWeight: 'bold', marginBottom: '5px' }}>
                        {generatedProgression.map(c => c.chordName).join(' - ')}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                        {generatedProgression.map(c => c.roman).join(' - ')}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                <button
                    onClick={() => generatedEvents && handlePlay('generator', generatedEvents)}
                    disabled={!generatedEvents}
                    className="midi-btn"
                    style={playingId === 'generator' ? { background: '#ef233c', color: 'white' } : {}}
                >
                    {playingId === 'generator' ? '⏹ Stop' : '▶ Play'}
                </button>
                <button
                    onClick={handleSave}
                    disabled={!generatedProgression}
                    className="midi-btn"
                    title="Save to list"
                >
                    💾 Save
                </button>
                <button
                    onClick={() => generatedProgression && generatedEvents && handleDownload({ events: generatedEvents, root, mode, style, chords: generatedProgression })}
                    disabled={!generatedProgression}
                    className="midi-btn primary"
                    style={{ width: '100%', backgroundColor: generatedProgression ? 'var(--primary-color, #3a86ff)' : undefined }}
                >
                    Download MIDI
                </button>
            </div>

            {/* Saved Progressions Accordion */}
            <div className="saved-progressions">
                <button
                    className="accordion-header"
                    onClick={() => setIsSavedOpen(!isSavedOpen)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '1rem'
                    }}
                >
                    <span>Saved Progressions ({savedProgressions.length})</span>
                    <span>{isSavedOpen ? '▼' : '▶'}</span>
                </button>

                {isSavedOpen && (
                    <div className="saved-list" style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {savedProgressions.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', opacity: 0.6 }}>No saved progressions yet.</div>}

                        {savedProgressions.map(prog => (
                            <div key={prog.id} className="saved-item" style={{
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: 600 }}>{prog.name}</div>
                                    <div style={{ fontSize: '0.8em', opacity: 0.6 }}>{new Date(prog.timestamp).toLocaleDateString()}</div>
                                </div>

                                <div style={{ fontSize: '0.9em', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                    {prog.chords.map(c => c.chordName).join(' - ')}
                                </div>

                                <div className="saved-actions" style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handlePlay(prog.id, prog.events)}
                                        className="midi-btn small"
                                        style={playingId === prog.id ? { background: '#ef233c', color: 'white', fontSize: '0.8rem', padding: '4px 8px' } : { fontSize: '0.8rem', padding: '4px 8px' }}
                                    >
                                        {playingId === prog.id ? '⏹' : '▶'}
                                    </button>
                                    <button
                                        onClick={() => handleDownload(prog)}
                                        className="midi-btn small"
                                        style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                                    >
                                        ⬇ MIDI
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(prog.id, e)}
                                        className="midi-btn small"
                                        style={{ fontSize: '0.8rem', padding: '4px 8px', marginLeft: 'auto', background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
