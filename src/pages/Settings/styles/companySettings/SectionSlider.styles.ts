// src/pages/Settings/styles/companySettings/SectionSlider.styles.ts
import styled from 'styled-components';

export const SliderContainer = styled.div`
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-bottom: 1px solid #e1e7ef;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
    z-index: 10;
    position: relative;
`;

export const SliderHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px 12px;
    max-width: 1400px;
    margin: 0 auto;

    @media (max-width: 1024px) {
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        align-items: stretch;
    }
`;

export const HeaderLeft = styled.div`
    flex: 1;
`;

export const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;

    @media (max-width: 1024px) {
        flex-direction: column;
        gap: 12px;
        width: 100%;
    }

    @media (max-width: 768px) {
        flex-direction: column-reverse;
    }
`;

export const SliderTitle = styled.h1`
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
    letter-spacing: -0.01em;
    line-height: 1.2;
`;

export const SliderSubtitle = styled.p`
    font-size: 13px;
    color: #64748b;
    margin: 4px 0 0;
    font-weight: 500;
`;

export const NavigationContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.7);
    padding: 8px 12px;
    border-radius: 12px;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(226, 232, 240, 0.5);
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);

    @media (max-width: 768px) {
        justify-content: center;
        padding: 10px 16px;
    }
`;

export const NavButton = styled.button<{ $disabled: boolean }>`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1.5px solid ${props => props.$disabled ? 'rgba(203, 213, 225, 0.5)' : 'rgba(26, 54, 93, 0.2)'};
    background: ${props => props.$disabled
            ? 'rgba(248, 250, 252, 0.6)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
    };
    color: ${props => props.$disabled ? '#cbd5e1' : '#1a365d'};
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${props => props.$disabled ? 'none' : '0 2px 8px rgba(26, 54, 93, 0.08)'};

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(26, 54, 93, 0.15);
        border-color: rgba(26, 54, 93, 0.3);
        background: #1a365d;
        color: white;
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

export const SectionIndicators = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 6px 12px;
    background: rgba(26, 54, 93, 0.04);
    border-radius: 10px;
    border: 1px solid rgba(26, 54, 93, 0.08);
`;

export const SectionDot = styled.button<{ $active: boolean }>`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: none;
    background: ${props => props.$active
            ? 'linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%)'
            : 'rgba(203, 213, 225, 0.6)'
    };
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${props => props.$active
            ? '0 2px 6px rgba(26, 54, 93, 0.25)'
            : '0 1px 2px rgba(0, 0, 0, 0.08)'
    };

    &:hover {
        transform: scale(1.15);
        ${props => !props.$active && `background: rgba(148, 163, 184, 0.8);`}
    }
`;

export const ActionButtonsContainer = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;

        > * {
            flex: 1;
            max-width: 180px;
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
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    white-space: nowrap;
    min-height: 36px;
    font-family: inherit;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &:not(:disabled):hover {
        transform: translateY(-1px);
    }

    &:not(:disabled):active {
        transform: translateY(0);
    }

    ${props => props.$primary && `
        background: var(--brand-primary, #1a365d);
        color: white;
        box-shadow: 0 2px 8px rgba(26, 54, 93, 0.2);

        &:not(:disabled):hover {
            box-shadow: 0 4px 12px rgba(26, 54, 93, 0.3);
        }
    `}

    ${props => props.$secondary && `
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        color: #64748b;
        border: 1px solid rgba(226, 232, 240, 0.8);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

        &:not(:disabled):hover {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            color: #475569;
            border-color: rgba(148, 163, 184, 0.6);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }
    `}
`;

export const ProgressContainer = styled.div`
    padding: 0 24px 12px;
    max-width: 1400px;
    margin: 0 auto;

    @media (max-width: 768px) {
        padding: 0 16px 12px;
    }
`;

export const ProgressBar = styled.div`
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
    border-radius: 2px;
    overflow: hidden;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
`;

export const ProgressFill = styled.div<{ $progress: number }>`
    height: 100%;
    background: linear-gradient(90deg, #1a365d 0%, #2c5aa0 50%, #3b82f6 100%);
    border-radius: 2px;
    width: ${props => props.$progress}%;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 8px rgba(26, 54, 93, 0.3);
`;