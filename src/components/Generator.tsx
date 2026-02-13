import React, { useState } from 'react';
import { STYLES, type Style, generateProgression, applyRhythm, type MidiEvent } from '../lib/engine';
import { downloadGeneratedMidi } from '../lib/midi';
import type { Chord } from '../lib/theory';

interface GeneratorProps {
    root: string;
    mode: string;
}

export const Generator: React.FC<GeneratorProps> = ({ root, mode }) => {
    const [style, setStyle] = useState<Style>(STYLES.POP);
    const [length, setLength] = useState(4);
    const [enableRhythm, setEnableRhythm] = useState(true);

    const [generatedProgression, setGeneratedProgression] = useState<Chord[] | null>(null);
    const [generatedEvents, setGeneratedEvents] = useState<MidiEvent[] | null>(null);

    const handleGenerate = () => {
        const progression = generateProgression(root, mode as any, { style, length });
        const events = applyRhythm(progression, style, enableRhythm);
        setGeneratedProgression(progression);
        setGeneratedEvents(events);
    };

    const handleDownload = () => {
        if (!generatedProgression || !generatedEvents) return;
        const name = generatedProgression.map(c => c.chordName).join('-');
        downloadGeneratedMidi(name, generatedEvents, root, mode, style);
    };

    const styleLabels: Record<string, string> = {
        [STYLES.RNB]: 'R&B',
        [STYLES.LOFI]: 'Lo-Fi',
        [STYLES.BOSSA]: 'Bossa Nova',
        [STYLES.JPOP]: 'J-Pop',
        [STYLES.FUTURE]: 'Future Bass',
    };

    return (
        <div className="generator-container">
            <h3>Generative Engine</h3>

            <div className="generator-controls">
                <label className="control-label">
                    <span>Style</span>
                    <select value={style} onChange={(e) => setStyle(e.target.value as Style)}>
                        {Object.values(STYLES).map(s => {
                            let label = styleLabels[s] || (s.charAt(0).toUpperCase() + s.slice(1));
                            return <option key={s} value={s}>{label}</option>;
                        })}
                    </select>
                </label>

                <label className="control-label">
                    <span>Length</span>
                    <select value={length} onChange={(e) => setLength(parseInt(e.target.value, 10))}>
                        <option value="4">4 Bars</option>
                        <option value="8">8 Bars</option>
                        <option value="16">16 Bars (Long)</option>
                        <option value="32">32 Bars (Huge)</option>
                        <option value="64">64 Bars (Epic)</option>
                    </select>
                </label>

                <label className="checkbox-label" style={{ marginBottom: '0.5rem' }}>
                    <input type="checkbox" checked={enableRhythm} onChange={(e) => setEnableRhythm(e.target.checked)} />
                    <span>Enable Rhythm</span>
                </label>

                <button
                    onClick={handleGenerate}
                    className="midi-btn accent"
                    style={{ marginLeft: 'auto' }}
                >
                    Generate New
                </button>
            </div>

            {generatedProgression && (
                <div style={{ marginBottom: '15px', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '1.1em', fontWeight: 'bold', marginBottom: '5px' }}>
                        {generatedProgression.map(c => c.chordName).join(' - ')}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                        {generatedProgression.map(c => c.roman).join(' - ')}
                    </div>
                </div>
            )}

            <button
                onClick={handleDownload}
                disabled={!generatedProgression}
                className="midi-btn primary"
                style={{ width: '100%', backgroundColor: generatedProgression ? 'var(--primary-color, #3a86ff)' : undefined }}
            >
                Download Generated MIDI
            </button>
        </div>
    );
};
