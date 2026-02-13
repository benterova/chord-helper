import React, { useState, useEffect } from 'react';
import { audioEngine } from '../lib/audio';

export const GlobalControls: React.FC = () => {
    const [isMetronome, setIsMetronome] = useState(false);
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

    return (
        <aside className="details-panel" style={{ marginTop: '2rem' }}>
            <div className="panel-section">
                <h2>Global Audio Settings</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label className="toggle-switch checkbox-label" style={{ justifyContent: 'space-between', width: '100%' }}>
                        <span>Metronome</span>
                        <input
                            type="checkbox"
                            checked={isMetronome}
                            onChange={e => setIsMetronome(e.target.checked)}
                        />
                    </label>

                    <label className="toggle-switch checkbox-label" style={{ justifyContent: 'space-between', width: '100%' }}>
                        <span>Loop Playback</span>
                        <input
                            type="checkbox"
                            checked={isLoop}
                            onChange={e => setIsLoop(e.target.checked)}
                        />
                    </label>

                    <button
                        onClick={handleStopAll}
                        className="midi-btn"
                        style={{
                            marginTop: '0.5rem',
                            width: '100%',
                            background: '#ef233c',
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    >
                        ⏹ Stop All Audio
                    </button>
                </div>
            </div>
        </aside>
    );
};
