// src/pages/Settings/styles/SignatureCanvas.styles.ts
import styled from 'styled-components';
import { theme } from '../../../../styles/theme';

export const SignatureContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xxl};
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    overflow: hidden;
    box-shadow: ${theme.shadow.md};
`;

export const CanvasHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xxl};
    background: ${theme.surfaceAlt};
    border-bottom: 1px solid ${theme.border};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.lg};
    }
`;

export const HeaderTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

export const ControlsGroup = styled.div`
    display: flex;
    gap: ${theme.spacing.xs};
    background: ${theme.surface};
    padding: ${theme.spacing.xs};
    border-radius: ${theme.radius.md};
    border: 1px solid ${theme.border};
`;

export const ControlButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    border-radius: ${theme.radius.sm};
    color: ${theme.text.secondary};
    cursor: pointer;
    transition: all ${theme.transitions.spring};
    font-size: 16px;

    &:hover:not(:disabled) {
        background: ${theme.primary};
        color: white;
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

export const CanvasWrapper = styled.div<{ $isExpanded: boolean }>`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing.xxxl};
    background: ${theme.surfaceAlt};
    transition: all 0.3s ease;
`;

export const StyledCanvas = styled.canvas<{ $isDrawing: boolean; $isExpanded: boolean }>`
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    background: white;
    cursor: ${props => props.$isDrawing ? 'grabbing' : 'crosshair'};
    box-shadow: ${theme.shadow.md};
    transition: all ${theme.transitions.spring};
    
    &:hover {
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}20;
    }
    
    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}30;
    }
`;

export const CanvasOverlay = styled.div<{ $isExpanded: boolean }>`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.lg};
    pointer-events: none;
    opacity: 0.4;
    text-align: center;
    max-width: ${props => props.$isExpanded ? '400px' : '300px'};
    z-index: 1;
`;

export const OverlayIcon = styled.div`
    font-size: 48px;
    color: ${theme.primary};
    margin-bottom: ${theme.spacing.lg};
`;

export const OverlayText = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    line-height: 1.4;
`;

export const OverlayHint = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-style: italic;
`;

export const PenStyleSelector = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xxl};
    background: ${theme.surfaceAlt};
    border-top: 1px solid ${theme.border};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.sm};
    }
`;

export const StyleLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.secondary};
    white-space: nowrap;
`;

export const StyleButtons = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
    flex-wrap: wrap;
`;

export const StyleButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.secondary};
    border: 1px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.md};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all ${theme.transitions.spring};
    text-transform: capitalize;

    &:hover {
        background: ${props => props.$active ? theme.primary : theme.surfaceAlt};
        border-color: ${theme.primary};
    }
`;

export const StylePreview = styled.div`
    width: 24px;
    height: 3px;
    border-radius: 2px;
`;

export const SignatureStats = styled.div`
    display: flex;
    justify-content: space-around;
    padding: ${theme.spacing.lg} ${theme.spacing.xxl};
    background: ${theme.surface};
    border-top: 1px solid ${theme.border};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.sm};
    }
`;

export const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 14px;
`;

export const StatLabel = styled.span`
    color: ${theme.text.secondary};
    font-weight: 500;
`;

export const StatValue = styled.span<{ $isEmpty?: boolean }>`
    color: ${props => props.$isEmpty ? theme.text.muted : theme.text.primary};
    font-weight: 600;
`;