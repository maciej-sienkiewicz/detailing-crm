// src/pages/Finances/styles/statsStyles.ts
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

// Main container
export const StatsContainer = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceElevated};
    padding: ${theme.spacing.xxxl} ${theme.spacing.xxxl} ${theme.spacing.xl};

    @media (max-width: 768px) {
        padding: ${theme.spacing.xl} ${theme.spacing.lg};
    }
`;

// Header section
export const Header = styled.div`
    margin-bottom: ${theme.spacing.xxxl};
`;

export const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${theme.spacing.xl};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.lg};
    }
`;

export const HeaderContent = styled.div``;

export const Title = styled.h1`
    font-size: 32px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
    letter-spacing: -0.025em;

    @media (max-width: 768px) {
        font-size: 26px;
    }
`;

export const Subtitle = styled.p`
    font-size: 16px;
    color: ${theme.text.secondary};
    margin: 0;
    font-weight: 400;
`;

export const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};

    @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-end;
    }
`;

// Categories section
export const CategoriesSection = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xl};
    margin-bottom: ${theme.spacing.xl};
`;

export const CategoriesHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing.lg};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.md};
    }
`;

export const CategoriesTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

export const CreateCategoryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.primary};
    color: ${theme.surface};
    border: none;
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: ${theme.transitions.normal};

    &:hover:not(:disabled) {
        background: ${theme.primaryLight};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

export const CategoriesList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.md};
`;

export const CategoryChip = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.primaryGhost};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    color: ${theme.text.primary};
    font-size: 14px;
    font-weight: 500;
`;

export const CategoryName = styled.span`
    color: ${theme.text.primary};
`;

export const CategoryCount = styled.span`
    color: ${theme.text.muted};
    font-size: 12px;
    background: ${theme.surface};
    padding: 2px 6px;
    border-radius: ${theme.radius.sm};
`;

export const EmptyCategories = styled.div`
    text-align: center;
    color: ${theme.text.muted};
    font-style: italic;
    padding: ${theme.spacing.lg};
`;

// Table section
export const TableSection = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
`;

export const TableHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xl};
    border-bottom: 1px solid ${theme.border};
    background: ${theme.surfaceElevated};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.md};
    }
`;

export const TableTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

export const TableActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

export const AssignButton = styled.button<{ $disabled?: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${props => props.$disabled ? theme.text.disabled : theme.success};
    color: ${theme.surface};
    border: none;
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: ${theme.transitions.normal};
    opacity: ${props => props.$disabled ? 0.6 : 1};

    &:hover:not(:disabled) {
        background: ${theme.success};
        filter: brightness(1.1);
    }
`;

export const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    color: ${theme.text.secondary};
    cursor: pointer;
    transition: ${theme.transitions.normal};

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        color: ${theme.text.primary};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

// Table styles
export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

export const TableHead = styled.thead`
    background: ${theme.surfaceElevated};
`;

export const TableRow = styled.tr<{ $selected?: boolean }>`
    background: ${props => props.$selected ? theme.primaryGhost : 'transparent'};
    border-bottom: 1px solid ${theme.borderLight};
    transition: ${theme.transitions.fast};

    &:hover {
        background: ${props => props.$selected ? theme.primaryGhost : theme.surfaceHover};
    }
`;

export const TableCell = styled.td`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    color: ${theme.text.primary};
    font-size: 14px;
    vertical-align: middle;
`;

export const CheckboxCell = styled(TableCell)`
    width: 50px;
    padding-left: ${theme.spacing.lg};
`;

export const Checkbox = styled.input`
    width: 16px;
    height: 16px;
    cursor: pointer;
`;

export const ServiceName = styled.div`
    font-weight: 500;
    color: ${theme.text.primary};
`;

export const ServiceCount = styled.div`
    font-weight: 600;
    color: ${theme.text.primary};
`;

export const ServiceRevenue = styled.div`
    font-weight: 600;
    color: ${theme.success};
`;

// Loading and empty states
export const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing.xxxl};
    color: ${theme.text.muted};
`;

export const EmptyState = styled.div`
    text-align: center;
    padding: ${theme.spacing.xxxl};
    color: ${theme.text.muted};
`;

export const EmptyStateIcon = styled.div`
    font-size: 48px;
    margin-bottom: ${theme.spacing.lg};
    opacity: 0.5;
`;

export const EmptyStateText = styled.div`
    font-size: 16px;
    margin-bottom: ${theme.spacing.sm};
`;

export const EmptyStateSubtext = styled.div`
    font-size: 14px;
    color: ${theme.text.disabled};
`;