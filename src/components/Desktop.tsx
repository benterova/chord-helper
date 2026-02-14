import React, { useState, useCallback } from 'react';
import { useWindowManager } from './WindowManager';
import { AeroWindow } from './AeroWindow';

interface DesktopProps {
    children?: React.ReactNode; // For taskbar or other static elements
}

export const Desktop: React.FC<DesktopProps> = ({ children }) => {
    const { windows, splitRatio, resizeSplit } = useWindowManager();
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const x = e.clientX / window.innerWidth;
            const y = (e.clientY - 60) / (window.innerHeight - 60); // Account for top bar
            resizeSplit(x, y);
        }
    }, [isDragging, resizeSplit]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div className="desktop-container" style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            cursor: isDragging ? 'move' : 'default'
        }}>
            {windows.map(window => (
                <AeroWindow key={window.id} id={window.id} />
            ))}

            <div className="desktop-overlay" style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                {/* Place for desktop icons if we had them */}
            </div>

            {/* Split Resize Handle */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    position: 'absolute',
                    left: `${splitRatio.x * 100}%`,
                    top: `calc(60px + ${(window.innerHeight - 60) * splitRatio.y}px)`, // More precise to match calc
                    // Actually clearer: use percentages of the container below top bar?
                    // The windows use absolute positioning based on screen pixels in WindowManager.
                    // WindowManager uses: row1H = (h-60) * split.y.
                    // So Top = 60 + row1H.
                    // We need it to match visually.
                    width: '20px',
                    height: '20px',
                    marginLeft: '-10px',
                    marginTop: '-10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    border: '2px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '50%',
                    cursor: 'move',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                }}
            >
                {/* Crosshair lines */}
                <div style={{ position: 'absolute', left: '50%', top: '-100vh', bottom: '-100vh', width: '1px', background: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', top: '50%', left: '-100vw', right: '-100vw', height: '1px', background: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}></div>
            </div>

            {/* Taskbar / Static Controls */}
            {children}
        </div>
    );
};
