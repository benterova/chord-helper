import React, { useState } from 'react';
import { audioEngine } from '../lib/audio';
import { generateVariationSequence } from '../lib/theory';
import { PROGRESSIONS } from '../lib/constants';
import { downloadProgressionMidi } from '../lib/midi';
import { useMusicTheory } from '../lib/MusicTheoryContext';

export const ProgressionList: React.FC = () => {
    const { root, mode, chords } = useMusicTheory();
    const [isExtension, setIsExtension] = useState(false);
    const [isVoicing, setIsVoicing] = useState(false);
    const [isVariation, setIsVariation] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    React.useEffect(() => {
        return audioEngine.subscribe(id => setPlayingId(id));
    }, []);

    const progs = PROGRESSIONS[mode] || [];

    const handleDownload = (progName: string, indices: number[], _genre: string) => {
        const sequence = generateVariationSequence(indices, chords, isVariation, isExtension, isVoicing);
        downloadProgressionMidi(progName, sequence, root, mode, {
            isVariation,
            isExtension,
            isVoicing
        });
    };

    const handlePlay = (indices: number[], id: string) => {
        if (playingId === id) {
            audioEngine.stop();
            return;
        }

        const sequence = generateVariationSequence(indices, chords, isVariation, isExtension, isVoicing);
        const BPM = 120;
        const secondsPerBeat = 60 / BPM;

        const audioSequence = sequence.map(chord => ({
            notes: chord.midiNotes,
            duration: 4 * secondsPerBeat
        }));

        audioEngine.playProgression(audioSequence, id);
    };

    const handleStop = () => {
        audioEngine.stop();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Windows 7 Toolbar */}
            <div className="win7-toolbar" style={{ justifyContent: 'space-between', paddingRight: '10px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                    {selectedId !== null ? (
                        <>
                            {playingId === `prog-${selectedId}` ? (
                                <button className="win7-toolbar-btn" onClick={handleStop}>
                                    <span style={{ color: '#e00', fontWeight: 'bold', fontSize: '1.2em', lineHeight: 1 }}>■</span>
                                    <span>Stop</span>
                                </button>
                            ) : (
                                <button className="win7-toolbar-btn" onClick={() => handlePlay(progs[selectedId].indices, `prog-${selectedId}`)}>
                                    <span style={{ color: '#4a7', fontWeight: 'bold', fontSize: '1.2em', lineHeight: 1 }}>▶</span>
                                    <span>Play</span>
                                </button>
                            )}
                            <button className="win7-toolbar-btn" onClick={() => handleDownload(`progression-${selectedId}`, progs[selectedId].indices, 'pop')}>
                                <span style={{ fontSize: '1.1em' }}>💾</span>
                                <span>Save MIDI</span>
                            </button>
                        </>
                    ) : (
                        <div style={{ padding: '4px 8px', color: '#888', fontStyle: 'italic', fontSize: '0.9em' }}>
                            Select a progression...
                        </div>
                    )}
                </div>

                {/* Visual Options in Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
                    <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} title="Add 7th intervals to basic triads">
                        <input type="checkbox" checked={isExtension} onChange={e => setIsExtension(e.target.checked)} />
                        <span>Add 7ths</span>
                    </label>
                    <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} title="Use smoother voice leading">
                        <input type="checkbox" checked={isVoicing} onChange={e => setIsVoicing(e.target.checked)} />
                        <span>Smooth Voicing</span>
                    </label>
                    <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} title="Play pattern twice">
                        <input type="checkbox" checked={isVariation} onChange={e => setIsVariation(e.target.checked)} />
                        <span>Loop 2x</span>
                    </label>
                </div>
            </div>

            {/* Address Bar-ish Header (Optional, maybe skip for simplicity inside window) */}

            {/* Explorer List View */}
            <div className="win7-inner-content" style={{ flex: 1, overflow: 'auto', background: '#fff' }}>
                <div className="explorer-list" style={{ width: '100%', minWidth: '400px' }}>
                    <div className="explorer-header">
                        <div className="col-name" style={{ width: '30%' }}>Name</div>
                        <div className="col-type" style={{ width: '50%' }}>Chords</div>
                        <div className="col-degree" style={{ width: '20%' }}>Genre</div>
                    </div>

                    {progs.length === 0 && (
                        <div style={{ padding: '20px', color: '#888', textAlign: 'center' }}>No progressions found for this mode.</div>
                    )}

                    {progs.map((prog, idx) => {
                        const sequence = generateVariationSequence(prog.indices, chords, isVariation, isExtension, isVoicing);
                        const displayChords = sequence.map(c => c.chordName).join(' - ');
                        const isSelected = selectedId === idx;
                        const isPlaying = playingId === `prog-${idx}`;

                        return (
                            <div
                                key={idx}
                                className={`explorer-row ${isSelected ? 'selected' : ''}`}
                                onClick={() => setSelectedId(idx)}
                                onDoubleClick={() => handlePlay(prog.indices, `prog-${idx}`)}
                            >
                                <div className="col-name" style={{ width: '30%', fontWeight: isPlaying ? 'bold' : 'normal', color: isPlaying ? '#003399' : 'inherit' }}>
                                    {isPlaying && '▶ '}
                                    {prog.name}
                                </div>
                                <div className="col-type" style={{ width: '50%' }}>{displayChords}</div>
                                <div className="col-degree" style={{ width: '20%' }}>{prog.genre || 'Pop'}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Status Bar */}
            <div className="win7-status-bar">
                <div>{progs.length} items</div>
                <div>{selectedId !== null ? '1 item selected' : ''}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Controls moved to top */}
                </div>
            </div>
        </div>
    );
};
