import React from 'react';


import { useMusicTheory } from '../lib/MusicTheoryContext';

// ... imports ...

export const ScaleDetails: React.FC = () => {
    const { chords } = useMusicTheory();
    return (
        <div style={{ padding: '0 10px 10px 10px', height: '100%', overflowY: 'auto', background: '#f0f0f0' }}>

            <div className="win7-group-box">
                <span className="win7-group-legend">Scale Degrees</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '5px' }}>
                    {chords.map(chord => (
                        <div key={chord.degree} style={{ textAlign: 'center', padding: '5px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '2px' }}>
                            <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{chord.root}</div>
                            <div style={{ fontSize: '0.8em', color: '#777' }}>{chord.degree}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="win7-group-box">
                <span className="win7-group-legend">Harmonized Chords</span>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
                            <th style={{ padding: '4px', fontWeight: 'normal', color: '#555' }}>Chord</th>
                            <th style={{ padding: '4px', fontWeight: 'normal', color: '#555' }}>Type</th>
                            <th style={{ padding: '4px', fontWeight: 'normal', color: '#555' }}>Roman</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chords.map(chord => (
                            <tr key={chord.degree} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '6px 4px', fontWeight: 'bold' }}>{chord.chordName}</td>
                                <td style={{ padding: '6px 4px', color: '#444' }}>{chord.quality}</td>
                                <td style={{ padding: '6px 4px', fontFamily: 'serif', color: '#666' }}>{chord.roman}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#777', padding: '0 5px' }}>
                Tip: Click on chords in the Circle of Fifths to play them.
            </div>
        </div>
    );
};
