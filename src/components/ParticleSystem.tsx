import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
}

interface ParticleSystemProps {
    active: boolean;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    color?: string; // Base color for particles (e.g., 'rgba(255, 100, 0, ')
    intensity?: 'low' | 'medium' | 'high';
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
    active,
    width = 200,
    height = 200,
    style = {},
    color: baseColor,
    intensity = 'medium'
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const createParticle = (w: number, h: number): Particle => {
            // Spawn randomly around the center
            const xOffset = (Math.random() - 0.5) * (width * 0.4);
            const yOffset = (Math.random() - 0.5) * (height * 0.4);

            // Determine properties based on intensity
            let speedMultiplier = 1;
            let sizeMultiplier = 1;

            if (intensity === 'low') {
                speedMultiplier = 0.5;
                sizeMultiplier = 0.7;
            } else if (intensity === 'high') {
                speedMultiplier = 1.5;
                sizeMultiplier = 1.2;
            }

            // Randomize speed
            const speed = (Math.random() * 0.5 + 0.2) * speedMultiplier;

            let pColor;
            if (baseColor) {
                pColor = baseColor;
            } else {
                const layer = Math.random();
                if (layer < 0.33) {
                    pColor = Math.random() > 0.5 ? 'rgba(0, 80, 200, ' : 'rgba(80, 0, 180, ';
                } else if (layer < 0.66) {
                    pColor = Math.random() > 0.5 ? 'rgba(0, 174, 255, ' : 'rgba(0, 220, 200, ';
                } else {
                    const rand = Math.random();
                    if (rand < 0.6) pColor = 'rgba(255, 255, 255, ';
                    else if (rand < 0.9) pColor = 'rgba(0, 255, 255, ';
                    else pColor = 'rgba(200, 255, 100, ';
                }
            }

            const size = (Math.random() * 2 + 1) * sizeMultiplier;

            return {
                x: w / 2 + xOffset,
                y: h / 2 + yOffset,
                vx: (Math.random() - 0.5) * 0.5 * speedMultiplier,
                vy: -speed,
                life: 0,
                maxLife: Math.random() * 60 + 40,
                size: size,
                color: pColor
            };
        };

        const animate = () => {
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Spawn new particles if active
            // Spawn rate based on intensity
            const spawnCount = intensity === 'high' ? 3 : (intensity === 'low' ? (Math.random() > 0.5 ? 1 : 0) : 1);

            for (let i = 0; i < spawnCount; i++) {
                particles.current.push(createParticle(canvas.width, canvas.height));
            }

            // Update and draw particles
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life++;
                p.size *= 0.98; // Shrink slightly

                if (p.life >= p.maxLife || p.size < 0.1) {
                    particles.current.splice(i, 1);
                    continue;
                }

                // Twinkle effect (random size fluctuation)
                if (Math.random() > 0.9) {
                    p.size = Math.max(0.5, p.size + (Math.random() - 0.5));
                }

                const alpha = (1 - (p.life / p.maxLife)) * 0.8; // Max opacity 0.8
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + alpha + ')'; // Assuming color string ends with ", "
                ctx.fill();

                // Glow
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.color + '0.5)';
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
        };
    }, [active, width, height, baseColor, intensity]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 0,
                ...style
            }}
        />
    );
};
