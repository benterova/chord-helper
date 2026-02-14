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

    const isWidget = windowState.variant === 'widget';
    const baseClass = isWidget ? 'aero-widget-dark' : 'win7-window';

    return (
        <div
            ref={windowRef}
            className={`${baseClass} ${activeWindowId === id ? 'active' : ''}`}
            style={style}
            onMouseDown={() => focusWindow(id)}
        >
            {!isWidget && (
                <div className="win7-titlebar" style={{ cursor: 'default' }}>
                    <div className="win7-icon">
                        {windowState.icon && (
                            <img
                                src={windowState.icon}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.7))' }}
                            />
                        )}
                    </div>
                    <div className="win7-title-text">{windowState.title}</div>
                </div>
            )}

            {!windowState.isMinimized && (
                <div className={isWidget ? 'aero-widget-content' : 'win7-content-area'}>
                    {isWidget ? (
                        windowState.component
                    ) : (
                        <div className="win7-inner-content">
                            {windowState.component}
                        </div>
                    )}
                    {/* Widget Specific Resize Handle (Optional, if needed later) */}
                </div>
            )}
        </div>
    );
};
