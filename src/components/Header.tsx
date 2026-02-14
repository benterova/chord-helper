import React from 'react';
import aeroLogo from '../assets/aero_logo_main_1771028936691.png';

export const Header: React.FC = () => {
    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0'
        }}>
            <img
                src={aeroLogo}
                alt="Chord Helper"
                className="taskbar-start-btn"
                onClick={() => window.location.reload()}
            />
        </header>
    );
};
