import React, { useEffect } from 'react';
import { MusicTheoryProvider } from './lib/MusicTheoryContext';
import { WindowManagerProvider, useWindowManager } from './components/WindowManager';
import { Desktop } from './components/Desktop';
import { CircleOfFifths } from './components/CircleOfFifths';
import { ProgressionList } from './components/ProgressionList';
import { Generator } from './components/Generator';
import { ScaleDetails } from './components/ScaleDetails';
import { GlobalSettings } from './components/GlobalSettings';
import { Header } from './components/Header';
import './index.css';

const DesktopInitializer: React.FC = () => {
  const { openWindow } = useWindowManager();

  useEffect(() => {
    // Calculate centered layout
    const screenW = window.innerWidth;
    const screenH = window.innerHeight; // Use height to center vertically too if needed, but top margin is safer

    // Define window sizes
    // Grid: 2 Columns, 2 Rows. Touching (0px Gap).
    // Column 1 Width: 600px (Circle & Progs)
    // Column 2 Width: 320px (Details & Gen)
    // Row 1 Height: 600px (Circle & Details) // Taller top row
    // Row 2 Height: 280px (Progs & Gen)    // Shorter bottom row

    const sizes = {
      circle: { w: 600, h: 600 },
      details: { w: 320, h: 600 },
      progs: { w: 600, h: 280 },
      gen: { w: 320, h: 280 }
    };

    const totalW = sizes.circle.w + sizes.details.w; // 920px
    const startX = Math.max(0, (screenW - totalW) / 2);
    const startY = 70; // Fixed top margin

    // Circle (Top Left)
    openWindow('circle', 'Circle of Fifths', <CircleOfFifths />,
      { width: sizes.circle.w, height: sizes.circle.h },
      { x: startX, y: startY }
    );

    // Scale Details (Top Right) - Touching Circle
    openWindow('details', 'Scale Details', <ScaleDetails />,
      { width: sizes.details.w, height: sizes.details.h },
      { x: startX + sizes.circle.w, y: startY }
    );

    // Progression List (Bottom Left) - Touching Circle
    openWindow('progressions', 'Progression Explorer', <ProgressionList />,
      { width: sizes.progs.w, height: sizes.progs.h },
      { x: startX, y: startY + sizes.circle.h }
    );

    // Generator (Bottom Right) - Touching Progs & Details
    openWindow('generator', 'MIDI Generator', <Generator />,
      { width: sizes.gen.w, height: sizes.gen.h },
      { x: startX + sizes.progs.w, y: startY + sizes.details.h } // Align based on column/row
    );

  }, []); // Run once on mount

  return (
    <Desktop>
      {/* Top Bar / Taskbar Area */}
      <div className="aero-taskbar" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        height: '60px',
        background: 'linear-gradient(to bottom, #2b3c5a 0%, #1e2b40 100%)', // Darker, more professional blue
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        justifyContent: 'space-between',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Header />
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.2)' }}></div>
          <GlobalSettings />
        </div>
      </div>
    </Desktop>
  );
};

function App() {
  return (
    <MusicTheoryProvider>
      <WindowManagerProvider>
        <DesktopInitializer />
      </WindowManagerProvider>
    </MusicTheoryProvider>
  );
}

export default App;
