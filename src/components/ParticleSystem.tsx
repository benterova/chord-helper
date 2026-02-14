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
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ active, width = 200, height = 200 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const requestRef = useRef<number | null>(null);

    const createParticle = (w: number, h: number): Particle => {
        // Spawn randomly around the center
        const xOffset = (Math.random() - 0.5) * 80;
        const yOffset = (Math.random() - 0.5) * 80;

        // Randomize Layer
        const layer = Math.random();
        let speed, color, size;

        if (layer < 0.33) {
            // Layer 1: Background (Very Slow, Small, Deep Colors)
            speed = Math.random() * 0.2 + 0.1; // Much slower
            // Mix of Deep Blue and Purple
            color = Math.random() > 0.5 ? 'rgba(0, 80, 200, ' : 'rgba(80, 0, 180, ';
            size = Math.random() * 1.5 + 0.5;
        } else if (layer < 0.66) {
            // Layer 2: Mid (Gentle, Aero Colors)
            speed = Math.random() * 0.5 + 0.3;
            // distinct Aero Blue and Teal
            color = Math.random() > 0.5 ? 'rgba(0, 174, 255, ' : 'rgba(0, 220, 200, ';
            size = Math.random() * 2 + 1;
        } else {
            // Layer 3: Foreground (Sparkles, Vivid)
            speed = Math.random() * 1.0 + 0.5;
            // White, Cyan, and a hint of Lime for pop
            const rand = Math.random();
            if (rand < 0.6) color = 'rgba(255, 255, 255, ';
            else if (rand < 0.9) color = 'rgba(0, 255, 255, ';
            else color = 'rgba(200, 255, 100, '; // Subtle Lime pop

            size = Math.random() * 2 + 2;
        }

        return {
            x: w / 2 + xOffset,
            y: h / 2 + yOffset,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -speed,
            life: 0,
            maxLife: Math.random() * 60 + 40,
            size: size,
            color: color
        };
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Spawn new particles if active
        if (active) {
            for (let i = 0; i < 2; i++) {
                particles.current.push(createParticle(canvas.width, canvas.height));
            }
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
            ctx.fillStyle = p.color + alpha + ')';
            ctx.fill();

            // Glow
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color + '0.5)';
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
        };
    }, [active]);

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
                zIndex: 0 // Behind the button (if button is z-index 1 or higher)
            }}
        />
    );
};
