// src/pages/Settings/styles/companySettings/SectionSlider.styles.ts
import styled from 'styled-components';

export const SliderContainer = styled.div`
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    z-index: 10;
    position: relative;
`;

export const SliderHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px 16px;
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 16px;
        padding: 20px 24px;
        align-items: flex-start;
    }
`;

export const SliderTitle = styled.h2`
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.025em;
`;

export const SliderSubtitle = styled.p`
    font-size: 16px;
    color: #64748b;
    margin: 4px 0 0;
    font-weight: 500;
`;

export const NavigationContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

export const NavButton = styled.button<{ $disabled: boolean }>`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    border: 2px solid ${props => props.$disabled ? '#e2e8f0' : '#1a365d'};
    background: ${props => props.$disabled ? '#f8fafc' : '#ffffff'};
    color: ${props => props.$disabled ? '#cbd5e1' : '#1a365d'};
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: all 0.2s ease;
    box-shadow: ${props => props.$disabled ? 'none' : '0 2px 4px rgba(26, 54, 93, 0.1)'};

    &:hover:not(:disabled) {
        background: #1a365d;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(26, 54, 93, 0.15);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

export const SectionIndicators = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
`;

export const SectionDot = styled.button<{ $active: boolean }>`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    background: ${props => props.$active ? '#1a365d' : '#cbd5e1'};
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
        background: ${props => props.$active ? '#1a365d' : '#94a3b8'};
        transform: scale(1.2);
    }

    ${props => props.$active && `
        &::after {
            content: '';
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            border: 2px solid #1a365d;
            border-radius: 50%;
            opacity: 0.3;
        }
    `}
`;

export const ProgressContainer = styled.div`
    padding: 0 32px 16px;
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 768px) {
        padding: 0 24px 16px;
    }
`;

export const ProgressBar = styled.div`
    width: 100%;
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
`;

export const ProgressFill = styled.div<{ $progress: number }>`
    height: 100%;
    background: linear-gradient(90deg, #1a365d 0%, #2c5aa0 100%);
    border-radius: 2px;
    width: ${props => props.$progress}%;
    transition: width 0.3s ease;
`;