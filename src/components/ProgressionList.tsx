import React, { useState } from 'react';
import { type Chord, generateVariationSequence } from '../lib/theory';
import { PROGRESSIONS, type ScaleName } from '../lib/constants';
import { downloadProgressionMidi } from '../lib/midi';

interface ProgressionListProps {
    root: string;
    mode: ScaleName;
    chords: Chord[];
}

export const ProgressionList: React.FC<ProgressionListProps> = ({ root, mode, chords }) => {
    const [isExtension, setIsExtension] = useState(false);
    const [isVoicing, setIsVoicing] = useState(false); // Smart Voicing
    const [isVariation, setIsVariation] = useState(false); // 2-Bar Loop

    const progs = PROGRESSIONS[mode] || [];

    const handleDownload = (progName: string, indices: number[], _genre: string) => {
        const sequence = generateVariationSequence(indices, chords, isVariation, isExtension, isVoicing);
        downloadProgressionMidi(progName, sequence, root, mode, {
            isVariation,
            isExtension,
            isVoicing
        });
    };

    if (progs.length === 0) {
        return <div className="no-progs">No example progressions for this mode yet.</div>;
    }

    return (
        <section className="progressions-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2>Example Progressions</h2>
                <div className="toggles" style={{ display: 'flex', gap: '15px' }}>
                    <label className="toggle-switch checkbox-label">
                        <input type="checkbox" checked={isExtension} onChange={e => setIsExtension(e.target.checked)} />
                        <span>Add 7th/9th</span>
                    </label>
                    <label className="toggle-switch checkbox-label">
                        <input type="checkbox" checked={isVoicing} onChange={e => setIsVoicing(e.target.checked)} />
                        <span>Smart Voicing</span>
                    </label>
                    <label className="toggle-switch checkbox-label">
                        <input type="checkbox" checked={isVariation} onChange={e => setIsVariation(e.target.checked)} />
                        <span>2-Bar Loop</span>
                    </label>
                </div>
            </div>

            <div className="progressions-list">
                {progs.map((prog, idx) => {
                    // Generate sequence for display
                    const sequence = generateVariationSequence(prog.indices, chords, isVariation, isExtension, isVoicing);
                    const displayChords = sequence.map(c => c.chordName);

                    let chordsDisplay: React.ReactNode;
                    if (isVariation) {
                        const half = Math.ceil(displayChords.length / 2);
                        const bar1 = displayChords.slice(0, half).join(' - ');
                        const bar2 = displayChords.slice(half).join(' - ');
                        chordsDisplay = (
                            <div>
                                <div style={{ fontSize: '0.9em', opacity: 0.8 }}>Bar 1: {bar1}</div>
                                <div style={{ fontWeight: 600 }}>Bar 2: {bar2}</div>
                            </div>
                        );
                    } else {
                        chordsDisplay = <div className="prog-chords">{displayChords.join(' - ')}</div>;
                    }

                    return (
                        <div key={idx} className="progression-item">
                            <div className="prog-info">
                                <div className="prog-header" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <div className="prog-name">{prog.name}</div>
                                    {prog.genre && (
                                        <span className="genre-badge">{prog.genre}</span>
                                    )}
                                </div>
                                {chordsDisplay}
                            </div>
                            <button
                                className="midi-btn primary"
                                onClick={() => handleDownload(prog.name, prog.indices, prog.genre)}
                            >
                                Download MIDI
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
