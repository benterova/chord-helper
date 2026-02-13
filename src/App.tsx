import { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { CircleOfFifths } from './components/CircleOfFifths';
import { ProgressionList } from './components/ProgressionList';
import { ScaleDetails } from './components/ScaleDetails';
import { Generator } from './components/Generator';
import { getChords } from './lib/theory';
import type { ScaleName } from './lib/constants';
import './index.css';

function App() {
  const [root, setRoot] = useState<string>('C');
  const [mode, setMode] = useState<ScaleName>('ionian');

  const chords = useMemo(() => {
    return getChords(root, mode);
  }, [root, mode]);

  return (
    <Layout>
      <Header />
      <Controls
        root={root}
        mode={mode}
        onRootChange={setRoot}
        onModeChange={setMode}
      />

      <main className="main-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '2rem',
        marginTop: '2rem',
        alignItems: 'start'
      }}>
        <div className="main-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className="circle-section">
            <div className="circle-container" style={{ width: '100%', maxWidth: '500px' }}>
              <CircleOfFifths root={root} mode={mode} chords={chords} />
            </div>
            <div className="legend">
              <div className="legend-item">
                <span className="legend-color major"></span>
                <span>Major</span>
              </div>
              <div className="legend-item">
                <span className="legend-color minor"></span>
                <span>Minor</span>
              </div>
              <div className="legend-item">
                <span className="legend-color dim"></span>
                <span>Diminished</span>
              </div>
              <div className="legend-item">
                <span className="legend-color aug"></span>
                <span>Augmented</span>
              </div>
            </div>
          </section>

          <ProgressionList root={root} mode={mode} chords={chords} />

          <Generator root={root} mode={mode} />
        </div>

        <ScaleDetails chords={chords} />
      </main>
    </Layout>
  );
}

export default App;
