import React, { useState, useEffect } from 'react';
import { STYLES, type Style, generateProgression, applyRhythm, type MidiEvent } from '../lib/engine';
import { downloadGeneratedMidi } from '../lib/midi';
import type { Chord } from '../lib/theory';
import { audioEngine } from '../lib/audio';
import useLocalStorage from '../hooks/useLocalStorage';

import { useMusicTheory } from '../lib/MusicTheoryContext';
// import { ParticleSystem } from './ParticleSystem';
import { Visualizer } from './Visualizer';


// ... imports ...
import { Clippy } from './Clippy';

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
    // const [isSavedOpen, setIsSavedOpen] = useState(false); // REMOVED
    const [_isGenerating, _setIsGenerating] = useState(false);
    const [displayMode, setDisplayMode] = useState<'roman' | 'chord'>('roman');
    const [showInfo, setShowInfo] = useState(false);

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
        audioEngine.stop();
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
        setScreenMode('MEMORY'); // Auto-switch to Memory screen
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedProgressions(savedProgressions.filter(p => p.id !== id));
    };

    const handleDownload = () => {
        if (!generatedEvents || !generatedProgression) return;
        const name = generatedProgression.map(c => c.chordName).join('-');
        downloadGeneratedMidi(name, generatedEvents, root, mode, style);
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

    const [screenMode, setScreenMode] = useState<'MAIN' | 'MEMORY'>('MAIN');

    // ... (keep existing effects)

    const toggleScreenMode = () => {
        setScreenMode(prev => prev === 'MAIN' ? 'MEMORY' : 'MAIN');
    };

    return (
        <div className="aero-widget-dark"> {/* Main Device Body */}

            {/* 1. LCD SCREEN (Center) */}
            <div className="aero-widget-content">
                <div className="aero-lcd-container">
                    {/* ... (LCD content) ... */}
                    <div className="aero-lcd-screen">

                        {screenMode === 'MAIN' ? (
                            <>
                                {/* Top Bar: Status */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '10px', opacity: 0.7 }}>
                                    <span>{playingId === 'generator' ? 'PLAYING' : 'READY'}</span>
                                    <span>{styleLabels[style].toUpperCase()}</span>
                                </div>

                                {/* Detailed Info */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                                    <div className={`roman-numerals ${length >= 8 ? 'lcd-text-squished' : ''}`} style={{
                                        width: '100%',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {generatedProgression
                                            ? generatedProgression.map(c => displayMode === 'roman' ? c.roman : c.chordName).join(' - ')
                                            : 'NO DISC'}
                                    </div>

                                    {/* Visualizer Overlay */}
                                    <div style={{ width: '100%', height: '20px', marginTop: '5px', opacity: 0.5 }}>
                                        <Visualizer width={200} height={20} color="#00ffff" style={{ width: '100%', height: '100%' }} />
                                    </div>
                                </div>

                                {/* Bottom Bar: Settings info */}
                                <div className="lcd-row" style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <span className="lcd-label">LEN: <span className="lcd-value">{length}</span></span>
                                        <span className="lcd-label">RHYTHM: <span className="lcd-value">{enableRhythm ? 'ON' : 'OFF'}</span></span>
                                    </div>
                                    <span className="lcd-label">{displayMode === 'roman' ? 'ROM' : 'CHD'}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* MEMORY MODE (Saved List) */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(0,255,255,0.3)', paddingBottom: '2px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>MEMORY CARD</span>
                                    <span style={{ fontSize: '10px' }}>{savedProgressions.length}/10</span>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', width: '100%', fontSize: '10px', gap: '2px', display: 'flex', flexDirection: 'column' }}>
                                    {savedProgressions.length === 0 ? (
                                        <div style={{ textAlign: 'center', marginTop: '10px', opacity: 0.5 }}>[EMPTY]</div>
                                    ) : (
                                        savedProgressions.map(p => (
                                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', padding: '2px', background: 'rgba(0,255,255,0.1)' }}
                                                onClick={() => {
                                                    setGeneratedProgression(p.chords);
                                                    setGeneratedEvents(p.events);
                                                    setStyle(p.style);
                                                    setScreenMode('MAIN');
                                                }}>
                                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                                                    {p.chords.map(c => c.chordName).join('-')}
                                                </span>
                                                <span onClick={(e) => handleDelete(p.id, e)} style={{ color: '#ff6666', fontWeight: 'bold', paddingLeft: '5px' }}>X</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>

            {/* Clippy Assistant */}
            <Clippy isVisible={showInfo} onClose={() => setShowInfo(false)} />

            {/* 2. PHYSICAL CONTROLS (Overlay) */}
            <div className="player-controls-container">

                {/* LEFT CLUSTER: Transport (Vertical) */}
                <div className="control-cluster-left">
                    <button className="silver-btn silver-btn-small" onClick={() => cycleStyle(-1)} title="Prev Style">
                        ◄◄
                    </button>
                    <button className="silver-btn silver-btn-large"
                        onClick={() => generatedEvents && handlePlay('generator', generatedEvents)}
                        title={playingId === 'generator' ? "Stop" : "Play"}>
                        {playingId === 'generator' ? '■' : '▶'}
                    </button>
                    <button className="silver-btn silver-btn-small" onClick={() => cycleStyle(1)} title="Next Style">
                        ►►
                    </button>
                </div>

                {/* RIGHT CLUSTER: Main Actions (Vertical) */}
                <div className="control-cluster-right">
                    <button className="silver-btn silver-btn-large" onClick={handleGenerate} title="Generate">
                        GEN
                    </button>
                    <button className="silver-btn silver-btn-large" onClick={handleSave} title="Save">
                        SAVE
                    </button>
                </div>

                {/* BOTTOM BAR: Settings (Horizontal Pills) */}
                <div className="control-bar-bottom">
                    <button className="silver-btn silver-btn-pill" onClick={() => cycleLength(1)} title="Length">
                        LEN
                    </button>
                    <button className={`silver-btn silver-btn-pill ${enableRhythm ? 'active' : ''}`} onClick={() => setEnableRhythm(!enableRhythm)} title="Rhythm">
                        RHY
                    </button>
                    <button className={`silver-btn silver-btn-pill ${screenMode === 'MEMORY' ? 'active' : ''}`} onClick={toggleScreenMode} title="Memory">
                        MEM
                    </button>
                    <button className="silver-btn silver-btn-pill" onClick={() => setDisplayMode(prev => prev === 'roman' ? 'chord' : 'roman')} title="View">
                        VIEW
                    </button>
                    <button className={`silver-btn silver-btn-pill ${showInfo ? 'active' : ''}`} onClick={() => setShowInfo(!showInfo)} title="Info">
                        ??
                    </button>
                </div>

            </div>

            {/* Special "Hardware" Download Button - Top Right Corner */}
            <div className="aero-dload-container">
                <button className="aero-dload-btn" onClick={handleDownload} title="Download MIDI File">
                    <div className="dload-content-wrapper">
                        <span className="dload-icon">⬇</span>
                        <span className="dload-text">MIDI</span>
                    </div>
                </button>
            </div>

        </div>
    );
};

