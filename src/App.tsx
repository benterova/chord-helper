import { useEffect } from 'react';
import { MusicTheoryProvider } from './lib/MusicTheoryContext';
import { WindowManagerProvider } from './components/WindowManager'; // Keep for now if context is used elsewhere, but provider might not be needed for layout. 
// Actually, if we removed useWindowManager from Desktop, we might not need it at all unless other components use it.
// Let's assume we can remove it for now, or keep it if it holds other state. 
// The plan said remove it. 
import { Desktop } from './components/Desktop';
import { GlobalSettings } from './components/GlobalSettings';
import { Header } from './components/Header';
import frutigerBg from './assets/frutiger_bg.png';
import './styles/components/grid.css'; // Import the grid styles

function App() {
  useEffect(() => {
    // Force background image via JS to ensure correct path resolution
    document.body.style.backgroundImage = `url(${frutigerBg})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center bottom';
    document.body.style.backgroundAttachment = 'fixed';
  }, []);

  return (
    <MusicTheoryProvider>
      <WindowManagerProvider>
        {/* We might still need WindowManagerProvider if some components use useWindowManager() for other things like "active window" state even if layout is static? 
              AeroWindow used it. Desktop used it. 
              Desktop doesn't use it anymore. 
              If no other component uses useWindowManager, we can remove it.
              Let's keep it for safety in case I missed a hook usage, but empty the initializer.
          */}
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
      </WindowManagerProvider>
    </MusicTheoryProvider>
  );
}

export default App;

