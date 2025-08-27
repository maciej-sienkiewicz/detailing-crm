// src/pages/Settings/styles/companySettings/SlideComponents.styles.ts
import styled from 'styled-components';

export const SlideContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    padding: 0 40px;
    overflow: hidden;

    @media (max-width: 768px) {
        padding: 0 20px;
    }
`;

export const SlideHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 40px 0 32px;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, #e1e7ef 20%, #e1e7ef 80%, transparent 100%);
    }

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
        padding: 32px 0 24px;
    }
`;

export const SlideTitle = styled.h3`
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
    letter-spacing: -0.025em;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 60px;
        height: 3px;
        background: linear-gradient(90deg, #1a365d 0%, #3b82f6 100%);
        border-radius: 2px;
    }
`;

export const SlideActions = styled.div`
    display: flex;
    gap: 16px;
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;

        > * {
            flex: 1;
        }
    }
`;

export const ActionButton = styled.button<{
    $primary?: boolean;
    $secondary?: boolean;
    $danger?: boolean;
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 28px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    white-space: nowrap;
    min-height: 48px;
    position: relative;
    overflow: hidden;
    font-family: inherit;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;

        &::before {
            display: none;
        }
    }

    &:not(:disabled):hover {
        transform: translateY(-2px);

        &::before {
            left: 100%;
        }
    }

    &:not(:disabled):active {
        transform: translateY(-1px);
    }

    ${props => props.$primary && `
        background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 50%, #3b82f6 100%);
        color: white;
        box-shadow: 
            0 4px 16px rgba(26, 54, 93, 0.2),
            0 8px 32px rgba(59, 130, 246, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);

        &:not(:disabled):hover {
            box-shadow: 
                0 8px 32px rgba(26, 54, 93, 0.3),
                0 16px 48px rgba(59, 130, 246, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
    `}

    ${props => props.$secondary && `
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        color: #64748b;
        border: 1.5px solid rgba(226, 232, 240, 0.8);
        box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);

        &:not(:disabled):hover {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            color: #475569;
            border-color: rgba(148, 163, 184, 0.6);
            box-shadow: 
                0 4px 16px rgba(0, 0, 0, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
    `}

    ${props => props.$danger && `
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        color: #dc2626;
        border: 1.5px solid rgba(252, 165, 165, 0.6);
        box-shadow: 
            0 2px 8px rgba(220, 38, 38, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);

        &:not(:disabled):hover {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white;
            border-color: #dc2626;
            box-shadow: 
                0 4px 16px rgba(220, 38, 38, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
    `}
`;

export const SlideContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 40px 0;

    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
        width: 10px;
    }

    &::-webkit-scrollbar-track {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 5px;
        margin: 8px 0;
    }

    &::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
        border-radius: 5px;
        border: 2px solid transparent;
        background-clip: padding-box;

        &:hover {
            background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
        }
    }

    &::-webkit-scrollbar-corner {
        background: #f1f5f9;
    }

    @media (max-width: 768px) {
        padding: 32px 0;
    }
`;

export const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px 32px;
    align-items: start;
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    padding: 40px;
    border-radius: 20px;
    border: 1px solid rgba(226, 232, 240, 0.6);
    box-shadow:
            0 4px 24px rgba(15, 23, 42, 0.04),
            0 2px 8px rgba(15, 23, 42, 0.02),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
    }

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:
                radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.02) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(26, 54, 93, 0.02) 0%, transparent 50%);
        pointer-events: none;
        z-index: 0;
    }

    > * {
        position: relative;
        z-index: 1;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 32px;
        padding: 32px 24px;
        border-radius: 16px;
    }
`;