import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaUser, FaBuilding, FaIdCard, FaMapMarkerAlt, FaEnvelope, FaPhone, FaCalendarAlt, FaMoneyBillWave, FaCar, FaHistory } from 'react-icons/fa';
import { ClientExpanded, ContactAttempt } from '../../../types';
import { fetchContactAttemptsByClientId } from '../../../api/mocks/clientMocks';

interface ClientDetailDrawerProps {
    isOpen: boolean;
    client: ClientExpanded | null;
    onClose: () => void;
}

const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
                                                                   isOpen,
                                                                   client,
                                                                   onClose
                                                               }) => {
    const [contactHistory, setContactHistory] = useState<ContactAttempt[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadContactHistory = async () => {
            if (client) {
                setLoading(true);
                try {
                    const history = await fetchContactAttemptsByClientId(client.id);
                    setContactHistory(history);
                } catch (error) {
                    console.error('Error loading contact history:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadContactHistory();
    }, [client]);

    if (!client) return null;

    return (
        <DrawerContainer isOpen={isOpen}>
            <DrawerHeader>
                <h2>Szczegóły klienta</h2>
                <CloseButton onClick={onClose}>
                    <FaTimes />
                </CloseButton>
            </DrawerHeader>

            <DrawerContent>
                <SectionTitle>Informacje podstawowe</SectionTitle>

                <DetailSection>
                    <DetailRow>
                        <DetailIcon><FaUser /></DetailIcon>
                        <DetailContent>
                            <DetailLabel>Imię i nazwisko</DetailLabel>
                            <DetailValue>{client.firstName} {client.lastName}</DetailValue>
                        </DetailContent>
                    </DetailRow>

                    <DetailRow>
                        <DetailIcon><FaEnvelope /></DetailIcon>
                        <DetailContent>
                            <DetailLabel>Email</DetailLabel>
                            <DetailValue>{client.email}</DetailValue>
                        </DetailContent>
                    </DetailRow>

                    <DetailRow>
                        <DetailIcon><FaPhone /></DetailIcon>
                        <DetailContent>
                            <DetailLabel>Telefon</DetailLabel>
                            <DetailValue>{client.phone}</DetailValue>
                        </DetailContent>
                    </DetailRow>

                    {client.address && (
                        <DetailRow>
                            <DetailIcon><FaMapMarkerAlt /></DetailIcon>
                            <DetailContent>
                                <DetailLabel>Adres</DetailLabel>
                                <DetailValue>{client.address}</DetailValue>
                            </DetailContent>
                        </DetailRow>
                    )}
                </DetailSection>

                {(client.company || client.taxId) && (
                    <>
                        <SectionTitle>Dane firmowe</SectionTitle>

                        <DetailSection>
                            {client.company && (
                                <DetailRow>
                                    <DetailIcon><FaBuilding /></DetailIcon>
                                    <DetailContent>
                                        <DetailLabel>Firma</DetailLabel>
                                        <DetailValue>{client.company}</DetailValue>
                                    </DetailContent>
                                </DetailRow>
                            )}

                            {client.taxId && (
                                <DetailRow>
                                    <DetailIcon><FaIdCard /></DetailIcon>
                                    <DetailContent>
                                        <DetailLabel>NIP</DetailLabel>
                                        <DetailValue>{client.taxId}</DetailValue>
                                    </DetailContent>
                                </DetailRow>
                            )}
                        </DetailSection>
                    </>
                )}

                <SectionTitle>Statystyki klienta</SectionTitle>

                <MetricsGrid>
                    <MetricCard>
                        <MetricIcon $color="#3498db"><FaCalendarAlt /></MetricIcon>
                        <MetricValue>{client.totalVisits}</MetricValue>
                        <MetricLabel>Liczba wizyt</MetricLabel>
                    </MetricCard>

                    <MetricCard>
                        <MetricIcon $color="#2ecc71"><FaMoneyBillWave /></MetricIcon>
                        <MetricValue>{client.totalRevenue.toFixed(2)} zł</MetricValue>
                        <MetricLabel>Suma przychodów</MetricLabel>
                    </MetricCard>

                    <MetricCard>
                        <MetricIcon $color="#f39c12"><FaCar /></MetricIcon>
                        <MetricValue>{client.vehicles.length}</MetricValue>
                        <MetricLabel>Pojazdy</MetricLabel>
                    </MetricCard>

                    <MetricCard>
                        <MetricIcon $color="#9b59b6"><FaHistory /></MetricIcon>
                        <MetricValue>{client.contactAttempts}</MetricValue>
                        <MetricLabel>Próby kontaktu</MetricLabel>
                    </MetricCard>
                </MetricsGrid>

                {client.notes && (
                    <>
                        <SectionTitle>Notatki</SectionTitle>
                        <NotesContent>{client.notes}</NotesContent>
                    </>
                )}

                <SectionTitle>Historia kontaktów</SectionTitle>

                {loading ? (
                    <LoadingText>Ładowanie historii kontaktów...</LoadingText>
                ) : contactHistory.length === 0 ? (
                    <EmptyMessage>Brak historii kontaktów z klientem</EmptyMessage>
                ) : (
                    <ContactHistoryList>
                        {contactHistory.map(contact => (
                            <ContactHistoryItem key={contact.id}>
                                <ContactDate>{formatDate(contact.date)}</ContactDate>
                                <ContactType type={contact.type}>{getContactTypeLabel(contact.type)}</ContactType>
                                <ContactDescription>{contact.description}</ContactDescription>
                                <ContactResult result={contact.result}>{getContactResultLabel(contact.result)}</ContactResult>
                            </ContactHistoryItem>
                        ))}
                    </ContactHistoryList>
                )}
            </DrawerContent>
        </DrawerContainer>
    );
};

// Helper functions
const formatDate = (dateString: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const getContactTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
        'PHONE': 'Telefon',
        'EMAIL': 'Email',
        'SMS': 'SMS',
        'OTHER': 'Inne'
    };
    return types[type] || type;
};

const getContactResultLabel = (result: string): string => {
    const results: Record<string, string> = {
        'SUCCESS': 'Sukces',
        'NO_ANSWER': 'Brak odpowiedzi',
        'CALLBACK_REQUESTED': 'Oddzwonienie',
        'REJECTED': 'Odmowa'
    };
    return results[result] || result;
};

// Styled components
const DrawerContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 450px;
  max-width: 90vw;
  height: 100vh;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  
  h2 {
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #34495e;
  }
`;

const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  color: #3498db;
  margin: 20px 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  
  &:first-of-type {
    margin-top: 0;
  }
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: flex-start;
`;

const DetailIcon = styled.div`
  width: 20px;
  margin-right: 12px;
  color: #7f8c8d;
  margin-top: 2px;
`;

const DetailContent = styled.div`
  flex: 1;
`;

const DetailLabel = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 2px;
`;

const DetailValue = styled.div`
  font-size: 15px;
  color: #34495e;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const MetricCard = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const MetricIcon = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 20px;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-weight: 600;
  font-size: 18px;
  color: #34495e;
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

const NotesContent = styled.p`
  font-size: 14px;
  color: #34495e;
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
  white-space: pre-line;
`;

const LoadingText = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  padding: 12px 0;
  text-align: center;
`;

const EmptyMessage = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  padding: 12px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 4px;
`;

const ContactHistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ContactHistoryItem = styled.div`
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 12px;
`;

const ContactDate = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 8px;
`;

const ContactType = styled.span<{ type: string }>`
  display: inline-block;
  font-size: 12px;
  padding: 2px 6px;
  margin-right: 8px;
  border-radius: 4px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.type) {
        case 'PHONE': return '#e8f7ff';
        case 'EMAIL': return '#e8f4f9';
        case 'SMS': return '#eefbea';
        default: return '#f5f5f5';
    }
}};
  color: ${props => {
    switch (props.type) {
        case 'PHONE': return '#3498db';
        case 'EMAIL': return '#9b59b6';
        case 'SMS': return '#27ae60';
        default: return '#7f8c8d';
    }
}};
`;

const ContactDescription = styled.div`
  font-size: 14px;
  color: #34495e;
  margin: 8px 0;
`;

const ContactResult = styled.span<{ result: string }>`
  display: inline-block;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.result) {
        case 'SUCCESS': return '#eefbea';
        case 'NO_ANSWER': return '#fcf3ea';
        case 'CALLBACK_REQUESTED': return '#e8f7ff';
        case 'REJECTED': return '#fdecea';
        default: return '#f5f5f5';
    }
}};
  color: ${props => {
    switch (props.result) {
        case 'SUCCESS': return '#27ae60';
        case 'NO_ANSWER': return '#f39c12';
        case 'CALLBACK_REQUESTED': return '#3498db';
        case 'REJECTED': return '#e74c3c';
        default: return '#7f8c8d';
    }
}};
`;

export default ClientDetailDrawer;