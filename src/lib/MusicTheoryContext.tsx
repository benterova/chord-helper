import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { getChords, type Chord } from '../lib/theory';
import type { ScaleName } from '../lib/constants';

interface MusicTheoryContextType {
    root: string;
    mode: ScaleName;
    chords: Chord[];
    setRoot: (root: string) => void;
    setMode: (mode: ScaleName) => void;
}

const MusicTheoryContext = createContext<MusicTheoryContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useMusicTheory = () => {
    const context = useContext(MusicTheoryContext);
    if (!context) {
        throw new Error('useMusicTheory must be used within a MusicTheoryProvider');
    }
    return context;
};

export const MusicTheoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [root, setRoot] = useState<string>('C');
    const [mode, setMode] = useState<ScaleName>('ionian');

    const chords = useMemo(() => {
        return getChords(root, mode);
    }, [root, mode]);

    return (
        <MusicTheoryContext.Provider value={{
            root,
            mode,
            chords,
            setRoot,
            setMode
        }}>
            {children}
        </MusicTheoryContext.Provider>
    );
};
