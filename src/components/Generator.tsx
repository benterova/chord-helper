import React, { useState } from 'react';
import { STYLES, type Style, generateProgression, applyRhythm, type MidiEvent } from '../lib/engine';
import { downloadGeneratedMidi } from '../lib/midi';
import type { Chord } from '../lib/theory';
import { audioEngine } from '../lib/audio';

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
    const [playingId, setPlayingId] = useState<string | null>(null);

    React.useEffect(() => {
        return audioEngine.subscribe(id => setPlayingId(id));
    }, []);

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

    const handlePlay = () => {
        if (playingId === 'generator') {
            audioEngine.stop();
            return;
        }

        if (!generatedEvents) return;

        // Convert to AudioEngine format
        // Audio engine expects seconds, MidiEvent inside engine.ts uses 128 ticks per beat
        // 120 BPM = 0.5s per beat = 128 ticks
        // Ticks to Seconds = (ticks / 128) * 0.5

        const secondsPerTick = 0.5 / 128;
        const speedFactor = 1.0; // Normal tempo

        // We need to flatten the events into a sequence where we wait for gaps
        // Actually, AudioEngine logic is "Next item plays after Current item duration"
        // But the generated events have 'startTime' and 'duration'.
        // We need to adapt this.
        // The simple AudioEngine loop expects a sequence of blocks.
        // The generator output is a list of events with absolute start times.

        // Complex Solution: Update AudioEngine to take absolute events.
        // Simple Solution: Convert absolute events to a sequential blocks list?
        // No, overlapping notes (polyphony during same beat) won't work well with simple "queue".

        // BETTER: Update AudioEngine to support "Score" playback?
        // OR: Just schedule all events now using `playNotes` with time offset?
        // But then `stop()` needs to work.
        // `playNotes` uses `scheduleNotes`.

        // Let's implement a `playScore` method in AudioEngine or just loop here scheduling them?
        // If we schedule them all at once, `stop()` on AudioEngine handles clearing them!
        // We just need to calculate the relative time for each.

        const now = audioEngine.getCurrentTime();

        // Stop previous
        audioEngine.stop();

        // Manually schedule all events
        // Let's rely on the simple AudioEngine for now, which might be limited.
        // Only way with current API:
        // `playProgression` takes a sequence of `{notes, duration}`.
        // If the generated rhythm is monophonic (chord blocks), we can convert it.
        // `applyRhythm` returns `MidiEvent[]` with keys `notes`, `duration`, `startTime`.
        // It seems `applyRhythm` output is essentially a track.

        // Let's try to convert it to a sequence map if it's sequential.
        // If there are gaps, we need silent spacers.

        // Sort by start time
        const sorted = [...generatedEvents].sort((a, b) => a.startTime - b.startTime);
        const sequence: { notes: number[], duration: number }[] = [];

        let lastEnd = 0;
        sorted.forEach(ev => {
            const gap = ev.startTime - lastEnd;
            if (gap > 0) {
                // Pause / Silence
                // AudioEngine doesn't have explicit rest support in type?
                // It plays notes. Empty notes array = silence?
                sequence.push({ notes: [], duration: gap * secondsPerTick });
            }

            sequence.push({ notes: ev.notes, duration: ev.duration * secondsPerTick });
            lastEnd = ev.startTime + ev.duration;
        });

        audioEngine.playProgression(sequence, 'generator');
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

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={handlePlay}
                    disabled={!generatedEvents}
                    className="midi-btn"
                    title="Preview in Browser"
                    style={playingId === 'generator' ? { background: '#ef233c', color: 'white' } : {}}
                >
                    {playingId === 'generator' ? '⏹ Stop' : '▶ Play'}
                </button>
                <button
                    onClick={handleDownload}
                    disabled={!generatedProgression}
                    className="midi-btn primary"
                    style={{ width: '100%', backgroundColor: generatedProgression ? 'var(--primary-color, #3a86ff)' : undefined }}
                >
                    Download Generated MIDI
                </button>
            </div>
        </div>
    );
};
