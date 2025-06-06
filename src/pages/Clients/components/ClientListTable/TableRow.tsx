// ClientListTable/TableRow.tsx
import React from 'react';
import {
    FaCheckSquare,
    FaSquare,
    FaEye,
    FaEdit,
    FaTrash,
    FaCar,
    FaHistory,
    FaSms,
    FaEnvelope,
    FaPhone,
    FaBuilding
} from 'react-icons/fa';
import { TableColumn } from './types';
import { getClientStatus, formatCurrency, formatDate } from './utils/clientUtils';
import {
    StyledTableRow,
    TableCell,
    SelectionCheckbox,
    ClientInfo,
    ClientName,
    StatusBadge,
    LastVisit,
    ContactInfo,
    ContactItem,
    ContactIcon,
    ContactText,
    CompanyInfo,
    CompanyName,
    TaxId,
    EmptyCompany,
    MetricsContainer,
    MetricItem,
    MetricValue,
    MetricLabel,
    MetricSeparator,
    RevenueDisplay,
    RevenueAmount,
    ActionButtons,
    ActionButton
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
                        {client.lastVisitDate && (
                            <LastVisit>
                                Ostatnia wizyta: {formatDate(client.lastVisitDate)}
                            </LastVisit>
                        )}
                    </ClientInfo>
                );

            case 'contact':
                return (
                    <ContactInfo>
                        <ContactItem>
                            <ContactIcon>
                                <FaEnvelope />
                            </ContactIcon>
                            <ContactText>{client.email}</ContactText>
                        </ContactItem>
                        <ContactItem>
                            <ContactIcon>
                                <FaPhone />
                            </ContactIcon>
                            <ContactText>{client.phone}</ContactText>
                        </ContactItem>
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

            case 'metrics':
                return (
                    <MetricsContainer>
                        <MetricItem>
                            <MetricValue>{client.totalVisits}</MetricValue>
                            <MetricLabel>wizyt</MetricLabel>
                        </MetricItem>
                        <MetricSeparator>•</MetricSeparator>
                        <MetricItem>
                            <MetricValue>{client.totalTransactions || 0}</MetricValue>
                            <MetricLabel>transakcji</MetricLabel>
                        </MetricItem>
                    </MetricsContainer>
                );

            case 'revenue':
                return (
                    <RevenueDisplay>
                        <RevenueAmount>
                            {formatCurrency(client.totalRevenue)}
                        </RevenueAmount>
                    </RevenueDisplay>
                );

            case 'actions':
                return (
                    <ActionButtons>
                        <ActionButton
                            onClick={(e) => onQuickAction('edit', client, e)}
                            title="Edytuj klienta"
                            $variant="secondary"
                        >
                            <FaEdit />
                        </ActionButton>
                        <ActionButton
                            onClick={(e) => onQuickAction('vehicles', client, e)}
                            title="Pojazdy klienta"
                            $variant="secondary"
                        >
                            <FaCar />
                        </ActionButton>
                        <ActionButton
                            onClick={(e) => onQuickAction('contact', client, e)}
                            title="Dodaj kontakt"
                            $variant="secondary"
                        >
                            <FaHistory />
                        </ActionButton>
                        <ActionButton
                            onClick={(e) => onQuickAction('delete', client, e)}
                            title="Usuń klienta"
                            $variant="secondary"
                        >
                            <FaTrash />
                        </ActionButton>
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