// src/components/common/ParticlesNetwork.tsx

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface ParticlesNetworkProps {
    color?: string;
    particleCount?: number;
    linkDistance?: number;
    moveSpeed?: number;
    opacity?: number;
    lineWidth?: number;
    size?: number;
    backgroundColor?: string;
}

/**
 * Komponent tworzący interaktywną sieć cząstek, która reaguje na ruch kursora
 * Doskonały do tworzenia nowoczesnych i zaawansowanych UI
 */
const ParticlesNetwork: React.FC<ParticlesNetworkProps> = ({
                                                               color = '#3498db',
                                                               particleCount = 80,
                                                               linkDistance = 150,
                                                               moveSpeed = 1,
                                                               opacity = 0.5,
                                                               lineWidth = 1,
                                                               size = 3,
                                                               backgroundColor = 'transparent'
                                                           }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId: number;
        let mousePosition = { x: width / 2, y: height / 2 };

        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Klasa cząsteczki
        class Particle {
            x: number;
            y: number;
            size: number;
            vx: number;
            vy: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * size + 1;
                this.vx = (Math.random() - 0.5) * moveSpeed;
                this.vy = (Math.random() - 0.5) * moveSpeed;
            }

            // Metoda aktualizująca pozycję cząsteczki
            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Odbijanie od krawędzi
                if (this.x < 0 || this.x > width) this.vx = -this.vx;
                if (this.y < 0 || this.y > height) this.vy = -this.vy;

                // Przyciąganie do pozycji kursora
                const distX = mousePosition.x - this.x;
                const distY = mousePosition.y - this.y;
                const distance = Math.sqrt(distX * distX + distY * distY);

                if (distance < linkDistance) {
                    const forceFactor = 0.03; // Siła przyciągania
                    this.vx += distX * forceFactor;
                    this.vy += distY * forceFactor;

                    // Limit prędkości
                    const maxSpeed = 3;
                    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    if (speed > maxSpeed) {
                        this.vx = (this.vx / speed) * maxSpeed;
                        this.vy = (this.vy / speed) * maxSpeed;
                    }
                }
            }

            // Metoda rysująca cząsteczkę
            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }

            // Metoda łącząca cząsteczkę z innymi
            connect(particles: Particle[]) {
                if (!ctx) return;

                particles.forEach(particle => {
                    const distX = this.x - particle.x;
                    const distY = this.y - particle.y;
                    const distance = Math.sqrt(distX * distX + distY * distY);

                    if (distance < linkDistance) {
                        // Zmień opacity linii w zależności od odległości
                        const opacity = 1 - (distance / linkDistance);
                        ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${opacity * opacity})`;
                        ctx.lineWidth = lineWidth;

                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(particle.x, particle.y);
                        ctx.stroke();
                    }
                });
            }
        }

        // Konwersja koloru hex do rgb
        const hexToRgb = (hex: string): string => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
                : '0, 0, 0';
        };

        // Inicjalizacja cząsteczek
        const particles: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Obsługa ruchu myszy
        const handleMouseMove = (e: MouseEvent) => {
            mousePosition.x = e.clientX;
            mousePosition.y = e.clientY;
        };

        // Obsługa eventu dla urządzeń mobilnych
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mousePosition.x = e.touches[0].clientX;
                mousePosition.y = e.touches[0].clientY;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        // Funkcja animująca
        const animate = () => {
            if (!ctx) return;

            ctx.clearRect(0, 0, width, height);

            if (backgroundColor !== 'transparent') {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, width, height);
            }

            // Aktualizacja i rysowanie cząsteczek
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Rysowanie połączeń między cząsteczkami
            particles.forEach(particle => {
                particle.connect(particles);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup przy odmontowaniu
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, particleCount, linkDistance, moveSpeed, opacity, lineWidth, size, backgroundColor]);

    return <Canvas ref={canvasRef} />;
};

const Canvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
`;

export default ParticlesNetwork;