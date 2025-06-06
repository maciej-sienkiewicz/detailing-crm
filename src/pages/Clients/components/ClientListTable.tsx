import React from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaCar, FaHistory, FaSms, FaCheckSquare, FaSquare, FaEye } from 'react-icons/fa';
import { ClientExpanded } from '../../../types';

// Brand Theme System - Automotive Premium
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    accent: '#f8fafc',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
};

interface ClientListTableProps {
    clients: ClientExpanded[];
    selectedClientIds: string[];
    onToggleSelection: (clientId: string) => void;
    onSelectClient: (client: ClientExpanded) => void;
    onEditClient: (client: ClientExpanded) => void;
    onDeleteClient: (clientId: string) => void;
    onShowVehicles: (clientId: string) => void;
    onAddContactAttempt: (client: ClientExpanded) => void;
    onSendSMS: (client: ClientExpanded) => void;
}

const ClientListTable: React.FC<ClientListTableProps> = ({
                                                             clients,
                                                             selectedClientIds,
                                                             onToggleSelection,
                                                             onSelectClient,
                                                             onEditClient,
                                                             onDeleteClient,
                                                             onShowVehicles,
                                                             onAddContactAttempt,
                                                             onSendSMS
                                                         }) => {
    // Helper function to format dates
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Helper function to handle action clicks
    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <TableContainer>
            <TableHeader>
                <HeaderCell width="60px">
                    <SelectionHeader>
                        <FaCheckSquare />
                    </SelectionHeader>
                </HeaderCell>
                <HeaderCell width="25%">
                    <HeaderContent>
                        <HeaderLabel>Klient</HeaderLabel>
                    </HeaderContent>
                </HeaderCell>
                <HeaderCell width="20%">
                    <HeaderContent>
                        <HeaderLabel>Kontakt</HeaderLabel>
                    </HeaderContent>
                </HeaderCell>
                <HeaderCell width="18%">
                    <HeaderContent>
                        <HeaderLabel>Firma</HeaderLabel>
                    </HeaderContent>
                </HeaderCell>
                <HeaderCell width="15%">
                    <HeaderContent>
                        <HeaderLabel>Statystyki</HeaderLabel>
                    </HeaderContent>
                </HeaderCell>
                <HeaderCell width="12%">
                    <HeaderContent>
                        <HeaderLabel>Przychody</HeaderLabel>
                    </HeaderContent>
                </HeaderCell>
                <HeaderCell width="10%">
                    <HeaderContent>
                        <HeaderLabel>Akcje</HeaderLabel>
                    </HeaderContent>
                </HeaderCell>
            </TableHeader>

            <TableBody>
                {clients.map(client => (
                    <TableRow key={client.id}>
                        {/* Selection Cell */}
                        <TableCell width="60px">
                            <SelectionCell onClick={(e) => handleActionClick(e, () => onToggleSelection(client.id))}>
                                <SelectionCheckbox $selected={selectedClientIds.includes(client.id)}>
                                    {selectedClientIds.includes(client.id) ? <FaCheckSquare /> : <FaSquare />}
                                </SelectionCheckbox>
                            </SelectionCell>
                        </TableCell>

                        {/* Client Info Cell */}
                        <TableCell width="25%" onClick={() => onSelectClient(client)}>
                            <ClientInfo>
                                <ClientName>{client.firstName} {client.lastName}</ClientName>
                                {client.lastVisitDate && (
                                    <ClientSubInfo>
                                        <LastVisitLabel>Ostatnia wizyta:</LastVisitLabel>
                                        <LastVisitDate>{formatDate(client.lastVisitDate)}</LastVisitDate>
                                    </ClientSubInfo>
                                )}
                            </ClientInfo>
                        </TableCell>

                        {/* Contact Info Cell */}
                        <TableCell width="20%" onClick={() => onSelectClient(client)}>
                            <ContactInfo>
                                <ContactItem>
                                    <ContactIcon>@</ContactIcon>
                                    <ContactText>{client.email}</ContactText>
                                </ContactItem>
                                <ContactItem>
                                    <ContactIcon>📞</ContactIcon>
                                    <ContactText>{client.phone}</ContactText>
                                </ContactItem>
                            </ContactInfo>
                        </TableCell>

                        {/* Company Info Cell */}
                        <TableCell width="18%" onClick={() => onSelectClient(client)}>
                            <CompanyInfo>
                                {client.company ? (
                                    <>
                                        <CompanyName>{client.company}</CompanyName>
                                        {client.taxId && (
                                            <CompanyDetails>
                                                <TaxLabel>NIP:</TaxLabel>
                                                <TaxValue>{client.taxId}</TaxValue>
                                            </CompanyDetails>
                                        )}
                                    </>
                                ) : (
                                    <EmptyField>Brak danych firmowych</EmptyField>
                                )}
                            </CompanyInfo>
                        </TableCell>

                        {/* Statistics Cell */}
                        <TableCell width="15%" onClick={() => onSelectClient(client)}>
                            <StatsContainer>
                                <StatItem>
                                    <StatValue>{client.totalVisits}</StatValue>
                                    <StatLabel>wizyt</StatLabel>
                                </StatItem>
                                <StatItem>
                                    <StatValue>{client.contactAttempts}</StatValue>
                                    <StatLabel>kontaktów</StatLabel>
                                </StatItem>
                            </StatsContainer>
                        </TableCell>

                        {/* Revenue Cell */}
                        <TableCell width="12%" onClick={() => onSelectClient(client)}>
                            <RevenueDisplay>
                                <RevenueAmount>{client.totalRevenue.toFixed(2)}</RevenueAmount>
                                <RevenueCurrency>PLN</RevenueCurrency>
                            </RevenueDisplay>
                        </TableCell>

                        {/* Actions Cell */}
                        <TableCell width="10%">
                            <ActionButtons>
                                <ActionButton
                                    title="Zobacz szczegóły"
                                    $variant="view"
                                    onClick={(e) => handleActionClick(e, () => onSelectClient(client))}
                                >
                                    <FaEye />
                                </ActionButton>

                                <ActionButton
                                    title="Edytuj klienta"
                                    $variant="edit"
                                    onClick={(e) => handleActionClick(e, () => onEditClient(client))}
                                >
                                    <FaEdit />
                                </ActionButton>

                                <ActionButton
                                    title="Pojazdy klienta"
                                    $variant="secondary"
                                    onClick={(e) => handleActionClick(e, () => onShowVehicles(client.id))}
                                >
                                    <FaCar />
                                </ActionButton>

                                <ActionButton
                                    title="Dodaj próbę kontaktu"
                                    $variant="secondary"
                                    onClick={(e) => handleActionClick(e, () => onAddContactAttempt(client))}
                                >
                                    <FaHistory />
                                </ActionButton>

                                <ActionButton
                                    title="Wyślij SMS"
                                    $variant="secondary"
                                    onClick={(e) => handleActionClick(e, () => onSendSMS(client))}
                                >
                                    <FaSms />
                                </ActionButton>

                                <ActionButton
                                    title="Usuń klienta"
                                    $variant="delete"
                                    onClick={(e) => handleActionClick(e, () => onDeleteClient(client.id))}
                                >
                                    <FaTrash />
                                </ActionButton>
                            </ActionButtons>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </TableContainer>
    );
};

// Modern Styled Components - Premium Automotive Design
const TableContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: 16px;
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    min-height: 56px;
`;

const HeaderCell = styled.div<{ width: string }>`
    flex: 0 0 ${props => props.width};
    width: ${props => props.width};
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

const SelectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    color: ${brandTheme.neutral};
    font-size: 16px;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
`;

const HeaderLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: #374151;
`;

const TableBody = styled.div`
    background: ${brandTheme.surface};
`;

const TableRow = styled.div`
    display: flex;
    border-bottom: 1px solid ${brandTheme.border};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.surfaceAlt};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.div<{ width: string }>`
    flex: 0 0 ${props => props.width};
    width: ${props => props.width};
    padding: 16px;
    display: flex;
    align-items: center;
    min-height: 72px;
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

// Cell Content Components
const SelectionCell = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    cursor: pointer;
`;

const SelectionCheckbox = styled.div<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    transition: all 0.2s ease;
    color: ${props => props.$selected ? brandTheme.primary : brandTheme.neutral};
    font-size: 16px;

    &:hover {
        color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
        transform: scale(1.1);
    }
`;

const ClientInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
`;

const ClientName = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.4;
`;

const ClientSubInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

const LastVisitLabel = styled.span`
    font-size: 12px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const LastVisitDate = styled.span`
    font-size: 12px;
    color: ${brandTheme.primary};
    font-weight: 600;
    background: ${brandTheme.primaryGhost};
    padding: 2px 6px;
    border-radius: 4px;
`;

const ContactInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
`;

const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ContactIcon = styled.div`
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: ${brandTheme.neutral};
    background: ${brandTheme.surfaceAlt};
    border-radius: 4px;
    flex-shrink: 0;
`;

const ContactText = styled.div`
    font-size: 14px;
    color: #374151;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const CompanyInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
`;

const CompanyName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.4;
`;

const CompanyDetails = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const TaxLabel = styled.span`
    font-size: 12px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const TaxValue = styled.span`
    font-size: 12px;
    color: #374151;
    font-weight: 600;
    background: ${brandTheme.surfaceAlt};
    padding: 2px 6px;
    border-radius: 4px;
`;

const EmptyField = styled.div`
    font-size: 14px;
    color: ${brandTheme.neutral};
    font-style: italic;
`;

const StatsContainer = styled.div`
    display: flex;
    gap: 16px;
    width: 100%;
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 12px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 8px;
    border: 1px solid ${brandTheme.border};
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        transform: translateY(-1px);
    }
`;

const StatValue = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${brandTheme.primary};
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: ${brandTheme.neutral};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const RevenueDisplay = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    width: 100%;
    padding: 8px 12px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
    border-radius: 8px;
    border: 1px solid rgba(16, 185, 129, 0.2);
`;

const RevenueAmount = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${brandTheme.success};
`;

const RevenueCurrency = styled.div`
    font-size: 11px;
    color: ${brandTheme.neutral};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 4px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
    width: 100%;
`;

const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete' | 'secondary';
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;

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
                        box-shadow: 0 4px 8px ${brandTheme.primaryGhost};
                    }
                `;
        case 'edit':
            return `
                    background: rgba(245, 158, 11, 0.1);
                    color: #f59e0b;
                    &:hover {
                        background: #f59e0b;
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
                    }
                `;
        case 'delete':
            return `
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    &:hover {
                        background: #ef4444;
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
                    }
                `;
        case 'secondary':
            return `
                    background: ${brandTheme.surfaceAlt};
                    color: ${brandTheme.neutral};
                    &:hover {
                        background: ${brandTheme.neutral};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 8px rgba(100, 116, 139, 0.2);
                    }
                `;
    }
}}
`;

export default ClientListTable;