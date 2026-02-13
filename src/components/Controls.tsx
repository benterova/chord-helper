import React from 'react';
import { NOTES, MODE_DISPLAY_NAMES, type ScaleName } from '../lib/constants';

interface ControlsProps {
    root: string;
    mode: ScaleName;
    onRootChange: (root: string) => void;
    onModeChange: (mode: ScaleName) => void;
}

export const Controls: React.FC<ControlsProps> = ({ root, mode, onRootChange, onModeChange }) => {
    const standardModes: ScaleName[] = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'natural_minor', 'locrian'];
    const otherScales: ScaleName[] = ['harmonic_minor', 'melodic_minor', 'major_pentatonic', 'minor_pentatonic', 'blues'];

    return (
        <div className="controls" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div className="control-group">
                <label htmlFor="key-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Key</label>
                <select
                    id="key-select"
                    value={root}
                    onChange={(e) => onRootChange(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', minWidth: '80px' }}
                >
                    {NOTES.map(note => (
                        <option key={note} value={note}>{note}</option>
                    ))}
                </select>
            </div>
            <div className="control-group">
                <label htmlFor="scale-type-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Scale</label>
                <select
                    id="scale-type-select"
                    value={mode}
                    onChange={(e) => onModeChange(e.target.value as ScaleName)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', minWidth: '150px' }}
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
    );
};
