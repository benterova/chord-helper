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
                style={{
                    height: '40px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.5))', // Add extra glow
                    cursor: 'pointer'
                }}
                onClick={() => window.location.reload()}
            />
        </header>
    );
};
