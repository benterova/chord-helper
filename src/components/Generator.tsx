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
    const [enableRhythm, setEnableRhythm] = useState(false);

    const [generatedProgression, setGeneratedProgression] = useState<Chord[] | null>(null);
    const [generatedEvents, setGeneratedEvents] = useState<MidiEvent[] | null>(null);

    // Playback State
    const [playingId, setPlayingId] = useState<string | null>(null);

    // Saved Progressions State
    const [savedProgressions, setSavedProgressions] = useLocalStorage<SavedProgression[]>('saved_progressions', []);
    const [isSavedOpen, setIsSavedOpen] = useState(false); // Accordion state
    const [_isGenerating, _setIsGenerating] = useState(false);
    const [displayMode, setDisplayMode] = useState<'roman' | 'chord'>('roman'); // Accordion state

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
        [STYLES.POP]: 'Pop',
        [STYLES.JAZZ]: 'Jazz',
        [STYLES.BLUES]: 'Blues',
        [STYLES.RNB]: 'R&B',
        [STYLES.ROCK]: 'Rock',
        [STYLES.LOFI]: 'Lo-Fi',
        [STYLES.EPIC]: 'Cinematic',
        [STYLES.BOSSA]: 'Bossa Nova',
        [STYLES.FOLK]: 'Folk',
        [STYLES.HYPERPOP]: 'Hyperpop',
        [STYLES.JPOP]: 'J-Pop',
        [STYLES.FUTURE]: 'Future Bass',
        [STYLES.DARK]: 'Dark Trap'
    };

    const cycleStyle = (direction: 1 | -1) => {
        const styles = Object.values(STYLES);
        const currentIndex = styles.indexOf(style);
        let nextIndex = currentIndex + direction;

        // Wrap around
        if (nextIndex < 0) nextIndex = styles.length - 1;
        if (nextIndex >= styles.length) nextIndex = 0;

        setStyle(styles[nextIndex]);
    };

    const cycleLength = (direction: 1 | -1) => {
        const lengths = [4, 8, 16];
        const currentIndex = lengths.indexOf(length);
        let nextIndex = currentIndex + direction;

        // Wrap around
        if (nextIndex < 0) nextIndex = lengths.length - 1;
        if (nextIndex >= lengths.length) nextIndex = 0;

        setLength(lengths[nextIndex]);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent', position: 'relative' }}>

            {/* Drawer Container (Absolute) */}
            <div className={`aero-drawer-container ${isSavedOpen ? 'open' : ''}`}>
                <div style={{ padding: '8px', borderBottom: '1px solid #333', background: '#1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Memory Card</span>
                    <button onClick={() => setIsSavedOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                </div>
                {/* Re-use aero-widget-inner here for scrolling THE DRAWER only if needed, but simple map is fine */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                    {savedProgressions.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                            Card Empty<br />Save a progression!
                        </div>
                    ) : (
                        <div className="aero-saved-list">
                            {savedProgressions.map((p) => (
                                <div key={p.id} className="aero-saved-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>{new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button onClick={() => {
                                                setGeneratedProgression(p.chords);
                                                setGeneratedEvents(p.events);
                                                setStyle(p.style);
                                                // Assuming root/mode are set by context, or need to be set here if loading from saved
                                                // setRoot(p.root);
                                                // setMode(p.mode);
                                                setIsSavedOpen(false); // Close drawer after loading
                                            }} className="aero-btn-small" style={{ fontSize: '9px', padding: '2px 6px' }}>LOAD</button>
                                            <button onClick={(e) => handleDelete(p.id, e)} className="aero-btn-small" style={{ fontSize: '9px', padding: '2px 6px', color: '#d44' }}>DEL</button>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#aaa', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                        {p.chords.map(c => c.chordName).join(' - ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Drawer Handle (Pull Tab) - When OPEN, it's at the bottom of the drawer? Or removed? */}
            </div>

            {/* Manual Drawer Tab (Always visible at top of window if drawer is closed) */}
            <button
                className={`aero-drawer-tab ${isSavedOpen ? 'active' : ''}`}
                onClick={() => setIsSavedOpen(!isSavedOpen)}
                title={isSavedOpen ? "Close Memory" : "Open Memory Card"}
            >
                {isSavedOpen ? '▲ CLOSE' : '▼ MEMORY'}
            </button>


            {/* LCD Display (Absolute Pop-out) - Expanded for Settings */}
            <div className="aero-lcd-container">
                <div className="aero-lcd-screen" style={{
                    background: '#0a1510',
                    border: '2px solid #3a4a40',
                    borderRadius: '4px',
                    padding: '8px',
                    marginBottom: '10px',
                    fontFamily: "'Courier New', monospace",
                    color: '#00ff41',
                    textShadow: '0 0 5px rgba(0, 255, 65, 0.5)',
                    position: 'relative',
                    minHeight: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    {/* Display Mode Toggle */}
                    <button
                        className="aero-lcd-toggle"
                        onClick={() => setDisplayMode(prev => prev === 'roman' ? 'chord' : 'roman')}
                        title="Toggle Display Mode"
                    >
                        {displayMode === 'roman' ? 'ROM' : 'CHD'}
                    </button>

                    <div style={{
                        fontSize: '10px',
                        opacity: 0.7,
                        textTransform: 'uppercase',
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        paddingLeft: '35px' // Space for toggle button
                    }}>
                        <span>Active Sequence</span>
                        <span>{generatedProgression ? `${length} BARS` : 'READY'}</span>
                    </div>

                    <div className={`roman-numerals ${length === 16 ? 'lcd-text-squished' : ''}`} style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '6px',
                        textAlign: 'center'
                    }}>
                        {generatedProgression && generatedProgression.length > 0
                            ? generatedProgression.map(c => displayMode === 'roman' ? c.roman : c.chordName).join(' - ')
                            : 'PRESS GENERATE'}
                    </div>

                    {/* Bottom Row: Settings (Style & Length) - Refactored Layout */}
                    <div className="aero-settings-row">
                        {/* STYLE Control */}
                        <div className="aero-setting-item">
                            <div className="info-col">
                                <span className="label">STYLE</span>
                                <span className="value">{styleLabels[style].toUpperCase()}</span>
                            </div>
                            <div className="controls-col">
                                <button onClick={() => cycleStyle(-1)} title="Previous Style">◄</button>
                                <button onClick={() => cycleStyle(1)} title="Next Style">►</button>
                            </div>
                        </div>

                        {/* LENGTH Control */}
                        <div className="aero-setting-item">
                            <div className="info-col">
                                <span className="label">LENGTH</span>
                                <span className="value">{length} BARS</span>
                            </div>
                            <div className="controls-col">
                                <button onClick={() => cycleLength(-1)} title="Decrease Length">◄</button>
                                <button onClick={() => cycleLength(1)} title="Increase Length">►</button>
                            </div>
                        </div>
                    </div>

                    <div style={{ position: 'absolute', right: '10px', top: '10px', display: 'flex', gap: '4px' }}>
                        {/* LCD small indicators or mini buttons */}
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: playingId === 'generator' ? '#0f0' : '#333', boxShadow: playingId === 'generator' ? '0 0 5px #0f0' : 'none' }}></div>
                    </div>
                </div>
                <div className="aero-lcd-gloss"></div>
            </div>

            {/* Main Controls - Retro Synth Orbit Layout */}
            <div className="aero-generator-controls">

                {/* Center: Play Button (Big) */}
                <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ParticleSystem
                        active={playingId === 'generator'}
                        width={200}
                        height={200}
                        color="rgba(0, 174, 255, "
                        intensity={playingId === 'generator' ? 'high' : 'low'}
                    />
                    <button
                        className={`aero-btn-main aero-btn-round large ${playingId === 'generator' ? 'playing' : ''}`}
                        style={{ position: 'relative', zIndex: 30 }}
                        title={playingId === 'generator' ? "Stop" : "Play"}
                        onClick={() => generatedEvents && handlePlay('generator', generatedEvents)}
                        disabled={!generatedEvents}
                    >
                        <span style={{ fontSize: '36px', marginLeft: playingId === 'generator' ? '0' : '4px' }}>
                            {playingId === 'generator' ? '■' : '▶'}
                        </span>
                    </button>

                    {/* Orbiting Buttons (Absolute relative to center) */}

                    {/* Top Left: Generate (Orange) */}
                    <div style={{ position: 'absolute', left: '-65px', top: '-10px', width: '40px', height: '40px' }}>
                        <ParticleSystem
                            active={true}
                            width={80}
                            height={80}
                            color="rgba(255, 170, 0, "
                            intensity="low"
                        />
                        <button
                            className="aero-btn-ball orange"
                            onClick={handleGenerate}
                            title="Generate New"
                            style={{ position: 'relative', left: 0, top: 0 }}
                        >
                            <span style={{ fontSize: '24px' }}>↻</span>
                        </button>
                    </div>

                    {/* Top Right: Save (Purple) */}
                    <div style={{ position: 'absolute', right: '-65px', top: '-10px', width: '40px', height: '40px' }}>
                        <ParticleSystem
                            active={true}
                            width={80}
                            height={80}
                            color="rgba(204, 0, 255, "
                            intensity="low"
                        />
                        <button
                            className={`aero-btn-ball purple ${isSavedOpen ? 'active' : ''}`}
                            onClick={handleSave}
                            title="Save to Memory"
                            style={{ position: 'relative', right: 0, top: 0, paddingTop: '3px' }}
                        >
                            <span style={{ fontSize: '22px' }}>💾</span>
                        </button>
                    </div>

                    {/* Bottom Left: Rhythm Toggle (Red) */}
                    <div style={{ position: 'absolute', left: '-65px', bottom: '-10px', width: '40px', height: '40px' }}>
                        <ParticleSystem
                            active={enableRhythm}
                            width={80}
                            height={80}
                            color="rgba(255, 0, 68, "
                            intensity={enableRhythm ? "medium" : "low"}
                        />
                        <button
                            className={`aero-btn-ball ${enableRhythm ? 'red' : 'grey'}`}
                            onClick={() => setEnableRhythm(!enableRhythm)}
                            title={enableRhythm ? "Rhythm On" : "Rhythm Off"}
                            style={{ position: 'relative', left: 0, bottom: 0 }}
                        >
                            <span style={{ fontSize: '22px' }}>🥁</span>
                        </button>
                    </div>

                    {/* Bottom Right: Download (Cyan) */}
                    <div style={{ position: 'absolute', right: '-65px', bottom: '-10px', width: '40px', height: '40px' }}>
                        <ParticleSystem
                            active={!!generatedProgression}
                            width={80}
                            height={80}
                            color="rgba(0, 204, 255, "
                            intensity="low"
                        />
                        <button
                            className="aero-btn-ball cyan"
                            onClick={() => generatedProgression && generatedEvents && handleDownload({ events: generatedEvents, root, mode, style, chords: generatedProgression })}
                            disabled={!generatedProgression}
                            title="Download MIDI"
                            style={{ position: 'relative', right: 0, bottom: 0 }}
                        >
                            <span style={{ fontSize: '24px' }}>⬇</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* Config Panel REMOVED - moved to LCD */}
        </div>
    );
};

