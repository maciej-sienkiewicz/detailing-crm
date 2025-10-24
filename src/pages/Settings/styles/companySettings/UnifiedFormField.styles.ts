// src/pages/Settings/styles/companySettings/UnifiedFormField.styles.ts
import styled from 'styled-components';

export const FieldContainer = styled.div<{ $fullWidth?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 8px;

    ${props => props.$fullWidth && `grid-column: 1 / -1;`}
`;

export const FieldHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const FieldLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    font-size: 13px;
    color: #1e293b;
    margin: 0;
`;

export const FieldIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: #64748b;
    font-size: 14px;
`;

export const RequiredMarker = styled.span`
    color: #dc2626;
    font-weight: 700;
    margin-left: 2px;
`;

export const ValidationIndicator = styled.div<{ $isValid: boolean; $loading: boolean }>`
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;

    ${props => {
        if (props.$loading) {
            return `
                background: #f1f5f9;
                color: #64748b;
                
                &::after {
                    content: '⟳';
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
        }

        return props.$isValid ? `
            background: #dcfce7;
            color: #166534;
            
            &::after {
                content: '✓';
            }
        ` : `
            background: #fee2e2;
            color: #dc2626;
            
            &::after {
                content: '✕';
            }
        `;
    }}
`;

export const FieldContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

export const Input = styled.input<{ $hasError?: boolean }>`
    height: 38px;
    padding: 0 12px;
    border: 1.5px solid ${props => props.$hasError ? '#f87171' : '#e2e8f0'};
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    background: #ffffff;
    color: #1e293b;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? '#ef4444' : '#1a365d'};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? '#fca5a5' : '#bfdbfe'}20;
    }

    &::placeholder {
        color: #94a3b8;
        font-weight: 400;
    }

    &:hover:not(:focus) {
        border-color: ${props => props.$hasError ? '#f87171' : '#cbd5e1'};
    }
`;

export const DisplayValue = styled.div<{ $hasValue: boolean }>`
    min-height: 38px;
    padding: 10px 12px;
    background: #f8fafc;
    border: 1.5px solid #f1f5f9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.$hasValue ? '#1e293b' : '#94a3b8'};
    font-style: ${props => props.$hasValue ? 'normal' : 'italic'};
    transition: all 0.2s ease;

    &:hover {
        background: #f1f5f9;
        border-color: #e2e8f0;
    }

    a {
        color: #1a365d;
        text-decoration: none;
        font-weight: 600;

        &:hover {
            text-decoration: underline;
        }
    }
`;

export const ValidationMessage = styled.div`
    font-size: 12px;
    color: #dc2626;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;

    &::before {
        content: '⚠';
        font-size: 12px;
    }
`;

export const HelpText = styled.div`
    font-size: 11px;
    color: #64748b;
    line-height: 1.4;
    font-weight: 500;
`;