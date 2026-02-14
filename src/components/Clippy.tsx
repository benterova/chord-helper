import React from 'react';
import '../styles/components/widget.css'; // Ensure styles are available

import clippyImage from '../assets/clippy.png';
interface ClippyProps {
    isVisible: boolean;
    onClose: () => void;
}

export const Clippy: React.FC<ClippyProps & { variant?: 'generator' | 'circle' }> = ({ isVisible, onClose, variant = 'generator' }) => {
    const [step, setStep] = React.useState(0);

    // Reset step when reopened
    React.useEffect(() => {
        if (isVisible) setStep(0);
    }, [isVisible]);

    const renderContent = () => {
        if (variant === 'circle') {
            return step === 0 ? (
                <>
                    <strong>Circle of Fifths</strong>
                    <p style={{ margin: '5px 0', fontSize: '11px' }}>
                        <b>Record:</b> Toggle REC to build chords.<br />
                        <b>Play:</b> Click segments to preview.<br />
                        <b>Key/Mode:</b> Change root & scale at top.<br />
                        <b>Smart Voice:</b> Smooth chord transitions.
                    </p>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                        <button className="clippy-close-btn" onClick={onClose} style={{ flex: 1 }}>
                            Got it!
                        </button>
                    </div>
                </>
            ) : null;
        }

        // Default 'generator' content
        return step === 0 ? (
            <>
                <strong>Need some help?</strong>
                <p style={{ margin: '5px 0', fontSize: '11px' }}>
                    <b>GEN:</b> Create a new progression.<br />
                    <b>RHY:</b> Add rhythm & bass.<br />
                    <b>MEM:</b> Save/Load your favorites.<br />
                    <b>VIEW:</b> Toggle Roman numerals.<br />
                    <b>◄◄ / ►►:</b> Cycle musical styles.
                </p>
                <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                    <button className="clippy-close-btn" onClick={onClose} style={{ flex: 1 }}>
                        I got this!
                    </button>
                    <button className="clippy-close-btn" onClick={() => setStep(1)} style={{ flex: 1, fontWeight: 'bold' }}>
                        What else?
                    </button>
                </div>
            </>
        ) : (
            <>
                <strong>Engine Features:</strong>
                <p style={{ marginBottom: '5px' }}>Our engine powers your creativity with:</p>
                <ul>
                    <li>Smart Voice Leading</li>
                    <li>Borrowed Chords (Modal Interchange)</li>
                    <li>Humanized Timing</li>
                    <li>Dynamic Rhythms</li>
                </ul>
                <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                    <button className="clippy-close-btn" onClick={() => setStep(0)} style={{ flex: 1 }}>
                        Back
                    </button>
                    <button className="clippy-close-btn" onClick={onClose} style={{ flex: 1 }}>
                        Close
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className={`clippy-container ${isVisible ? 'visible' : ''}`}>
            <div className="clippy-scaling-wrapper">
                <div className="clippy-bubble">
                    <div className="clippy-bubble-content">
                        {renderContent()}
                    </div>
                </div>
                <img src={clippyImage} alt="Clippy" className="clippy-image" />
            </div>
        </div>
    );
};
