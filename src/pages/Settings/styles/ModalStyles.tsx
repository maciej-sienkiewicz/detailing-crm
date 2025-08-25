// src/pages/Settings/styles/ModalStyles.tsx
import styled from 'styled-components';
import {settingsTheme} from './theme';

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${settingsTheme.zIndex.modal};
    padding: ${settingsTheme.spacing.lg};
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

export const ModalContainer = styled.div`
    background-color: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    box-shadow: ${settingsTheme.shadow.xl};
    width: 95vw;
    max-width: 600px;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @media (max-width: ${settingsTheme.breakpoints.md}) {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
    }
`;

export const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${settingsTheme.spacing.lg} ${settingsTheme.spacing.xl};
    border-bottom: 1px solid ${settingsTheme.border};
    background: ${settingsTheme.surfaceAlt};
    flex-shrink: 0;

    h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: ${settingsTheme.text.primary};
        letter-spacing: -0.025em;
    }
`;

export const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: ${settingsTheme.surfaceHover};
    color: ${settingsTheme.text.secondary};
    border-radius: ${settingsTheme.radius.md};
    cursor: pointer;
    transition: all ${settingsTheme.transitions.normal};
    font-size: 18px;

    &:hover {
        background: ${settingsTheme.status.errorLight};
        color: ${settingsTheme.status.error};
        transform: scale(1.05);
    }

    &:active {
        transform: scale(0.95);
    }
`;

export const ModalBody = styled.div`
    overflow-y: auto;
    flex: 1;
    padding: ${settingsTheme.spacing.xl};
    
    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: ${settingsTheme.surfaceAlt};
    }
    
    &::-webkit-scrollbar-thumb {
        background: ${settingsTheme.border};
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: ${settingsTheme.borderHover};
    }
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
`;

export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xs};
`;

export const FormRow = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.md};

    > ${FormGroup} {
        flex: 1;
    }

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

export const Label = styled.label`
    font-weight: 600;
    font-size: 14px;
    color: ${settingsTheme.text.primary};
`;

export const Input = styled.input`
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }

    &::placeholder {
        color: ${settingsTheme.text.muted};
        font-weight: 400;
    }
`;

export const Select = styled.select`
    height: 44px;
    padding: 0 ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }
`;

export const ColorPickerContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
`;

export const ColorPreview = styled.div<{ color: string }>`
    width: 44px;
    height: 44px;
    border-radius: ${settingsTheme.radius.sm};
    background-color: ${props => props.color};
    border: 2px solid ${settingsTheme.border};
    flex-shrink: 0;
    box-shadow: ${settingsTheme.shadow.xs};
`;

export const ColorInput = styled.input`
    width: 44px;
    height: 44px;
    border: none;
    padding: 0;
    background: none;
    cursor: pointer;
    border-radius: ${settingsTheme.radius.sm};

    &::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    &::-webkit-color-swatch {
        border: 2px solid ${settingsTheme.border};
        border-radius: ${settingsTheme.radius.sm};
    }
`;

export const FileUploadButton = styled.label`
    display: inline-flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    background: ${settingsTheme.primaryGhost};
    color: ${settingsTheme.primary};
    border: 2px solid ${settingsTheme.primary}30;
    border-radius: ${settingsTheme.radius.md};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${settingsTheme.primary};
        color: white;
        border-color: ${settingsTheme.primary};
        transform: translateY(-1px);
        box-shadow: ${settingsTheme.shadow.md};
    }

    &:active {
        transform: translateY(0);
    }
`;

export const FileInput = styled.input`
    position: absolute;
    opacity: 0;
    width: 0.1px;
    height: 0.1px;
`;

export const HelpText = styled.div`
    font-size: 12px;
    color: ${settingsTheme.text.muted};
    line-height: 1.4;
    margin-top: ${settingsTheme.spacing.xs};
`;

export const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${settingsTheme.spacing.sm};
    margin-top: ${settingsTheme.spacing.md};
    padding-top: ${settingsTheme.spacing.lg};
    border-top: 1px solid ${settingsTheme.border};

    @media (max-width: 576px) {
        flex-direction: column;
    }
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 576px) {
        justify-content: center;
    }
`;

export const Button = styled(BaseButton)<{ primary?: boolean; secondary?: boolean }>`
    ${props => props.primary && `
        background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
        color: white;
        box-shadow: ${settingsTheme.shadow.sm};

        &:hover {
            background: linear-gradient(135deg, ${settingsTheme.primaryDark} 0%, ${settingsTheme.primary} 100%);
            box-shadow: ${settingsTheme.shadow.md};
        }

        @media (max-width: 576px) {
            order: 1;
        }
    `}

    ${props => props.secondary && `
        background: ${settingsTheme.surface};
        color: ${settingsTheme.text.secondary};
        border-color: ${settingsTheme.border};
        box-shadow: ${settingsTheme.shadow.xs};

        &:hover {
            background: ${settingsTheme.surfaceHover};
            color: ${settingsTheme.text.primary};
            border-color: ${settingsTheme.borderHover};
            box-shadow: ${settingsTheme.shadow.sm};
        }

        @media (max-width: 576px) {
            order: 2;
        }
    `}
`;

export const ErrorText = styled.div`
    color: ${settingsTheme.status.error};
    font-size: 12px;
    font-weight: 500;
    margin-top: ${settingsTheme.spacing.xs};
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};

    &::before {
        content: '⚠';
        font-size: 14px;
    }
`;