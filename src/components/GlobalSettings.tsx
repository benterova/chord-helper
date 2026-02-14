import React, { useState, useEffect } from 'react';

import { audioEngine } from '../lib/audio';

export const GlobalSettings: React.FC = () => {
    // We only need reset which is just reload for now, so we don't need WindowManager context.

    const [playingId, setPlayingId] = useState<string | null>(null);

    useEffect(() => {
        return audioEngine.subscribe(id => setPlayingId(id));
    }, []);
    const [isMetronome, setIsMetronome] = useState(true);
    const [isLoop, setIsLoop] = useState(false);
    const [isChill, setIsChill] = useState(false);

    // Sync Audio State
    useEffect(() => {
        audioEngine.setMetronome(isMetronome);
    }, [isMetronome]);

    useEffect(() => {
        audioEngine.setChillMode(isChill);
    }, [isChill]);

    useEffect(() => {
        // Subscribe to external changes
        const unsubscribe = audioEngine.subscribeLoop((looping) => {
            if (isLoop !== looping) setIsLoop(looping);
        });
        return unsubscribe;
    }, [isLoop]);

    // Handle user toggle
    const handleLoopToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        setIsLoop(newValue);
        audioEngine.setLoop(newValue);
    };

    const handleStopAll = () => {
        audioEngine.stop();
    };


    return (
        <div className="global-settings" style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '1.5rem' }}>
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
                        onChange={handleLoopToggle}
                    />
                    Loop
                </label>

                <label className="taskbar-checkbox">
                    <input
                        type="checkbox"
                        checked={isChill}
                        onChange={e => setIsChill(e.target.checked)}
                    />
                    Chill Mode 🌊
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


        </div>
    );
};
