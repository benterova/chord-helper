import React, { useState } from 'react';
import { audioEngine } from '../lib/audio';
import { type Chord, getChordMidiNotes, getChordNotes } from '../lib/theory';
import { CIRCLE_OF_FIFTHS, MODE_DISPLAY_NAMES, type ScaleName } from '../lib/constants';

interface CircleOfFifthsProps {
    root: string;
    mode: string;
    chords: Chord[];
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ root, mode, chords }) => {
    const size = 500;
    const center = size / 2;
    const radius = 200;
    const thickness = 80;
    const angleStep = 360 / 12;

    const [hoveredChord, setHoveredChord] = useState<Chord | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const createSectorPath = (cx: number, cy: number, rOuter: number, rInner: number, startAngle: number, endAngle: number) => {
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = cx + rOuter * Math.cos(startRad);
        const y1 = cy + rOuter * Math.sin(startRad);
        const x2 = cx + rOuter * Math.cos(endRad);
        const y2 = cy + rOuter * Math.sin(endRad);

        const x3 = cx + rInner * Math.cos(endRad);
        const y3 = cy + rInner * Math.sin(endRad);
        const x4 = cx + rInner * Math.cos(startRad);
        const y4 = cy + rInner * Math.sin(startRad);

        return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;
    };

    const handleMouseEnter = (_event: React.MouseEvent, chord: Chord | undefined) => {
        if (!chord) return;
        setHoveredChord(chord);
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!hoveredChord) return;
        setTooltipPos({ x: event.clientX + 15, y: event.clientY + 15 });
    };

    const handleMouseLeave = () => {
        setHoveredChord(null);
    };

    const handleChordClick = (chord: Chord | undefined) => {
        if (!chord) return;
        const midiNotes = getChordMidiNotes(chord);
        audioEngine.playNotes(midiNotes, 0.5, true); // True for concurrent
    };

    return (
        <div style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: 'auto', maxHeight: '500px' }}>
                {CIRCLE_OF_FIFTHS.map((note, index) => {
                    const startAngle = (index * angleStep) - 90 - (angleStep / 2);
                    const endAngle = startAngle + angleStep;

                    const chordData = chords.find(c => c.root === note);

                    let color = 'var(--inactive-color, #e0e0e0)';
                    const quality = chordData?.quality;
                    if (quality === 'major') color = 'var(--major-color, #a8dadc)';
                    else if (quality === 'minor') color = 'var(--minor-color, #f4a261)';
                    else if (quality === 'dim') color = 'var(--dim-color, #e76f51)';
                    else if (quality === 'aug') color = 'var(--aug-color, #2a9d8f)';

                    const pathd = createSectorPath(center, center, radius, radius - thickness, startAngle, endAngle);

                    const midAngle = (startAngle + endAngle) / 2;
                    const textRadius = radius - (thickness / 2);
                    const textX = center + textRadius * Math.cos(midAngle * Math.PI / 180);
                    const textY = center + textRadius * Math.sin(midAngle * Math.PI / 180);

                    return (
                        <g key={note}
                            onMouseEnter={(e) => handleMouseEnter(e, chordData)}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleChordClick(chordData)}
                            style={{ cursor: chordData ? 'pointer' : 'default' }}
                        >
                            <path
                                d={pathd}
                                fill={color}
                                stroke="var(--bg-color, #fff)"
                                strokeWidth="2"
                                className="sector"
                            />
                            <text
                                x={textX}
                                y={textY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={chordData ? "#000" : "var(--text-secondary, #888)"}
                                fontWeight="bold"
                                fontSize="18"
                                style={{ pointerEvents: 'none' }}
                            >
                                {note}
                            </text>
                            {chordData && (
                                <text
                                    x={textX}
                                    y={textY + 20}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="#000"
                                    fontSize="14"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {chordData.roman}
                                </text>
                            )}
                        </g>
                    );
                })}
                <text
                    x={center}
                    y={center}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="24"
                    className="center-text"
                >
                    {root} {MODE_DISPLAY_NAMES[mode as ScaleName] || mode.replace(/_/g, ' ')}
                </text>
            </svg>

            {hoveredChord && (
                <div
                    className="chord-tooltip"
                    style={{
                        left: tooltipPos.x,
                        top: tooltipPos.y,
                    }}
                >
                    <div className="tooltip-title">{hoveredChord.chordName}</div>
                    <div className="tooltip-notes">
                        {getChordNotes(hoveredChord).join(' - ')}
                    </div>
                </div>
            )}
        </div>
    );
};
