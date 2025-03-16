import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaTimesCircle,
    FaUser,
    FaCalendarAlt,
    FaClock,
    FaInfoCircle,
    FaCheckCircle,
    FaExclamationCircle
} from 'react-icons/fa';
import { ActivityItem } from '../../../types/activity';
import ActivityEntityLink from './ActivityEntityLink';

interface ActivityDetailProps {
    activity: ActivityItem;
    isOpen: boolean;
    onClose: () => void;
}

const ActivityDetail: React.FC<ActivityDetailProps> = ({
                                                           activity,
                                                           isOpen,
                                                           onClose
                                                       }) => {
    if (!isOpen) return null;

    // Formatowanie daty i czasu
    const formatDateTime = (timestamp: string): string => {
        return format(new Date(timestamp), 'd MMMM yyyy, HH:mm:ss', { locale: pl });
    };

    // Określenie koloru statusu
    const getStatusColor = (status: string | undefined): string => {
        if (!status) return '#7f8c8d';

        switch (status) {
            case 'success': return '#2ecc71';
            case 'error': return '#e74c3c';
            case 'pending': return '#f39c12';
            default: return '#7f8c8d';
        }
    };

    // Ikona statusu
    const getStatusIcon = () => {
        switch (activity.status) {
            case 'success':
                return <StatusIcon color="#2ecc71"><FaCheckCircle /></StatusIcon>;
            case 'error':
                return <StatusIcon color="#e74c3c"><FaExclamationCircle /></StatusIcon>;
            case 'pending':
                return <StatusIcon color="#f39c12"><FaClock /></StatusIcon>;
            default:
                return <StatusIcon color="#7f8c8d"><FaInfoCircle /></StatusIcon>;
        }
    };

    // Domyślny tekst statusu
    const getDefaultStatusText = (status: string | undefined): string => {
        if (!status) return 'Informacja';

        switch (status) {
            case 'success': return 'Wykonano pomyślnie';
            case 'error': return 'Wystąpił błąd';
            case 'pending': return 'W trakcie realizacji';
            default: return 'Informacja';
        }
    };

    // Renderowanie metadanych
    const renderMetadata = () => {
        if (!activity.metadata || Object.keys(activity.metadata).length === 0) {
            return null;
        }

        return (
            <MetadataContainer>
                <MetadataTitle>Dodatkowe informacje</MetadataTitle>
                <MetadataList>
                    {Object.entries(activity.metadata).map(([key, value]) => (
                        <MetadataItem key={key}>
                            <MetadataKey>{formatMetadataKey(key)}:</MetadataKey>
                            <MetadataValue>{formatMetadataValue(key, value)}</MetadataValue>
                        </MetadataItem>
                    ))}
                </MetadataList>
            </MetadataContainer>
        );
    };

    // Formatowanie kluczy metadanych
    const formatMetadataKey = (key: string): string => {
        // Przekształcenie camelCase na słowa z dużą literą
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    };

    // Formatowanie wartości metadanych w zależności od typu
    const formatMetadataValue = (key: string, value: any): string => {
        if (value === null || value === undefined) {
            return '-';
        }

        if (typeof value === 'boolean') {
            return value ? 'Tak' : 'Nie';
        }

        if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
            try {
                return format(new Date(value), 'dd.MM.yyyy HH:mm', { locale: pl });
            } catch {
                return value.toString();
            }
        }

        return value.toString();
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Szczegóły aktywności</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimesCircle />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <ActivityMessage>{activity.message}</ActivityMessage>

                    <InfoRow>
                        <InfoItem>
                            <InfoLabel>Data i czas:</InfoLabel>
                            <InfoValue>
                                <FaCalendarAlt /> {formatDateTime(activity.timestamp)}
                            </InfoValue>
                        </InfoItem>

                        <InfoItem>
                            <InfoLabel>Autor:</InfoLabel>
                            <InfoValue>
                                {activity.userName ? (
                                    <>
                                        <UserAvatar color={activity.userColor || '#7f8c8d'}>
                                            {activity.userName.split(' ').map(n => n[0]).join('')}
                                        </UserAvatar>
                                        {activity.userName}
                                    </>
                                ) : (
                                    <>
                                        <UserAvatar color="#7f8c8d">S</UserAvatar>
                                        System
                                    </>
                                )}
                            </InfoValue>
                        </InfoItem>

                        <InfoItem>
                            <InfoLabel>Status:</InfoLabel>
                            <InfoValue>
                                {getStatusIcon()}
                                <span style={{ color: getStatusColor(activity.status) }}>
                  {activity.statusText || getDefaultStatusText(activity.status)}
                </span>
                            </InfoValue>
                        </InfoItem>
                    </InfoRow>

                    {activity.entities && activity.entities.length > 0 && (
                        <RelatedEntitiesSection>
                            <SectionTitle>Powiązane obiekty</SectionTitle>
                            <EntitiesList>
                                {activity.entities.map(entity => (
                                    <EntityItem key={entity.id}>
                                        <EntityLabel>{getEntityTypeLabel(entity.type)}:</EntityLabel>
                                        <ActivityEntityLink entity={entity} />
                                    </EntityItem>
                                ))}
                            </EntitiesList>
                        </RelatedEntitiesSection>
                    )}

                    {renderMetadata()}

                    <ActivityCategory>
                        <CategoryLabel>Kategoria:</CategoryLabel>
                        <CategoryValue>{getCategoryName(activity.category)}</CategoryValue>
                    </ActivityCategory>
                </ModalBody>

                <ModalFooter>
                    <CloseFooterButton onClick={onClose}>
                        Zamknij
                    </CloseFooterButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Pomocnicze funkcje do formatowania tekstów
const getEntityTypeLabel = (type: string): string => {
    switch (type) {
        case 'appointment': return 'Wizyta';
        case 'protocol': return 'Protokół';
        case 'client': return 'Klient';
        case 'vehicle': return 'Pojazd';
        case 'invoice': return 'Faktura';
        case 'comment': return 'Komentarz';
        default: return 'Obiekt';
    }
};

const getCategoryName = (category: string): string => {
    switch (category) {
        case 'appointment': return 'Wizyty i rezerwacje';
        case 'protocol': return 'Protokoły przyjęcia';
        case 'comment': return 'Komentarze';
        case 'call': return 'Rozmowy telefoniczne';
        case 'client': return 'Operacje na klientach';
        case 'vehicle': return 'Operacje na pojazdach';
        case 'notification': return 'Powiadomienia';
        case 'system': return 'Operacje systemowe';
        default: return 'Inne';
    }
};

// Styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    max-width: 90%;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #34495e;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #34495e;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;

const ActivityMessage = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #34495e;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const InfoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 480px) {
    min-width: 100%;
  }
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #34495e;
`;

const StatusIcon = styled.span<{ color: string }>`
  color: ${props => props.color};
  display: flex;
  align-items: center;
`;

const UserAvatar = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color};
  color: white;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RelatedEntitiesSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #34495e;
  margin: 0 0 10px 0;
`;

const EntitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: #f9f9f9;
  padding: 12px 15px;
  border-radius: 4px;
`;

const EntityItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
`;

const EntityLabel = styled.div`
  font-weight: 500;
  color: #7f8c8d;
  margin-right: 6px;
`;

const MetadataContainer = styled.div`
  margin-bottom: 20px;
`;

const MetadataTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #34495e;
  margin: 0 0 10px 0;
`;

const MetadataList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: #f9f9f9;
  padding: 12px 15px;
  border-radius: 4px;
`;

const MetadataItem = styled.div`
  display: flex;
  font-size: 14px;
`;

const MetadataKey = styled.div`
  font-weight: 500;
  color: #7f8c8d;
  min-width: 140px;
  margin-right: 8px;
`;

const MetadataValue = styled.div`
  color: #34495e;
`;

const ActivityCategory = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const CategoryLabel = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  margin-right: 6px;
`;

const CategoryValue = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #34495e;
`;

const ModalFooter = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
`;

const CloseFooterButton = styled.button`
  padding: 8px 16px;
  background-color: #f0f7ff;
  color: #3498db;
  border: 1px solid #d5e9f9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #d5e9f9;
  }
`;

export default ActivityDetail;