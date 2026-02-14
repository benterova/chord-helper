import React from 'react';


import { useMusicTheory } from '../lib/MusicTheoryContext';

// ... imports ...

export const ScaleDetails: React.FC = () => {
    const { chords } = useMusicTheory();
    return (
        <div style={{
            padding: '15px',
            height: '100%',
            overflowY: 'auto',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
            fontFamily: '"Segoe UI", sans-serif'
        }}>

            <div className="aero-group-box">
                <span className="aero-group-legend">Scale Degrees</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px' }}>
                    {chords.map(chord => (
                        <div key={chord.degree} className="aero-degree-card">
                            <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#004466', textShadow: '0 1px 0 rgba(255,255,255,0.8)' }}>{chord.root}</div>
                            <div style={{ fontSize: '0.85em', color: '#0088cc' }}>{chord.degree}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="aero-group-box" style={{ marginTop: '20px' }}>
                <span className="aero-group-legend">Harmonized Chords</span>
                <table className="aero-table">
                    <thead>
                        <tr>
                            <th>Chord</th>
                            <th>Type</th>
                            <th>Roman</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chords.map(chord => (
                            <tr key={chord.degree}>
                                <td style={{ fontWeight: '600', color: '#003366' }}>{chord.chordName}</td>
                                <td style={{ color: '#005580' }}>{chord.quality}</td>
                                <td style={{ fontFamily: '"Segoe UI Symbol", serif', color: '#0077aa' }}>{chord.roman}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </div>
    );
};
