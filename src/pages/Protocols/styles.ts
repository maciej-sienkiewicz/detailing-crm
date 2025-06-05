// src/pages/Protocols/styles.ts
import styled from 'styled-components';
import { ProtocolStatus } from '../../types';

// Brand Theme System - modern and consistent
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    accent: '#f8fafc',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
};

// Modern Status Badge with enhanced design
export const StatusBadge = styled.div<{ status: ProtocolStatus }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.2s ease;

    ${({ status }) => {
        switch (status) {
            case ProtocolStatus.SCHEDULED:
                return `
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
                    color: #1d4ed8;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
                `;
            case ProtocolStatus.IN_PROGRESS:
                return `
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
                    color: #7c3aed;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    box-shadow: 0 2px 4px rgba(139, 92, 246, 0.1);
                `;
            case ProtocolStatus.READY_FOR_PICKUP:
                return `
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
                    color: #059669;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
                `;
            case ProtocolStatus.COMPLETED:
                return `
                    background: linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%);
                    color: #4b5563;
                    border: 1px solid rgba(107, 114, 128, 0.3);
                    box-shadow: 0 2px 4px rgba(107, 114, 128, 0.1);
                `;
            case ProtocolStatus.CANCELLED:
                return `
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
                    color: #dc2626;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
                `;
            default:
                return `
                    background: ${brandTheme.surfaceAlt};
                    color: ${brandTheme.neutral};
                    border: 1px solid ${brandTheme.border};
                `;
        }
    }}

    &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
    }
`;

// Enhanced Protocol Item Components
export const CarInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;

    strong {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
    }

    span {
        font-size: 13px;
        color: ${brandTheme.neutral};
        font-weight: 500;
    }
`;

export const DateRange = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: #374151;
    width: 100%;

    span {
        font-weight: 500;

        &:first-child {
            color: #1e293b;
            font-weight: 600;
        }
    }
`;

export const OwnerInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    color: #1e293b;
    width: 100%;

    div:first-child {
        font-weight: 600;
    }
`;

export const CompanyInfo = styled.div`
    font-size: 13px;
    color: ${brandTheme.neutral};
    font-weight: 500;
    margin-top: 2px;
`;

export const LicensePlate = styled.div`
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    background: ${brandTheme.primaryGhost};
    border: 1px solid rgba(37, 99, 235, 0.2);
    border-radius: 6px;
    font-weight: 700;
    color: ${brandTheme.primary};
    font-size: 13px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
`;

export const PriceDisplay = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;

    .amount {
        font-size: 15px;
        font-weight: 700;
        color: #1e293b;
    }

    .currency {
        font-size: 12px;
        color: ${brandTheme.neutral};
        font-weight: 500;
    }
`;

// Modern Action Buttons
export const ActionButtons = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
`;

export const ActionButton = styled.button<{ danger?: boolean; variant?: 'primary' | 'secondary' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;

    ${({ danger, variant }) => {
        if (danger) {
            return `
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
                
                &:hover {
                    background: #ef4444;
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }
            `;
        }

        if (variant === 'primary') {
            return `
                background: ${brandTheme.primaryGhost};
                color: ${brandTheme.primary};
                
                &:hover {
                    background: ${brandTheme.primary};
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px ${brandTheme.primaryGhost};
                }
            `;
        }

        return `
            background: ${brandTheme.surfaceAlt};
            color: ${brandTheme.neutral};
            
            &:hover {
                background: ${brandTheme.neutral};
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(100, 116, 139, 0.2);
            }
        `;
    }}
`;

// Enhanced Loading and Error States
export const LoadingMessage = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background: ${brandTheme.surface};
    border-radius: 16px;
    border: 1px solid ${brandTheme.border};
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid ${brandTheme.border};
        border-top: 3px solid ${brandTheme.primary};
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
    }
    
    .text {
        font-size: 16px;
        color: ${brandTheme.neutral};
        font-weight: 500;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export const ErrorMessage = styled.div`
    background: linear-gradient(135deg, #fef2f2 0%, #fdf2f8 100%);
    color: #dc2626;
    padding: 16px 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    border: 1px solid #fecaca;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);

    display: flex;
    align-items: center;
    gap: 12px;

    &::before {
        content: '⚠️';
        font-size: 18px;
    }
`;

export const EmptyState = styled.div`
    background: ${brandTheme.surface};
    border: 2px dashed ${brandTheme.border};
    border-radius: 16px;
    padding: 60px 40px;
    text-align: center;
    color: ${brandTheme.neutral};

    .icon {
        width: 64px;
        height: 64px;
        background: ${brandTheme.surfaceAlt};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        font-size: 24px;
        color: ${brandTheme.neutral};
    }

    .title {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 8px;
    }

    .description {
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 16px;
    }

    .action {
        font-size: 14px;
        color: ${brandTheme.primary};
        font-weight: 500;
    }
`;

// Legacy compatibility exports (updated with modern styling)
export const PageContainer = styled.div`
    background: ${brandTheme.accent};
    min-height: 100vh;
    padding: 0;
`;

export const PageHeader = styled.div`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    padding: 24px 32px;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);

    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;

    h1 {
        font-size: 28px;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.5px;
    }
`;

export const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

export const BackButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: 8px;
    cursor: pointer;
    color: ${brandTheme.neutral};
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
        transform: translateY(-1px);
    }
`;

export const AddButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
        background: ${brandTheme.primaryDark};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
        transform: translateY(0);
    }
`;

// Filter Components (updated for consistency)
export const FilterButtons = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    padding: 24px;
    background: ${brandTheme.surface};
`;

export const FilterButton = styled.button<{ active: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: ${props => props.active ? brandTheme.primary : brandTheme.surface};
    color: ${props => props.active ? 'white' : brandTheme.neutral};
    border: 2px solid ${props => props.active ? brandTheme.primary : brandTheme.border};
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.active ? brandTheme.primaryDark : brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        color: ${props => props.active ? 'white' : brandTheme.primary};
        transform: translateY(-1px);
    }
`;

// Table Components (modern updates)
export const TableContainer = styled.div`
    width: 100%;
    background: ${brandTheme.surface};
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    border: 1px solid ${brandTheme.border};
`;

export const TableHeaderContainer = styled.div`
    display: flex;
    width: 100%;
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    min-height: 56px;
`;

export const DraggableHeaderCell = styled.div<{ isDragging?: boolean, width: string }>`
    flex: 0 0 ${props => props.width};
    width: ${props => props.width};
    display: flex;
    align-items: center;
    padding: 0 16px;
    background: ${props => props.isDragging ? brandTheme.primaryGhost : brandTheme.surfaceAlt};
    color: #374151;
    font-weight: 600;
    font-size: 14px;
    user-select: none;
    cursor: grab;
    transition: all 0.2s ease;
    border-right: 1px solid ${brandTheme.border};

    &:hover {
        background: ${brandTheme.primaryGhost};
    }

    &:active {
        cursor: grabbing;
    }

    &:last-child {
        border-right: none;
    }
`;

export const TableBody = styled.div`
    background: ${brandTheme.surface};
`;

export const TableRow = styled.div`
    display: flex;
    border-bottom: 1px solid ${brandTheme.border};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.surfaceAlt};
    }

    &:last-child {
        border-bottom: none;
    }
`;

export const TableCell = styled.div<{ width?: string, colSpan?: number }>`
    flex: ${props => props.colSpan ? '1 1 100%' : `0 0 ${props.width || 'auto'}`};
    width: ${props => props.colSpan ? '100%' : props.width || 'auto'};
    padding: 16px;
    display: flex;
    align-items: center;
    min-height: 72px;
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

export default {
    brandTheme,
    StatusBadge,
    CarInfo,
    DateRange,
    OwnerInfo,
    CompanyInfo,
    LicensePlate,
    PriceDisplay,
    ActionButtons,
    ActionButton,
    LoadingMessage,
    ErrorMessage,
    EmptyState,
    PageContainer,
    PageHeader,
    HeaderLeft,
    BackButton,
    AddButton,
    FilterButtons,
    FilterButton,
    TableContainer,
    TableHeaderContainer,
    DraggableHeaderCell,
    TableBody,
    TableRow,
    TableCell
};