// src/pages/Settings/styles/companySettings/SlideComponents.styles.ts
import styled from 'styled-components';

export const SlideContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    padding: 0 24px;
    overflow: hidden;

    @media (max-width: 768px) {
        padding: 0 16px;
    }
`;

export const SlideHeader = styled.div`
    display: none;
`;

export const SlideTitle = styled.h3`
    display: none;
`;

export const SlideActions = styled.div`
    display: none;
`;

export const ActionButton = styled.button<{
    $primary?: boolean;
    $secondary?: boolean;
    $danger?: boolean;
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
        opacity: 0.6;
        cursor: not-allowed;
    }

    &:not(:disabled):hover {
        transform: translateY(-1px);
    }

    &:not(:disabled):active {
        transform: translateY(0);
    }

    ${props => props.$primary && `
        background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 50%, #3b82f6 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(26, 54, 93, 0.15);

        &:not(:disabled):hover {
            box-shadow: 0 4px 16px rgba(26, 54, 93, 0.25);
        }
    `}

    ${props => props.$secondary && `
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        color: #64748b;
        border: 1px solid rgba(226, 232, 240, 0.8);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

        &:not(:disabled):hover {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            color: #475569;
            border-color: rgba(148, 163, 184, 0.6);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
    `}

    ${props => props.$danger && `
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        color: #dc2626;
        border: 1px solid rgba(252, 165, 165, 0.6);
        box-shadow: 0 1px 4px rgba(220, 38, 38, 0.1);

        &:not(:disabled):hover {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white;
            border-color: #dc2626;
            box-shadow: 0 2px 8px rgba(220, 38, 38, 0.25);
        }
    `}
`;

export const SlideContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 24px 0;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 4px;
        margin: 4px 0;
    }

    &::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
        border-radius: 4px;
        border: 2px solid transparent;
        background-clip: padding-box;

        &:hover {
            background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
            background-clip: padding-box;
        }
    }

    @media (max-width: 768px) {
        padding: 20px 0;
    }
`;

export const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px 20px;
    align-items: start;
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    padding: 28px;
    border-radius: 16px;
    border: 1px solid rgba(226, 232, 240, 0.6);
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 24px;
        border-radius: 12px;
    }

    @media (max-width: 480px) {
        padding: 20px;
    }
`;