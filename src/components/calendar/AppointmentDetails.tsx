import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { FaCalendarAlt, FaClock, FaUser, FaTag, FaEdit, FaTrash } from 'react-icons/fa';
import { Appointment } from '../../types';
import { AppointmentStatusManager } from './AppointmentStatusManager';

interface AppointmentDetailsProps {
    appointment: Appointment;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (status: any) => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
                                                                   appointment,
                                                                   onEdit,
                                                                   onDelete,
                                                                   onStatusChange
                                                               }) => {
    // Formatowanie daty i godziny
    const formatDateTimeRange = (start: Date, end: Date) => {
        const startDate = format(start, 'PPPP', { locale: pl });
        const startTime = format(start, 'HH:mm');
        const endTime = format(end, 'HH:mm');

        return `${startDate}, ${startTime} - ${endTime}`;
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
                <DetailText>{formatDateTimeRange(appointment.start, appointment.end)}</DetailText>
            </DetailRow>

            {appointment.customerId && (
                <DetailRow>
                    <DetailIcon><FaUser /></DetailIcon>
                    <DetailText>{appointment.customerId}</DetailText>
                </DetailRow>
            )}

            <DetailRow>
                <DetailIcon><FaTag /></DetailIcon>
                <DetailText>{appointment.serviceType}</DetailText>
            </DetailRow>

            {appointment.notes && (
                <Notes>
                    <NotesTitle>Notatki:</NotesTitle>
                    <NotesContent>{appointment.notes}</NotesContent>
                </Notes>
            )}

            <Actions>
                <ActionButton onClick={onEdit} primary>
                    <FaEdit /> Edytuj
                </ActionButton>
                <ActionButton onClick={onDelete} danger>
                    <FaTrash /> Usuń
                </ActionButton>
            </Actions>
        </Container>
    );
};

const Container = styled.div`
    padding: 16px;
`;

const Title = styled.h2`
    font-size: 18px;
    color: #34495e;
    margin: 0 0 16px 0;
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

const ActionButton = styled.button<{ primary?: boolean; danger?: boolean }>`
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
`;

export default AppointmentDetails;