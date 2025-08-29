import React from 'react';
import styled from 'styled-components';
import {
    FaCheckCircle,
    FaDownload,
    FaEye,
    FaSort,
    FaSortDown,
    FaSortUp,
    FaSpinner,
    FaTimesCircle,
    FaTrash
} from 'react-icons/fa';
import {InvoiceTemplate, SortDirection, SortField} from '../../types/invoiceTemplate';
import {settingsTheme} from '../../pages/Settings/styles/theme';

interface TemplatesTableProps {
    templates: InvoiceTemplate[];
    sortField: SortField;
    sortDirection: SortDirection;
    isActivating: string | null;
    isDeleting: string | null;
    isGeneratingPreview: string | null;
    onSort: (field: SortField) => void;
    onActivate: (templateId: string) => void;
    onPreview: (template: InvoiceTemplate) => void;
    onExport: (template: InvoiceTemplate) => void;
    onDelete: (templateId: string) => void;
}

export const TemplatesTable: React.FC<TemplatesTableProps> = ({
                                                                  templates,
                                                                  sortField,
                                                                  sortDirection,
                                                                  isActivating,
                                                                  isDeleting,
                                                                  isGeneratingPreview,
                                                                  onSort,
                                                                  onActivate,
                                                                  onPreview,
                                                                  onExport,
                                                                  onDelete
                                                              }) => {
    const formatDate = (dateArray: number[]) => {
        if (!Array.isArray(dateArray) || dateArray.length < 6) {
            return 'Nieprawidłowa data';
        }

        const [year, month, day, hour, minute, second] = dateArray;
        const date = new Date(year, month - 1, day, hour, minute, second);

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <FaSort />;
        if (sortDirection === 'asc') return <FaSortUp />;
        if (sortDirection === 'desc') return <FaSortDown />;
        return <FaSort />;
    };

    return (
        <TableContainer>
            <TableHeader>
                <TableTitle>
                    Szablony faktur ({templates.length})
                </TableTitle>
            </TableHeader>

            <TableWrapper>
                <Table>
                    <TableHead>
                        <TableRowHeader>
                            <SortableHeaderCell onClick={() => onSort('name')}>
                                <HeaderContent>
                                    Szablon
                                    <SortIcon>{getSortIcon('name')}</SortIcon>
                                </HeaderContent>
                            </SortableHeaderCell>
                            <SortableHeaderCell onClick={() => onSort('isActive')} width="120px">
                                <HeaderContent>
                                    Status
                                    <SortIcon>{getSortIcon('isActive')}</SortIcon>
                                </HeaderContent>
                            </SortableHeaderCell>
                            <SortableHeaderCell onClick={() => onSort('createdAt')} width="200px">
                                <HeaderContent>
                                    Data utworzenia
                                    <SortIcon>{getSortIcon('createdAt')}</SortIcon>
                                </HeaderContent>
                            </SortableHeaderCell>
                            <TableHeaderCell width="160px">Akcje</TableHeaderCell>
                        </TableRowHeader>
                    </TableHead>
                    <TableBody>
                        {templates.map(template => (
                            <TableRow key={template.id}>
                                <TableCell>
                                    <TemplateInfo>
                                        <TemplateName>{template.name}</TemplateName>
                                        {template.description && (
                                            <TemplateDescription>{template.description}</TemplateDescription>
                                        )}
                                    </TemplateInfo>
                                </TableCell>

                                <TableCell>
                                    <StatusBadge $isActive={template.isActive}>
                                        <StatusIcon>
                                            {template.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                                        </StatusIcon>
                                        <StatusText>
                                            {template.isActive ? 'Aktywny' : 'Nieaktywny'}
                                        </StatusText>
                                    </StatusBadge>
                                </TableCell>

                                <TableCell>
                                    <DateValue>{formatDate(template.createdAt)}</DateValue>
                                </TableCell>

                                <TableCell>
                                    <ActionButtons>
                                        <ActionButton
                                            onClick={() => onPreview(template)}
                                            disabled={isGeneratingPreview === template.id}
                                            title="Podgląd szablonu"
                                            $variant="view"
                                        >
                                            {isGeneratingPreview === template.id ? (
                                                <FaSpinner className="spinning" />
                                            ) : (
                                                <FaEye />
                                            )}
                                        </ActionButton>

                                        <ActionButton
                                            onClick={() => onExport(template)}
                                            title="Pobierz szablon"
                                            $variant="view"
                                        >
                                            <FaDownload />
                                        </ActionButton>

                                        {!template.isActive && (
                                            <ActionButton
                                                onClick={() => onActivate(template.id)}
                                                disabled={isActivating === template.id}
                                                title="Ustaw jako aktywny"
                                                $variant="view"
                                            >
                                                {isActivating === template.id ? (
                                                    <FaSpinner className="spinning" />
                                                ) : (
                                                    <FaCheckCircle />
                                                )}
                                            </ActionButton>
                                        )}

                                        {!template.isActive && (
                                            <ActionButton
                                                onClick={() => onDelete(template.id)}
                                                disabled={isDeleting === template.id}
                                                title="Usuń szablon"
                                                $variant="view"
                                            >
                                                {isDeleting === template.id ? (
                                                    <FaSpinner className="spinning" />
                                                ) : (
                                                    <FaTrash />
                                                )}
                                            </ActionButton>
                                        )}
                                    </ActionButtons>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableWrapper>
        </TableContainer>
    );
};

// Styled Components - bazowane na CalendarColorsPage
const TableContainer = styled.div`
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    overflow: hidden;
    box-shadow: ${settingsTheme.shadow.sm};
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const TableHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${settingsTheme.spacing.lg};
    border-bottom: 1px solid ${settingsTheme.border};
    background: ${settingsTheme.surfaceAlt};
    flex-shrink: 0;
`;

const TableTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
`;

const TableWrapper = styled.div`
    flex: 1;
    overflow: auto;
    min-height: 0;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHead = styled.thead`
    background: ${settingsTheme.surfaceAlt};
    border-bottom: 2px solid ${settingsTheme.border};
    position: sticky;
    top: 0;
    z-index: 10;
`;

const TableRowHeader = styled.tr``;

const TableHeaderCell = styled.th<{ width?: string }>`
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.md};
    text-align: left;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    font-size: 14px;
    border-right: 1px solid ${settingsTheme.border};
    width: ${props => props.width || 'auto'};

    &:last-child {
        border-right: none;
    }
`;

const SortableHeaderCell = styled(TableHeaderCell)`
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;

    &:hover {
        background: ${settingsTheme.primaryGhost};
        color: ${settingsTheme.primary};
    }
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
`;

const SortIcon = styled.span`
    opacity: 0.6;
    font-size: 12px;
    transition: opacity 0.2s ease;

    ${SortableHeaderCell}:hover & {
        opacity: 1;
    }
`;

const TableBody = styled.tbody`
    background: ${settingsTheme.surface};
`;

const TableRow = styled.tr`
    border-bottom: 1px solid ${settingsTheme.borderLight};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        background: ${settingsTheme.surfaceHover};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.td`
    padding: ${settingsTheme.spacing.md};
    border-right: 1px solid ${settingsTheme.borderLight};
    vertical-align: middle;

    &:last-child {
        border-right: none;
    }
`;

const TemplateInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xs};
`;

const TemplateName = styled.div`
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    font-size: 14px;
`;

const TemplateDescription = styled.div`
    font-size: 13px;
    color: ${settingsTheme.text.secondary};
    line-height: 1.4;
    max-width: 400px;
`;

const TemplateVersion = styled.div`
    font-size: 11px;
    color: ${settingsTheme.text.muted};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatusBadge = styled.div<{ $isActive: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
    padding: 6px 12px;
    border-radius: ${settingsTheme.radius.md};
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;

    ${({ $isActive }) => $isActive ? `
        background: ${settingsTheme.status.successLight};
        color: ${settingsTheme.status.success};
        border: 1px solid ${settingsTheme.status.success}30;
    ` : `
        background: ${settingsTheme.surfaceAlt};
        color: ${settingsTheme.text.muted};
        border: 1px solid ${settingsTheme.border};
    `}
`;

const StatusIcon = styled.span`
    font-size: 10px;
`;

const StatusText = styled.span``;

const DateValue = styled.div`
    font-size: 14px;
    color: ${settingsTheme.text.primary};
    font-weight: 500;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
    letter-spacing: 0.25px;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.xs};
    align-items: center;
`;

const ActionButton = styled.button<{
    $variant: 'view' | 'download' | 'activate' | 'delete';
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: ${settingsTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 13px;
    position: relative;
    overflow: hidden;

    ${({ $variant }) => {
        switch ($variant) {
            case 'view':
                return `
                    background: ${settingsTheme.primaryGhost};
                    color: ${settingsTheme.primary};
                    &:hover:not(:disabled) {
                        background: ${settingsTheme.primary};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${settingsTheme.shadow.md};
                    }
                `;
            case 'download':
                return `
                    background: ${settingsTheme.surfaceAlt};
                    color: ${settingsTheme.text.secondary};
                    &:hover:not(:disabled) {
                        background: ${settingsTheme.text.muted};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${settingsTheme.shadow.md};
                    }
                `;
            case 'activate':
                return `
                    background: ${settingsTheme.status.successLight};
                    color: ${settingsTheme.status.success};
                    &:hover:not(:disabled) {
                        background: ${settingsTheme.status.success};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${settingsTheme.shadow.md};
                    }
                `;
            case 'delete':
                return `
                    background: ${settingsTheme.status.errorLight};
                    color: ${settingsTheme.status.error};
                    &:hover:not(:disabled) {
                        background: ${settingsTheme.status.error};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${settingsTheme.shadow.md};
                    }
                `;
        }
    }}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    &:active:not(:disabled) {
        transform: translateY(-1px);
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;