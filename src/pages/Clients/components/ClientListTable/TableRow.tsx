// ClientListTable/TableRow.tsx - Updated with new columns and tooltips
import React from 'react';
import {
    FaBuilding,
    FaCalendarAlt,
    FaCheckSquare,
    FaEdit,
    FaEnvelope,
    FaEye,
    FaPhone,
    FaSquare,
    FaTrash
} from 'react-icons/fa';
import {TableColumn} from './types';
import {formatCurrency, formatDate, getClientStatus} from './utils/clientUtils';
import {
    ActionButton,
    ActionButtons,
    ClientInfo,
    ClientName,
    CompanyInfo,
    CompanyName,
    ContactIcon,
    ContactInfo,
    ContactItem,
    ContactText,
    EmptyCompany,
    LastVisitDate,
    MetricItem,
    MetricLabel,
    MetricsContainer,
    MetricSeparator,
    MetricValue,
    RevenueAmount,
    RevenueDisplay,
    SelectionCheckbox,
    StatusBadge,
    StyledTableRow,
    TableCell,
    TaxId,
    TooltipWrapper
} from './styles/components';
import {ClientExpanded} from "../../../../types";

interface TableRowProps {
    client: ClientExpanded;
    columns: TableColumn[];
    selectedClientIds: string[];
    onToggleSelection: (clientId: string) => void;
    onSelectClient: (client: ClientExpanded) => void;
    onQuickAction: (action: string, client: ClientExpanded, e: React.MouseEvent) => void;
}

export const TableRow: React.FC<TableRowProps> = ({
                                                      client,
                                                      columns,
                                                      selectedClientIds,
                                                      onToggleSelection,
                                                      onSelectClient,
                                                      onQuickAction
                                                  }) => {
    const status = getClientStatus(client);
    const isSelected = selectedClientIds.includes(client.id);

    const renderCellContent = (column: TableColumn) => {
        switch (column.id) {
            case 'selection':
                return (
                    <SelectionCheckbox
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSelection(client.id);
                        }}
                        $selected={isSelected}
                    >
                        {isSelected ? <FaCheckSquare /> : <FaSquare />}
                    </SelectionCheckbox>
                );

            case 'client':
                return (
                    <ClientInfo>
                        <ClientName>
                            {client.firstName} {client.lastName}
                            <StatusBadge $color={status.color}>
                                {status.label}
                            </StatusBadge>
                        </ClientName>
                    </ClientInfo>
                );

            case 'contact':
                return (
                    <ContactInfo>
                        {client.email && client.email.trim() != "" && (
                            <ContactItem>
                                <ContactIcon>
                                    <FaEnvelope />
                                </ContactIcon>
                                <ContactText>{client.email}</ContactText>
                            </ContactItem>
                        )}
                        {client.phone && client.phone.trim() != "" && (
                            <ContactItem>
                                <ContactIcon>
                                    <FaPhone />
                                </ContactIcon>
                                <ContactText>{client.phone}</ContactText>
                            </ContactItem>
                        )}
                    </ContactInfo>
                );

            case 'company':
                return (
                    <CompanyInfo>
                        {client.company ? (
                            <>
                                <CompanyName>
                                    <FaBuilding />
                                    {client.company}
                                </CompanyName>
                                {client.taxId && (
                                    <TaxId>NIP: {client.taxId}</TaxId>
                                )}
                            </>
                        ) : (
                            <EmptyCompany>
                                Klient indywidualny
                            </EmptyCompany>
                        )}
                    </CompanyInfo>
                );

            case 'lastVisit':
                return (
                    <TooltipWrapper title={client.lastVisitDate ? `Data ostatniej wizyty: ${formatDate(client.lastVisitDate)}` : 'Brak wizyt'}>
                        <LastVisitDate>
                            {client.lastVisitDate ? (
                                <>
                                    <FaCalendarAlt />
                                    <span>{formatDate(client.lastVisitDate)}</span>
                                </>
                            ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Brak wizyt</span>
                            )}
                        </LastVisitDate>
                    </TooltipWrapper>
                );

            case 'metrics':
                return (
                    <TooltipWrapper title={`Wizyty: ${client.totalVisits} | Pojazdy: ${client.vehicles?.length || 0}`}>
                        <MetricsContainer>
                            <MetricItem>
                                <MetricValue>{client.totalVisits}</MetricValue>
                                <MetricLabel>wizyt</MetricLabel>
                            </MetricItem>
                            <MetricSeparator>•</MetricSeparator>
                            <MetricItem>
                                <MetricValue>{client.vehicles?.length || 0}</MetricValue>
                                <MetricLabel>pojazdów</MetricLabel>
                            </MetricItem>
                        </MetricsContainer>
                    </TooltipWrapper>
                );

            case 'revenue':
                return (
                    <TooltipWrapper title={`Łączne przychody od klienta: ${formatCurrency(client.totalRevenue)}`}>
                        <RevenueDisplay>
                            <RevenueAmount>
                                {formatCurrency(client.totalRevenue)}
                            </RevenueAmount>
                        </RevenueDisplay>
                    </TooltipWrapper>
                );

            case 'actions':
                return (
                    <ActionButtons>
                        <TooltipWrapper title="Zobacz szczegóły klienta">
                            <ActionButton
                                onClick={(e) => onQuickAction('view', client, e)}
                                $variant="secondary"
                            >
                                <FaEye />
                            </ActionButton>
                        </TooltipWrapper>
                        <TooltipWrapper title="Edytuj dane klienta">
                            <ActionButton
                                onClick={(e) => onQuickAction('edit', client, e)}
                                $variant="secondary"
                            >
                                <FaEdit />
                            </ActionButton>
                        </TooltipWrapper>
                        <TooltipWrapper title="Usuń klienta">
                            <ActionButton
                                onClick={(e) => onQuickAction('delete', client, e)}
                                $variant="secondary"
                            >
                                <FaTrash />
                            </ActionButton>
                        </TooltipWrapper>
                    </ActionButtons>
                );

            default:
                return null;
        }
    };

    return (
        <StyledTableRow
            onClick={() => onSelectClient(client)}
            $selected={isSelected}
        >
            {columns.map(column => (
                <TableCell
                    key={`${client.id}-${column.id}`}
                    $width={column.width}
                >
                    {renderCellContent(column)}
                </TableCell>
            ))}
        </StyledTableRow>
    );
};