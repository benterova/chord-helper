import React, { useState } from 'react';
import { audioEngine } from '../lib/audio';
import { type Chord, getChordMidiNotes } from '../lib/theory';
import { PROGRESSIONS } from '../lib/constants';
import { useMusicTheory } from '../lib/MusicTheoryContext';

export const ProgressionList: React.FC = () => {
    const { root, chords, mode } = useMusicTheory();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);

    const matchProgressions = PROGRESSIONS[mode] || [];

    // Helpers
    const getProgressionChords = (indices: number[]): (Chord | undefined)[] => {
        return indices.map(idx => chords.find(c => c.degree === idx));
    };

    const handlePlay = async (indices: number[], id: string) => {
        if (playingId) return;
        setPlayingId(id);
        const progChords = getProgressionChords(indices);

        for (const chord of progChords) {
            if (chord) {
                const notes = getChordMidiNotes(chord);
                audioEngine.playNotes(notes, 0.8);
                await new Promise(r => setTimeout(r, 1000));
            }
        }
        setPlayingId(null);
    };

    const handleStop = () => {
        setPlayingId(null);
        audioEngine.stop();
    };

    // New Aero Icons
    const Icons = {
        Play: <span style={{ textShadow: '0 0 5px rgba(255,255,255,0.8)' }}>▶</span>,
        Stop: <span style={{ textShadow: '0 0 5px rgba(255,0,0,0.5)' }}>■</span>,
        Music: <span style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }}>🎵</span>
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>

            {/* Aero Toolbar */}
            <div className="aero-toolbar">
                <div className="aero-toolbar-group">
                    <button className="aero-toolbar-btn" onClick={() => selectedId !== null && handlePlay(matchProgressions[selectedId].indices, `prog-${selectedId}`)} disabled={selectedId === null}>
                        <span style={{ color: '#00cc00', fontSize: '1.2em' }}>{Icons.Play}</span>
                        <span>Play</span>
                    </button>
                    <button className="aero-toolbar-btn" onClick={handleStop}>
                        <span style={{ color: '#cc0000', fontSize: '1.2em' }}>{Icons.Stop}</span>
                        <span>Stop</span>
                    </button>
                </div>
                <div className="aero-toolbar-separator"></div>
                <div className="aero-toolbar-group">
                    <button className="aero-toolbar-btn" disabled>
                        <span style={{ fontSize: '1.2em' }}>💾</span>
                        <span>Save</span>
                    </button>
                    <button className="aero-toolbar-btn" disabled>
                        <span style={{ fontSize: '1.2em' }}>📤</span>
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
                            onDoubleClick={() => handlePlay(prog.indices, `prog-${idx}`)}
                        >
                            <div className="aero-list-icon">
                                {isPlaying ? <span className="pulse-anim">🔊</span> : Icons.Music}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ fontWeight: '600', color: '#003366' }}>{prog.name}</div>
                                <div style={{ fontSize: '0.8em', color: '#555' }}>
                                    {prog.indices.map(i => chords.find(c => c.degree === i)?.roman).join(' - ')}
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
