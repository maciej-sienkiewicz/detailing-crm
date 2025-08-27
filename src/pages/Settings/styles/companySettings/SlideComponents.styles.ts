// src/pages/Settings/styles/companySettings/SlideComponents.styles.ts
import styled from 'styled-components';

export const SlideContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    padding: 0 32px;
    overflow: hidden;

    @media (max-width: 768px) {
        padding: 0 24px;
    }
`;

export const SlideHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32px 0 24px;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 32px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        padding: 24px 0 20px;
        margin-bottom: 24px;
    }
`;

export const SlideTitle = styled.h3`
    font-size: 24px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.025em;
`;

export const SlideActions = styled.div`
    display: flex;
    gap: 12px;
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
    gap: 8px;
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    white-space: nowrap;
    min-height: 44px;

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
        box-shadow: 0 4px 12px rgba(26, 54, 93, 0.15);

        &:not(:disabled):hover {
            box-shadow: 0 6px 20px rgba(26, 54, 93, 0.25);
        }
    `}

    ${props => props.$secondary && `
        background: #ffffff;
        color: #64748b;
        border-color: #e2e8f0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

        &:not(:disabled):hover {
            background: #f8fafc;
            color: #475569;
            border-color: #cbd5e1;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
    `}

    ${props => props.$danger && `
        background: #fef2f2;
        color: #dc2626;
        border-color: #fca5a5;

        &:not(:disabled):hover {
            background: #dc2626;
            color: white;
            border-color: #dc2626;
        }
    `}
`;

export const SlideContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding-bottom: 32px;

    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
`;

export const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    align-items: start;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 24px;
    }
`;