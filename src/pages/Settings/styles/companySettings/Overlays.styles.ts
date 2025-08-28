// src/pages/Settings/styles/companySettings/Overlays.styles.ts
import styled from 'styled-components';

export const OverlayContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 40px;
    text-align: center;
    gap: 32px;
    background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.9) 100%
    );
    border-radius: 24px;
    margin: 40px;
    box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.1),
            0 8px 32px rgba(15, 23, 42, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(226, 232, 240, 0.5);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background:
                conic-gradient(
                        from 0deg at 50% 50%,
                        transparent 0deg,
                        rgba(59, 130, 246, 0.02) 90deg,
                        transparent 180deg,
                        rgba(26, 54, 93, 0.02) 270deg,
                        transparent 360deg
                );
        animation: rotate 20s linear infinite;
        pointer-events: none;
    }

    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    > * {
        position: relative;
        z-index: 1;
    }
`;

export const LoadingSpinnerLarge = styled.div`
    width: 56px;
    height: 56px;
    border: 4px solid rgba(241, 245, 249, 0.8);
    border-top: 4px solid #1a365d;
    border-radius: 50%;
    animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
    box-shadow: 0 8px 24px rgba(26, 54, 93, 0.15);

    @keyframes spin {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.1); }
        100% { transform: rotate(360deg) scale(1); }
    }
`;

export const LoadingText = styled.div`
    font-size: 20px;
    color: #475569;
    font-weight: 600;
    letter-spacing: -0.01em;
    background: linear-gradient(135deg, #64748b 0%, #334155 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

export const ErrorIcon = styled.div`
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #dc2626;
    font-size: 32px;
    box-shadow:
            0 8px 32px rgba(220, 38, 38, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border: 2px solid rgba(248, 113, 113, 0.3);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%);
        border-radius: 50%;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 0.3;
        }
        50% {
            transform: scale(1.05);
            opacity: 0.1;
        }
    }
`;

export const ErrorTitle = styled.h3`
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
    letter-spacing: -0.02em;
`;

export const ErrorMessage = styled.p`
    font-size: 16px;
    color: #64748b;
    margin: 0;
    max-width: 480px;
    line-height: 1.6;
    font-weight: 500;
`;

export const RetryButton = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 32px;
    background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 50%, #3b82f6 100%);
    color: white;
    border: none;
    border-radius: 14px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-top: 24px;
    box-shadow:
            0 4px 16px rgba(26, 54, 93, 0.2),
            0 8px 32px rgba(59, 130, 246, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;

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

    &:hover {
        transform: translateY(-2px);
        box-shadow:
                0 8px 32px rgba(26, 54, 93, 0.3),
                0 16px 48px rgba(59, 130, 246, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);

        &::before {
            left: 100%;
        }
    }

    &:active {
        transform: translateY(-1px);
    }
`;