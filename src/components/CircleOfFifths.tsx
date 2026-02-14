import React, { useState, useRef } from 'react';
import { audioEngine } from '../lib/audio';
import { type Chord, getChordMidiNotes, getChordNotes } from '../lib/theory';
import { CIRCLE_OF_FIFTHS } from '../lib/constants';

import { useMusicTheory } from '../lib/MusicTheoryContext';

export const CircleOfFifths: React.FC = () => {
    const { root, chords } = useMusicTheory();

    // Frutiger Aero Palette - Vibrant & Glossy
    const QUALITY_COLORS: Record<string, string> = {
        'major': 'url(#grad-major)', // Cyan/Blue
        'minor': 'url(#grad-minor)', // Pink/Magenta
        'dim': 'url(#grad-dim)',   // Bright Green
        'aug': 'url(#grad-aug)',   // Purple
        'unknown': '#ccc'
    };

    const INACTIVE_COLOR = 'url(#grad-inactive)';

    const size = 500;
    const center = size / 2;
    const radius = 140;
    const angleStep = 360 / 12;
    const depth = 15; // Slightly reduced depth for clearer glass look

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

        return `M ${x1} ${y1} L ${x1} ${y1 + depth} A ${r} ${r} 0 0 1 ${x2} ${y2 + depth} L ${x2} ${y2} A ${r} ${r} 0 0 0 ${x1} ${y1} Z`;
    };

    const handleChordClick = (chord: Chord | undefined) => {
        if (!chord) return;
        const midiNotes = getChordMidiNotes(chord);
        audioEngine.playNotes(midiNotes, 0.5, true);
    };

    return (
        <div className="circle-section" ref={containerRef} onMouseMove={handleMouseMove} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent', fontFamily: '"Segoe UI", sans-serif', position: 'relative', overflow: 'hidden' }}>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                {/* Chart Area */}
                <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: 'auto', maxHeight: '100%', filter: 'drop-shadow(0 10px 15px rgba(0,160,255,0.2))' }}>
                    <defs>
                        {/* Frutiger Aero Gradients */}
                        <linearGradient id="grad-major" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#4facfe" />
                            <stop offset="100%" stopColor="#00f2fe" />
                        </linearGradient>
                        <linearGradient id="grad-minor" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#fa709a" />
                            <stop offset="100%" stopColor="#fee140" />
                        </linearGradient>
                        <linearGradient id="grad-dim" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#43e97b" />
                            <stop offset="100%" stopColor="#38f9d7" />
                        </linearGradient>
                        <linearGradient id="grad-aug" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#a18cd1" />
                            <stop offset="100%" stopColor="#fbc2eb" />
                        </linearGradient>
                        <linearGradient id="grad-inactive" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#e0e0e0" />
                            <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>

                        {/* Glass Shine Overlay */}
                        <linearGradient id="glass-shine" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                            <stop offset="40%" stopColor="rgba(255,255,255,0)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                        </linearGradient>
                    </defs>

                    <g transform={`translate(${center}, ${center}) rotate(-90)`}> {/* Rotate so C is top */}
                        {/* Render Slices */}
                        {CIRCLE_OF_FIFTHS.map((note, index) => {
                            const chordData = chords.find(c => c.root === note);
                            const isHovered = hoveredChord?.root === note;
                            const isActive = root === note;

                            // Pull out logic: Only on hover
                            const pullOut = isHovered ? 25 : (isActive ? 10 : 0);
                            const midAngle = (index * angleStep);
                            const rad = midAngle * Math.PI / 180;
                            const tx = pullOut * Math.cos(rad);
                            const ty = pullOut * Math.sin(rad);

                            const startAngle = (index * angleStep) - (angleStep / 2) + 1; // Gap
                            const endAngle = startAngle + angleStep - 2; // Gap

                            // Determine Color
                            let fill = INACTIVE_COLOR;
                            if (chordData) {
                                fill = QUALITY_COLORS[chordData.quality] || QUALITY_COLORS['unknown'];
                            }

                            return (
                                <g key={note}
                                    transform={`translate(${tx}, ${ty})`}
                                    onMouseEnter={() => chordData && setHoveredChord(chordData)}
                                    onMouseLeave={() => setHoveredChord(null)}
                                    onClick={() => handleChordClick(chordData)}
                                    style={{ cursor: chordData ? 'pointer' : 'default', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                                >
                                    {/* 3D Side (Depth) */}
                                    <path
                                        d={createSidePath(0, 0, radius, startAngle, endAngle, depth)}
                                        fill="rgba(0,0,0,0.15)"
                                        stroke="none"
                                    />
                                    {/* Main Face */}
                                    <path
                                        d={createSectorPath(0, 0, radius, startAngle, endAngle)}
                                        fill={fill}
                                        fillOpacity={isActive || isHovered || chordData ? 0.9 : 0.3}
                                        stroke="rgba(255,255,255,0.8)"
                                        strokeWidth="2"
                                    />
                                    {/* Glass Shine */}
                                    <path
                                        d={createSectorPath(0, 0, radius, startAngle, endAngle)}
                                        fill="url(#glass-shine)"
                                        pointerEvents="none"
                                    />

                                    {isActive && (
                                        <circle cx={(radius - 20) * Math.cos(rad)} cy={(radius - 20) * Math.sin(rad)} r="4" fill="#fff" filter="drop-shadow(0 0 4px #fff)" />
                                    )}
                                </g>
                            );
                        })}
                    </g>

                    {/* Leader Lines & Labels layer */}
                    <g transform={`translate(${center}, ${center})`}>
                        {CIRCLE_OF_FIFTHS.map((note, index) => {
                            const chordData = chords.find(c => c.root === note);
                            const isActive = root === note;

                            const angle = (index * angleStep) - 90;
                            const rad = angle * Math.PI / 180;

                            const rLabel = radius + 45;
                            const x = rLabel * Math.cos(rad);
                            const y = rLabel * Math.sin(rad);

                            const rAnchor = radius + 5;
                            const ax = rAnchor * Math.cos(rad);
                            const ay = rAnchor * Math.sin(rad);

                            const labelText = chordData ? `${note}` : note;
                            const subText = chordData ? `(${chordData.roman})` : '';

                            const labelColor = isActive ? '#00aeff' : (chordData ? '#004466' : 'rgba(0,68,102,0.3)');
                            const fontWeight = isActive ? '800' : (chordData ? '600' : '400');
                            const fontSize = isActive ? '20' : '16';

                            return (
                                <g key={`label-${note}`} style={{ transition: 'all 0.3s ease' }}>
                                    {chordData && (
                                        <polyline
                                            points={`${ax},${ay} ${x * 0.85},${y * 0.85}`}
                                            fill="none"
                                            stroke={isActive ? "#00aeff" : "rgba(0,174,255,0.3)"}
                                            strokeWidth={isActive ? "2" : "1"}
                                        />
                                    )}
                                    <text
                                        x={x}
                                        y={y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize={fontSize}
                                        fontWeight={fontWeight}
                                        fill={labelColor}
                                        style={{ textShadow: isActive ? '0 0 10px rgba(255,255,255,0.8)' : 'none' }}
                                    >
                                        {labelText}
                                        <tspan x={x} dy="16" fontSize="11" fill={isActive ? '#00aeff' : '#666'} fontWeight="normal">{subText}</tspan>
                                    </text>
                                </g>
                            );
                        })}
                    </g>

                    {/* Central Hub Bubble */}
                    <g transform={`translate(${center}, ${center})`}>
                        <circle r="40" fill="url(#grad-major)" opacity="0.1" />
                        <circle r="35" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                        <text y="-5" textAnchor="middle" fontSize="10" fill="#0077aa" fontWeight="bold" letterSpacing="1">KEY</text>
                        <text y="12" textAnchor="middle" fontSize="16" fill="#004466" fontWeight="bold">{root}</text>
                    </g>
                </svg>

                {/* Legend at Bottom - Transparent Glass */}
                <div style={{
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.6))',
                    borderTop: '1px solid rgba(255,255,255,0.5)',
                    marginTop: 'auto'
                }}>
                    <div style={{ fontSize: '11px', color: '#005580', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Chord Qualities</div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                            <span style={{ fontSize: '11px', color: '#004466' }}>Major</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #fa709a, #fee140)', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                            <span style={{ fontSize: '11px', color: '#004466' }}>Minor</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #43e97b, #38f9d7)', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                            <span style={{ fontSize: '11px', color: '#004466' }}>Dim</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Note Tooltip - Now Aero Glass Popover */}
            {
                hoveredChord && (
                    <div style={{
                        position: 'absolute',
                        left: Math.min(mousePos.x + 20, containerRef.current ? containerRef.current.clientWidth - 180 : 0),
                        top: Math.min(mousePos.y + 20, containerRef.current ? containerRef.current.clientHeight - 100 : 0),
                        width: '180px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 8px 32px rgba(0, 174, 255, 0.25)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        pointerEvents: 'none',
                        zIndex: 100,
                        fontFamily: '"Segoe UI", sans-serif',
                        color: '#004466'
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            borderBottom: '1px solid rgba(0, 174, 255, 0.2)',
                            paddingBottom: '4px',
                            marginBottom: '6px'
                        }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0077aa' }}>
                                {hoveredChord.chordName}
                            </div>
                            <div style={{ fontSize: '1rem', color: '#00aeff' }}>
                                {hoveredChord.roman}
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ fontSize: '0.9rem', color: '#555' }}>
                            {getChordNotes(hoveredChord).join(' - ')}
                        </div>
                    </div>
                )
            }
        </div >
    );
};


