import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="app-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {children}
        </div>
    );
};
