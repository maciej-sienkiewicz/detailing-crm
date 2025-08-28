// src/pages/Settings/styles/companySettings/UserSignatureSlide.styles.ts
import styled from 'styled-components';

export const StatusBanner = styled.div<{ $hasSignature: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    background: ${props => props.$hasSignature
    ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
    : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
};
    color: ${props => props.$hasSignature ? '#166534' : '#92400e'};
    border-radius: 12px;
    margin-bottom: 24px;
    border: 1px solid ${props => props.$hasSignature ? '#bbf7d0' : '#fde68a'};
    font-weight: 600;
    font-size: 14px;

    &::before {
        content: ${props => props.$hasSignature ? '"✓"' : '"⚠"'};
        font-size: 16px;
        font-weight: bold;
    }
`;

export const SignatureArea = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px 0;
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    border-radius: 24px;
    border: 1px solid rgba(226, 232, 240, 0.6);
    box-shadow: 
        0 8px 32px rgba(15, 23, 42, 0.06),
        0 4px 16px rgba(15, 23, 42, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    position: relative;
    min-height: 400px;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(59, 130, 246, 0.3) 25%, 
            rgba(26, 54, 93, 0.4) 50%,
            rgba(59, 130, 246, 0.3) 75%, 
            transparent 100%
        );
    }

    @media (max-width: 768px) {
        padding: 32px 20px;
        min-height: 350px;
    }
`;

export const CanvasWrapper = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
    background: #ffffff;
    min-height: 248px; /* Fixed height prevents jumping */

    .signature-canvas {
        border: 2px dashed #e2e8f0;
        border-radius: 8px;
        cursor: crosshair;
        
        &:focus {
            outline: none;
            border-color: #1a365d;
        }
    }
`;

export const PreviewContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 200px;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
`;

export const PreviewImage = styled.img`
    max-width: 450px;
    max-height: 180px;
    object-fit: contain;
    background: #ffffff;
    padding: 10px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 200px;
    background: #f8fafc;
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    gap: 16px;
`;

export const EmptyIcon = styled.div`
    width: 48px;
    height: 48px;
    background: #e2e8f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #64748b;
`;

export const EmptyTitle = styled.h5`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #475569;
`;

export const EmptyDescription = styled.p`
    margin: 0;
    font-size: 14px;
    color: #64748b;
    max-width: 300px;
`;

export const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    gap: 16px;
    color: #64748b;
    font-weight: 500;
`;

export const LoadingSpinner = styled.div`
    width: 32px;
    height: 32px;
    border: 3px solid #f1f5f9;
    border-top: 3px solid #1a365d;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export const ErrorContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #fee2e2;
    color: #dc2626;
    border-radius: 8px;
    margin-top: 16px;
    font-size: 14px;
    font-weight: 500;

    button {
        background: none;
        border: none;
        color: #dc2626;
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
        border-radius: 4px;
        
        &:hover {
            background: rgba(220, 38, 38, 0.1);
        }
    }
`;