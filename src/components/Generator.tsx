import React, { useState, useEffect } from 'react';
import { STYLES, type Style, generateProgression, applyRhythm, type MidiEvent } from '../lib/engine';
import { downloadGeneratedMidi } from '../lib/midi';
import type { Chord } from '../lib/theory';
import { audioEngine } from '../lib/audio';
import useLocalStorage from '../hooks/useLocalStorage';

import { useMusicTheory } from '../lib/MusicTheoryContext';
import { ParticleSystem } from './ParticleSystem';

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

    // 1. Auto-Generate on Mount, Root/Mode Change, and Style Change
    useEffect(() => {
        handleGenerate();
    }, [root, mode, style]);

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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
            {/* Scrollable Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '10px' }}>

                {/* Top LCD Display Area */}
                <div style={{ padding: '0 0 15px 0', flexShrink: 0 }}>
                    <div className="aero-lcd-container">
                        <div className="aero-lcd-screen">
                            {generatedProgression ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                    <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#fff', textShadow: '0 0 10px rgba(0,255,255,0.8)' }}>
                                        {generatedProgression.map(c => c.chordName).join(' - ')}
                                    </div>
                                    <div style={{ fontSize: '1em', color: 'rgba(255,255,255,0.7)' }}>
                                        {generatedProgression.map(c => c.roman).join(' - ')}
                                    </div>
                                    <div style={{ fontSize: '0.8em', color: '#00ffcc', marginTop: '5px' }}>
                                        Style: {style} • {length} Bars
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Ready to Generate...</div>
                            )}
                        </div>
                        <div className="aero-lcd-gloss"></div>
                    </div>
                </div>

                {/* Control Interface - Shiny Buttons */}
                <div className="aero-controls-panel">
                    <button
                        className="aero-btn-round"
                        title="Generate New"
                        onClick={handleGenerate}
                    >
                        <span style={{ fontSize: '1.5em', transform: 'rotate(45deg)', display: 'block' }}>↻</span>
                    </button>

                    <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ParticleSystem active={playingId === 'generator'} width={200} height={200} />
                        <button
                            className={`aero-btn-main ${playingId === 'generator' ? 'playing' : ''}`}
                            style={{ position: 'relative', zIndex: 1 }}
                            title={playingId === 'generator' ? "Stop" : "Play"}
                            onClick={() => generatedEvents && handlePlay('generator', generatedEvents)}
                            disabled={!generatedEvents}
                        >
                            {playingId === 'generator' ? '■' : '▶'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                            className="aero-btn-small"
                            title="Save"
                            onClick={handleSave}
                            disabled={!generatedProgression}
                        >
                            💾
                        </button>
                        <button
                            className="aero-btn-small"
                            title="Download MIDI"
                            onClick={() => generatedProgression && generatedEvents && handleDownload({ events: generatedEvents, root, mode, style, chords: generatedProgression })}
                            disabled={!generatedProgression}
                        >
                            ⬇
                        </button>
                    </div>
                </div>

                {/* Configuration Panel - Glass Panel */}
                <div className="aero-config-panel">
                    <div className="aero-form-row">
                        <label>Style</label>
                        <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value as Style)}
                            className="aero-glass-select"
                        >
                            {Object.values(STYLES).map(s => {
                                let label = styleLabels[s] || (s.charAt(0).toUpperCase() + s.slice(1));
                                return <option key={s} value={s}>{label}</option>;
                            })}
                        </select>
                    </div>

                    <div className="aero-form-row">
                        <label>Length</label>
                        <select
                            value={length}
                            onChange={(e) => setLength(parseInt(e.target.value, 10))}
                            className="aero-glass-select"
                        >
                            <option value="4">4 Bars</option>
                            <option value="8">8 Bars</option>
                            <option value="16">16 Bars</option>
                        </select>
                    </div>

                    <div className="aero-form-row">
                        <label className="aero-checkbox">
                            <input type="checkbox" checked={enableRhythm} onChange={(e) => setEnableRhythm(e.target.checked)} />
                            <span>Rhythm Pattern</span>
                        </label>
                    </div>
                </div>

                {/* Saved List (Collapsible) */}
                <div style={{ flex: '1 0 auto', marginTop: '15px' }}>
                    <button
                        onClick={() => setIsSavedOpen(!isSavedOpen)}
                        className="aero-accordion-header"
                    >
                        {isSavedOpen ? '▼' : '▶'} Saved Items ({savedProgressions.length})
                    </button>

                    {isSavedOpen && (
                        <div className="aero-accordion-content">
                            {savedProgressions.map(prog => (
                                <div key={prog.id} className="aero-saved-item">
                                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginRight: '10px' }}>
                                        <div style={{ fontWeight: 600, color: '#004466' }}>{prog.name}</div>
                                        <div style={{ fontSize: '0.85em', color: '#0088aa' }}>
                                            {prog.chords.map(c => c.chordName).join('-')}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button className="aero-mini-btn" onClick={() => handlePlay(prog.id, prog.events)}>
                                            {playingId === prog.id ? '■' : '▶'}
                                        </button>
                                        <button className="aero-mini-btn" onClick={() => handleDownload(prog)}>⬇</button>
                                        <button className="aero-mini-btn delete" onClick={(e) => handleDelete(prog.id, e)}>✕</button>
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
