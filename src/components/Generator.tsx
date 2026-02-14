import React, { useState, useEffect } from 'react';
import { STYLES, type Style, generateProgression, applyRhythm, type MidiEvent } from '../lib/engine';
import { downloadGeneratedMidi } from '../lib/midi';
import type { Chord } from '../lib/theory';
import { audioEngine } from '../lib/audio';
import useLocalStorage from '../hooks/useLocalStorage';

import { useMusicTheory } from '../lib/MusicTheoryContext';

// ... imports ...

export const Generator: React.FC = () => {
    const { root, mode } = useMusicTheory();

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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
            {/* Scrollable Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

                {/* Top LCD Display Area */}
                <div style={{ padding: '15px', flexShrink: 0 }}>
                    <div className="lcd-display" style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        {generatedProgression ? (
                            <>
                                <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                                    {generatedProgression.map(c => c.chordName).join(' - ')}
                                </div>
                                <div style={{ fontSize: '0.9em', opacity: 0.7, marginTop: '5px' }}>
                                    {generatedProgression.map(c => c.roman).join(' - ')}
                                </div>
                            </>
                        ) : (
                            <div style={{ opacity: 0.5 }}>Waiting for input...</div>
                        )}
                    </div>
                </div>

                {/* WMP Control Interface */}
                <div className="wmp-controls" style={{ flexShrink: 0 }}>
                    <button
                        className="wmp-btn-round"
                        title="Generate New"
                        onClick={handleGenerate}
                    >
                        ↻
                    </button>

                    <button
                        className="wmp-btn-round large"
                        title={playingId === 'generator' ? "Stop" : "Play"}
                        onClick={() => generatedEvents && handlePlay('generator', generatedEvents)}
                        disabled={!generatedEvents}
                        style={{ color: playingId === 'generator' ? '#d00' : '#1e5799' }}
                    >
                        {playingId === 'generator' ? '■' : '▶'}
                    </button>

                    <button
                        className="wmp-btn-round"
                        title="Save"
                        onClick={handleSave}
                        disabled={!generatedProgression}
                    >
                        💾
                    </button>
                    <button
                        className="wmp-btn-round"
                        title="Download MIDI"
                        onClick={() => generatedProgression && generatedEvents && handleDownload({ events: generatedEvents, root, mode, style, chords: generatedProgression })}
                        disabled={!generatedProgression}
                    >
                        ⬇
                    </button>
                </div>

                {/* Configuration Panel */}
                <div style={{ padding: '15px', background: '#f9f9f9', borderBottom: '1px solid #d9d9d9', flexShrink: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.9rem' }}>
                            <span style={{ marginBottom: '4px', color: '#555' }}>Style</span>
                            <select
                                value={style}
                                onChange={(e) => setStyle(e.target.value as Style)}
                                style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '3px' }}
                            >
                                {Object.values(STYLES).map(s => {
                                    let label = styleLabels[s] || (s.charAt(0).toUpperCase() + s.slice(1));
                                    return <option key={s} value={s}>{label}</option>;
                                })}
                            </select>
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.9rem' }}>
                            <span style={{ marginBottom: '4px', color: '#555' }}>Length</span>
                            <select
                                value={length}
                                onChange={(e) => setLength(parseInt(e.target.value, 10))}
                                style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '3px' }}
                            >
                                <option value="4">4 Bars</option>
                                <option value="8">8 Bars</option>
                                <option value="16">16 Bars</option>
                            </select>
                        </label>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                            <input type="checkbox" checked={enableRhythm} onChange={(e) => setEnableRhythm(e.target.checked)} style={{ marginRight: '6px' }} />
                            Enable Rhythm Pattern
                        </label>
                    </div>
                </div>

                {/* Saved List (Collapsible) */}
                <div style={{ flex: '1 0 auto', padding: '0' }}>
                    <button
                        onClick={() => setIsSavedOpen(!isSavedOpen)}
                        style={{
                            width: '100%',
                            padding: '8px 15px',
                            background: '#fcfcfc',
                            border: 'none',
                            borderBottom: '1px solid #e0e0e0',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: '#333',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}
                    >
                        {isSavedOpen ? '▼' : '▶'} Saved Items ({savedProgressions.length})
                    </button>

                    {isSavedOpen && (
                        <div style={{ background: '#fff' }}>
                            {savedProgressions.map(prog => (
                                <div
                                    key={prog.id}
                                    style={{
                                        padding: '8px 15px',
                                        borderBottom: '1px solid #f0f0f0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginRight: '10px' }}>
                                        <div style={{ fontWeight: 600, color: '#333' }}>{prog.name}</div>
                                        <div style={{ fontSize: '0.85em', color: '#777' }}>
                                            {prog.chords.map(c => c.chordName).join('-')}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={() => handlePlay(prog.id, prog.events)}
                                            style={{ border: '1px solid #ccc', background: '#f5f5f5', borderRadius: '3px', cursor: 'pointer', padding: '2px 6px' }}
                                        >
                                            {playingId === prog.id ? '■' : '▶'}
                                        </button>
                                        <button
                                            onClick={() => handleDownload(prog)}
                                            style={{ border: '1px solid #ccc', background: '#f5f5f5', borderRadius: '3px', cursor: 'pointer', padding: '2px 6px' }}
                                        >
                                            ⬇
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(prog.id, e)}
                                            style={{ border: '1px solid #ccc', background: '#fff0f0', color: '#d00', borderRadius: '3px', cursor: 'pointer', padding: '2px 6px' }}
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
        </div>
    );
};
