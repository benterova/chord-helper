import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../lib/audio';

interface VisualizerProps {
    width?: number;
    height?: number;
    color?: string;
    style?: React.CSSProperties;
}

export const Visualizer: React.FC<VisualizerProps> = ({
    width = 300,
    height = 50,
    color = '#00ff41',
    style
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const analyser = audioEngine.analyser;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let animationId: number;

        const draw = () => {
            animationId = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, width, height);

            // Draw background grid (faint)
            ctx.fillStyle = 'rgba(0, 40, 20, 0.2)';
            for (let i = 0; i < width; i += 4) {
                if (i % 20 === 0) ctx.fillRect(i, 0, 1, height);
            }

            // Draw bars
            const barWidth = (width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * height;

                // Main bar
                ctx.fillStyle = color;
                // Add some transparency at the bottom for a glow effect
                // Gradient for bar
                const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

                ctx.fillStyle = gradient;

                if (dataArray[i] > 0) {
                    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
                }


                // Peak hold (simulated) - keeps top pixel bright
                if (dataArray[i] > 10) {
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x, height - barHeight, barWidth, 1);
                }

                x += barWidth + 1;
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [width, height, color]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                display: 'block',
                ...style
            }}
        />
    );
};
