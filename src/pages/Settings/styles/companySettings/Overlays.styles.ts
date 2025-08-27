// src/pages/Settings/styles/companySettings/Overlays.styles.ts
import styled from 'styled-components';

export const OverlayContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 32px;
    text-align: center;
    gap: 24px;
    background: #ffffff;
    border-radius: 16px;
    margin: 32px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const LoadingSpinnerLarge = styled.div`
    width: 48px;
    height: 48px;
    border: 4px solid #f1f5f9;
    border-top: 4px solid #1a365d;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export const LoadingText = styled.div`
    font-size: 18px;
    color: #64748b;
    font-weight: 500;
`;

export const ErrorIcon = styled.div`
    width: 64px;
    height: 64px;
    background: #fee2e2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #dc2626;
    font-size: 24px;
`;

export const ErrorTitle = styled.h3`
    font-size: 24px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
`;

export const ErrorMessage = styled.p`
    font-size: 16px;
    color: #64748b;
    margin: 0;
    max-width: 400px;
    line-height: 1.5;
`;

export const RetryButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: #1a365d;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 16px;

    &:hover {
        background: #0f172a;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(26, 54, 93, 0.25);
    }

    &:active {
        transform: translateY(0);
    }
`;