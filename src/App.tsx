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


import frutigerBg from './assets/frutiger_bg.png';

const DesktopInitializer: React.FC = () => {
  const { openWindow } = useWindowManager();

  useEffect(() => {
    // Force background image via JS to ensure correct path resolution
    document.body.style.backgroundImage = `url(${frutigerBg})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center bottom';
    document.body.style.backgroundAttachment = 'fixed';

    const sizes = {
      circle: { w: 600, h: 600 },
      details: { w: 320, h: 600 },
      progs: { w: 600, h: 280 },
      gen: { w: 320, h: 280 }
    };

    // const totalW = sizes.circle.w + sizes.details.w; // 920px -> Unused
    const startX = 20; // Fixed left margin
    const startY = 70; // Fixed top margin

    // Circle (Top Left)
    openWindow('circle', 'Circle of Fifths', <CircleOfFifths />,
      { width: sizes.circle.w, height: sizes.circle.h },
      { x: startX, y: startY },
      '/icon_circle.png'
    );

    // Scale Details (Top Right) - Touching Circle
    openWindow('details', 'Scale Details', <ScaleDetails />,
      { width: sizes.details.w, height: sizes.details.h },
      { x: startX + sizes.circle.w, y: startY },
      '/icon_scale.png'
    );

    // Progression List (Bottom Left) - Touching Circle
    openWindow('progressions', 'Progression Explorer', <ProgressionList />,
      { width: sizes.progs.w, height: sizes.progs.h },
      { x: startX, y: startY + sizes.circle.h },
      '/icon_progression.png'
    );

    // Generator (Bottom Right) - Touching Progs & Details
    openWindow('generator', 'MIDI Generator', <Generator />,
      { width: sizes.gen.w, height: sizes.gen.h },
      { x: startX + sizes.progs.w, y: startY + sizes.details.h }, // Align based on column/row
      '/icon_generator.png'
    );

  }, []); // Run once on mount

  return (
    <Desktop>
      {/* Top Bar / Taskbar Area */}
      <div className="aero-taskbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Header />
          <div className="taskbar-divider"></div>
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
