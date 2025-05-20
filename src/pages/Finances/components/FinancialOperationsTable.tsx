// src/pages/Finances/components/FinancialOperationsTable.tsx
import React from 'react';
import styled from 'styled-components';
import { FaEye, FaEdit, FaTrashAlt, FaFileInvoiceDollar, FaReceipt, FaMoneyBillWave, FaExchangeAlt } from 'react-icons/fa';
import {
    FinancialOperation,
    FinancialOperationType,
    TransactionDirection,
    TransactionDirectionColors,
    PaymentStatus,
    PaymentStatusLabels,
    PaymentStatusColors,
    PaymentMethodLabels
} from '../../../types';

interface FinancialOperationsTableProps {
    operations: FinancialOperation[];
    isLoading: boolean;
    onView: (operation: FinancialOperation) => void;
    onEdit: (operation: FinancialOperation) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: PaymentStatus) => void;
}

const FinancialOperationsTable: React.FC<FinancialOperationsTableProps> = ({
                                                                               operations,
                                                                               isLoading,
                                                                               onView,
                                                                               onEdit,
                                                                               onDelete,
                                                                               onStatusChange
                                                                           }) => {
    // Funkcja zwracająca ikonę dla typu operacji
    const getOperationIcon = (type: FinancialOperationType) => {
        switch (type) {
            case FinancialOperationType.INVOICE:
                return <FaFileInvoiceDollar />;
            case FinancialOperationType.RECEIPT:
                return <FaReceipt />;
            case FinancialOperationType.OTHER:
                return <FaExchangeAlt />;
            default:
                return <FaExchangeAlt />;
        }
    };

    // Funkcja formatująca datę
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    // Funkcja formatująca kwotę
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Funkcja pobierająca typ dokumentu jako tekst
    const getOperationTypeText = (type: FinancialOperationType): string => {
        switch (type) {
            case FinancialOperationType.INVOICE:
                return 'Faktura';
            case FinancialOperationType.RECEIPT:
                return 'Paragon';
            case FinancialOperationType.OTHER:
                return 'Inna';
            default:
                return 'Nieznany';
        }
    };

    // Obsługa potwierdzenia usunięcia
    const handleConfirmDelete = (id: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć tę operację finansową? Tej operacji nie można cofnąć.')) {
            onDelete(id);
        }
    };

    if (isLoading) {
        return <LoadingTable />;
    }

    return (
        <TableContainer>
            <StyledTable>
                <TableHead>
                    <TableRow>
                        <TableHeader>Typ</TableHeader>
                        <TableHeader>Numer</TableHeader>
                        <TableHeader>Data</TableHeader>
                        <TableHeader>Tytuł/Opis</TableHeader>
                        <TableHeader>Kontrahent</TableHeader>
                        <TableHeader>Kierunek</TableHeader>
                        <TableHeader>Forma płatności</TableHeader>
                        <TableHeader>Kwota</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Powiązanie</TableHeader>
                        <TableHeader>Akcje</TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {operations.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={11} className="empty-message">
                                Brak operacji finansowych spełniających kryteria wyszukiwania
                            </TableCell>
                        </TableRow>
                    ) : (
                        operations.map((operation) => (
                            <TableRow key={operation.id}>
                                <TableCell>
                                    <OperationTypeWrapper>
                                        <OperationTypeIcon>
                                            {getOperationIcon(operation.type)}
                                        </OperationTypeIcon>
                                        <OperationTypeText>{getOperationTypeText(operation.type)}</OperationTypeText>
                                    </OperationTypeWrapper>
                                </TableCell>
                                <TableCell>
                                    {operation.documentNumber || '-'}
                                </TableCell>
                                <TableCell>
                                    <DateColumn>
                                        <div>{formatDate(operation.date)}</div>
                                        {operation.dueDate && (
                                            <DueDate>Termin: {formatDate(operation.dueDate)}</DueDate>
                                        )}
                                    </DateColumn>
                                </TableCell>
                                <TableCell>
                                    <TitleColumn>
                                        <TitleText>{operation.title}</TitleText>
                                        {operation.description && (
                                            <DescriptionText>{operation.description}</DescriptionText>
                                        )}
                                    </TitleColumn>
                                </TableCell>
                                <TableCell>{operation.counterpartyName}</TableCell>
                                <TableCell>
                                    <DirectionBadge direction={operation.direction}>
                                        {operation.direction === TransactionDirection.INCOME ? 'Przychód' : 'Wydatek'}
                                    </DirectionBadge>
                                </TableCell>
                                <TableCell>{PaymentMethodLabels[operation.paymentMethod]}</TableCell>
                                <TableCell>
                                    <AmountColumn direction={operation.direction}>
                                        <AmountValue>{formatAmount(operation.amount)}</AmountValue>
                                        {operation.paidAmount !== undefined && operation.paidAmount < operation.amount && (
                                            <PaidAmount>Zapłacono: {formatAmount(operation.paidAmount || 0)}</PaidAmount>
                                        )}
                                    </AmountColumn>
                                </TableCell>
                                <TableCell>
                                    <StatusDropdown
                                        value={operation.status}
                                        onChange={(e) => onStatusChange(operation.id, e.target.value as PaymentStatus)}
                                    >
                                        {Object.entries(PaymentStatusLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </StatusDropdown>
                                </TableCell>
                                <TableCell>
                                    {operation.protocolId ? (
                                        <RelationLink href={`/orders/car-reception/${operation.protocolId}`}>
                                            Protokół #{operation.protocolId.split('-')[0]}
                                        </RelationLink>
                                    ) : operation.visitId ? (
                                        <RelationLink href={`/appointments/${operation.visitId}`}>
                                            Wizyta #{operation.visitId.split('-')[0]}
                                        </RelationLink>
                                    ) : (
                                        <NoRelation>-</NoRelation>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <ActionButtons>
                                        <ActionButton
                                            title="Szczegóły operacji"
                                            onClick={() => onView(operation)}
                                        >
                                            <FaEye />
                                        </ActionButton>
                                        <ActionButton
                                            title="Edytuj operację"
                                            onClick={() => onEdit(operation)}
                                        >
                                            <FaEdit />
                                        </ActionButton>
                                        <ActionButton
                                            title="Usuń operację"
                                            className="delete"
                                            onClick={() => handleConfirmDelete(operation.id)}
                                        >
                                            <FaTrashAlt />
                                        </ActionButton>
                                    </ActionButtons>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </StyledTable>
        </TableContainer>
    );
};

const TableContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #f8f9fa;
  border-bottom: 2px solid #eef2f7;
`;

const TableBody = styled.tbody`
  .empty-message {
    text-align: center;
    padding: 30px 0;
    color: #7f8c8d;
    font-style: italic;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #eef2f7;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableHeader = styled.th`
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: 14px 16px;
  color: #34495e;
  font-size: 14px;
  vertical-align: top;
`;

const OperationTypeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OperationTypeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #3498db;
`;

const OperationTypeText = styled.div`
  font-weight: 500;
`;

const DateColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DueDate = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const TitleColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TitleText = styled.div`
  font-weight: 500;
`;

const DescriptionText = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const DirectionBadge = styled.span<{ direction: TransactionDirection }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => `${TransactionDirectionColors[props.direction]}22`};
  color: ${props => TransactionDirectionColors[props.direction]};
  border: 1px solid ${props => `${TransactionDirectionColors[props.direction]}44`};
`;

const AmountColumn = styled.div<{ direction: TransactionDirection }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AmountValue = styled.div`
  font-weight: 600;
`;

const PaidAmount = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const StatusDropdown = styled.select`
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #dfe6e9;
  font-size: 13px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
  }
`;

const RelationLink = styled.a`
  color: #3498db;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const NoRelation = styled.span`
  color: #95a5a6;
  font-style: italic;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #3498db;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(52, 152, 219, 0.1);
  }

  &.delete {
    color: #e74c3c;

    &:hover {
      background-color: rgba(231, 76, 60, 0.1);
    }
  }
`;

const LoadingTable = () => (
    <TableContainer>
        <StyledTable>
            <TableHead>
                <TableRow>
                    <TableHeader>Typ</TableHeader>
                    <TableHeader>Numer</TableHeader>
                    <TableHeader>Data</TableHeader>
                    <TableHeader>Tytuł/Opis</TableHeader>
                    <TableHeader>Kontrahent</TableHeader>
                    <TableHeader>Kierunek</TableHeader>
                    <TableHeader>Forma płatności</TableHeader>
                    <TableHeader>Kwota</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Powiązanie</TableHeader>
                    <TableHeader>Akcje</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                        {[...Array(11)].map((_, cellIndex) => (
                            <TableCell key={cellIndex}>
                                <LoadingCell />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </StyledTable>
    </TableContainer>
);

const LoadingCell = styled.div`
  height: 18px;
  background-color: #f0f0f0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0.5) 60%,
      rgba(255, 255, 255, 0)
    );
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;

export default FinancialOperationsTable;