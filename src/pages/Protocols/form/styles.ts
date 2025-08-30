import styled from 'styled-components';

// Professional Brand Theme - Premium Automotive CRM (zgodny z theme.ts)
export const brandTheme = {
    // Primary Colors - Professional Blue Palette
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    // Surface Colors - Clean & Minimal
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Typography Colors
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',

    // Status Colors - Automotive Grade
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },

    // Shadows - Professional Depth
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    // Spacing Scale
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Border Radius
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    },

    // Transitions
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    },

    // Z-index scale
    zIndex: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modalBackdrop: 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070
    }
};

// Container styles - Premium Layout
export const FormContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    margin-bottom: ${brandTheme.spacing.lg};
    max-width: 100%;
    margin-top: 10px;

    @media (max-width: 768px) {
        border-radius: ${brandTheme.radius.lg};
        margin-bottom: ${brandTheme.spacing.md};
    }
`;

export const FormHeader = styled.div`
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};

    h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: ${brandTheme.text.primary};
        letter-spacing: -0.025em;
    }

    @media (max-width: 576px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};

        h2 {
            font-size: 18px;
        }
    }
`;

export const Form = styled.form`
    padding: ${brandTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};

    @media (max-width: 576px) {
        padding: ${brandTheme.spacing.lg};
        gap: ${brandTheme.spacing.lg};
    }
`;

// Section styles - Professional Hierarchy
export const FormSection = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

export const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};

    &::before {
        content: '';
        width: 4px;
        height: 18px;
        background: ${brandTheme.primary};
        border-radius: 2px;
    }

    @media (max-width: 576px) {
        font-size: 16px;
    }
`;

// Form row and group styles - Responsive Grid System
export const FormRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${brandTheme.spacing.md};

    &.responsive-row {
        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }

    &.checkbox-row {
        display: flex;
        flex-wrap: wrap;
        gap: ${brandTheme.spacing.lg};

        @media (max-width: 576px) {
            flex-direction: column;
            gap: ${brandTheme.spacing.md};
        }
    }
`;

export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};

    &.date-time-group {
        grid-column: span 2;

        @media (max-width: 768px) {
            grid-column: span 1;
        }
    }
`;

// DateTime container for enhanced UX
export const DateTimeContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: ${brandTheme.spacing.sm};
    align-items: end;

    .date-input {
        grid-column: 1;
    }

    .time-input {
        grid-column: 2;
        width: 120px;
    }

    @media (max-width: 576px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.xs};

        .time-input {
            width: 100%;
        }
    }
`;

// Premium Input Components
export const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

export const Input = styled.input<{ $hasError?: boolean }>`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? brandTheme.status.error : brandTheme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? brandTheme.status.errorLight : brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        color: ${brandTheme.text.disabled};
        cursor: not-allowed;
    }

    &.time-input, &.date-input {
        font-variant-numeric: tabular-nums;
    }
`;

export const Select = styled.select<{ $hasError?: boolean }>`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? brandTheme.status.error : brandTheme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? brandTheme.status.errorLight : brandTheme.primaryGhost};
    }

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        color: ${brandTheme.text.disabled};
        cursor: not-allowed;
    }
`;

export const Textarea = styled.textarea<{ $hasError?: boolean }>`
    padding: ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? brandTheme.status.error : brandTheme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? brandTheme.status.errorLight : brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

// Professional Checkbox Components
export const CheckboxGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} 0;
`;

export const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.primary};
    cursor: pointer;
    user-select: none;
`;

export const Checkbox = styled.input`
    width: 18px;
    height: 18px;
    accent-color: ${brandTheme.primary};
    cursor: pointer;
`;

// Enhanced Search Components
export const SearchContainer = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    align-items: flex-start;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

export const SearchInputGroup = styled.div`
    position: relative;
    flex: 1;
`;

export const SearchInputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

export const SearchIcon = styled.div`
    position: absolute;
    left: ${brandTheme.spacing.md};
    color: ${brandTheme.text.muted};
    font-size: 16px;
    z-index: 2;
`;

export const SearchInput = styled.input`
    width: 100%;
    height: 48px;
    padding: 0 ${brandTheme.spacing.md} 0 48px;
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    font-size: 16px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

export const SearchResultsList = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    box-shadow: ${brandTheme.shadow.lg};
    z-index: ${brandTheme.zIndex.dropdown};
    max-height: 300px;
    overflow-y: auto;
    margin-top: ${brandTheme.spacing.xs};

    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
    }

    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.border};
        border-radius: 3px;
    }
`;

export const SearchResultItem = styled.div`
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all ${brandTheme.transitions.fast};

    &:not(:last-child) {
        border-bottom: 1px solid ${brandTheme.borderLight};
    }

    &:hover {
        background: ${brandTheme.surfaceHover};
    }

    &:first-child {
        border-top-left-radius: ${brandTheme.radius.lg};
        border-top-right-radius: ${brandTheme.radius.lg};
    }

    &:last-child {
        border-bottom-left-radius: ${brandTheme.radius.lg};
        border-bottom-right-radius: ${brandTheme.radius.lg};
    }
`;

export const SearchResultPrice = styled.div`
    font-weight: 600;
    color: ${brandTheme.primary};
    font-variant-numeric: tabular-nums;
`;

export const AddServiceButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    height: 48px;
    padding: 0 ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border: 2px solid transparent;
    border-radius: ${brandTheme.radius.lg};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    box-shadow: ${brandTheme.shadow.sm};
    white-space: nowrap;

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        background: ${brandTheme.text.disabled};
    }

    @media (max-width: 768px) {
        width: 100%;
    }
`;

// Professional Services Table
export const ServicesTableContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    margin-top: ${brandTheme.spacing.md};

    @media (max-width: 576px) {
        margin-left: -${brandTheme.spacing.lg};
        margin-right: -${brandTheme.spacing.lg};
        border-radius: 0;
        border-left: none;
        border-right: none;
    }
`;

export const ServicesTable = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;

    @media (max-width: 480px) {
        font-size: 13px;
    }
`;

export const TableHeader = styled.th`
    text-align: left;
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    white-space: nowrap;

    &:first-child {
        border-top-left-radius: ${brandTheme.radius.xl};
    }

    &:last-child {
        border-top-right-radius: ${brandTheme.radius.xl};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
        font-size: 13px;
    }
`;

export const TableCell = styled.td`
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.borderLight};
    vertical-align: middle;

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
        font-size: 13px;
    }
`;

export const TableFooterCell = styled.td`
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    font-weight: 600;
    background: ${brandTheme.surfaceAlt};
    border-top: 2px solid ${brandTheme.border};
    color: ${brandTheme.text.primary};

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    }
`;

// Enhanced Discount Components
export const DiscountContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    min-width: 280px;

    @media (max-width: 768px) {
        min-width: 240px;
    }

    @media (max-width: 576px) {
        min-width: 200px;
    }
`;

export const DiscountInputGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};

    @media (max-width: 480px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.xs};
    }
`;

export const DiscountInput = styled.input`
    width: 100px;
    height: 36px;
    padding: 0 ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 13px;
    font-weight: 500;
    text-align: right;
    font-variant-numeric: tabular-nums;
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    &[type=number] {
        -moz-appearance: textfield;
    }

    @media (max-width: 480px) {
        width: 100%;
    }
`;

export const DiscountTypeSelect = styled.select`
    flex: 1;
    height: 36px;
    padding: 0 ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 13px;
    font-weight: 500;
    background: ${brandTheme.surface};
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
    }

    @media (max-width: 480px) {
        width: 100%;
    }
`;

export const DiscountPercentage = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.tertiary};
    font-weight: 500;
    text-align: right;
    font-variant-numeric: tabular-nums;

    @media (max-width: 768px) {
        font-size: 10px;
    }
`;

// Premium Action Components
export const ActionButton = styled.button<{ danger?: boolean; note?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    font-size: 14px;
    position: relative;
    overflow: hidden;

    ${({ danger, note }) => {
        if (danger) {
            return `
                background: ${brandTheme.status.errorLight};
                color: ${brandTheme.status.error};
                
                &:hover {
                    background: ${brandTheme.status.error};
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: ${brandTheme.shadow.md};
                }
            `;
        }

        if (note) {
            return `
                background: ${brandTheme.status.warningLight};
                color: ${brandTheme.status.warning};
                
                &:hover {
                    background: ${brandTheme.status.warning};
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: ${brandTheme.shadow.md};
                }
            `;
        }

        return `
            background: ${brandTheme.primaryGhost};
            color: ${brandTheme.primary};
            
            &:hover {
                background: ${brandTheme.primary};
                color: white;
                transform: translateY(-1px);
                box-shadow: ${brandTheme.shadow.md};
            }
        `;
    }}

    &:active {
        transform: translateY(0);
    }
`;

// Professional Form Actions
export const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.md};
    margin-top: ${brandTheme.spacing.xl};
    padding-top: ${brandTheme.spacing.lg};
    border-top: 1px solid ${brandTheme.border};

    @media (max-width: 576px) {
        flex-direction: column-reverse;
        gap: ${brandTheme.spacing.sm};
    }
`;

export const Button = styled.button<{ primary?: boolean; secondary?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    min-height: 44px;
    min-width: 120px;

    ${props => props.primary && `
        background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
        color: white;
        border: 2px solid transparent;
        box-shadow: ${brandTheme.shadow.sm};
        
        &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
            transform: translateY(-1px);
            box-shadow: ${brandTheme.shadow.md};
        }
        
        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
    `}

    ${props => props.secondary && `
        background: ${brandTheme.surface};
        color: ${brandTheme.text.secondary};
        border: 2px solid ${brandTheme.border};
        
        &:hover:not(:disabled) {
            background: ${brandTheme.surfaceHover};
            color: ${brandTheme.text.primary};
            border-color: ${brandTheme.borderHover};
            box-shadow: ${brandTheme.shadow.sm};
        }
    `}

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    @media (max-width: 576px) {
        width: 100%;
        min-height: 48px;
    }
`;

// Enhanced Error States
export const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.status.error}30;
    font-weight: 500;
    box-shadow: ${brandTheme.shadow.xs};

    &::before {
        content: '⚠️';
        font-size: 16px;
    }

    @media (max-width: 576px) {
        margin: 0 -${brandTheme.spacing.lg} ${brandTheme.spacing.md};
        border-radius: 0;
        border-left: none;
        border-right: none;
    }
`;

export const ErrorText = styled.div`
    color: ${brandTheme.status.error};
    font-size: 12px;
    font-weight: 500;
    margin-top: ${brandTheme.spacing.xs};
`;

// Enhanced Summary Components
export const AddItemRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border-top: 1px solid ${brandTheme.border};
`;

export const TotalAmount = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

export const TotalValue = styled.span`
    font-weight: 700;
    color: ${brandTheme.status.success};
    font-variant-numeric: tabular-nums;
`;

export const CustomServiceInfo = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.tertiary};
    margin-top: ${brandTheme.spacing.xs};
    font-style: italic;
    font-weight: 500;
`;

// SearchField compatibility
export const FieldContainer = styled.div`
    width: 100%;
`;

export const InputWithIcon = styled.div`
    position: relative;
    width: 100%;
`;

// Professional Confirmation Dialog
export const ConfirmationDialog = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: ${brandTheme.zIndex.modal};
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

export const DialogContent = styled.div`
    background: ${brandTheme.surface};
    padding: ${brandTheme.spacing.xl};
    border-radius: ${brandTheme.radius.xl};
    width: 90%;
    max-width: 480px;
    box-shadow: ${brandTheme.shadow.xl};
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

    @media (max-width: 576px) {
        width: 95%;
        padding: ${brandTheme.spacing.lg};
        max-height: 90vh;
        overflow-y: auto;
    }
`;
export const DialogTitle = styled.h3`
    margin: 0 0 ${brandTheme.spacing.md} 0;
    color: ${brandTheme.status.error};
    font-size: 20px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};

    &::before {
        content: '⚠️';
        font-size: 18px;
    }

    @media (max-width: 576px) {
        font-size: 18px;
    }
`;

export const DialogText = styled.p`
   margin: 0 0 ${brandTheme.spacing.lg} 0;
   line-height: 1.6;
   color: ${brandTheme.text.secondary};
   font-size: 15px;
   font-weight: 500;

   @media (max-width: 576px) {
       font-size: 14px;
   }
`;

export const DialogActions = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${brandTheme.spacing.md};

   @media (max-width: 576px) {
       flex-direction: column-reverse;
       gap: ${brandTheme.spacing.sm};
   }
`;

export const EnhancedLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

// Professional Badge Components
export const RequiredBadge = styled.span`
    background: linear-gradient(135deg, ${brandTheme.status.error} 0%, #ef4444 100%);
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: ${brandTheme.radius.sm};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
    box-shadow: ${brandTheme.shadow.xs};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
`;

export const OptionalBadge = styled.span`
    background: ${brandTheme.text.muted};
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: ${brandTheme.radius.sm};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
    opacity: 0.8;
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        opacity: 1;
        transform: translateY(-1px);
    }
`;

// Modern variant
export const ModernRequiredBadge = styled.span`
    background: ${brandTheme.primaryLight};
    opacity: 0.29;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
    box-shadow: 0 2px 4px ${brandTheme.primary}30;
    border: 2px solid ${brandTheme.primaryLight};
    transition: all ${brandTheme.transitions.spring};

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px ${brandTheme.primary}40;
    }
`;

// Minimal variant
export const MinimalRequiredBadge = styled.span`
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    font-size: 11px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: ${brandTheme.radius.sm};
    text-transform: none;
    flex-shrink: 0;
    border: 1px solid ${brandTheme.status.error}40;
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        background: ${brandTheme.status.error};
        color: white;
        transform: scale(1.05);
    }
`;