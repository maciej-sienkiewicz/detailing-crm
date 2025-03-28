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
    FaExternalLinkAlt
} from 'react-icons/fa';
import {Appointment, ProtocolStatus} from '../../types';
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

            <DetailRow>
                <DetailIcon><FaTag /></DetailIcon>
                <DetailText>
                    {appointment.isProtocol ? 'Protokół przyjęcia' : appointment.serviceType}
                </DetailText>
            </DetailRow>

            {appointment.notes && (
                <Notes>
                    <NotesTitle>Informacje:</NotesTitle>
                    <NotesContent>{appointment.notes}</NotesContent>
                </Notes>
            )}

            <Actions>
                {(appointment.isProtocol && (appointment.status as unknown as ProtocolStatus) !== ProtocolStatus.SCHEDULED) ? (
                    <ActionButton onClick={handleGoToProtocol} primary>
                        <FaExternalLinkAlt /> Przejdź do protokołu
                    </ActionButton>
                ) : (
                    <>
                        <ActionButton onClick={onEdit} primary>
                            <FaEdit /> Edytuj
                        </ActionButton>
                        <ActionButton onClick={onDelete} danger>
                            <FaTrash /> Usuń
                        </ActionButton>
                        <ActionButton onClick={onCreateProtocol} special>
                            <FaClipboardCheck /> Utwórz protokół
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