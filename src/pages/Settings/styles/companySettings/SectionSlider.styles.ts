// src/pages/Settings/styles/companySettings/SectionSlider.styles.ts
import styled from 'styled-components';

export const SliderContainer = styled.div`
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-bottom: 1px solid #e1e7ef;
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
    z-index: 10;
    position: relative;
    backdrop-filter: blur(8px);
`;

export const SliderHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32px 40px 24px;
    max-width: 1400px;
    margin: 0 auto;

    @media (max-width: 1024px) {
        flex-direction: column;
        gap: 24px;
        padding: 24px 20px;
        align-items: stretch;
    }
`;

export const HeaderLeft = styled.div`
    flex: 1;
`;

export const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 32px;

    @media (max-width: 1024px) {
        flex-direction: column;
        gap: 20px;
        width: 100%;
    }

    @media (max-width: 768px) {
        flex-direction: column-reverse;
    }
`;

export const SliderTitle = styled.h1`
    font-size: 32px;
    font-weight: 800;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
    letter-spacing: -0.02em;
    line-height: 1.2;
`;

export const SliderSubtitle = styled.p`
    font-size: 16px;
    color: #64748b;
    margin: 8px 0 0;
    font-weight: 500;
    opacity: 0.8;
`;

export const NavigationContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    background: rgba(255, 255, 255, 0.7);
    padding: 12px 20px;
    border-radius: 20px;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(226, 232, 240, 0.5);
    box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08);

    @media (max-width: 768px) {
        justify-content: center;
        padding: 16px 24px;
    }
`;

export const NavButton = styled.button<{ $disabled: boolean }>`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 2px solid ${props => props.$disabled ? 'rgba(203, 213, 225, 0.5)' : 'rgba(26, 54, 93, 0.2)'};
    background: ${props => props.$disabled
            ? 'rgba(248, 250, 252, 0.6)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
    };
    color: ${props => props.$disabled ? '#cbd5e1' : '#1a365d'};
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${props => props.$disabled
            ? 'none'
            : '0 4px 16px rgba(26, 54, 93, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    };
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 10px;
    }

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(26, 54, 93, 0.2);
        border-color: rgba(26, 54, 93, 0.3);

        &::before {
            opacity: 1;
        }

        * {
            color: white;
            position: relative;
            z-index: 1;
        }
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

export const SectionIndicators = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 8px 16px;
    background: rgba(26, 54, 93, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(26, 54, 93, 0.1);
`;

export const SectionDot = styled.button<{ $active: boolean }>`
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: none;
    background: ${props => props.$active
    ? 'linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%)'
    : 'rgba(203, 213, 225, 0.6)'
};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    box-shadow: ${props => props.$active
    ? '0 4px 12px rgba(26, 54, 93, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
    : '0 2px 4px rgba(0, 0, 0, 0.1)'
};

    &:hover {
        transform: scale(1.2);
        
        ${props => !props.$active && `
            background: rgba(148, 163, 184, 0.8);
        `}
    }

    ${props => props.$active && `
        &::after {
            content: '';
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            border: 2px solid rgba(26, 54, 93, 0.3);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 0.3;
            }
            50% {
                transform: scale(1.1);
                opacity: 0.1;
            }
        }
    `}
`;

export const ActionButtonsContainer = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;

        > * {
            flex: 1;
            max-width: 200px;
        }
    }
`;

export const ActionButton = styled.button<{
    $primary?: boolean;
    $secondary?: boolean;
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    white-space: nowrap;
    min-height: 40px;
    position: relative;
    overflow: hidden;
    font-family: inherit;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    &:not(:disabled):hover {
        transform: translateY(-1px);
    }

    &:not(:disabled):active {
        transform: translateY(0);
    }

    ${props => props.$primary && `
        background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(26, 54, 93, 0.2);

        &:not(:disabled):hover {
            box-shadow: 0 6px 20px rgba(26, 54, 93, 0.3);
        }
    `}

    ${props => props.$secondary && `
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        color: #64748b;
        border: 1px solid rgba(226, 232, 240, 0.8);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

        &:not(:disabled):hover {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            color: #475569;
            border-color: rgba(148, 163, 184, 0.6);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }
    `}
`;

export const ProgressContainer = styled.div`
    padding: 0 40px 24px;
    max-width: 1400px;
    margin: 0 auto;

    @media (max-width: 768px) {
        padding: 0 20px 20px;
    }
`;

export const ProgressBar = styled.div`
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
    border-radius: 3px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
    }
`;

export const ProgressFill = styled.div<{ $progress: number }>`
    height: 100%;
    background: linear-gradient(90deg, #1a365d 0%, #2c5aa0 50%, #3b82f6 100%);
    border-radius: 3px;
    width: ${props => props.$progress}%;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    box-shadow: 0 0 12px rgba(26, 54, 93, 0.4);
    
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
        border-radius: 3px 3px 0 0;
    }
`;