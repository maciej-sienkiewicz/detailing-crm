// src/components/common/AnimatedGradientBackground.tsx

import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

interface AnimatedGradientBackgroundProps {
    children: React.ReactNode;
    colors?: string[];
    speed?: number;
    blurAmount?: number;
    opacity?: number;
}

/**
 * Animowane tło z gradientem, które dodaje nowoczesny wygląd do stron aplikacji
 * Można użyć jako wrapper dla całej strony lub konkretnej sekcji
 */
const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
                                                                                   children,
                                                                                   colors = ['#3498db', '#2980b9', '#2c3e50', '#34495e'],
                                                                                   speed = 20,
                                                                                   blurAmount = 100,
                                                                                   opacity = 0.05
                                                                               }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ustawienie wymiarów canvasa zgodnie z wielkością okna
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Tworzenie blobów gradientowych
        type Blob = {
            x: number;
            y: number;
            radius: number;
            color: string;
            vx: number;
            vy: number;
        };

        // Inicjalizacja blobów
        const blobs: Blob[] = [];
        const blobCount = 5; // Liczba animowanych elementów

        for (let i = 0; i < blobCount; i++) {
            const radius = Math.random() * 300 + 100;
            blobs.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * speed / 10,
                vy: (Math.random() - 0.5) * speed / 10
            });
        }

        // Funkcja rysująca jeden blob z gradientem
        const drawBlob = (blob: Blob) => {
            const gradient = ctx.createRadialGradient(
                blob.x, blob.y, 0,
                blob.x, blob.y, blob.radius
            );

            // Dodaj przezroczystość do koloru
            const baseColor = blob.color;

            gradient.addColorStop(0, `${baseColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${baseColor}00`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
            ctx.fill();
        };

        // Funkcja do aktualizacji pozycji blobów
        const updateBlobs = () => {
            blobs.forEach(blob => {
                blob.x += blob.vx;
                blob.y += blob.vy;

                // Odbijanie od krawędzi
                if (blob.x < -blob.radius) blob.x = canvas.width + blob.radius;
                if (blob.x > canvas.width + blob.radius) blob.x = -blob.radius;
                if (blob.y < -blob.radius) blob.y = canvas.height + blob.radius;
                if (blob.y > canvas.height + blob.radius) blob.y = -blob.radius;
            });
        };

        // Główna pętla animacji
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Rysuj wszystkie bloby
            blobs.forEach(drawBlob);

            // Aktualizuj pozycje
            updateBlobs();

            // Kontynuuj animację
            requestAnimationFrame(animate);
        };

        // Uruchom animację
        animate();

        // Cleanup przy odmontowaniu
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [colors, speed, opacity]);

    return (
        <Container>
            <Canvas ref={canvasRef} $blurAmount={blurAmount} />
            <Content>{children}</Content>
        </Container>
    );
};

const Canvas = styled.canvas<{ $blurAmount: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: blur(${props => props.$blurAmount}px);
  pointer-events: none;
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Content = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

export default AnimatedGradientBackground;