import React from 'react';
import styled from 'styled-components';
import {FaBuilding, FaPhone, FaUser} from 'react-icons/fa';
import {ClientExpanded} from "../../../../../types";

interface RecipientsListProps {
    recipients: ClientExpanded[];
    totalCount: number;
    maxDisplay?: number;
}

/**
 * Komponent listy odbiorców kampanii SMS
 * Wyświetla podgląd wybranych odbiorców z informacjami o nazwie, telefonie, itp.
 */
export const RecipientsList: React.FC<RecipientsListProps> = ({
                                                                  recipients,
                                                                  totalCount,
                                                                  maxDisplay = 5
                                                              }) => {
    // Ograniczamy liczbę wyświetlanych odbiorców do maxDisplay
    const displayedRecipients = recipients.slice(0, maxDisplay);
    const remainingCount = totalCount - displayedRecipients.length;

    return (
        <RecipientsListContainer>
            {displayedRecipients.map(recipient => (
                <RecipientItem key={recipient.id}>
                    <RecipientIcon>
                        {recipient.company ? <FaBuilding /> : <FaUser />}
                    </RecipientIcon>
                    <RecipientDetails>
                        <RecipientName>
                            {recipient.firstName} {recipient.lastName}
                            {recipient.company && <RecipientCompany>{recipient.company}</RecipientCompany>}
                        </RecipientName>
                        <RecipientPhone>
                            <FaPhone size={12} style={{ marginRight: '5px' }} />
                            {recipient.phone}
                        </RecipientPhone>
                        {recipient.email && (
                            <RecipientEmail>{recipient.email}</RecipientEmail>
                        )}
                    </RecipientDetails>
                    <RecipientStats>
                        <StatItem>
                            <StatLabel>Wizyty:</StatLabel>
                            <StatValue>{recipient.totalVisits}</StatValue>
                        </StatItem>
                        {recipient.totalRevenue > 0 && (
                            <StatItem>
                                <StatLabel>Wartość:</StatLabel>
                                <StatValue>
                                    {recipient.totalRevenue.toLocaleString('pl-PL')} zł
                                </StatValue>
                            </StatItem>
                        )}
                        {recipient.lastVisitDate && (
                            <StatItem>
                                <StatLabel>Ostatnia wizyta:</StatLabel>
                                <StatValue>
                                    {new Date(recipient.lastVisitDate).toLocaleDateString('pl-PL')}
                                </StatValue>
                            </StatItem>
                        )}
                    </RecipientStats>
                </RecipientItem>
            ))}

            {remainingCount > 0 && (
                <RemainingCountInfo>
                    ... i {remainingCount} więcej odbiorców
                </RemainingCountInfo>
            )}
        </RecipientsListContainer>
    );
};

// Styled components
const RecipientsListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    padding: 16px;
    background-color: white;
    border: 1px solid #e9ecef;
    border-radius: 5px;
`;

const RecipientItem = styled.div`
    display: flex;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid #f1f3f5;
    
    &:last-child {
        border-bottom: none;
    }
    
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const RecipientIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #e3f2fd;
    color: #3498db;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
`;

const RecipientDetails = styled.div`
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const RecipientName = styled.div`
    font-weight: 500;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const RecipientCompany = styled.span`
    font-size: 12px;
    color: #6c757d;
    font-weight: normal;
    
    &:before {
        content: '•';
        margin-right: 8px;
    }
`;

const RecipientPhone = styled.div`
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #2c3e50;
`;

const RecipientEmail = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const RecipientStats = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    
    @media (max-width: 768px) {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 8px;
    }
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    
    @media (max-width: 768px) {
        background-color: #f8f9fa;
        padding: 3px 8px;
        border-radius: 12px;
    }
`;

const StatLabel = styled.span`
    color: #6c757d;
`;

const StatValue = styled.span`
    color: #2c3e50;
    font-weight: 500;
`;

const RemainingCountInfo = styled.div`
    text-align: center;
    padding: 8px;
    background-color: #f8f9fa;
    border-radius: 5px;
    color: #6c757d;
    font-size: 13px;
`;

export default RecipientsList;