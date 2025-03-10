import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaHourglassHalf,
    FaCheckCircle,
    FaTools,
    FaClock,
    FaCarSide
} from 'react-icons/fa';
import {
    CarReceptionProtocol,
    ProtocolStatus,
    ProtocolStatusLabels
} from '../../../../types';

interface StatusHistoryItem {
    status: ProtocolStatus;
    date: string;
    icon: React.ReactNode;
}

interface ProtocolStatusTimelineProps {
    protocol: CarReceptionProtocol;
}

const ProtocolStatusTimeline: React.FC<ProtocolStatusTimelineProps> = ({ protocol }) => {
    // Function to get the appropriate icon for each status
    const getStatusIcon = (status: ProtocolStatus) => {
        switch (status) {
            case ProtocolStatus.PENDING_APPROVAL:
                return <FaHourglassHalf />;
            case ProtocolStatus.CONFIRMED:
                return <FaCheckCircle />;
            case ProtocolStatus.IN_PROGRESS:
                return <FaTools />;
            case ProtocolStatus.READY_FOR_PICKUP:
                return <FaClock />;
            case ProtocolStatus.COMPLETED:
                return <FaCarSide />;
            default:
                return <FaHourglassHalf />;
        }
    };

    // Format date for display
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: pl });
    };

    // Create a virtual status history based on the current protocol status
    // In a real app, you would track the actual status history
    const statusOrder: ProtocolStatus[] = [
        ProtocolStatus.PENDING_APPROVAL,
        ProtocolStatus.CONFIRMED,
        ProtocolStatus.IN_PROGRESS,
        ProtocolStatus.READY_FOR_PICKUP,
        ProtocolStatus.COMPLETED
    ];

    const currentStatusIndex = statusOrder.indexOf(protocol.status);

    // Create status history items
    const statusHistory: StatusHistoryItem[] = statusOrder
        .slice(0, currentStatusIndex + 1)
        .map(status => ({
            status,
            // For the demo, we're using the same date for all statuses
            // In a real app, you'd store the actual date of each status change
            date: protocol.statusUpdatedAt || protocol.createdAt,
            icon: getStatusIcon(status)
        }));

    return (
        <TimelineContainer>
            <TimelineTitle>Status zlecenia</TimelineTitle>

            <Timeline>
                {statusHistory.map((item, index) => (
                    <TimelineItem key={index} active={true}>
                        <TimelineDot active={true}>
                            {item.icon}
                        </TimelineDot>
                        <TimelineContent>
                            <StatusLabel>{ProtocolStatusLabels[item.status]}</StatusLabel>
                            <StatusDate>{formatDate(item.date)}</StatusDate>
                        </TimelineContent>
                    </TimelineItem>
                ))}

                {/* Render future statuses */}
                {statusOrder.slice(currentStatusIndex + 1).map((status, index) => (
                    <TimelineItem key={`future-${index}`} active={false}>
                        <TimelineDot active={false}>
                            {getStatusIcon(status)}
                        </TimelineDot>
                        <TimelineContent>
                            <StatusLabel inactive>{ProtocolStatusLabels[status]}</StatusLabel>
                            <StatusDate inactive>Oczekiwanie</StatusDate>
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>
        </TimelineContainer>
    );
};

// Styled components
const TimelineContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 15px;
    margin-top: 15px;
`;

const TimelineTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
`;

const Timeline = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 10px;
        width: 2px;
        background-color: #e0e0e0;
    }
`;

const TimelineItem = styled.div<{ active: boolean }>`
    display: flex;
    padding: 0 0 20px 0;
    position: relative;

    &:last-child {
        padding-bottom: 0;
    }
`;

const TimelineDot = styled.div<{ active: boolean }>`
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: ${props => props.active ? '#3498db' : '#e0e0e0'};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    margin-right: 15px;
    position: relative;
    z-index: 2;
`;

const TimelineContent = styled.div`
    flex: 1;
`;

const StatusLabel = styled.div<{ inactive?: boolean }>`
    font-weight: 500;
    font-size: 14px;
    color: ${props => props.inactive ? '#95a5a6' : '#34495e'};
    margin-bottom: 2px;
`;

const StatusDate = styled.div<{ inactive?: boolean }>`
    font-size: 12px;
    color: ${props => props.inactive ? '#bdc3c7' : '#7f8c8d'};
`;

export default ProtocolStatusTimeline;