import styled from 'styled-components';
import { dataTableTheme } from './theme';

export const TableContainer = styled.div`
    background: ${dataTableTheme.surface};
    border-radius: ${dataTableTheme.radius.lg};
    border: 1px solid ${dataTableTheme.border};
    overflow: hidden;
    box-shadow: ${dataTableTheme.shadow.xs};
    width: 100%;
    min-height: 300px;
    margin-top: 6px;
    max-width: 100%;

    @media (max-width: 768px) {
        border-radius: ${dataTableTheme.radius.md};
        margin-top: 4px;
    }
`;

export const TableHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${dataTableTheme.spacing.sm} ${dataTableTheme.spacing.md};
    border-bottom: 1px solid ${dataTableTheme.border};
    background: ${dataTableTheme.surfaceAlt};
    flex-shrink: 0;
    gap: ${dataTableTheme.spacing.sm};
    min-height: 52px;

    @media (max-width: 1024px) {
        flex-direction: column;
        align-items: stretch;
        gap: ${dataTableTheme.spacing.xs};
        min-height: auto;
        padding: ${dataTableTheme.spacing.xs} ${dataTableTheme.spacing.sm};
    }

    @media (max-width: 768px) {
        padding: ${dataTableTheme.spacing.xs};
    }
`;

export const TableWrapper = styled.div`
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
        height: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${dataTableTheme.surfaceAlt};
    }

    &::-webkit-scrollbar-thumb {
        background: ${dataTableTheme.border};
        border-radius: 3px;

        &:hover {
            background: ${dataTableTheme.text.muted};
        }
    }

    @media (max-width: 1400px) {
        &::-webkit-scrollbar {
            height: 5px;
        }
    }
`;

export const TableContent = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    min-width: 900px;

    @media (max-width: 1400px) {
        min-width: 800px;
    }

    @media (max-width: 1024px) {
        min-width: 700px;
    }
`;

export const TableHeaderRow = styled.div`
    display: flex;
    background: ${dataTableTheme.surfaceAlt};
    border-bottom: 2px solid ${dataTableTheme.border};
    min-height: 40px;
    width: 100%;

    @media (max-width: 1024px) {
        min-height: 36px;
    }
`;

export const HeaderCell = styled.div<{
    $isDragging?: boolean;
    $width: string;
    $sortable?: boolean;
}>`
    display: flex;
    align-items: center;
    padding: 0 ${dataTableTheme.spacing.xs};
    background: ${props => props.$isDragging ? dataTableTheme.primaryGhost : dataTableTheme.surfaceAlt};
    border-right: 1px solid ${dataTableTheme.border};
    cursor: ${props => props.$sortable ? 'pointer' : props.$isDragging ? 'grabbing' : 'grab'};
    user-select: none;
    transition: all 0.15s ease;
    overflow: hidden;
    flex-shrink: 0;

    ${props => {
        if (props.$width === 'auto') {
            return `
                flex: 1 1 auto;
                min-width: 80px;
            `;
        }

        if (props.$width.endsWith('px')) {
            const width = parseInt(props.$width);
            return `
                width: ${props.$width};
                min-width: ${Math.max(width * 0.7, 60)}px;
                max-width: ${props.$width};
            `;
        }

        if (props.$width.endsWith('%')) {
            return `
                flex: 0 0 ${props.$width};
                width: ${props.$width};
                min-width: 60px;
            `;
        }

        return `
            flex: 1 1 auto;
            min-width: 80px;
        `;
    }}

    &:hover {
        background: ${dataTableTheme.primaryGhost};
    }

    &:last-child {
        border-right: none;
    }

    @media (max-width: 1400px) {
        padding: 0 6px;
    }
`;

export const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    min-width: 0;
    overflow: hidden;
`;

export const HeaderLabel = styled.span`
    font-size: 11px;
    font-weight: 600;
    color: ${dataTableTheme.text.primary};
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;

    @media (max-width: 1024px) {
        font-size: 10px;
    }
`;

export const TableRow = styled.div<{ $selected?: boolean }>`
    display: flex;
    border-bottom: 1px solid ${dataTableTheme.borderLight};
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    background: ${props => props.$selected ? dataTableTheme.primaryGhost : dataTableTheme.surface};
    width: 100%;
    position: relative;
    z-index: 1;

    &:hover {
        background: ${props => props.$selected ? dataTableTheme.primaryGhost : dataTableTheme.surfaceHover};
        box-shadow: inset 0 0 0 1px ${dataTableTheme.borderHover};
        z-index: 10;
    }

    &:last-child {
        border-bottom: none;
    }
`;

export const TableCell = styled.div<{ $width?: string }>`
    padding: ${dataTableTheme.spacing.xs};
    display: flex;
    align-items: center;
    min-height: 52px;
    border-right: 1px solid ${dataTableTheme.borderLight};
    position: relative;
    flex-shrink: 0;

    ${props => {
        if (!props.$width || props.$width === 'auto') {
            return `
                flex: 1 1 auto;
                min-width: 80px;
            `;
        }

        if (props.$width.endsWith('px')) {
            const width = parseInt(props.$width);
            return `
                width: ${props.$width};
                min-width: ${Math.max(width * 0.7, 60)}px;
                max-width: ${props.$width};
            `;
        }

        if (props.$width.endsWith('%')) {
            return `
                flex: 0 0 ${props.$width};
                width: ${props.$width};
                min-width: 60px;
            `;
        }

        return `
            flex: 1 1 auto;
            min-width: 80px;
        `;
    }}

    &:last-child {
        border-right: none;
    }

    @media (max-width: 1400px) {
        padding: 6px;
        min-height: 48px;
    }

    @media (max-width: 1024px) {
        min-height: 44px;
    }
`;

export const TableBody = styled.div`
    background: ${dataTableTheme.surface};
    width: 100%;
`;

export const TableTitle = styled.h3`
    font-size: 14px;
    font-weight: 600;
    color: ${dataTableTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
    white-space: nowrap;

    @media (max-width: 1024px) {
        font-size: 13px;
    }

    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

export const ViewControls = styled.div`
    display: flex;
    border: 1.5px solid ${dataTableTheme.border};
    border-radius: ${dataTableTheme.radius.sm};
    overflow: hidden;
`;

export const ViewButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 28px;
    border: none;
    background: ${props => props.$active ? dataTableTheme.primary : dataTableTheme.surface};
    color: ${props => props.$active ? 'white' : dataTableTheme.text.tertiary};
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 11px;

    &:hover {
        background: ${props => props.$active ? dataTableTheme.primaryDark : dataTableTheme.primaryGhost};
        color: ${props => props.$active ? 'white' : dataTableTheme.primary};
    }

    &:not(:last-child) {
        border-right: 1px solid ${dataTableTheme.border};
    }

    @media (max-width: 1024px) {
        width: 28px;
        height: 26px;
        font-size: 10px;
    }
`;

export const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};
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
    gap: ${dataTableTheme.spacing.xs};
    flex-shrink: 0;

    @media (max-width: 768px) {
        flex-wrap: wrap;
        width: 100%;
        justify-content: flex-end;
        gap: 4px;
    }
`;

export const HeaderActionsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.xs};

    @media (max-width: 768px) {
        flex-wrap: wrap;
        width: 100%;
        gap: 4px;
    }
`;

export const SelectAllContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.sm};

    @media (max-width: 768px) {
        flex-wrap: wrap;
        align-items: stretch;
        gap: 4px;
    }
`;

export const SelectAllCheckbox = styled.div<{ $selected?: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: ${dataTableTheme.text.primary};
    font-weight: 500;
    font-size: 12px;
    transition: all 0.15s ease;
    padding: 4px ${dataTableTheme.spacing.xs};
    border-radius: ${dataTableTheme.radius.sm};
    white-space: nowrap;

    svg {
        color: ${props => props.$selected ? dataTableTheme.primary : dataTableTheme.text.muted};
        font-size: 14px;
        transition: transform 0.15s ease;
    }

    &:hover {
        color: ${dataTableTheme.primary};
        background: ${dataTableTheme.primaryGhost};

        svg {
            transform: scale(1.08);
            color: ${dataTableTheme.primary};
        }
    }

    @media (max-width: 1024px) {
        font-size: 11px;

        svg {
            font-size: 13px;
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
    gap: 6px;
    padding: 6px ${dataTableTheme.spacing.sm};
    border-radius: ${dataTableTheme.radius.sm};
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    position: relative;
    height: 32px;
    border: 1.5px solid;

    ${({ $variant = 'secondary', $active = false }) => {
        switch ($variant) {
            case 'primary':
                return `
                    background: linear-gradient(135deg, ${dataTableTheme.primary} 0%, ${dataTableTheme.primaryLight} 100%);
                    color: white;
                    border-color: ${dataTableTheme.primary};
                    box-shadow: ${dataTableTheme.shadow.xs};

                    &:hover {
                        background: linear-gradient(135deg, ${dataTableTheme.primaryDark} 0%, ${dataTableTheme.primary} 100%);
                        transform: translateY(-1px);
                        box-shadow: ${dataTableTheme.shadow.sm};
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
                        box-shadow: ${dataTableTheme.shadow.xs};
                    }
                `;
            default:
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

    @media (max-width: 1024px) {
        padding: 5px ${dataTableTheme.spacing.xs};
        font-size: 11px;
        height: 28px;

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
    padding: ${dataTableTheme.spacing.xl};
    background: ${dataTableTheme.surface};
    border-radius: ${dataTableTheme.radius.lg};
    border: 2px dashed ${dataTableTheme.border};
    text-align: center;
    min-height: 300px;

    @media (max-width: 768px) {
        padding: ${dataTableTheme.spacing.lg};
        min-height: 240px;
    }
`;

export const EmptyStateIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${dataTableTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: ${dataTableTheme.text.tertiary};
    margin-bottom: ${dataTableTheme.spacing.sm};
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);

    @media (max-width: 768px) {
        width: 40px;
        height: 40px;
        font-size: 18px;
    }
`;

export const EmptyStateTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${dataTableTheme.text.primary};
    margin: 0 0 ${dataTableTheme.spacing.xs} 0;
    letter-spacing: -0.025em;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

export const EmptyStateDescription = styled.p`
    font-size: 13px;
    color: ${dataTableTheme.text.secondary};
    margin: 0 0 ${dataTableTheme.spacing.xs} 0;
    line-height: 1.5;

    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

export const EmptyStateAction = styled.p`
    font-size: 12px;
    color: ${dataTableTheme.primary};
    margin: 0;
    font-weight: 500;

    @media (max-width: 768px) {
        font-size: 11px;
    }
`;

export const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete' | 'info' | 'success' | 'secondary';
    $small?: boolean;
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${props => props.$small ? '22px' : '26px'};
    height: ${props => props.$small ? '22px' : '26px'};
    border: none;
    border-radius: ${dataTableTheme.radius.sm};
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: ${props => props.$small ? '10px' : '11px'};
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
                        box-shadow: ${dataTableTheme.shadow.sm};
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
                        box-shadow: ${dataTableTheme.shadow.sm};
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
                        box-shadow: ${dataTableTheme.shadow.sm};
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
                        box-shadow: ${dataTableTheme.shadow.sm};
                    }
                `;
        }
    }}

    @media (max-width: 1024px) {
    width: ${props => props.$small ? '20px' : '24px'};
    height: ${props => props.$small ? '20px' : '24px'};
    font-size: ${props => props.$small ? '9px' : '10px'};
}
`;

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


export const ActionButtons = styled.div`
    display: flex;
    gap: 4px;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: center;
    position: relative;
    z-index: 10;
    overflow: visible !important;

    @media (max-width: 1024px) {
        gap: 3px;
    }
`;

export const StatusBadge = styled.span<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: ${dataTableTheme.radius.md};
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
    white-space: nowrap;

    @media (max-width: 1024px) {
        font-size: 8px;
        padding: 1px 5px;
    }
`;

export const SortIcon = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    color: ${props => props.$active ? dataTableTheme.primary : dataTableTheme.text.muted};
    font-size: 10px;
    transition: color 0.15s ease;
    flex-shrink: 0;

    @media (max-width: 1024px) {
        font-size: 9px;
    }
`;

export const DragHandle = styled.div`
    color: ${dataTableTheme.text.muted};
    font-size: 10px;
    opacity: 0.6;
    transition: opacity 0.15s ease;
    flex-shrink: 0;

    ${HeaderCell}:hover & {
        opacity: 1;
    }

    @media (max-width: 1024px) {
        display: none;
    }
`;

export const ExpandableContent = styled.div<{ $visible: boolean }>`
    overflow: hidden;
    background: ${dataTableTheme.surfaceAlt};
    border-bottom: 1px solid ${dataTableTheme.border};
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

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
    top: -3px;
    right: -3px;
    width: 8px;
    height: 8px;
    background: ${dataTableTheme.status.warning};
    border-radius: 50%;
    border: 1.5px solid ${dataTableTheme.surface};
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
    font-size: 12px;
    color: ${dataTableTheme.primary};
    font-weight: 600;
    padding: 4px ${dataTableTheme.spacing.xs};
    background: ${dataTableTheme.surface};
    border-radius: ${dataTableTheme.radius.sm};
    border: 1px solid ${dataTableTheme.primary}30;
    white-space: nowrap;

    @media (max-width: 1024px) {
        font-size: 11px;
    }
`;

export const BulkActionsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${dataTableTheme.spacing.xs};

    @media (max-width: 768px) {
        flex-wrap: wrap;
    }
`;

export const BulkActionButton = styled.button<{
    $variant?: 'primary' | 'secondary';
}>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px ${dataTableTheme.spacing.sm};
    border-radius: ${dataTableTheme.radius.sm};
    font-weight: 500;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s ease;
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
            default:
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
        font-size: 10px;
    }

    @media (max-width: 1024px) {
        padding: 5px ${dataTableTheme.spacing.xs};
        font-size: 10px;

        span {
            display: none;
        }
    }
`;

export const CardsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${dataTableTheme.spacing.sm};
    padding: ${dataTableTheme.spacing.md};

    @media (max-width: 1200px) {
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: ${dataTableTheme.spacing.xs};
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        padding: ${dataTableTheme.spacing.sm};
    }
`;

export const Card = styled.div<{ $selected?: boolean }>`
    background: ${dataTableTheme.surface};
    border: 2px solid ${props => props.$selected ? dataTableTheme.primary : dataTableTheme.border};
    border-radius: ${dataTableTheme.radius.md};
    padding: ${dataTableTheme.spacing.sm};
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow: ${props => props.$selected ? dataTableTheme.shadow.md : dataTableTheme.shadow.xs};

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        border-color: ${dataTableTheme.primary};
    }

    @media (max-width: 768px) {
        padding: ${dataTableTheme.spacing.xs};
    }
`;