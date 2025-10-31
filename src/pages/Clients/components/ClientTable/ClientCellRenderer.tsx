    import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ClientExpanded } from '../../../../types';
import {
    TooltipWrapper,
    ActionButton,
    ActionButtons,
    StatusBadge
} from '../../../../components/common/DataTable';
import { formatCurrency, formatDate, getClientStatus } from './utils';
import {
    SelectionCheckbox,
    ClientInfo,
    ClientName,
    ContactInfo,
    ContactItem,
    ContactIcon,
    ContactText,
    CompanyInfo,
    CompanyName,
    TaxId,
    EmptyCompany,
    LastVisitDate,
    MetricsContainer,
    MetricItem,
    MetricValue,
    MetricLabel,
    MetricSeparator,
    RevenueDisplay,
    RevenueAmount
} from './styled';
import { ContextMenu, ContextMenuItem } from '../../../../components/common/ContextMenu';

interface ClientCellRendererProps {
    client: ClientExpanded;
    columnId: string;
    selectedClientIds: string[];
    onToggleSelection: (clientId: string) => void;
    onSelectClient: (client: ClientExpanded) => void;
    onEditClient: (client: ClientExpanded) => void;
    onDeleteClient: (clientId: string) => void;
    onShowVehicles: (clientId: string) => void;
    onAddContactAttempt: (client: ClientExpanded) => void;
    onSendSMS: (client: ClientExpanded) => void;
}

export const ClientCellRenderer: React.FC<ClientCellRendererProps> = ({
                                                                          client,
                                                                          columnId,
                                                                          selectedClientIds,
                                                                          onToggleSelection,
                                                                          onEditClient,
                                                                          onDeleteClient,
                                                                      }) => {
    const navigate = useNavigate();
    const status = getClientStatus(client);
    const isSelected = selectedClientIds.includes(client.id);

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    const handleViewClient = () => {
        navigate(`/clients/${client.id}`);
    };

    switch (columnId) {
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
                    {client.email && client.email.trim() !== "" && (
                        <ContactItem>
                            <ContactIcon>
                                <FaEnvelope />
                            </ContactIcon>
                            <ContactText>{client.email}</ContactText>
                        </ContactItem>
                    )}
                    {client.phone && client.phone.trim() !== "" && (
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
            const menuItems: ContextMenuItem[] = [
                {
                    id: 'view',
                    label: 'Zobacz szczegóły',
                    icon: FaEye,
                    onClick: () => handleViewClient(),
                    variant: 'primary'
                },
                {
                    id: 'edit',
                    label: 'Edytuj klienta',
                    icon: FaEdit,
                    onClick: () => onEditClient(client),
                    variant: 'default'
                },
                {
                    id: 'delete',
                    label: 'Usuń klienta',
                    icon: FaTrash,
                    onClick: () => onDeleteClient(client.id),
                    variant: 'danger'
                }
            ];

            return (
                <ActionButtons onClick={(e) => e.stopPropagation()}>
                    <ContextMenu items={menuItems} size="medium" />
                </ActionButtons>
            );

        default:
            return null;
    }
};