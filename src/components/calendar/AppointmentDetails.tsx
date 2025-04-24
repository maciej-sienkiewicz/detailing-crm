import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaCalendarAlt,
    FaClock,
    FaUser,
    FaTag,
    FaEdit,
    FaTrash,
    FaCar,
    FaClipboardCheck,
    FaExternalLinkAlt,
    FaTools
} from 'react-icons/fa';
import {Appointment, ProtocolStatus, SelectedService} from '../../types';
import { AppointmentStatusManager } from './AppointmentStatusManager';
import { useNavigate } from 'react-router-dom';

interface AppointmentDetailsProps {
    appointment: Appointment;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (status: any) => void;
    onCreateProtocol: () => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
                                                                   appointment,
                                                                   onEdit,
                                                                   onDelete,
                                                                   onStatusChange,
                                                                   onCreateProtocol
                                                               }) => {
    const navigate = useNavigate();

    // Formatowanie daty i godziny
    const formatDateTime = (date: Date) => {
        return format(date, 'PPPP, HH:mm', { locale: pl });
    };

    // Przekierowanie do widoku protokołu
    const handleGoToProtocol = () => {
        if (appointment.isProtocol && appointment.id) {
            // Pobieramy ID protokołu z ID wydarzenia
            const protocolId = appointment.id.replace('protocol-', '');
            navigate(`/orders/car-reception/${protocolId}`);
        }
    };

    // Funkcja do obliczania ceny netto na podstawie ceny brutto
    const calculateNetPrice = (grossPrice: number): number => {
        return grossPrice / 1.23; // Zakładamy standardową stawkę VAT 23%
    };

    return (
        <Container>
            <Title>{appointment.title}</Title>

            <DetailRow>
                <StatusContainer>
                    <AppointmentStatusManager
                        status={appointment.status}
                        onStatusChange={onStatusChange}
                    />
                </StatusContainer>
            </DetailRow>

            <DetailRow>
                <DetailIcon><FaCalendarAlt /></DetailIcon>
                <DetailText>{formatDateTime(appointment.start)}</DetailText>
            </DetailRow>

            {appointment.customerId && (
                <DetailRow>
                    <DetailIcon><FaUser /></DetailIcon>
                    <DetailText>{appointment.customerId}</DetailText>
                </DetailRow>
            )}

            {appointment.vehicleId && appointment.isProtocol && (
                <DetailRow>
                    <DetailIcon><FaCar /></DetailIcon>
                    <DetailText>Nr rej.: {appointment.vehicleId}</DetailText>
                </DetailRow>
            )}


            {appointment.services && appointment.services.length > 0 && (
                <ServicesList>
                    <ServicesTitle>
                        <FaTools style={{ marginRight: '8px' }} />
                        Usługi:
                    </ServicesTitle>
                    {appointment.services.map((service, index) => (
                        <ServiceItem
                            key={index}
                            isLast={index === appointment.services.length - 1}
                        >
                            <ServiceName>{service.name}</ServiceName>
                            <ServicePriceContainer>
                                <ServicePrice>
                                    <PriceValue>{service.finalPrice.toFixed(2)} zł</PriceValue>
                                    <PriceType>brutto</PriceType>
                                </ServicePrice>
                                <ServicePrice>
                                    <PriceValue>{calculateNetPrice(service.finalPrice).toFixed(2)} zł</PriceValue>
                                    <PriceType>netto</PriceType>
                                </ServicePrice>
                            </ServicePriceContainer>
                        </ServiceItem>
                    ))}
                    <TotalPrice>
                        <TotalPriceLabel>Razem:</TotalPriceLabel>
                        <TotalPriceValues>
                            <TotalPriceRow>
                                <TotalPriceValue>{appointment.services.reduce((sum, service) => sum + service.finalPrice, 0).toFixed(2)} zł</TotalPriceValue>
                                <PriceType>brutto</PriceType>
                            </TotalPriceRow>
                            <TotalPriceRow>
                                <TotalPriceValue>{calculateNetPrice(appointment.services.reduce((sum, service) => sum + service.finalPrice, 0)).toFixed(2)} zł</TotalPriceValue>
                                <PriceType>netto</PriceType>
                            </TotalPriceRow>
                        </TotalPriceValues>
                    </TotalPrice>
                </ServicesList>
            )}

            <Actions>
                {(appointment.isProtocol && (appointment.status as unknown as ProtocolStatus) !== ProtocolStatus.SCHEDULED) ? (
                    <ActionButton onClick={handleGoToProtocol} primary>
                        <FaExternalLinkAlt /> Przejdź do wizyty
                    </ActionButton>
                ) : (
                    <>
                        <ActionButton onClick={onEdit} primary>
                            <FaEdit /> Edytuj
                        </ActionButton>
                        <ActionButton onClick={onCreateProtocol} special>
                            <FaClipboardCheck /> Otwórz wizytę
                        </ActionButton>
                    </>
                )}
            </Actions>
        </Container>
    );
};

const Container = styled.div`
    padding: 16px;
    position: relative;
`;

const ProtocolBadge = styled.div`
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #2c3e50;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
`;

const Title = styled.h2`
    font-size: 18px;
    color: #34495e;
    margin: 0 0 16px 0;
    padding-right: 120px; // Miejsce na badge
`;

const StatusContainer = styled.div`
    margin-bottom: 16px;
`;

const DetailRow = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 12px;
`;

const DetailIcon = styled.div`
    color: #7f8c8d;
    margin-right: 10px;
    width: 20px;
    text-align: center;
`;

const DetailText = styled.div`
    color: #34495e;
    font-size: 14px;
`;

const ServicesList = styled.div`
    margin-top: 16px;
    background-color: #f9f9f9;
    padding: 12px;
    border-radius: 4px;
`;

const ServicesTitle = styled.div`
    font-weight: 600;
    margin-bottom: 10px;
    font-size: 14px;
    color: #34495e;
    display: flex;
    align-items: center;
`;

const ServiceItem = styled.div<{ isLast: boolean }>`
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    padding-bottom: 6px;
    border-bottom: ${props => props.isLast ? 'none' : '1px dashed #e0e0e0'};
`;

const ServiceName = styled.div`
    font-size: 14px;
    color: #34495e;
    flex: 1;
`;

const ServicePriceContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

const ServicePrice = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

const PriceValue = styled.div`
    font-size: 14px;
    color: #34495e;
    font-weight: 500;
`;

const PriceType = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    text-transform: uppercase;
`;

const TotalPrice = styled.div`
    margin-top: 10px;
    padding-top: 6px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const TotalPriceLabel = styled.div`
    font-weight: bold;
    font-size: 14px;
    color: #34495e;
`;

const TotalPriceValues = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

const TotalPriceRow = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

const TotalPriceValue = styled.div`
    font-weight: bold;
    font-size: 14px;
    color: #34495e;
`;

const Notes = styled.div`
    margin-top: 16px;
    background-color: #f9f9f9;
    padding: 12px;
    border-radius: 4px;
`;

const NotesTitle = styled.div`
    font-weight: 600;
    margin-bottom: 6px;
    font-size: 14px;
    color: #34495e;
`;

const NotesContent = styled.div`
    font-size: 14px;
    color: #34495e;
    white-space: pre-line;
`;

const Actions = styled.div`
    display: flex;
    margin-top: 20px;
    gap: 10px;
`;

const ActionButton = styled.button<{ primary?: boolean; danger?: boolean; special?: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;

    ${props => props.primary && `
        background-color: #3498db;
        color: white;
        border: none;
        
        &:hover {
            background-color: #2980b9;
        }
    `}

    ${props => props.danger && `
        background-color: #fff;
        color: #e74c3c;
        border: 1px solid #e74c3c;
        
        &:hover {
            background-color: #fef5f5;
        }
    `}

    ${props => props.special && `
        background-color: #fff;
        color: #27ae60;
        border: 1px solid #27ae60;
        
        &:hover {
            background-color: #f0f9f4;
        }
    `}
`;

export default AppointmentDetails;