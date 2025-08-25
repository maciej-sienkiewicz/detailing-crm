// ClientListTable/styles/components-fixed.ts - Fixed height constraints
import styled from 'styled-components';
import {brandTheme} from './theme';

// Main Container Components - FIXED: Remove height constraints
export const ListContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};

    /* FIXED: Remove flex: 1, display: flex, flex-direction: column, min-height: 0 */
    /* Allow natural content expansion */
    width: 100%;
`;

export const ListHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    flex-shrink: 0;
`;

export const ListTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
`;

// Table Components - FIXED: Remove height constraints
export const TableWrapper = styled.div`
    width: 100%;

    /* FIXED: Remove flex: 1, overflow: hidden, display: flex, flex-direction: column */
    /* Allow table to expand naturally to show all rows */
`;

export const TableContainer = styled.div`
    width: 100%;

    /* FIXED: Remove flex: 1, overflow: auto, min-height: 0 */
    /* Allow natural content flow */
`;

export const TableHeader = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    min-height: 56px;
    position: sticky;
    top: 0;
    z-index: 10;
`;

export const ModernHeaderCell = styled.div<{
    $isDragging?: boolean;
    $width: string;
    $sortable?: boolean;
}>`
    flex: 0 0 ${props => props.$width};
    width: ${props => props.$width};
    display: flex;
    align-items: center;
    padding: 0 ${brandTheme.spacing.md};
    background: ${props => props.$isDragging ? brandTheme.primaryGhost : brandTheme.surfaceAlt};
    border-right: 1px solid ${brandTheme.border};
    cursor: ${props => props.$sortable ? 'pointer' : 'grab'};
    user-select: none;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
    }

    &:active {
        cursor: ${props => props.$sortable ? 'pointer' : 'grabbing'};
    }

    &:last-child {
        border-right: none;
    }
`;

export const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    width: 100%;
`;

export const DragHandle = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 12px;
    opacity: 0.6;
    transition: opacity 0.2s ease;

    ${ModernHeaderCell}:hover & {
        opacity: 1;
    }
`;

export const HeaderLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    flex: 1;
`;

export const SortIcon = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    color: ${props => props.$active ? brandTheme.primary : brandTheme.text.muted};
    font-size: 12px;
    transition: color 0.2s ease;
`;

export const TableBody = styled.div`
    background: ${brandTheme.surface};

    /* FIXED: Remove any height constraints */
    /* Allow all rows to be visible */
`;

export const StyledTableRow = styled.div<{ $selected?: boolean }>`
    display: flex;
    border-bottom: 1px solid ${brandTheme.borderLight};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background: ${props => props.$selected ? brandTheme.primaryGhost : brandTheme.surface};

    &:hover {
        background: ${props => props.$selected ? brandTheme.primaryGhost : brandTheme.surfaceHover};
        box-shadow: inset 0 0 0 1px ${brandTheme.borderHover};
    }

    &:last-child {
        border-bottom: none;
    }
`;

export const TableCell = styled.div<{ $width?: string }>`
    flex: 0 0 ${props => props.$width || 'auto'};
    width: ${props => props.$width || 'auto'};
    padding: ${brandTheme.spacing.md};
    display: flex;
    align-items: center;
    min-height: 80px;
    border-right: 1px solid ${brandTheme.borderLight};

    &:last-child {
        border-right: none;
    }
`;

// Tooltip Component
export const TooltipWrapper = styled.div<{ title: string }>`
    position: relative;
    display: inline-flex;

    &:hover::after {
        content: attr(title);
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
        background: ${brandTheme.text.primary};
        color: white;
        padding: 8px 12px;
        border-radius: ${brandTheme.radius.md};
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        z-index: 1000;
        box-shadow: ${brandTheme.shadow.lg};
        animation: tooltipFadeIn 0.2s ease-out;
    }

    &:hover::before {
        content: '';
        position: absolute;
        bottom: calc(100% + 2px);
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: ${brandTheme.text.primary};
        z-index: 1000;
        animation: tooltipFadeIn 0.2s ease-out;
    }

    @keyframes tooltipFadeIn {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;

// Selection Components
export const SelectionCheckbox = styled.div<{ $selected?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    color: ${props => props.$selected ? brandTheme.primary : brandTheme.text.muted};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    padding: ${brandTheme.spacing.xs};
    border-radius: ${brandTheme.radius.sm};

    &:hover {
        color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
        transform: scale(1.1);
    }
`;

// Client Info Components
export const ClientInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    width: 100%;
`;

export const ClientName = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-weight: 600;
    font-size: 15px;
    color: ${brandTheme.text.primary};
    line-height: 1.3;
`;

export const StatusBadge = styled.span<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: ${brandTheme.radius.lg};
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
    white-space: nowrap;
`;

export const LastVisit = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

// Contact Info Components
export const ContactInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    width: 100%;
`;

export const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-size: 13px;
`;

export const ContactIcon = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 12px;
    width: 16px;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
`;

export const ContactText = styled.span`
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    word-break: break-all;
`;

// Company Info Components
export const CompanyInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    width: 100%;
`;

export const CompanyName = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.primary};

    svg {
        color: ${brandTheme.text.muted};
        font-size: 12px;
    }
`;

export const TaxId = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
`;

export const EmptyCompany = styled.div`
    color: ${brandTheme.text.muted};
    font-style: italic;
    font-size: 13px;
`;

// Vehicle Count Component
export const VehicleCount = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    background: linear-gradient(135deg, ${brandTheme.status.infoLight} 0%, #e0f2fe 100%);
    color: ${brandTheme.status.info};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    border: 1px solid ${brandTheme.status.info}30;
    width: fit-content;

    svg {
        font-size: 12px;
    }
`;

// Last Visit Date Component
export const LastVisitDate = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 13px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};

    svg {
        color: ${brandTheme.text.muted};
        font-size: 11px;
    }
`;

// Metrics Components
export const MetricsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

export const MetricItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
`;

export const MetricValue = styled.div`
    font-weight: 700;
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    line-height: 1.2;
`;

export const MetricLabel = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export const MetricSeparator = styled.div`
    color: ${brandTheme.borderHover};
    font-weight: bold;
    font-size: 16px;
`;

// Revenue Components
export const RevenueDisplay = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

export const RevenueAmount = styled.div`
    font-weight: 700;
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    line-height: 1.2;
`;

// Action Components
export const ActionButtons = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
    align-items: center;
    flex-wrap: wrap;
`;

export const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete' | 'info' | 'success' | 'secondary';
    $small?: boolean;
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${props => props.$small ? '28px' : '32px'};
    height: ${props => props.$small ? '28px' : '32px'};
    border: none;
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: ${props => props.$small ? '12px' : '13px'};
    position: relative;
    overflow: hidden;

    ${({ $variant }) => {
        switch ($variant) {
            case 'view':
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
            case 'edit':
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
            case 'info':
                return `
                    background: ${brandTheme.status.infoLight};
                    color: ${brandTheme.status.info};
                    &:hover {
                        background: ${brandTheme.status.info};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'success':
                return `
                    background: ${brandTheme.status.successLight};
                    color: ${brandTheme.status.success};
                    &:hover {
                        background: ${brandTheme.status.success};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'secondary':
                return `
                    background: ${brandTheme.surfaceElevated};
                    color: ${brandTheme.text.tertiary};
                    &:hover {
                        background: ${brandTheme.text.tertiary};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'delete':
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
    }}
`;

// Empty State Components
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
    width: 64px;
    height: 64px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${brandTheme.text.tertiary};
    margin-bottom: ${brandTheme.spacing.lg};
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
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
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    line-height: 1.5;
`;

export const EmptyStateAction = styled.p`
    font-size: 14px;
    color: ${brandTheme.primary};
    margin: 0;
    font-weight: 500;
`;