// src/pages/Finances/components/FinancialOperationDetails.tsx
import React from 'react';
import styled from 'styled-components';
import {
    FaFileInvoiceDollar,
    FaReceipt,
    FaMoneyBillWave,
    FaExchangeAlt,
    FaCalendarAlt,
    FaUser,
    FaCreditCard,
    FaClipboardList,
    FaTags,
    FaInfoCircle, FaEdit
} from 'react-icons/fa';
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

interface FinancialOperationDetailsProps {
    operation: FinancialOperation;
    onEdit?: () => void;
}

const FinancialOperationDetails: React.FC<FinancialOperationDetailsProps> = ({
                                                                                 operation,
                                                                                 onEdit
                                                                             }) => {    // Funkcja formatująca datę
    const formatDate = (dateString: string): string => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    // Funkcja formatująca kwotę
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: operation.currency || 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Funkcja zwracająca ikonę dla typu operacji
    const getOperationIcon = () => {
        switch (operation.type) {
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

    // Funkcja zwracająca etykietę dla typu operacji
    const getOperationTypeLabel = (): string => {
        switch (operation.type) {
            case FinancialOperationType.INVOICE:
                return 'Faktura';
            case FinancialOperationType.RECEIPT:
                return 'Paragon';
            case FinancialOperationType.OTHER:
                return 'Inna operacja';
            default:
                return 'Nieznany typ';
        }
    };

    return (
        <DetailsContainer>
            <DetailsHeader>
                <HeaderIcon type={operation.type}>
                    {getOperationIcon()}
                </HeaderIcon>
                <HeaderInfo>
                    <OperationType>{getOperationTypeLabel()}</OperationType>
                    <OperationTitle>{operation.title}</OperationTitle>
                    {operation.description && (
                        <OperationDescription>{operation.description}</OperationDescription>
                    )}
                </HeaderInfo>
                <StatusBadge status={operation.status}>
                    {PaymentStatusLabels[operation.status]}
                </StatusBadge>
            </DetailsHeader>

            <DetailsSections>
                <DetailsSection>
                    <SectionTitle>
                        <FaCalendarAlt />
                        <span>Daty i terminy</span>
                    </SectionTitle>
                    <DetailGrid>
                        <DetailItem>
                            <DetailLabel>Data operacji</DetailLabel>
                            <DetailValue>{formatDate(operation.date)}</DetailValue>
                        </DetailItem>
                        {operation.dueDate && (
                            <DetailItem>
                                <DetailLabel>Termin płatności</DetailLabel>
                                <DetailValue>{formatDate(operation.dueDate)}</DetailValue>
                            </DetailItem>
                        )}
                        <DetailItem>
                            <DetailLabel>Data utworzenia</DetailLabel>
                            <DetailValue>{formatDate(operation.createdAt)}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                            <DetailLabel>Ostatnia aktualizacja</DetailLabel>
                            <DetailValue>{formatDate(operation.updatedAt)}</DetailValue>
                        </DetailItem>
                    </DetailGrid>
                </DetailsSection>

                <DetailsSection>
                    <SectionTitle>
                        <FaUser />
                        <span>Kontrahent</span>
                    </SectionTitle>
                    <DetailGrid>
                        <DetailItem extended>
                            <DetailLabel>Nazwa kontrahenta</DetailLabel>
                            <DetailValue>{operation.counterpartyName}</DetailValue>
                        </DetailItem>
                        {operation.counterpartyId && (
                            <DetailItem>
                                <DetailLabel>ID kontrahenta</DetailLabel>
                                <DetailValue>{operation.counterpartyId}</DetailValue>
                            </DetailItem>
                        )}
                    </DetailGrid>
                </DetailsSection>

                <DetailsSection>
                    <SectionTitle>
                        <FaCreditCard />
                        <span>Płatność</span>
                    </SectionTitle>
                    <DetailGrid>
                        <DetailItem>
                            <DetailLabel>Kwota brutto</DetailLabel>
                            <DetailAmount direction={operation.direction}>
                                {formatAmount(operation.amount)}
                            </DetailAmount>
                        </DetailItem>
                        {operation.netAmount !== undefined && (
                            <DetailItem>
                                <DetailLabel>Kwota netto</DetailLabel>
                                <DetailValue>{formatAmount(operation.netAmount)}</DetailValue>
                            </DetailItem>
                        )}
                        {operation.taxAmount !== undefined && (
                            <DetailItem>
                                <DetailLabel>Kwota podatku</DetailLabel>
                                <DetailValue>{formatAmount(operation.taxAmount)}</DetailValue>
                            </DetailItem>
                        )}
                        <DetailItem>
                            <DetailLabel>Kierunek</DetailLabel>
                            <DirectionBadge direction={operation.direction}>
                                {operation.direction === TransactionDirection.INCOME ? 'Przychód' : 'Wydatek'}
                            </DirectionBadge>
                        </DetailItem>
                        <DetailItem>
                            <DetailLabel>Metoda płatności</DetailLabel>
                            <DetailValue>{PaymentMethodLabels[operation.paymentMethod]}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                            <DetailLabel>Status płatności</DetailLabel>
                            <StatusBadge status={operation.status}>
                                {PaymentStatusLabels[operation.status]}
                            </StatusBadge>
                        </DetailItem>
                        {operation.paidAmount !== undefined && operation.paidAmount !== operation.amount && (
                            <DetailItem>
                                <DetailLabel>Zapłacona kwota</DetailLabel>
                                <DetailValue>{formatAmount(operation.paidAmount || 0)}</DetailValue>
                            </DetailItem>
                        )}
                    </DetailGrid>
                </DetailsSection>

                <DetailsSection>
                    <SectionTitle>
                        <FaClipboardList />
                        <span>Powiązania</span>
                    </SectionTitle>
                    <DetailGrid>
                        {operation.documentNumber && (
                            <DetailItem>
                                <DetailLabel>Numer dokumentu</DetailLabel>
                                <DetailValue>{operation.documentNumber}</DetailValue>
                            </DetailItem>
                        )}
                        {operation.protocolId && (
                            <DetailItem>
                                <DetailLabel>Protokół</DetailLabel>
                                <DetailLink href={`/orders/car-reception/${operation.protocolId}`}>
                                    Protokół #{operation.protocolId}
                                </DetailLink>
                            </DetailItem>
                        )}
                        {operation.visitId && (
                            <DetailItem>
                                <DetailLabel>Wizyta</DetailLabel>
                                <DetailLink href={`/appointments/${operation.visitId}`}>
                                    Wizyta #{operation.visitId}
                                </DetailLink>
                            </DetailItem>
                        )}
                        <DetailItem>
                            <DetailLabel>ID źródłowe</DetailLabel>
                            <DetailValue>{operation.sourceId}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                            <DetailLabel>Typ źródła</DetailLabel>
                            <DetailValue>{getOperationTypeLabel()}</DetailValue>
                        </DetailItem>
                    </DetailGrid>
                </DetailsSection>

                {operation.attachments && operation.attachments.length > 0 && (
                    <DetailsSection>
                        <SectionTitle>
                            <FaTags />
                            <span>Załączniki</span>
                        </SectionTitle>
                        <AttachmentsList>
                            {operation.attachments.map((attachment, index) => (
                                <AttachmentItem key={index}>
                                    <AttachmentIcon>
                                        <FaFileInvoiceDollar />
                                    </AttachmentIcon>
                                    <AttachmentInfo>
                                        <AttachmentName>{attachment.name}</AttachmentName>
                                        <AttachmentSize>
                                            {Math.round((attachment.size || 0) / 1024)} KB
                                        </AttachmentSize>
                                    </AttachmentInfo>
                                </AttachmentItem>
                            ))}
                        </AttachmentsList>
                    </DetailsSection>
                )}

                {operation.description && (
                    <DetailsSection>
                        <SectionTitle>
                            <FaInfoCircle />
                            <span>Dodatkowe informacje</span>
                        </SectionTitle>
                        <DescriptionText>{operation.description}</DescriptionText>
                    </DetailsSection>
                )}
            </DetailsSections>

            {onEdit && (
                <ActionButtonsContainer>
                    <ActionButton onClick={onEdit}>
                        <FaEdit />
                        <span>Edytuj operację</span>
                    </ActionButton>
                </ActionButtonsContainer>
            )}
        </DetailsContainer>
    );
};

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 1px solid #eef2f7;
  padding-top: 24px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #3498db;
  color: white;
  border: none;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const DetailsContainer = styled.div`
  padding: 20px;
`;

const DetailsHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eef2f7;
  margin-bottom: 24px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

interface HeaderIconProps {
    type: FinancialOperationType;
}

const HeaderIcon = styled.div<HeaderIconProps>`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background-color: ${props => {
    switch (props.type) {
        case FinancialOperationType.INVOICE:
            return '#ebf5fb';
        case FinancialOperationType.RECEIPT:
            return '#eafaf1';
        case FinancialOperationType.CASH:
            return '#fef9e7';
        case FinancialOperationType.OTHER:
            return '#f4f6f7';
        default:
            return '#f4f6f7';
    }
}};
  color: ${props => {
    switch (props.type) {
        case FinancialOperationType.INVOICE:
            return '#3498db';
        case FinancialOperationType.RECEIPT:
            return '#2ecc71';
        case FinancialOperationType.CASH:
            return '#f39c12';
        case FinancialOperationType.OTHER:
            return '#95a5a6';
        default:
            return '#95a5a6';
    }
}};
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const OperationType = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
`;

const OperationTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
`;

const OperationDescription = styled.div`
  font-size: 14px;
  color: #7f8c8d;
`;

interface StatusBadgeProps {
    status: PaymentStatus;
}

const StatusBadge = styled.div<StatusBadgeProps>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => `${PaymentStatusColors[props.status]}22`};
  color: ${props => PaymentStatusColors[props.status]};
  border: 1px solid ${props => `${PaymentStatusColors[props.status]}44`};
`;

const DetailsSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const DetailsSection = styled.div`
  border: 1px solid #eef2f7;
  border-radius: 8px;
  overflow: hidden;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eef2f7;
  
  svg {
    color: #3498db;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

interface DetailItemProps {
    extended?: boolean;
}

const DetailItem = styled.div<DetailItemProps>`
  grid-column: ${props => props.extended ? 'span 2' : 'auto'};
  
  @media (max-width: 576px) {
    grid-column: 1;
  }
`;

const DetailLabel = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #34495e;
`;

interface DetailAmountProps {
    direction: TransactionDirection;
}

const DetailAmount = styled.div<DetailAmountProps>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => TransactionDirectionColors[props.direction]};
`;

interface DirectionBadgeProps {
    direction: TransactionDirection;
}

const DirectionBadge = styled.div<DirectionBadgeProps>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => `${TransactionDirectionColors[props.direction]}22`};
  color: ${props => TransactionDirectionColors[props.direction]};
  border: 1px solid ${props => `${TransactionDirectionColors[props.direction]}44`};
`;

const DetailLink = styled.a`
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AttachmentsList = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #eef2f7;
`;

const AttachmentIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background-color: #ebf5fb;
  color: #3498db;
`;

const AttachmentInfo = styled.div`
  flex: 1;
`;

const AttachmentName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
`;

const AttachmentSize = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const DescriptionText = styled.div`
  padding: 16px;
  font-size: 14px;
  color: #34495e;
  line-height: 1.5;
`;

export default FinancialOperationDetails;