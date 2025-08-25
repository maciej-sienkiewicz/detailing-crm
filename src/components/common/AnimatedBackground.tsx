// src/components/common/AnimatedBackground.tsx

import React from 'react';
import styled, {keyframes} from 'styled-components';

interface AnimatedBackgroundProps {
    type?: 'hexagons' | 'particles' | 'waves';
    count?: number;
    color1?: string;
    color2?: string;
    opacity?: number;
    speed?: number;
    size?: 'small' | 'medium' | 'large';
}

/**
 * Komponent tła z animowanymi elementami dla nowoczesnego wyglądu stron
 *
 * @param type - Typ animowanego tła (hexagony, cząsteczki, fale)
 * @param count - Liczba elementów tła
 * @param color1 - Główny kolor gradientu
 * @param color2 - Drugi kolor gradientu
 * @param opacity - Przezroczystość elementów
 * @param speed - Szybkość animacji (1-10)
 * @param size - Rozmiar elementów
 */
const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
                                                                   type = 'hexagons',
                                                                   count = 15,
                                                                   color1 = '#3498db',
                                                                   color2 = '#2c3e50',
                                                                   opacity = 0.1,
                                                                   speed = 5,
                                                                   size = 'medium'
                                                               }) => {
    // Określenie rozmiaru elementów
    const getSize = () => {
        switch (size) {
            case 'small': return { min: 20, max: 50 };
            case 'large': return { min: 60, max: 100 };
            default: return { min: 40, max: 80 };
        }
    };

    const { min, max } = getSize();

    // Generowanie elementów tła
    const generateElements = () => {
        const elements = [];

        for (let i = 0; i < count; i++) {
            const elementSize = min + Math.random() * (max - min);
            const animationDuration = (5 + Math.random() * 15) / (speed / 5);
            const animationDelay = Math.random() * 5;

            let elementStyle: React.CSSProperties = {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${elementSize}px`,
                height: `${elementSize}px`,
                opacity,
                animationDuration: `${animationDuration}s`,
                animationDelay: `${animationDelay}s`,
                transform: `rotate(${Math.random() * 360}deg)`
            };

            if (type === 'hexagons' || type === 'particles') {
                elementStyle.background = `linear-gradient(135deg, ${color1} ${Math.random() * 50}%, ${color2})`;
            }

            let ElementComponent;

            switch (type) {
                case 'particles':
                    ElementComponent = Particle;
                    break;
                case 'waves':
                    ElementComponent = Wave;
                    break;
                default:
                    ElementComponent = Hexagon;
            }

            elements.push(
                <ElementComponent
                    key={i}
                    style={elementStyle}
                />
            );
        }

        return elements;
    };

    return (
        <Container>
            {generateElements()}
        </Container>
    );
};

// Animacje
const float = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
`;

const wave = keyframes`
  0% {
    transform: translateX(0) translateY(0) rotate(0);
  }
  50% {
    transform: translateX(20px) translateY(-30px) rotate(10deg);
  }
  100% {
    transform: translateX(0) translateY(0) rotate(0);
  }
`;

// Styled Components
const Container = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
`;

const Hexagon = styled.div`
  position: absolute;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  animation: ${float} infinite alternate both ease-in-out;
`;

const Particle = styled.div`
  position: absolute;
  border-radius: 50%;
  animation: ${pulse} infinite alternate both ease-in-out;
`;

const Wave = styled.div`
  position: absolute;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.5), rgba(52, 152, 219, 0));
  animation: ${wave} infinite alternate both ease-in-out;
`;

export default AnimatedBackground;