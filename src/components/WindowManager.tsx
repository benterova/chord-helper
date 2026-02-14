import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface WindowState {
    id: string;
    title: string;
    icon?: string; // Path to icon image
    component: ReactNode;
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    position: Position;
    size: Size;
    zIndex: number;
}

interface WindowManagerContextType {
    windows: WindowState[];
    activeWindowId: string | null;
    openWindow: (id: string, title: string, component: ReactNode, initialSize?: Size, initialPos?: Position, icon?: string) => void;
    focusWindow: (id: string) => void;
    resetLayout: () => void;
    resizeSplit: (x: number, y: number) => void;
    splitRatio: { x: number; y: number };
    applyTiledLayout: () => void;
}

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

export const useWindowManager = () => {
    const context = useContext(WindowManagerContext);
    if (!context) {
        throw new Error('useWindowManager must be used within a WindowManagerProvider');
    }
    return context;
};

export const WindowManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
    const [nextZIndex, setNextZIndex] = useState(100);
    const [splitRatio, setSplitRatio] = useState({ x: 0.6, y: 0.58 }); // Default split point (percentages) based on user preference

    const resizeSplit = useCallback((x: number, y: number) => {
        // Clamp values to keep windows usable (e.g., 10% to 90%)
        const clampedX = Math.max(0.1, Math.min(0.9, x));
        const clampedY = Math.max(0.1, Math.min(0.9, y));
        setSplitRatio({ x: clampedX, y: clampedY });
        // Tiling will update automatically via effect
    }, []);

    // Tiling Logic
    const applyTiledLayout = useCallback(() => {
        setWindows(prevWindows => {
            const visibleWindows = prevWindows.filter(w => w.isOpen && !w.isMinimized);
            // Sort by order of opening/creation to maintain stable grid positions if possible
            // But relying on array order is usually fine if they aren't closed/opened randomly.

            const count = visibleWindows.length;
            if (count === 0) return prevWindows;

            const topBarHeight = 60; // Exact height of GlobalSettings bar from Desktop.tsx
            const availableWidth = window.innerWidth;
            const availableHeight = window.innerHeight - topBarHeight;

            // Interactive Split Layout
            // Uses splitRatio to determine the crosshair point.

            const col1W = Math.floor(availableWidth * splitRatio.x);
            const row1H = Math.floor(availableHeight * splitRatio.y);

            const rightColW = availableWidth - col1W;
            const row2H = availableHeight - row1H;

            return prevWindows.map(w => {
                if (!w.isOpen || w.isMinimized) return w;

                const index = visibleWindows.findIndex(vw => vw.id === w.id);
                if (index === -1) return w;

                // Hardcoded 2x2 Logic matching the initializer order
                // 0: Circle (TL), 1: Details (TR), 2: Progs (BL), 3: Gen (BR)

                const col = index % 2; // 0 (Left) or 1 (Right)
                const row = Math.floor(index / 2); // 0 (Top) or 1 (Bottom)

                let x = 0;
                let y = topBarHeight;
                let width = 0;
                let height = 0;

                if (col === 0) {
                    x = 0;
                    width = col1W;
                } else {
                    x = col1W;
                    width = rightColW;
                }

                if (row === 0) {
                    y = topBarHeight;
                    height = row1H;
                } else {
                    y = topBarHeight + row1H;
                    height = row2H;
                }

                // If we have more rows/cols, this hardcoding might break, but for this app it's fine.
                // Fallback for dynamic sizing if not exactly 4 windows? 
                // The user specifically asked for this layout "default".

                return {
                    ...w,
                    position: { x, y },
                    size: { width, height },
                    isMaximized: false
                };
            });
        });
    }, [splitRatio]);

    // Apply tiling when windows change or resize
    useEffect(() => {
        const handleResize = () => {
            applyTiledLayout();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [applyTiledLayout]);

    // Re-tile if a window is opened, closed, or minimized
    const windowsStructureHash = windows.map(w => `${w.id}:${w.isOpen}:${w.isMinimized}`).join('|');
    useEffect(() => {
        applyTiledLayout();
    }, [windowsStructureHash, applyTiledLayout]);


    const focusWindow = useCallback((id: string) => {
        setActiveWindowId(id);
        setWindows(prev => prev.map(w => {
            if (w.id === id) {
                return { ...w, zIndex: nextZIndex, isMinimized: false };
            }
            return w;
        }));
        setNextZIndex(prev => prev + 1);
    }, [nextZIndex]);

    const openWindow = useCallback((id: string, title: string, component: ReactNode, initialSize: Size = { width: 400, height: 300 }, initialPos?: Position, icon?: string) => {
        setWindows(prev => {
            const existing = prev.find(w => w.id === id);
            if (existing) {
                if (!existing.isOpen || existing.isMinimized) {
                    return prev.map(w => w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: nextZIndex } : w);
                }
                return prev;
            }
            const pos = initialPos || { x: 50 + (prev.length * 30), y: 50 + (prev.length * 30) };
            return [...prev, {
                id,
                title,
                icon,
                component,
                isOpen: true,
                isMinimized: false,
                isMaximized: false,
                position: pos,
                size: initialSize,
                zIndex: nextZIndex
            }];
        });
        setNextZIndex(prev => prev + 1);
        setActiveWindowId(id);
    }, [nextZIndex]);

    const resetLayout = useCallback(() => {
        // window.location.reload(); 
        // Better: Restore openness and default ish? Actually reload is best for "Reset to Default" as it re-runs initializer.
        window.location.reload();
    }, []);

    return (
        <WindowManagerContext.Provider value={{
            windows,
            activeWindowId,
            openWindow,
            focusWindow,
            resetLayout,
            applyTiledLayout,
            splitRatio,
            resizeSplit
        }}>
            {children}
        </WindowManagerContext.Provider>
    );
};
