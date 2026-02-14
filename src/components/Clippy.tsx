import React from 'react';
import '../styles/components/widget.css'; // Ensure styles are available

interface ClippyProps {
    isVisible: boolean;
    onClose: () => void;
}

export const Clippy: React.FC<ClippyProps> = ({ isVisible, onClose }) => {
    return (
        <div className={`clippy-container ${isVisible ? 'visible' : ''}`}>
            <div className="clippy-scaling-wrapper">
                <div className="clippy-bubble">
                    <div className="clippy-bubble-content">
                        <strong>Hi! It looks like you're making music!</strong>
                        <p>Our engine features:</p>
                        <ul>
                            <li>Smart Voice Leading</li>
                            <li>Borrowed Chords</li>
                            <li>Humanized Timing</li>
                            <li>Dynamic Rhythms</li>
                        </ul>
                        <button className="clippy-close-btn" onClick={onClose}>
                            I got this!
                        </button>
                    </div>
                </div>
                <img src="/clippy_agent.png" alt="Clippy" className="clippy-image" />
            </div>
        </div>
    );
};
