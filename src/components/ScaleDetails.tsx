import React from 'react';
import type { Chord } from '../lib/theory';

interface ScaleDetailsProps {
    chords: Chord[];
}

export const ScaleDetails: React.FC<ScaleDetailsProps> = ({ chords }) => {
    return (
        <aside className="details-panel">
            <div className="panel-section">
                <h2>Scale Notes & Degrees</h2>
                <div className="scale-degrees">
                    {chords.map(chord => (
                        <div key={chord.degree} className="note-badge">
                            <span className="note-name">{chord.root}</span>
                            <span className="note-degree">{chord.degree}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="panel-section">
                <h2>Chords in Key</h2>
                <div className="chords-list">
                    {chords.map(chord => (
                        <div key={chord.degree} className={`chord-item ${chord.quality}`}>
                            <div className="chord-info">
                                <span className="chord-name">{chord.chordName}</span>
                            </div>
                            <span className="chord-roman">{chord.roman}</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};
