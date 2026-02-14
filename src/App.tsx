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
import { FloatingPlayer } from './components/FloatingPlayer';
import { useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './styles/driver-custom.css';
import clippyImage from './assets/clippy.png';

function App() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');

    if (!hasSeenWelcome) {
      const driverObj = driver({
        showProgress: false,
        animate: true,
        allowClose: true,
        doneBtnText: 'Got it!',
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        steps: [
          {
            element: '#midi-generator-taskbar-btn',
            popover: {
              title: 'Welcome!',
              description: `
                <div class="clippy-tutorial-content">
                  <img src="${clippyImage}" class="clippy-tutorial-img" alt="Clippy" />
                  <div class="clippy-tutorial-text">
                    <strong>Hi! It looks like you're new here.</strong><br/><br/>
                    Click this button to open the MIDI Generator and start making music!
                  </div>
                </div>
              `,
              side: 'top',
              align: 'start',
            },
          },
        ],
        onDestroyed: () => {
          localStorage.setItem('hasSeenWelcome', 'true');
        },
      });

      // Small delay to ensure the DOM is ready and the user sees the page load first
      setTimeout(() => {
        driverObj.drive();
      }, 1000);
    }
  }, []);

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
        <Desktop>
          {/* Top Bar / Taskbar Area */}
          <div className="aero-taskbar">
            <div className="aero-taskbar">
              {/* LEFT: Start + Running Apps */}
              <div className="taskbar-left">
                <Header />
                <div className="taskbar-divider"></div>

                {/* Running Apps / Quick Launch */}
                <button
                  className={`taskbar-item ${isPlayerOpen ? 'active' : ''}`}
                  onClick={() => setIsPlayerOpen(!isPlayerOpen)}
                  id="midi-generator-taskbar-btn"
                  style={{
                    background: isPlayerOpen ? 'linear-gradient(to bottom, #d9f2ff 0%, #87cfff 100%)' : 'transparent',
                    border: isPlayerOpen ? '1px solid #3c7fb1' : '1px solid transparent',
                    borderRadius: '4px',
                    padding: '4px 12px',
                    color: isPlayerOpen ? '#003366' : 'rgba(255,255,255,0.9)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textShadow: isPlayerOpen ? '0 1px 0 rgba(255,255,255,0.7)' : '0 1px 2px rgba(0,0,0,0.5)',
                    boxShadow: isPlayerOpen
                      ? 'inset 0 1px 3px rgba(0,0,0,0.2), 0 0 5px rgba(135, 207, 255, 0.8)'
                      : 'none',
                    fontWeight: isPlayerOpen ? 'bold' : 'normal',
                    transition: 'all 0.2s ease',
                    minWidth: '140px'
                  }}
                >
                  <img src="/app_icon.png" alt="" style={{ width: 16, height: 16, filter: isPlayerOpen ? 'none' : 'drop-shadow(0 0 2px rgba(255,255,255,0.8))' }}
                    onError={(e) => e.currentTarget.style.display = 'none'} />
                  <span>MIDI Generator</span>
                </button>
              </div>

              {/* RIGHT: System Tray / Global Settings */}
              <div className="taskbar-right">
                <GlobalSettings />
                <div className="taskbar-clock">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
          <FloatingPlayer isOpen={isPlayerOpen} onClose={() => setIsPlayerOpen(false)} />
        </Desktop>
      </WindowManagerProvider>
    </MusicTheoryProvider>
  );
}

export default App;


