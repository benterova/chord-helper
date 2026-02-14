import React, { useState, useRef } from 'react';
import { audioEngine } from '../lib/audio';
import { type Chord, getChordMidiNotes, getChordNotes } from '../lib/theory';
import { CIRCLE_OF_FIFTHS } from '../lib/constants';

import { useMusicTheory } from '../lib/MusicTheoryContext';

export const CircleOfFifths: React.FC = () => {
    const { root, chords } = useMusicTheory();

    // Color Palette based on Chord Quality
    const QUALITY_COLORS: Record<string, string> = {
        'major': '#4db8ff', // Bright Blue
        'minor': '#ff6b6b', // Soft Red
        'dim': '#51cf66',   // Green
        'aug': '#cc5de8',   // Purple
        'unknown': '#adb5bd' // Gray
    };

    const INACTIVE_COLOR = '#e9ecef'; // Light Gray for non-key notes

    const size = 500;
    const center = size / 2;
    const radius = 140; // Smaller radius to fit leader lines
    const angleStep = 360 / 12;
    const depth = 20;

    const [hoveredChord, setHoveredChord] = useState<Chord | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const createSectorPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);

        return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
    };

    const createSidePath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number, depth: number) => {
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);

        // Only draw side if it's "front facing" roughly
        // Simplified: Draw outer arc wall
        return `M ${x1} ${y1} L ${x1} ${y1 + depth} A ${r} ${r} 0 0 1 ${x2} ${y2 + depth} L ${x2} ${y2} A ${r} ${r} 0 0 0 ${x1} ${y1} Z`;
    };

    const handleChordClick = (chord: Chord | undefined) => {
        if (!chord) return;
        const midiNotes = getChordMidiNotes(chord);
        audioEngine.playNotes(midiNotes, 0.5, true);
    };

    return (
        <div ref={containerRef} onMouseMove={handleMouseMove} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: 'Calibri, sans-serif', position: 'relative', overflow: 'hidden' }}>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                {/* Chart Area */}
                <div style={{ flex: 1, position: 'relative', minHeight: '0' }}>
                    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: '100%', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}>
                        <g transform={`translate(${center}, ${center}) rotate(-90)`}> {/* Rotate so C is top */}
                            {/* Render Slices */}
                            {CIRCLE_OF_FIFTHS.map((note, index) => {
                                const chordData = chords.find(c => c.root === note);
                                const isHovered = hoveredChord?.root === note;
                                const isActive = root === note;

                                // Pull out logic: Only on hover
                                const pullOut = isHovered ? 20 : 0;
                                const midAngle = (index * angleStep);
                                const rad = midAngle * Math.PI / 180;
                                const tx = pullOut * Math.cos(rad);
                                const ty = pullOut * Math.sin(rad);

                                const startAngle = (index * angleStep) - (angleStep / 2);
                                const endAngle = startAngle + angleStep;

                                // Determine Color
                                let color = INACTIVE_COLOR;
                                if (chordData) {
                                    color = QUALITY_COLORS[chordData.quality] || QUALITY_COLORS['unknown'];
                                    // If this is the tonic (I), make it deeper/darker
                                    if (isActive) {
                                        color = adjustColor(color, -40); // Darken significantly to distinguish without raising
                                    }
                                }

                                const darkColor = adjustColor(color, -40); // Darker side

                                return (
                                    <g key={note}
                                        transform={`translate(${tx}, ${ty})`}
                                        onMouseEnter={() => chordData && setHoveredChord(chordData)}
                                        onMouseLeave={() => setHoveredChord(null)}
                                        onClick={() => handleChordClick(chordData)}
                                        style={{ cursor: chordData ? 'pointer' : 'default', transition: 'transform 0.2s ease-out' }}
                                    >
                                        {/* 3D Side (Depth) */}
                                        <path
                                            d={createSidePath(0, 0, radius, startAngle, endAngle, depth)}
                                            fill={darkColor}
                                            stroke="none"
                                        />
                                        <path
                                            d={createSectorPath(0, 0, radius, startAngle, endAngle)}
                                            fill={color}
                                            stroke="#fff"
                                            strokeWidth="1"
                                        />
                                    </g>
                                );
                            })}
                        </g>

                        {/* Leader Lines & Labels layer (Separate Group to be on top) */}
                        <g transform={`translate(${center}, ${center})`}>
                            {CIRCLE_OF_FIFTHS.map((note, index) => {
                                const chordData = chords.find(c => c.root === note);

                                // We need to match the rotation above
                                const angle = (index * angleStep) - 90; // Adjust for top-start
                                const rad = angle * Math.PI / 180;

                                const rLabel = radius + 30;
                                const x = rLabel * Math.cos(rad);
                                const y = rLabel * Math.sin(rad);

                                const rAnchor = radius - 20;
                                const ax = rAnchor * Math.cos(rad);
                                const ay = rAnchor * Math.sin(rad);

                                const labelText = chordData ? `${note} (${chordData.roman})` : note;
                                const labelColor = chordData ? '#333' : '#aaa';
                                const fontWeight = chordData ? 'bold' : 'normal';

                                return (
                                    <g key={`label-${note}`}>
                                        <polyline
                                            points={`${ax},${ay} ${x},${y}`}
                                            fill="none"
                                            stroke={chordData ? "#666" : "#ddd"}
                                            strokeWidth="1"
                                        />
                                        <text
                                            x={x + (x > 0 ? 5 : -5)}
                                            y={y}
                                            textAnchor={x > 0 ? "start" : "end"}
                                            dominantBaseline="middle"
                                            fontSize="14"
                                            fontWeight={fontWeight}
                                            fill={labelColor}
                                        >
                                            {labelText}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>

                {/* Legend at Bottom */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid #ccc', background: '#f9f9f9', marginTop: 'auto' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px', fontWeight: 'bold' }}>Chord Qualities</div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {Object.entries(QUALITY_COLORS).filter(([key]) => key !== 'unknown').map(([quality, color]) => (
                            <div key={quality} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '12px', height: '12px', background: color, border: '1px solid rgba(0,0,0,0.2)', borderRadius: '2px' }}></div>
                                <div style={{ fontSize: '12px', color: '#333', textTransform: 'capitalize' }}>
                                    {quality === 'dim' ? 'Diminished' : quality === 'aug' ? 'Augmented' : quality}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Note Tooltip */}
            {hoveredChord && (
                <div style={{
                    position: 'absolute',
                    left: Math.min(mousePos.x + 15, containerRef.current ? containerRef.current.clientWidth - 160 : 0), // Prevent overflow right
                    top: Math.min(mousePos.y + 15, containerRef.current ? containerRef.current.clientHeight - 100 : 0), // Prevent overflow bottom
                    width: '180px', // Slightly wider for layout
                    background: '#fef3c7', // Post-it yellow
                    border: '1px solid #eab308',
                    boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
                    padding: '8px 12px',
                    borderRadius: '2px', // Slight round
                    transform: 'rotate(-1deg)', // Slight tilt for "sticky note" feel
                    pointerEvents: 'none', // Don't block mouse events
                    zIndex: 100,
                    fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif', // Handwritten feel attempt
                    color: '#4b5563',
                    lineHeight: '1.4'
                }}>
                    {/* Header: Name and Roman Numeral */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        borderBottom: '1px dashed #d1d5db',
                        paddingBottom: '4px',
                        marginBottom: '6px'
                    }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937' }}>
                            {hoveredChord.chordName}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#4b5563' }}>
                            {hoveredChord.roman}
                        </div>
                    </div>

                    {/* Content: Notes */}
                    <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#6b7280' }}>
                        {getChordNotes(hoveredChord).join(', ')}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper for color darkening
function adjustColor(col: string, amt: number) {
    let usePound = false;
    if (col[0] === "#") {
        col = col.slice(1);
        usePound = true;
    }
    let num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

