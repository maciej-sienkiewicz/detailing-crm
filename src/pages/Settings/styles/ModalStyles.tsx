// src/pages/Settings/styles/ModalStyles.tsx
import styled from 'styled-components';
import { settingsTheme } from './theme';

// Style dla modali - zmodernizowane zgodnie z Finance theme

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

export const Textarea = styled.textarea`
    padding: ${settingsTheme.spacing.md};
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.primary};
    resize: vertical;
    transition: all 0.2s ease;
    font-family: inherit;
    min-height: 80px;

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

export const SuccessText = styled.div`
    color: ${settingsTheme.status.success};
    font-size: 12px;
    font-weight: 500;
    margin-top: ${settingsTheme.spacing.xs};
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};

    &::before {
        content: '✓';
        font-size: 14px;
    }
`;

// Enhanced form elements
export const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
    padding: ${settingsTheme.spacing.lg};
    background: ${settingsTheme.surfaceAlt};
    border-radius: ${settingsTheme.radius.lg};
    border: 1px solid ${settingsTheme.border};
`;

export const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.md} 0;
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};

    &::before {
        content: '';
        width: 4px;
        height: 16px;
        background: ${settingsTheme.primary};
        border-radius: 2px;
    }
`;

export const InputGroup = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xs};
`;

export const InputWithIcon = styled.div`
    position: relative;
    display: flex;
    align-items: center;

    svg {
        position: absolute;
        left: ${settingsTheme.spacing.md};
        color: ${settingsTheme.text.muted};
        font-size: 16px;
        z-index: 2;
    }

    input {
        padding-left: 40px;
    }
`;

export const InputWithSuffix = styled.div`
    position: relative;
    display: flex;
    align-items: center;

    &::after {
        content: attr(data-suffix);
        position: absolute;
        right: ${settingsTheme.spacing.md};
        color: ${settingsTheme.text.muted};
        font-weight: 500;
        font-size: 14px;
        pointer-events: none;
    }

    input {
        padding-right: 40px;
    }
`;

export const CheckboxGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    cursor: pointer;
`;

export const CheckboxInput = styled.input.attrs({ type: 'checkbox' })`
    width: 18px;
    height: 18px;
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.sm};
    background: ${settingsTheme.surface};
    cursor: pointer;
    
    &:checked {
        background: ${settingsTheme.primary};
        border-color: ${settingsTheme.primary};
    }
`;

export const CheckboxLabel = styled.label`
    font-size: 14px;
    color: ${settingsTheme.text.primary};
    cursor: pointer;
    user-select: none;
`;

export const RadioGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.sm};
`;

export const RadioOption = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    cursor: pointer;
`;

export const RadioInput = styled.input.attrs({ type: 'radio' })`
    width: 18px;
    height: 18px;
    border: 2px solid ${settingsTheme.border};
    border-radius: 50%;
    background: ${settingsTheme.surface};
    cursor: pointer;
    
    &:checked {
        background: ${settingsTheme.primary};
        border-color: ${settingsTheme.primary};
    }
`;

export const RadioLabel = styled.label`
    font-size: 14px;
    color: ${settingsTheme.text.primary};
    cursor: pointer;
    user-select: none;
`;

// Status badges
export const StatusBadge = styled.span<{ status: 'success' | 'warning' | 'error' | 'info' }>`
    display: inline-flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
    padding: 4px 8px;
    border-radius: ${settingsTheme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    
    ${props => {
  switch (props.status) {
    case 'success':
      return `
                    background: ${settingsTheme.status.successLight};
                    color: ${settingsTheme.status.success};
                    border: 1px solid ${settingsTheme.status.success}30;
                `;
    case 'warning':
      return `
                    background: ${settingsTheme.status.warningLight};
                    color: ${settingsTheme.status.warning};
                    border: 1px solid ${settingsTheme.status.warning}30;
                `;
    case 'error':
      return `
                    background: ${settingsTheme.status.errorLight};
                    color: ${settingsTheme.status.error};
                    border: 1px solid ${settingsTheme.status.error}30;
                `;
    case 'info':
      return `
                    background: ${settingsTheme.status.infoLight};
                    color: ${settingsTheme.status.info};
                    border: 1px solid ${settingsTheme.status.info}30;
                `;
  }
}}
`;

// Loading states
export const LoadingButton = styled(BaseButton)`
    background: ${settingsTheme.surfaceAlt};
    color: ${settingsTheme.text.muted};
    cursor: not-allowed;
    
    &:hover {
        transform: none;
    }
`;

export const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid ${settingsTheme.borderLight};
    border-top: 2px solid ${settingsTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Utility components
export const Divider = styled.div`
    height: 1px;
    background: ${settingsTheme.border};
    margin: ${settingsTheme.spacing.lg} 0;
`;

export const Spacer = styled.div<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }>`
    height: ${props => {
  switch (props.size) {
    case 'xs': return settingsTheme.spacing.xs;
    case 'sm': return settingsTheme.spacing.sm;
    case 'md': return settingsTheme.spacing.md;
    case 'lg': return settingsTheme.spacing.lg;
    case 'xl': return settingsTheme.spacing.xl;
    default: return settingsTheme.spacing.md;
  }
}};
`;

export const FlexRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
`;

export const FlexColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.sm};
`;

export const Grid = styled.div<{ columns?: number }>`
    display: grid;
    grid-template-columns: repeat(${props => props.columns || 2}, 1fr);
    gap: ${settingsTheme.spacing.md};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

// Enhanced modal variants
export const ConfirmationModal = styled(ModalContainer)`
    max-width: 480px;
`;

export const FullScreenModal = styled(ModalContainer)`
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
`;

export const CompactModal = styled(ModalContainer)`
    max-width: 400px;
`;

// Form validation states
export const ValidationMessage = styled.div<{ type: 'error' | 'success' | 'warning' }>`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
    font-size: 12px;
    font-weight: 500;
    margin-top: ${settingsTheme.spacing.xs};
    
    ${props => {
  switch (props.type) {
    case 'error':
      return `
                    color: ${settingsTheme.status.error};
                    &::before { content: '⚠'; }
                `;
    case 'success':
      return `
                    color: ${settingsTheme.status.success};
                    &::before { content: '✓'; }
                `;
    case 'warning':
      return `
                    color: ${settingsTheme.status.warning};
                    &::before { content: '!'; }
                `;
  }
}}
`;

export const RequiredField = styled.span`
    color: ${settingsTheme.status.error};
    margin-left: 2px;
`;

// Progress indicators
export const ProgressBar = styled.div<{ progress: number }>`
    width: 100%;
    height: 8px;
    background: ${settingsTheme.surfaceAlt};
    border-radius: ${settingsTheme.radius.sm};
    overflow: hidden;
    
    &::after {
        content: '';
        display: block;
        width: ${props => props.progress}%;
        height: 100%;
        background: linear-gradient(90deg, ${settingsTheme.primary}, ${settingsTheme.primaryLight});
        transition: width 0.3s ease;
    }
`;

export const StepIndicator = styled.div<{ active: boolean; completed: boolean }>`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s ease;
    
    ${props => {
  if (props.completed) {
    return `
                background: ${settingsTheme.status.success};
                color: white;
                &::after { content: '✓'; }
            `;
  } else if (props.active) {
    return `
                background: ${settingsTheme.primary};
                color: white;
            `;
  } else {
    return `
                background: ${settingsTheme.surfaceAlt};
                color: ${settingsTheme.text.muted};
                border: 2px solid ${settingsTheme.border};
            `;
  }
}}
`;