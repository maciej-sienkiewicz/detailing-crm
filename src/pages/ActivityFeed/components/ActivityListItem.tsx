import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ActivityItem } from '../../../types/activity';
import ActivityEntityLink from './ActivityEntityLink';

interface ActivityListItemProps {
    activity: ActivityItem;
    icon: React.ReactNode;
}

const ActivityListItem: React.FC<ActivityListItemProps> = ({ activity, icon }) => {
    // Formatowanie czasu
    const formatTime = (timestamp: string): string => {
        return format(new Date(timestamp), 'HH:mm', { locale: pl });
    };

    // Renderowanie powiązanych encji
    const renderEntities = () => {
        if (!activity.entities || activity.entities.length === 0) return null;

        return (
            <EntitiesContainer>
                {activity.entities.map((entity, index) => (
                    <React.Fragment key={entity.id}>
                        <ActivityEntityLink entity={entity} />
                        {index < activity.entities!.length - 1 && <EntitySeparator>•</EntitySeparator>}
                    </React.Fragment>
                ))}
            </EntitiesContainer>
        );
    };

    // Renderowanie dodatkowych informacji z metadata
    const renderMetadata = () => {
        if (!activity.metadata) return null;

        // Przykładowe renderowanie dla różnych typów metadanych
        if (activity.category === 'COMMENT' && activity.metadata.callDuration) {
            return (
                <MetadataInfo>
                    <MetadataItem>
                        <MetadataLabel>Czas rozmowy:</MetadataLabel>
                        <MetadataValue>{activity.metadata.callDuration}</MetadataValue>
                    </MetadataItem>
                    {activity.metadata.callNotes && (
                        <MetadataNotes>{activity.metadata.callNotes}</MetadataNotes>
                    )}
                </MetadataInfo>
            );
        }

        if (activity.category === 'notification' && activity.metadata.notificationType) {
            return (
                <MetadataInfo>
                    <MetadataItem>
                        <MetadataLabel>Typ powiadomienia:</MetadataLabel>
                        <MetadataValue>{activity.metadata.notificationType}</MetadataValue>
                    </MetadataItem>
                    {activity.metadata.notificationContent && (
                        <MetadataNotes>{activity.metadata.notificationContent}</MetadataNotes>
                    )}
                </MetadataInfo>
            );
        }

        return null;
    };

    return (
        <ActivityItemContainer>
            <ActivityHeader>
                <ActivityIconWrapper categoryType={activity.category}>
                    {icon}
                </ActivityIconWrapper>

                <ActivityContent>
                    <ActivityMessage>{activity.message}</ActivityMessage>
                    {renderEntities()}
                    {renderMetadata()}
                </ActivityContent>

                <ActivityTime>
                    <TimeText>{formatTime(activity.timestamp)}</TimeText>
                </ActivityTime>
            </ActivityHeader>

            {activity.userId && (
                <ActivityFooter>
                    <UserInfo>
                        <UserAvatar color={activity.userColor || '#7f8c8d'}>
                            {activity.userName ? activity.userName.split(' ').map(n => n[0]).join('') : 'U'}
                        </UserAvatar>
                        <UserName>{activity.userName || 'System'}</UserName>
                    </UserInfo>
                </ActivityFooter>
            )}
        </ActivityItemContainer>
    );
};

// Style dla różnych kategorii aktywności
const getCategoryColor = (category: string): string => {
    switch (category) {
        case 'APPOINTMENT':
            return '#3498db'; // niebieski
        case 'PROTOCOL':
            return '#2ecc71'; // zielony
        case 'COMMENT':
            return '#9b59b6'; // fioletowy
        case 'call':
            return '#e74c3c'; // czerwony
        case 'client':
            return '#f39c12'; // pomarańczowy
        case 'vehicle':
            return '#1abc9c'; // turkusowy
        case 'notification':
            return '#34495e'; // ciemny niebieski
        case 'system':
            return '#7f8c8d'; // szary
        default:
            return '#95a5a6'; // jasny szary
    }
};

// Styled components
const ActivityItemContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 15px;
`;

const ActivityIconWrapper = styled.div<{ categoryType: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => `${getCategoryColor(props.categoryType)}20`};
  color: ${props => getCategoryColor(props.categoryType)};
  font-size: 16px;
  margin-right: 15px;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityMessage = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #34495e;
  margin-bottom: 5px;
`;

const EntitiesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
  font-size: 13px;
`;

const EntitySeparator = styled.span`
  font-size: 12px;
  color: #bdc3c7;
  margin: 0 2px;
`;

const MetadataInfo = styled.div`
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 8px 10px;
  margin-top: 5px;
  margin-bottom: 8px;
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  margin-bottom: 3px;
`;

const MetadataLabel = styled.span`
  color: #7f8c8d;
  margin-right: 5px;
`;

const MetadataValue = styled.span`
  color: #34495e;
  font-weight: 500;
`;

const MetadataNotes = styled.div`
  font-size: 13px;
  color: #34495e;
  margin-top: 5px;
  font-style: italic;
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
`;

const StatusIcon = styled.span<{ success?: boolean; error?: boolean; pending?: boolean }>`
  font-size: 12px;
  margin-right: 5px;
  color: ${props =>
    props.success ? '#2ecc71' :
        props.error ? '#e74c3c' :
            props.pending ? '#f39c12' : '#7f8c8d'
};
`;

const StatusText = styled.span<{ status: string }>`
  font-size: 12px;
  color: ${props =>
    props.status === 'success' ? '#2ecc71' :
        props.status === 'error' ? '#e74c3c' :
            props.status === 'pending' ? '#f39c12' : '#7f8c8d'
};
`;

const ActivityTime = styled.div`
  margin-left: 15px;
  flex-shrink: 0;
`;

const TimeText = styled.div`
  font-size: 12px;
  color: #95a5a6;
  white-space: nowrap;
`;

const ActivityFooter = styled.div`
  display: flex;
  justify-content: flex-start;
  padding: 8px 15px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
`;

const UserInfo = styled.div`
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
  margin-right: 8px;
`;

const UserName = styled.div`
  font-size: 12px;
  color: #7f8c8d;
`;

export default ActivityListItem;