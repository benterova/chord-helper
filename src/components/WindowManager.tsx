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
    isLocked: boolean;
    setIsLocked: (locked: boolean) => void;
    openWindow: (id: string, title: string, component: ReactNode, initialSize?: Size, initialPos?: Position) => void;
    closeWindow: (id: string) => void;
    closeAll: () => void;
    minimizeWindow: (id: string) => void; // Re-added for compatibility
    maximizeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    toggleMinimize: (id: string) => void;
    updateWindowPosition: (id: string, position: Position) => void;
    updateWindowSize: (id: string, size: Size) => void;
    resetLayout: () => void;
    restoreWindow: (id: string) => void;
    resizeSplit: (x: number, y: number) => void;
    splitRatio: { x: number; y: number };
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
    const [isLocked, setIsLocked] = useState(true); // Default to locked layout
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
            const spacing = 0; // Touching windows (0px gap)
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

    // Apply tiling when locked, or when windows change while locked
    useEffect(() => {
        if (isLocked) {
            applyTiledLayout();
        }
    }, [isLocked, applyTiledLayout]); // We need to be careful with dependencies to avoid infinite loops. 
    // Ideally we want to trigger this when isOpen or isMinimized changes.
    // But `windows` is in the dependency if we include it. 
    // Let's rely on a separate effect responding to specific window changes or just generally?

    // Better approach: Listen to structural changes.
    // The problem is `setWindows` changes `windows`.
    // We can use a ref or check if layout actually needs changing?
    // Or just run it when `isLocked` becomes true.
    // And attach a listener for Open/Close/Minimize actions? 
    // Actually, let's just make the actions trigger it if locked.

    // HOWEVER, we also need to handle window resize events.
    useEffect(() => {
        const handleResize = () => {
            if (isLocked) {
                applyTiledLayout();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isLocked, applyTiledLayout]);

    // We also want to re-tile if a window is opened, closed, or minimized WHILE locked.
    // We can modify the actions (open/close/min) to call applyTiledLayout if locked.
    // But `applyTiledLayout` depends on current state.
    // State updates are async.
    // So we might need to useEffect on `windows.map(w => w.id + w.isOpen + w.isMinimized).join(',')`
    // to detect structural changes.
    const windowsStructureHash = windows.map(w => `${w.id}:${w.isOpen}:${w.isMinimized}`).join('|');
    useEffect(() => {
        if (isLocked) {
            applyTiledLayout();
        }
    }, [isLocked, windowsStructureHash, applyTiledLayout]);


    const focusWindow = useCallback((id: string) => {
        // ... existing implementation ...
        setActiveWindowId(id);
        setWindows(prev => prev.map(w => {
            if (w.id === id) {
                return { ...w, zIndex: nextZIndex, isMinimized: false };
            }
            return w;
        }));
        setNextZIndex(prev => prev + 1);
    }, [nextZIndex]);

    const openWindow = useCallback((id: string, title: string, component: ReactNode, initialSize: Size = { width: 400, height: 300 }, initialPos?: Position) => {
        // ... existing implementation ...
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

    const closeWindow = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
    }, []);

    const closeAll = useCallback(() => {
        setWindows(prev => prev.map(w => ({ ...w, isOpen: false })));
    }, []);

    const minimizeWindow = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
    }, []);

    const maximizeWindow = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    }, []);

    const updateWindowPosition = useCallback((id: string, position: Position) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, position } : w));
    }, []);

    const updateWindowSize = useCallback((id: string, size: Size) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, size } : w));
    }, []);

    const resetLayout = useCallback(() => {
        // window.location.reload(); 
        // Better: Restore openness and default ish? Actually reload is best for "Reset to Default" as it re-runs initializer.
        window.location.reload();
    }, []);

    const restoreWindow = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false, isOpen: true } : w));
        focusWindow(id);
    }, [focusWindow]);

    return (
        <WindowManagerContext.Provider value={{
            windows,
            activeWindowId,
            isLocked,
            setIsLocked,
            openWindow,
            closeWindow,
            closeAll,
            minimizeWindow,
            maximizeWindow,
            focusWindow,
            toggleMinimize: minimizeWindow,
            updateWindowPosition,
            updateWindowSize,
            resetLayout,
            restoreWindow,
            applyTiledLayout,
            splitRatio,
            resizeSplit
        }}>
            {children}
        </WindowManagerContext.Provider>
    );
};
