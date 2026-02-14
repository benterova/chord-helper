import React, { useRef } from 'react';
import { useWindowManager } from './WindowManager';
// Styles are globally imported in index.css

interface AeroWindowProps {
    id: string;
}

export const AeroWindow: React.FC<AeroWindowProps> = ({ id }) => {
    const { windows, activeWindowId, focusWindow } = useWindowManager();
    const windowState = windows.find(w => w.id === id);
    const windowRef = useRef<HTMLDivElement>(null);

    if (!windowState || !windowState.isOpen) return null;

    // Style for minimized state (hidden but technically mounted, or just use rendering logic)
    const style: React.CSSProperties = {
        position: 'absolute',
        left: windowState.position.x,
        top: windowState.position.y,
        width: windowState.size.width,
        height: windowState.isMinimized ? 'auto' : windowState.size.height,
        zIndex: windowState.zIndex,
        display: windowState.isMinimized ? 'none' : 'flex'
    };

    return (
        <div
            ref={windowRef}
            className={`win7-window ${activeWindowId === id ? 'active' : ''}`}
            style={style}
            onMouseDown={() => focusWindow(id)}
        >
            <div className="win7-titlebar" style={{ cursor: 'default' }}>
                <div className="win7-icon"></div>
                <div className="win7-title-text">{windowState.title}</div>
            </div>

            {!windowState.isMinimized && (
                <div className="win7-content-area">
                    <div className="win7-inner-content">
                        {windowState.component}
                    </div>
                </div>
            )}
        </div>
    );
};
