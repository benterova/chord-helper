import React, { useState, useEffect } from 'react';
import { useMusicTheory } from '../lib/MusicTheoryContext';

import { audioEngine } from '../lib/audio';
import { NOTES, MODE_DISPLAY_NAMES, type ScaleName } from '../lib/constants';

export const GlobalSettings: React.FC = () => {
    const { root, mode, setRoot, setMode } = useMusicTheory();
    // We only need reset which is just reload for now, so we don't need WindowManager context.

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
        <div className="global-settings" style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '1.5rem' }}>
            {/* Music Context Section */}
            <div className="taskbar-group">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label htmlFor="gs-key" className="taskbar-label">Key</label>
                    <select
                        id="gs-key"
                        value={root}
                        onChange={(e) => onRootChange(e.target.value)}
                        className="taskbar-select"
                        style={{ width: '50px' }}
                    >
                        {NOTES.map(note => (
                            <option key={note} value={note}>{note}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label htmlFor="gs-scale" className="taskbar-label">Scale</label>
                    <select
                        id="gs-scale"
                        value={mode}
                        onChange={(e) => onModeChange(e.target.value as ScaleName)}
                        className="taskbar-select"
                        style={{ minWidth: '130px' }}
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

            <div className="taskbar-divider"></div>

            {/* Audio Controls Section */}
            <div className="taskbar-group">
                <label className="taskbar-checkbox">
                    <input
                        type="checkbox"
                        checked={isMetronome}
                        onChange={e => setIsMetronome(e.target.checked)}
                    />
                    Metronome
                </label>

                <label className="taskbar-checkbox">
                    <input
                        type="checkbox"
                        checked={isLoop}
                        onChange={e => setIsLoop(e.target.checked)}
                    />
                    Loop
                </label>

                <button
                    onClick={handleStopAll}
                    className={`taskbar-btn ${playingId ? 'active' : ''}`}
                    disabled={!playingId}
                    style={{ opacity: playingId ? 1 : 0.7 }}
                >
                    {playingId ? (
                        <>
                            <span style={{ color: '#ff4444' }}>■</span> Stop
                        </>
                    ) : (
                        <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Idle</span>
                    )}
                </button>
            </div>

            <div className="taskbar-divider"></div>

            {/* Window Management Section */}
            <div className="taskbar-group">
                <button
                    onClick={() => window.location.reload()}
                    title="Reset Layout"
                    className="taskbar-btn-reset"
                >
                    ⟲ Reset
                </button>
            </div>
        </div>
    );
};
