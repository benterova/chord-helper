import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { Generator } from './Generator';

interface FloatingPlayerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FloatingPlayer: React.FC<FloatingPlayerProps> = ({ isOpen }) => {
    const nodeRef = useRef(null);

    if (!isOpen) return null;

    return (
        <Draggable
            nodeRef={nodeRef}
            handle=".drag-handle"
            defaultPosition={{ x: 20, y: 90 }} // Top-left startup
        >
            <div
                ref={nodeRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 9999,
                    // No drop shadow or filter here on the wrapper, let the widget handle it
                    // The user wanted "just floating there with some drop shadow", 
                    // Generator likely has its own styling. We can add a shadow here if Generator doesn't provide enough depth.
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
                }}
            >
                {/* Invisible Drag Handle on top of the widget */}
                <div
                    className="drag-handle"
                    style={{
                        height: '80px',
                        width: '60%',
                        position: 'absolute',
                        top: '20px',
                        left: '20%',
                        zIndex: 100,
                        cursor: 'grab',
                        background: 'transparent',
                        borderRadius: '20px'
                    }}
                    title="Drag to move"
                />

                {/* Content - The Generator Widget */}
                {/* Ensure no border radius clipping that looks like a window */}
                <div>
                    <Generator />
                </div>
            </div>
        </Draggable>
    );
};
