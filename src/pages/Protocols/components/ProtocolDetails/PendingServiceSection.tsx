import React from 'react';
import styled from 'styled-components';
import { ServiceApprovalStatus, ServiceApprovalStatusLabels, ServiceApprovalStatusColors, SelectedService } from '../../../../types';
import { FaClock, FaCheckCircle, FaTimesCircle, FaBell, FaMobileAlt, FaEnvelope } from 'react-icons/fa';

interface PendingServicesSectionProps {
    services: SelectedService[];
    onCancelService: (serviceId: string) => void;
    onResendNotification: (serviceId: string) => void;
}

const PendingServiceSection: React.FC<PendingServicesSectionProps> = ({
                                                                           services,
                                                                           onCancelService,
                                                                           onResendNotification
                                                                       }) => {
    // Filtruj tylko usługi oczekujące
    const pendingServices = services.filter(service =>
        service.approvalStatus === ServiceApprovalStatus.PENDING
    );

    if (pendingServices.length === 0) {
        return null; // Nie wyświetlaj sekcji, jeśli nie ma oczekujących usług
    }

    // Formatuj datę
    const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Container>
            <SectionHeader>
                <SectionTitle>
                    <FaClock /> Usługi oczekujące na potwierdzenie
                </SectionTitle>
                <ServicesCounter>{pendingServices.length}</ServicesCounter>
            </SectionHeader>

            <InfoMessage>
                Poniższe usługi zostały dodane do zlecenia, ale wymagają potwierdzenia przez klienta. Po potwierdzeniu, zostaną dodane do głównej listy usług.
            </InfoMessage>

            <ServiceList>
                {pendingServices.map(service => (
                    <ServiceItem key={service.id}>
                        <ServiceHeader>
                            <ServiceName>{service.name}</ServiceName>
                            <ServiceStatus color={ServiceApprovalStatusColors[service.approvalStatus!]}>
                                {ServiceApprovalStatusLabels[service.approvalStatus!]}
                            </ServiceStatus>
                        </ServiceHeader>

                        <ServiceDetails>
                            <ServicePrice>
                                <PriceLabel>Cena:</PriceLabel>
                                <PriceValue>{service.finalPrice.toFixed(2)} zł</PriceValue>
                            </ServicePrice>

                            <ServiceAdded>
                                <AddedLabel>Dodano:</AddedLabel>
                                <AddedValue>{formatDate(service.addedAt)}</AddedValue>
                            </ServiceAdded>

                            {service.confirmationMessage && (
                                <NotificationInfo>
                                    <NotificationLabel>
                                        Powiadomienie:
                                    </NotificationLabel>
                                    <NotificationMethod>
                                        {service.confirmationMessage.includes('SMS') && (
                                            <NotificationIcon title="SMS"><FaMobileAlt /></NotificationIcon>
                                        )}
                                        {service.confirmationMessage.includes('Email') && (
                                            <NotificationIcon title="Email"><FaEnvelope /></NotificationIcon>
                                        )}
                                    </NotificationMethod>
                                </NotificationInfo>
                            )}
                        </ServiceDetails>

                        <ServiceActions>
                            <ActionButton
                                title="Wyślij ponownie powiadomienie"
                                onClick={() => onResendNotification(service.id)}
                            >
                                <FaBell /> Powiadom ponownie
                            </ActionButton>

                            <ActionButton
                                title="Anuluj usługę"
                                danger
                                onClick={() => onCancelService(service.id)}
                            >
                                <FaTimesCircle /> Anuluj
                            </ActionButton>
                        </ServiceActions>
                    </ServiceItem>
                ))}
            </ServiceList>
        </Container>
    );
};

const Container = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ServicesCounter = styled.div`
  background-color: #95a5a6;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const InfoMessage = styled.div`
  background-color: #fff8e1;
  border-left: 3px solid #f39c12;
  padding: 12px 15px;
  border-radius: 4px;
  font-size: 13px;
  color: #34495e;
  margin-bottom: 15px;
`;

const ServiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ServiceItem = styled.div`
  background-color: white;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 15px;
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
`;

const ServiceName = styled.div`
  font-weight: 500;
  font-size: 15px;
  color: #34495e;
`;

const ServiceStatus = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: ${props => `${props.color}20`};
  color: ${props => props.color};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const ServiceDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 15px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ServicePrice = styled.div`
  display: flex;
  align-items: center;
`;

const PriceLabel = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  margin-right: 5px;
`;

const PriceValue = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #2ecc71;
`;

const ServiceAdded = styled.div`
  display: flex;
  align-items: center;
`;

const AddedLabel = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  margin-right: 5px;
`;

const AddedValue = styled.div`
  font-size: 13px;
  color: #34495e;
`;

const NotificationInfo = styled.div`
  display: flex;
  align-items: center;
  grid-column: span 2;
  
  @media (max-width: 600px) {
    grid-column: span 1;
  }
`;

const NotificationLabel = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  margin-right: 5px;
`;

const NotificationMethod = styled.div`
  display: flex;
  gap: 8px;
`;

const NotificationIcon = styled.div`
  color: #3498db;
  font-size: 14px;
`;

const ServiceActions = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  background-color: ${props => props.danger ? '#fef5f5' : '#f0f7ff'};
  color: ${props => props.danger ? '#e74c3c' : '#3498db'};
  border: 1px solid ${props => props.danger ? '#fde8e8' : '#d5e9f9'};
  
  &:hover {
    background-color: ${props => props.danger ? '#fde8e8' : '#d5e9f9'};
  }
  
  @media (max-width: 480px) {
    justify-content: center;
  }
`;

export default PendingServiceSection;