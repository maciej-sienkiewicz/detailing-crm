import React from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaCar, FaHistory, FaSms } from 'react-icons/fa';
import { ClientExpanded } from '../../../types';

interface ClientListTableProps {
    clients: ClientExpanded[];
    onSelectClient: (client: ClientExpanded) => void;
    onEditClient: (client: ClientExpanded) => void;
    onDeleteClient: (clientId: string) => void;
    onShowVehicles: (clientId: string) => void;
    onAddContactAttempt: (client: ClientExpanded) => void;
    onSendSMS: (client: ClientExpanded) => void;
}

const ClientListTable: React.FC<ClientListTableProps> = ({
                                                             clients,
                                                             onSelectClient,
                                                             onEditClient,
                                                             onDeleteClient,
                                                             onShowVehicles,
                                                             onAddContactAttempt,
                                                             onSendSMS
                                                         }) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeader>Imię i nazwisko</TableHeader>
                        <TableHeader>Kontakt</TableHeader>
                        <TableHeader>Firma</TableHeader>
                        <TableHeader>Wizyty</TableHeader>
                        <TableHeader>Przychody</TableHeader>
                        <TableHeader>Akcje</TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {clients.map(client => (
                        <TableRow key={client.id} onClick={() => onSelectClient(client)}>
                            <TableCell>
                                <ClientName>{client.firstName} {client.lastName}</ClientName>
                                {client.lastVisitDate && (
                                    <LastVisit>Ostatnia wizyta: {formatDate(client.lastVisitDate)}</LastVisit>
                                )}
                            </TableCell>
                            <TableCell>
                                <ContactInfo>
                                    <div>{client.email}</div>
                                    <div>{client.phone}</div>
                                </ContactInfo>
                            </TableCell>
                            <TableCell>
                                {client.company && (
                                    <>
                                        <div>{client.company}</div>
                                        {client.taxId && <CompanyId>NIP: {client.taxId}</CompanyId>}
                                    </>
                                )}
                            </TableCell>
                            <TableCell>
                                <MetricsCell>
                                    <MetricItem>
                                        <MetricValue>{client.totalVisits}</MetricValue>
                                        <MetricLabel>wizyt</MetricLabel>
                                    </MetricItem>
                                    <MetricItem>
                                        <MetricValue>{client.totalTransactions}</MetricValue>
                                        <MetricLabel>transakcji</MetricLabel>
                                    </MetricItem>
                                </MetricsCell>
                            </TableCell>
                            <TableCell>
                                <Revenue>{client.totalRevenue.toFixed(2)} zł</Revenue>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <ActionButtons>
                                    <ActionButton title="Edytuj klienta" onClick={() => onEditClient(client)}>
                                        <FaEdit />
                                    </ActionButton>

                                    <ActionButton title="Pokaż pojazdy klienta" onClick={() => onShowVehicles(client.id)}>
                                        <FaCar />
                                    </ActionButton>

                                    <ActionButton title="Dodaj próbę kontaktu" onClick={() => onAddContactAttempt(client)}>
                                        <FaHistory />
                                    </ActionButton>

                                    <ActionButton title="Wyślij SMS" onClick={() => onSendSMS(client)}>
                                        <FaSms />
                                    </ActionButton>

                                    <ActionButton
                                        title="Usuń klienta"
                                        danger
                                        onClick={() => onDeleteClient(client.id)}
                                    >
                                        <FaTrash />
                                    </ActionButton>
                                </ActionButtons>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

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

// Styled components
const TableContainer = styled.div`
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #f5f5f5;
  border-bottom: 2px solid #eee;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  cursor: pointer;
  
  &:not(:last-child) {
    border-bottom: 1px solid #eee;
  }

  &:hover {
    background-color: #f9f9f9;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #333;
`;

const TableCell = styled.td`
  padding: 12px 16px;
  vertical-align: middle;
`;

const ClientName = styled.div`
  font-weight: 500;
  font-size: 15px;
  color: #34495e;
`;

const LastVisit = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 2px;
`;

const ContactInfo = styled.div`
  font-size: 14px;
  color: #34495e;
  
  > div {
    margin-bottom: 2px;
  }
`;

const CompanyId = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const MetricsCell = styled.div`
  display: flex;
  gap: 12px;
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MetricValue = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #3498db;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const Revenue = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #2ecc71;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  background: none;
  border: none;
  color: ${props => props.danger ? '#e74c3c' : '#3498db'};
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;

  &:hover {
    background-color: ${props => props.danger ? '#fdecea' : '#f0f7ff'};
  }
`;

export default ClientListTable;