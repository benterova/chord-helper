import React from 'react';
import { useWindowManager } from './WindowManager';
import { AeroWindow } from './AeroWindow';

interface DesktopProps {
    children?: React.ReactNode; // For taskbar or other static elements
}

export const Desktop: React.FC<DesktopProps> = ({ children }) => {
    const { windows } = useWindowManager();


    return (
        <div className="desktop-container" style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'auto',

        }}>
            {windows.map(window => (
                <AeroWindow key={window.id} id={window.id} />
            ))}

            <div className="desktop-overlay" style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                {/* Place for desktop icons if we had them */}
            </div>

            {/* Taskbar / Static Controls */}
            {children}
        </div>
    );
};
