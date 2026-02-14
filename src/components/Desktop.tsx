import React from 'react';
import { CircleOfFifths } from './CircleOfFifths';
import { ProgressionList } from './ProgressionList'; /* Fixed import name */
// import { Generator } from './Generator';
import { ScaleDetails } from './ScaleDetails';
// import '../styles/components/grid.css'; // Assuming we import this in index.css or here

interface DesktopProps {
    children?: React.ReactNode; // For taskbar or other static elements
}

export const Desktop: React.FC<DesktopProps> = ({ children }) => {
    return (
        <div className="desktop-container" style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden', /* Grid handles overflow if needed */
        }}>
            {/* Main Grid Layout */}
            <div className="desktop-grid">

                {/* Top Left: Circle of Fifths */}
                <div className="grid-cell-circle static-window">
                    <div className="win7-titlebar">
                        <div className="win7-icon">
                            <img src="icon_circle.png" alt="" style={{ width: 16, height: 16, marginRight: 5 }} />
                        </div>
                        <div className="win7-title-text">Circle of Fifths</div>
                    </div>
                    <div className="win7-content-area">
                        <div className="win7-inner-content">
                            <CircleOfFifths />
                        </div>
                    </div>
                </div>

                {/* Top Right: Scale Details */}
                <div className="grid-cell-details static-window">
                    <div className="win7-titlebar">
                        <div className="win7-icon">
                            <img src="icon_scale.png" alt="" style={{ width: 16, height: 16, marginRight: 5 }} />
                        </div>
                        <div className="win7-title-text">Scale Details</div>
                    </div>
                    <div className="win7-content-area">
                        <div className="win7-inner-content">
                            <ScaleDetails />
                        </div>
                    </div>
                </div>

                {/* Bottom Left: Progression List */}
                <div className="grid-cell-progs static-window">
                    <div className="win7-titlebar">
                        <div className="win7-icon">
                            <img src="icon_progression.png" alt="" style={{ width: 16, height: 16, marginRight: 5 }} />
                        </div>
                        <div className="win7-title-text">Progression Explorer</div>
                    </div>
                    <div className="win7-content-area">
                        <div className="win7-inner-content">
                            {/* Check export name, App.tsx used ProgressionList */}
                            <ProgressionList />
                        </div>
                    </div>
                </div>

                {/* Bottom Right: Generator Widget (MOVED TO FLOATING) */}
                <div className="grid-cell-generator" style={{ display: 'none' }}>
                    {/* <Generator /> */}
                </div>

            </div>

            {/* Taskbar / Static Controls */}
            {children}
        </div>
    );
};
