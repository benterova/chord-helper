import React, { useState } from 'react';

interface Windows7WindowProps {
    title?: string;
    children: React.ReactNode;
}

export const Windows7Window: React.FC<Windows7WindowProps> = ({ title = "Chord Helper", children }) => {
    const [isMaximized, setIsMaximized] = useState(false);

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    return (
        <div className={`win7-window ${isMaximized ? 'maximized' : ''}`}>
            <div className="win7-titlebar">
                <div className="win7-icon">
                    <div className="win7-icon-img"></div>
                </div>
                <div className="win7-title-text">{title}</div>
                <div className="win7-controls">
                    <button className="win7-btn minimize" aria-label="Minimize"></button>
                    <button
                        className={`win7-btn maximize ${isMaximized ? 'restore' : ''}`}
                        onClick={toggleMaximize}
                        aria-label="Maximize"
                    ></button>
                    <button className="win7-btn close" aria-label="Close"></button>
                </div>
            </div>

            {/* Command Bar / Address Bar Placeholder */}
            <div className="win7-command-bar">
                <div className="win7-cmd-btn">Organize</div>
                <div className="win7-cmd-btn">Views</div>
                <div className="win7-cmd-sep"></div>
                <div className="win7-cmd-btn">Help</div>
            </div>

            <div className="win7-content-area">
                <div className="win7-glass-overlay"></div>
                <div className="win7-inner-content">
                    {children}
                </div>
            </div>

            {/* Window Borders for non-maximized mode */}
            {!isMaximized && (
                <>
                    <div className="win7-border-left"></div>
                    <div className="win7-border-right"></div>
                    <div className="win7-border-bottom"></div>
                </>
            )}
        </div>
    );
};
