import styled from 'styled-components';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
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
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

export const ContentContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};

    /* Remove flex: 1 and min-height: 0 constraints */
    /* Allow natural content flow */
`;

export const StatsSection = styled.section`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl} 0;
    width: 100%;

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg} 0;
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.md} 0;
    }
`;

export const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: ${brandTheme.spacing.lg};
    margin-bottom: ${brandTheme.spacing.lg};

    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: ${brandTheme.spacing.md};
    }
`;

export const StatCard = styled.div`
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.xl};
    padding: ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${brandTheme.shadow.xs};
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.lg};
        border-color: ${brandTheme.primary};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    &:hover::before {
        opacity: 1;
    }
`;

export const StatIcon = styled.div<{ $color: string }>`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 24px;
    flex-shrink: 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

export const StatContent = styled.div`
    flex: 1;
    min-width: 0;
`;

export const StatValue = styled.div`
    font-size: 28px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.025em;
    line-height: 1.1;

    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

export const StatLabel = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    line-height: 1.3;
`;

export const MainContent = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${brandTheme.spacing.xl} ${brandTheme.spacing.xl};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};

    /* Remove flex: 1 and min-height: 0 to allow natural expansion */
    flex-shrink: 0;

    @media (max-width: 1024px) {
        padding: 0 ${brandTheme.spacing.lg} ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${brandTheme.spacing.md} ${brandTheme.spacing.md};
        gap: ${brandTheme.spacing.md};
    }
`;

export const SelectionBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.primaryGhost} 0%, rgba(26, 54, 93, 0.02) 100%);
    border: 1px solid ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.lg};
    margin-bottom: ${brandTheme.spacing.md};
`;

export const SelectAllCheckbox = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    cursor: pointer;
    color: ${brandTheme.text.primary};
    font-weight: 500;
    font-size: 14px;
    transition: all 0.2s ease;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};

    svg {
        color: ${brandTheme.primary};
        font-size: 18px;
        transition: transform 0.2s ease;
    }

    &:hover {
        color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};

        svg {
            transform: scale(1.1);
        }
    }
`;

export const SelectionInfo = styled.div`
    font-size: 14px;
    color: ${brandTheme.primary};
    font-weight: 600;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.primary}30;
`;

export const SearchResultsInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.status.infoLight} 0%, #e0f2fe 100%);
    border: 1px solid ${brandTheme.status.info}30;
    border-radius: ${brandTheme.radius.lg};
    margin-bottom: ${brandTheme.spacing.md};
`;

export const SearchIcon = styled.div`
    font-size: 20px;
    flex-shrink: 0;
`;

export const SearchText = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    flex: 1;
`;

export const SearchSubtext = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    font-style: italic;
    margin-top: 2px;
`;

export const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    gap: ${brandTheme.spacing.md};
    min-height: 400px;
`;

export const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${brandTheme.borderLight};
    border-top: 3px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export const LoadingText = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

export const TableContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};

    /* Allow table to show all content without height constraints */
    min-height: 400px;
    flex-shrink: 0;

    /* Global override for any nested table components that might have height restrictions */
    * {
        &[class*="TableWrapper"],
        &[class*="TableContainer"],
        &[class*="ListContainer"] {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            flex: none !important;
        }
    }

    /* Ensure pagination is always visible */
    .pagination-container {
        margin-top: auto;
        flex-shrink: 0;
    }
`;

export const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 2px dashed ${brandTheme.border};
    text-align: center;
    min-height: 400px;
`;

export const EmptyStateIcon = styled.div`
    font-size: 64px;
    margin-bottom: ${brandTheme.spacing.lg};
    opacity: 0.6;
`;

export const EmptyStateTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    letter-spacing: -0.025em;
`;

export const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    margin: 0 0 ${brandTheme.spacing.lg} 0;
    line-height: 1.5;
`;

export const EmptyStateAction = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.lg};
    background: ${brandTheme.primary};
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

export const PaginationContainer = styled.div`
    margin-top: ${brandTheme.spacing.md};
    display: flex;
    justify-content: center;
    padding: ${brandTheme.spacing.md} 0;
`;

export const BulkSmsContent = styled.div`
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.md};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};
`;

export const BulkSmsHeader = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    align-items: flex-start;
    padding-bottom: ${brandTheme.spacing.lg};
    border-bottom: 2px solid ${brandTheme.borderLight};
`;

export const BulkSmsIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.status.success} 0%, #10b981 100%);
    border-radius: ${brandTheme.radius.xl};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.lg};
    flex-shrink: 0;
`;

export const BulkSmsInfo = styled.div`
    flex: 1;
`;

export const BulkSmsTitle = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
    letter-spacing: -0.025em;
`;

export const BulkSmsSubtitle = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    line-height: 1.5;
`;

export const SmsFormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

export const SmsFormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

export const SmsLabel = styled.label`
    font-weight: 600;
    font-size: 14px;
    color: ${brandTheme.text.primary};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
`;

export const SmsTextarea = styled.textarea`
    width: 100%;
    padding: ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    font-size: 15px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    resize: vertical;
    min-height: 120px;
    font-family: inherit;
    line-height: 1.6;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 4px ${brandTheme.primaryGhost};
        transform: translateY(-1px);
    }

    &::placeholder {
        color: ${brandTheme.text.tertiary};
        font-weight: 400;
    }
`;

export const SmsCharacterCounter = styled.div<{ $nearLimit?: boolean }>`
    font-size: 12px;
    color: ${props => props.$nearLimit ? brandTheme.status.warning : brandTheme.text.muted};
    text-align: right;
    font-weight: 500;

    span {
        color: ${brandTheme.status.error};
        font-weight: 600;
    }
`;

export const BulkSmsActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.sm};
    padding-top: ${brandTheme.spacing.lg};
    border-top: 2px solid ${brandTheme.borderLight};
`;

export const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;

    &:hover {
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

export const PrimaryButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

export const SecondaryButton = styled(BaseButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-color: ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;