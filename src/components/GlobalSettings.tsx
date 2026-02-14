import React, { useState, useEffect } from 'react';
import { useMusicTheory } from '../lib/MusicTheoryContext';
import { useWindowManager } from './WindowManager';
import { audioEngine } from '../lib/audio';
import { NOTES, MODE_DISPLAY_NAMES, type ScaleName } from '../lib/constants';

export const GlobalSettings: React.FC = () => {
    const { root, mode, setRoot, setMode } = useMusicTheory();
    // const { windows, toggleMinimize, focusWindow, isLocked, setIsLocked } = useWindowManager(); 
    // We only need reset which is just reload for now, or we can use resetLayout from context if exposed.
    // But the current code uses window.location.reload(), so we don't need WindowManager context at all here unless we want to use the proper resetLayout.
    // Let's keep it clean.
    const { } = useWindowManager(); // Or just remove if unused.

    const [playingId, setPlayingId] = useState<string | null>(null);

    useEffect(() => {
        return audioEngine.subscribe(id => setPlayingId(id));
    }, []);
    const [isMetronome, setIsMetronome] = useState(true);
    const [isLoop, setIsLoop] = useState(false);

    // Sync Audio State
    useEffect(() => {
        audioEngine.setMetronome(isMetronome);
    }, [isMetronome]);

    useEffect(() => {
        audioEngine.setLoop(isLoop);
    }, [isLoop]);

    const handleStopAll = () => {
        audioEngine.stop();
    };

    const onRootChange = setRoot;
    const onModeChange = setMode;
    const standardModes: ScaleName[] = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'natural_minor', 'locrian'];
    const otherScales: ScaleName[] = ['harmonic_minor', 'melodic_minor', 'major_pentatonic', 'minor_pentatonic', 'blues'];
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            gap: '1.5rem',
            color: '#e0e0e0',
            fontFamily: '"Segoe UI", sans-serif'
        }}>
            {/* Music Context Section */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label htmlFor="gs-key" style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key</label>
                    <select
                        id="gs-key"
                        value={root}
                        onChange={(e) => onRootChange(e.target.value)}
                        style={{
                            background: '#f0f0f0',
                            border: '1px solid #999',
                            borderRadius: '2px',
                            color: '#333',
                            padding: '2px 4px',
                            fontSize: '0.9rem',
                            width: '50px',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                        }}
                    >
                        {NOTES.map(note => (
                            <option key={note} value={note}>{note}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label htmlFor="gs-scale" style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scale</label>
                    <select
                        id="gs-scale"
                        value={mode}
                        onChange={(e) => onModeChange(e.target.value as ScaleName)}
                        style={{
                            background: '#f0f0f0',
                            border: '1px solid #999',
                            borderRadius: '2px',
                            color: '#333',
                            padding: '2px 4px',
                            fontSize: '0.9rem',
                            minWidth: '130px',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                        }}
                    >
                        <optgroup label="Standard Modes">
                            {standardModes.map(m => (
                                <option key={m} value={m}>{MODE_DISPLAY_NAMES[m]}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Other Scales">
                            {otherScales.map(m => (
                                <option key={m} value={m}>{MODE_DISPLAY_NAMES[m]}</option>
                            ))}
                        </optgroup>
                    </select>
                </div>
            </div>

            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.15)', borderRight: '1px solid rgba(0,0,0,0.2)' }}></div>

            {/* Audio Controls Section */}
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                        type="checkbox"
                        checked={isMetronome}
                        onChange={e => setIsMetronome(e.target.checked)}
                        style={{ accentColor: '#4cc9f0' }}
                    />
                    Metronome
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                        type="checkbox"
                        checked={isLoop}
                        onChange={e => setIsLoop(e.target.checked)}
                        style={{ accentColor: '#4cc9f0' }}
                    />
                    Loop
                </label>

                <button
                    onClick={handleStopAll}
                    style={{

                        background: 'none',
                        border: 'none',
                        color: playingId ? '#fff' : '#666',
                        fontSize: '0.85rem',
                        fontFamily: 'Segoe UI, Tahoma, sans-serif',
                        fontWeight: 600,
                        cursor: playingId ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 4px'
                    }}
                >
                    {playingId ? (
                        <>
                            <span style={{ color: '#e00' }}>■</span> Stop Playback
                        </>
                    ) : (
                        <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>Nothing Playing</span>
                    )}
                </button>
            </div>

            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.15)', borderRight: '1px solid rgba(0,0,0,0.2)' }}></div>

            {/* Window Management Section */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                    onClick={() => window.location.reload()}
                    title="Reset Layout"
                    style={{
                        background: 'linear-gradient(to bottom, #5bc0de 0%, #46b8da 100%)',
                        border: '1px solid #269abc',
                        borderRadius: '3px',
                        color: 'white',
                        padding: '5px 10px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                >
                    ⟲ Reset
                </button>
            </div>
        </div>

    );
};
