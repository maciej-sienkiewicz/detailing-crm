// src/components/common/DataTable/components.ts - FINALNA WERSJA z poprawionymi tooltipami
import styled from 'styled-components';
import { dataTableTheme } from './theme';

export const TableContainer = styled.div`
    background: ${dataTableTheme.surface};
    border-radius: ${dataTableTheme.radius.xl};
    border: 1px solid ${dataTableTheme.border};
    overflow: hidden;
    box-shadow: ${dataTableTheme.shadow.sm};
    width: 100%;
    min-height: 400px;
    margin-top: 10px;
    max-width: 100%;
`;

export const TableHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${dataTableTheme.spacing.lg};
    border-bottom: 1px solid ${dataTableTheme.border};
    background: ${dataTableTheme.surfaceAlt};
    flex-shrink: 0;
    gap: ${dataTableTheme.spacing.xl};
    min-height: 80px;

    @media (max-width: 1024px) {
        flex-direction: column;
        align-items: stretch;
        gap: ${dataTableTheme.spacing.lg};
        min-height: auto;
        padding: ${dataTableTheme.spacing.md} ${dataTableTheme.spacing.lg};
    }
`;

// GŁÓWNA POPRAWKA: TableWrapper bez wymuszonego overflow hidden
export const TableWrapper = styled.div`
    width: 100%;
    /* POPRAWKA: Usuwa overflow hidden - pozwala tooltipom być widocznym */
    /* overflow: hidden; */

    /* Tylko gdy rzeczywiście potrzebny scroll na mobile */
    @media (max-width: 768px) {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
`;

export const TableContent = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

export const TableHeaderRow = styled.div`
    display: flex;
    background: ${dataTableTheme.surfaceAlt};
    border-bottom: 2px solid ${dataTableTheme.border};
    min-height: 56px;
    width: 100%;
`;

export const HeaderCell = styled.div<{
    $isDragging?: boolean;
    $width: string;
    $sortable?: boolean;
}>`
    ${props => {
        if (props.$width.includes('px')) {
            const numericWidth = parseInt(props.$width);
            return `
                flex: 0 0 auto;
                width: ${props.$width};
                min-width: ${Math.min(numericWidth, 80)}px;
                
                @media (max-width: 1400px) {
                    min-width: ${Math.min(numericWidth * 0.8, 60)}px;
                    width: ${Math.min(numericWidth * 0.8, 60)}px;
                }
                
                @media (max-width: 1024px) {
                    min-width: ${Math.min(numericWidth * 0.6, 50)}px;
                    width: ${Math.min(numericWidth * 0.6, 50)}px;
                }
            `;
        }

        if (props.$width.includes('%')) {
            const percentage = parseInt(props.$width);
            return `
                flex: ${percentage} ${percentage} 0%;
                min-width: 0;
                width: 0;
            `;
        }

        return `
            flex: 1 1 auto;
            min-width: 0;
        `;
    }}

    display: flex;
    align-items: center;
    padding: 0 ${dataTableTheme.spacing.md};
    background: ${props => props.$isDragging ? dataTableTheme.primaryGhost : dataTableTheme.surfaceAlt};
    border-right: 1px solid ${dataTableTheme.border};
    cursor: ${props => props.$sortable ? 'pointer' : props.$isDragging ? 'grabbing' : 'grab'};
    user-select: none;
    transition: all 0.2s ease;
    overflow: hidden;

    &:hover {
        background: ${dataTableTheme.primaryGhost};
    }

    &:last-child {
        border-right: none;
    }

    @media (max-width: 1024px) {
        padding: 0 ${dataTableTheme.spacing.sm};
    }
`;

export const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
    width: 100%;
    min-width: 0;
    overflow: hidden;
`;

export const HeaderLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${dataTableTheme.text.primary};
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;

    @media (max-width: 1024px) {
        font-size: 13px;
    }

    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

// KLUCZOWA POPRAWKA: TableRow z poprawnym z-index dla tooltipów
export const TableRow = styled.div<{ $selected?: boolean }>`
    display: flex;
    border-bottom: 1px solid ${dataTableTheme.borderLight};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background: ${props => props.$selected ? dataTableTheme.primaryGhost : dataTableTheme.surface};
    width: 100%;
    position: relative; /* DODANE dla z-index */
    z-index: 1; /* DODANE */

    &:hover {
        background: ${props => props.$selected ? dataTableTheme.primaryGhost : dataTableTheme.surfaceHover};
        box-shadow: inset 0 0 0 1px ${dataTableTheme.borderHover};
        z-index: 10; /* PODWYŻSZONY z-index przy hover - tooltipsy będą widoczne nad innymi wierszami */
    }

    &:last-child {
        border-bottom: none;
    }
`;

// KLUCZOWA POPRAWKA: TableCell bez overflow hidden
export const TableCell = styled.div<{ $width?: string }>`
    ${props => {
        if (!props.$width) {
            return `
                flex: 1 1 auto;
                min-width: 0;
            `;
        }

        if (props.$width.includes('px')) {
            const numericWidth = parseInt(props.$width);
            return `
                flex: 0 0 auto;
                width: ${props.$width};
                min-width: ${Math.min(numericWidth, 80)}px;
                
                @media (max-width: 1400px) {
                    min-width: ${Math.min(numericWidth * 0.8, 60)}px;
                    width: ${Math.min(numericWidth * 0.8, 60)}px;
                }
                
                @media (max-width: 1024px) {
                    min-width: ${Math.min(numericWidth * 0.6, 50)}px;
                    width: ${Math.min(numericWidth * 0.6, 50)}px;
                }
            `;
        }

        if (props.$width.includes('%')) {
            const percentage = parseInt(props.$width);
            return `
                flex: ${percentage} ${percentage} 0%;
                min-width: 0;
                width: 0;
            `;
        }

        return `
            flex: 1 1 auto;
            min-width: 0;
        `;
    }}

    padding: ${dataTableTheme.spacing.md};
    display: flex;
    align-items: center;
    min-height: 80px;
    border-right: 1px solid ${dataTableTheme.borderLight};
    position: relative; /* DODANE dla tooltipów */

    /* USUNIĘTE: overflow: hidden - pozwala tooltipom być widocznym */

    &:last-child {
        border-right: none;
    }

    @media (max-width: 1024px) {
        padding: ${dataTableTheme.spacing.sm};
        min-height: 70px;
    }
`;

export const TableBody = styled.div`
    background: ${dataTableTheme.surface};
    width: 100%;
`;

export const TableTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${dataTableTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
    white-space: nowrap;
`;

export const ViewControls = styled.div`
    display: flex;
    border: 2px solid ${dataTableTheme.border};
    border-radius: ${dataTableTheme.radius.md};
    overflow: hidden;
`;

export const ViewButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 36px;
    border: none;
    background: ${props => props.$active ? dataTableTheme.primary : dataTableTheme.surface};
    color: ${props => props.$active ? 'white' : dataTableTheme.text.tertiary};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;

    &:hover {
        background: ${props => props.$active ? dataTableTheme.primaryDark : dataTableTheme.primaryGhost};
        color: ${props => props.$active ? 'white' : dataTableTheme.primary};
    }

    &:not(:last-child) {
        border-right: 1px solid ${dataTableTheme.border};
    }
`;

export const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.lg};
    flex: 1;
    min-width: 0;

    @media (max-width: 1024px) {
        justify-content: space-between;
        width: 100%;
    }
`;

export const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.md};
    flex-shrink: 0;

    @media (max-width: 768px) {
        flex-wrap: wrap;
        width: 100%;
        justify-content: flex-end;
        gap: ${dataTableTheme.spacing.sm};
    }
`;

export const HeaderActionsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.md};

    @media (max-width: 768px) {
        flex-wrap: wrap;
        width: 100%;
        gap: ${dataTableTheme.spacing.sm};
    }
`;

export const SelectAllContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.lg};

    @media (max-width: 768px) {
        flex-wrap: wrap;
        align-items: stretch;
        gap: ${dataTableTheme.spacing.sm};
    }
`;

export const SelectAllCheckbox = styled.div<{ $selected?: boolean }>`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
    cursor: pointer;
    color: ${dataTableTheme.text.primary};
    font-weight: 500;
    font-size: 14px;
    transition: all 0.2s ease;
    padding: ${dataTableTheme.spacing.xs} ${dataTableTheme.spacing.sm};
    border-radius: ${dataTableTheme.radius.md};
    white-space: nowrap;

    svg {
        color: ${props => props.$selected ? dataTableTheme.primary : dataTableTheme.text.muted};
        font-size: 18px;
        transition: transform 0.2s ease;
    }

    &:hover {
        color: ${dataTableTheme.primary};
        background: ${dataTableTheme.primaryGhost};

        svg {
            transform: scale(1.1);
            color: ${dataTableTheme.primary};
        }
    }
`;

export const HeaderActionButton = styled.button<{
    $variant?: 'primary' | 'secondary' | 'filter';
    $active?: boolean;
    $hasBadge?: boolean;
}>`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
    padding: ${dataTableTheme.spacing.sm} ${dataTableTheme.spacing.md};
    border-radius: ${dataTableTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    position: relative;
    height: 40px;
    border: 2px solid;

    ${({ $variant = 'secondary', $active = false }) => {
        switch ($variant) {
            case 'primary':
                return `
                    background: linear-gradient(135deg, ${dataTableTheme.primary} 0%, ${dataTableTheme.primaryLight} 100%);
                    color: white;
                    border-color: ${dataTableTheme.primary};
                    box-shadow: ${dataTableTheme.shadow.sm};

                    &:hover {
                        background: linear-gradient(135deg, ${dataTableTheme.primaryDark} 0%, ${dataTableTheme.primary} 100%);
                        transform: translateY(-1px);
                        box-shadow: ${dataTableTheme.shadow.md};
                    }
                `;
            case 'filter':
                return `
                    background: ${$active ? dataTableTheme.primaryGhost : dataTableTheme.surface};
                    color: ${$active ? dataTableTheme.primary : dataTableTheme.text.secondary};
                    border-color: ${$active ? dataTableTheme.primary : dataTableTheme.border};

                    &:hover {
                        border-color: ${dataTableTheme.primary};
                        color: ${dataTableTheme.primary};
                        background: ${dataTableTheme.primaryGhost};
                        transform: translateY(-1px);
                        box-shadow: ${dataTableTheme.shadow.md};
                    }
                `;
            default: // secondary
                return `
                    background: ${dataTableTheme.surface};
                    color: ${dataTableTheme.text.secondary};
                    border-color: ${dataTableTheme.border};
                    box-shadow: ${dataTableTheme.shadow.xs};

                    &:hover {
                        background: ${dataTableTheme.surfaceHover};
                        color: ${dataTableTheme.text.primary};
                        border-color: ${dataTableTheme.borderHover};
                        transform: translateY(-1px);
                        box-shadow: ${dataTableTheme.shadow.sm};
                    }
                `;
        }
    }}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
    }

    @media (max-width: 768px) {
        padding: ${dataTableTheme.spacing.xs} ${dataTableTheme.spacing.sm};
        font-size: 13px;
        height: 36px;

        span {
            display: none;
        }
    }
`;

export const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${dataTableTheme.spacing.xxl};
    background: ${dataTableTheme.surface};
    border-radius: ${dataTableTheme.radius.xl};
    border: 2px dashed ${dataTableTheme.border};
    text-align: center;
    min-height: 400px;
`;

export const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${dataTableTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${dataTableTheme.text.tertiary};
    margin-bottom: ${dataTableTheme.spacing.lg};
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;

export const EmptyStateTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${dataTableTheme.text.primary};
    margin: 0 0 ${dataTableTheme.spacing.sm} 0;
    letter-spacing: -0.025em;
`;

export const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${dataTableTheme.text.secondary};
    margin: 0 0 ${dataTableTheme.spacing.sm} 0;
    line-height: 1.5;
`;

export const EmptyStateAction = styled.p`
    font-size: 14px;
    color: ${dataTableTheme.primary};
    margin: 0;
    font-weight: 500;
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
    border-radius: ${dataTableTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: ${props => props.$small ? '12px' : '13px'};
    position: relative;
    overflow: hidden;

    ${({ $variant }) => {
    switch ($variant) {
        case 'view':
            return `
                    background: ${dataTableTheme.primaryGhost};
                    color: ${dataTableTheme.primary};
                    &:hover {
                        background: ${dataTableTheme.primary};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${dataTableTheme.shadow.md};
                    }
                `;
        case 'edit':
            return `
                    background: ${dataTableTheme.status.warningLight};
                    color: ${dataTableTheme.status.warning};
                    &:hover {
                        background: ${dataTableTheme.status.warning};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${dataTableTheme.shadow.md};
                    }
                `;
        case 'delete':
            return `
                    background: ${dataTableTheme.status.errorLight};
                    color: ${dataTableTheme.status.error};
                    &:hover {
                        background: ${dataTableTheme.status.error};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${dataTableTheme.shadow.md};
                    }
                `;
        default:
            return `
                    background: ${dataTableTheme.surfaceElevated};
                    color: ${dataTableTheme.text.tertiary};
                    &:hover {
                        background: ${dataTableTheme.text.tertiary};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${dataTableTheme.shadow.md};
                    }
                `;
    }
}}
`;

// POPRAWKA: ActionButtons z overflow visible dla tooltipów
export const ActionButtons = styled.div`
    display: flex;
    gap: ${dataTableTheme.spacing.xs};
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    position: relative;
    z-index: 10;

    /* KLUCZOWA POPRAWKA: pozwala tooltipom być widocznym */
    overflow: visible !important;
`;

export const StatusBadge = styled.span<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: ${dataTableTheme.radius.lg};
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
    white-space: nowrap;
`;

// GŁÓWNA POPRAWKA: TooltipWrapper z bardzo wysokim z-index
export const TooltipWrapper = styled.div<{ title: string }>`
    position: relative;
    display: inline-flex;

    &:hover::after {
        content: attr(title);
        position: fixed; /* KLUCZOWA ZMIANA: fixed zamiast absolute */
        background: ${dataTableTheme.text.primary};
        color: white;
        padding: 12px 16px;
        border-radius: ${dataTableTheme.radius.md};
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        z-index: 999999; /* BARDZO WYSOKI Z-INDEX */
        box-shadow: ${dataTableTheme.shadow.xl};
        animation: tooltipFadeIn 0.2s ease-out;
        max-width: 280px;
        word-wrap: break-word;
        white-space: normal;
        pointer-events: none;

        /* Dynamiczne pozycjonowanie - tooltip pojawi się nad elementem */
        left: 50%;
        transform: translateX(-50%);
        bottom: calc(100% + 12px);

        /* Responsywność */
        @media (max-width: 768px) {
            max-width: 200px;
            font-size: 12px;
            padding: 8px 12px;
        }
    }

    &:hover::before {
        content: '';
        position: fixed; /* KLUCZOWA ZMIANA: fixed zamiast absolute */
        width: 0;
        height: 0;
        border: 6px solid transparent;
        border-top-color: ${dataTableTheme.text.primary};
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999; /* BARDZO WYSOKI Z-INDEX */
        animation: tooltipFadeIn 0.2s ease-out;
        pointer-events: none;

        /* Pozycjonowanie strzałki */
        top: calc(100% + 6px);
    }

    @keyframes tooltipFadeIn {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
        }
    }
`;

export const SortIcon = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    color: ${props => props.$active ? dataTableTheme.primary : dataTableTheme.text.muted};
    font-size: 12px;
    transition: color 0.2s ease;
    flex-shrink: 0;
`;

export const DragHandle = styled.div`
    color: ${dataTableTheme.text.muted};
    font-size: 12px;
    opacity: 0.6;
    transition: opacity 0.2s ease;
    flex-shrink: 0;

    ${HeaderCell}:hover & {
        opacity: 1;
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

export const ExpandableContent = styled.div<{ $visible: boolean }>`
    overflow: hidden;
    background: ${dataTableTheme.surfaceAlt};
    border-bottom: 1px solid ${dataTableTheme.border};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    ${props => props.$visible
            ? `
            max-height: 1000px;
            opacity: 1;
        `
            : `
            max-height: 0;
            opacity: 0;
        `
    }
`;

export const ActionBadge = styled.span`
    position: absolute;
    top: -4px;
    right: -4px;
    width: 12px;
    height: 12px;
    background: ${dataTableTheme.status.warning};
    border-radius: 50%;
    border: 2px solid ${dataTableTheme.surface};
    animation: pulse 2s infinite;

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.1);
            opacity: 0.8;
        }
    }
`;

export const SelectionCounter = styled.div`
    font-size: 14px;
    color: ${dataTableTheme.primary};
    font-weight: 600;
    padding: ${dataTableTheme.spacing.xs} ${dataTableTheme.spacing.sm};
    background: ${dataTableTheme.surface};
    border-radius: ${dataTableTheme.radius.md};
    border: 1px solid ${dataTableTheme.primary}30;
    white-space: nowrap;
`;

export const BulkActionsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};

    @media (max-width: 768px) {
        flex-wrap: wrap;
    }
`;

export const BulkActionButton = styled.button<{
    $variant?: 'primary' | 'secondary';
}>`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.xs};
    padding: ${dataTableTheme.spacing.xs} ${dataTableTheme.spacing.md};
    border-radius: ${dataTableTheme.radius.md};
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    white-space: nowrap;

    ${({ $variant = 'secondary' }) => {
    switch ($variant) {
        case 'primary':
            return `
                    background: ${dataTableTheme.primary};
                    color: white;
                    border-color: ${dataTableTheme.primary};

                    &:hover:not(:disabled) {
                        background: ${dataTableTheme.primaryDark};
                        border-color: ${dataTableTheme.primaryDark};
                    }
                `;
        default: // secondary
            return `
                    background: ${dataTableTheme.surface};
                    color: ${dataTableTheme.text.secondary};
                    border-color: ${dataTableTheme.border};

                    &:hover:not(:disabled) {
                        background: ${dataTableTheme.surfaceHover};
                        color: ${dataTableTheme.text.primary};
                        border-color: ${dataTableTheme.primary};
                    }
                `;
    }
}}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        font-size: 12px;
    }

    @media (max-width: 768px) {
        padding: ${dataTableTheme.spacing.xs} ${dataTableTheme.spacing.sm};
        font-size: 12px;

        span {
            display: none;
        }
    }
`;

export const CardsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: ${dataTableTheme.spacing.md};
    padding: ${dataTableTheme.spacing.lg};

    @media (max-width: 1200px) {
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        padding: ${dataTableTheme.spacing.md};
        gap: ${dataTableTheme.spacing.sm};
    }
`;

export const Card = styled.div<{ $selected?: boolean }>`
    background: ${dataTableTheme.surface};
    border: 2px solid ${props => props.$selected ? dataTableTheme.primary : dataTableTheme.border};
    border-radius: ${dataTableTheme.radius.lg};
    padding: ${dataTableTheme.spacing.lg};
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${props => props.$selected ? dataTableTheme.shadow.md : dataTableTheme.shadow.xs};

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        border-color: ${dataTableTheme.primary};
    }

    @media (max-width: 768px) {
        padding: ${dataTableTheme.spacing.md};
    }
`;