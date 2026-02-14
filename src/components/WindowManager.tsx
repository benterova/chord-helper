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
    variant?: 'default' | 'widget';
}

interface WindowManagerContextType {
    windows: WindowState[];
    activeWindowId: string | null;
    openWindow: (id: string, title: string, component: ReactNode, initialSize?: Size, initialPos?: Position, icon?: string, variant?: 'default' | 'widget') => void;
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



    const resizeSplit = useCallback((_x: number, y: number) => {
        // Clamp values to keep windows usable (e.g., 10% to 90%)
        // const clampedX = Math.max(0.1, Math.min(0.9, x)); // X is now fixed
        const clampedY = Math.max(0.1, Math.min(0.9, y));

        // We only update Y now, keep X at default or ignored
        setSplitRatio(prev => ({ ...prev, y: clampedY }));
    }, []);

    // Tiling Logic
    // Tiling Logic
    const applyTiledLayout = useCallback(() => {
        setWindows(prevWindows => {
            const visibleWindows = prevWindows.filter(w => w.isOpen && !w.isMinimized);
            // Sort by order of opening/creation to maintain stable grid positions if possible
            // But relying on array order is usually fine if they aren't closed/opened randomly.

            const count = visibleWindows.length;
            if (count === 0) return prevWindows;

            const topBarHeight = 60; // Exact height of GlobalSettings bar from Desktop.tsx
            const availableHeight = window.innerHeight - topBarHeight;

            // Check width directly for robustness during resize
            const isMobileView = window.innerWidth < 768;

            if (isMobileView) {
                // Mobile Vertical Stack Logic
                let currentY = topBarHeight + 10;
                const margin = 10;
                const width = window.innerWidth - (margin * 2);

                return prevWindows.map(w => {
                    if (!w.isOpen || w.isMinimized) return w;

                    let height = w.size.height;
                    // Optional: cap height if needed, but existing heights are okayish

                    const newY = currentY;
                    currentY += height + margin;

                    return {
                        ...w,
                        position: { x: margin, y: newY },
                        size: { width, height },
                        isMaximized: false
                    };
                });
            }

            // Fixed Layout Logic
            // Column 1: 600px
            // Column 2: 320px
            // Total: 920px

            const col1W = 600;
            const rightColW = 320;
            const gap = 20;

            // Adjust available height for gap
            const availableHeightForRows = availableHeight - gap;

            const row1H = Math.floor(availableHeightForRows * splitRatio.y);
            const row2H = availableHeightForRows - row1H;

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

                // Margins from App.tsx (startX = 20)
                const startX = 20;

                if (col === 0) {
                    x = startX;
                    width = col1W;
                } else {
                    x = startX + col1W + gap; // Start after col1 + gap
                    width = rightColW;
                }

                if (row === 0) {
                    y = topBarHeight;
                    height = row1H;
                } else {
                    y = topBarHeight + row1H + gap;
                    height = row2H;
                }

                return {
                    ...w,
                    position: { x, y },
                    size: { width, height },
                    isMaximized: false
                };
            });
        });
    }, [splitRatio.y]); // Check only Y split for height resizing if satisfied

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

    const openWindow = useCallback((id: string, title: string, component: ReactNode, initialSize: Size = { width: 400, height: 300 }, initialPos?: Position, icon?: string, variant?: 'default' | 'widget') => {
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
                zIndex: nextZIndex,
                variant
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
