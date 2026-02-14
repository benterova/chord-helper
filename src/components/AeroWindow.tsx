import React, { useState, useEffect, useRef } from 'react';
import { useWindowManager } from './WindowManager';
// Styles are globally imported in index.css

interface AeroWindowProps {
    id: string;
}

export const AeroWindow: React.FC<AeroWindowProps> = ({ id }) => {
    const { windows, activeWindowId, focusWindow, closeAll, minimizeWindow, maximizeWindow, updateWindowPosition, updateWindowSize, isLocked } = useWindowManager();
    const windowState = windows.find(w => w.id === id);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const windowRef = useRef<HTMLDivElement>(null);

    if (!windowState || !windowState.isOpen) return null;

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only drag if clicking the title bar (and not buttons)
        if ((e.target as HTMLElement).closest('.win7-controls')) return;

        focusWindow(id);

        if (isLocked) return; // Disable drag if locked

        setIsDragging(true);
        setDragOffset({
            x: e.clientX - windowState.position.x,
            y: e.clientY - windowState.position.y
        });
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        focusWindow(id);

        if (isLocked) return; // Disable resize if locked

        setIsResizing(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: windowState.size.width,
            height: windowState.size.height
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && !isLocked) {
                let newX = e.clientX - dragOffset.x;
                let newY = e.clientY - dragOffset.y;

                // Constraints
                const maxX = window.innerWidth - 100; // Keep at least 100px visible
                const maxY = window.innerHeight - 30; // Keep at least title bar visible
                const minX = -windowState.size.width + 100; // Keep at least 100px visible from left

                newX = Math.max(minX, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY)); // Can't go above top

                updateWindowPosition(id, {
                    x: newX,
                    y: newY
                });
            }
            if (isResizing && !isLocked) {
                updateWindowSize(id, {
                    width: Math.max(200, resizeStart.width + (e.clientX - resizeStart.x)),
                    height: Math.max(150, resizeStart.height + (e.clientY - resizeStart.y))
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, resizeStart, id, updateWindowPosition, updateWindowSize, isLocked]);

    // Style for minimized state (hidden but technically mounted, or just use rendering logic)
    // For now, if minimized, we might just hide it via CSS or let the manager handle it.
    // The plan said "minimized windows ... able to be dragged around ... except controls".
    // Usually minimized windows go to a taskbar. If we want them floating but minimized (just title bar?), we can do that.
    // Standard behavior is taskbar. Let's assume standard behavior or "shade" behavior for now.
    // Let's hide if minimized for now, assuming a taskbar will retrieve it.

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
            <div className="win7-titlebar" onMouseDown={handleMouseDown} style={{ cursor: isLocked ? 'default' : 'move' }}>
                <div className="win7-icon"></div>
                <div className="win7-title-text">{windowState.title} {isLocked ? '(Locked)' : ''}</div>
                {!isLocked && (
                    <div className="win7-controls">
                        <button className="win7-btn minimize" onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }} title="Minimize" />
                        <button className="win7-btn maximize" onClick={(e) => { e.stopPropagation(); maximizeWindow(id); }} title="Maximize" />
                        <button className="win7-btn close" onClick={(e) => { e.stopPropagation(); closeAll(); }} title="Close All" />
                    </div>
                )}
            </div>

            {!windowState.isMinimized && (
                <div className="win7-content-area">
                    <div className="win7-inner-content">
                        {windowState.component}
                    </div>
                </div>
            )}

            {/* Resize Handle */}
            {!windowState.isMinimized && !windowState.isMaximized && !isLocked && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '15px',
                        height: '15px',
                        cursor: 'se-resize',
                        zIndex: 20
                    }}
                    onMouseDown={handleResizeStart}
                />
            )}
        </div>
    );
};
