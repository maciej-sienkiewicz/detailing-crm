import React, { useMemo } from 'react';
import styled from 'styled-components';
import { format, isToday, isYesterday } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaSpinner,
    FaCalendarAlt,
    FaClipboardCheck,
    FaComment,
    FaUser,
    FaCar,
    FaBell,
    FaCog,
    FaInfoCircle,
    FaChevronRight
} from 'react-icons/fa';
import { ActivityItem } from '../../../types/activity';
import { Link } from 'react-router-dom';

// Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    neutral: '#64748b',
    border: '#e2e8f0',
    text: {
        primary: '#1e293b',
        secondary: '#475569',
        muted: '#64748b'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px'
    },
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }
};

interface ActivityTimelineListProps {
    activities: ActivityItem[];
    loading: boolean;
}

const ActivityTimelineList: React.FC<ActivityTimelineListProps> = ({ activities, loading }) => {
    // Grupowanie aktywności według dat
    const groupedActivities = useMemo(() => {
        const groups: { [key: string]: ActivityItem[] } = {};

        activities.forEach(activity => {
            const date = new Date(activity.timestamp);
            const dateKey = format(date, 'yyyy-MM-dd');

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(activity);
        });

        // Sortowanie aktywności w grupach (najnowsze pierwsze)
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
        });

        return groups;
    }, [activities]);

    // Sortowanie dat (najnowsze pierwsze)
    const sortedDates = useMemo(() => {
        return Object.keys(groupedActivities).sort((a, b) =>
            new Date(b).getTime() - new Date(a).getTime()
        );
    }, [groupedActivities]);

    // Formatowanie nazwy dnia
    const formatDayLabel = (dateStr: string): string => {
        const date = new Date(dateStr);

        if (isToday(date)) {
            return 'Dzisiaj';
        } else if (isYesterday(date)) {
            return 'Wczoraj';
        } else {
            return format(date, 'EEEE, d MMMM', { locale: pl });
        }
    };

    // Ikona dla kategorii aktywności
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'APPOINTMENT':
                return <FaCalendarAlt />;
            case 'PROTOCOL':
                return <FaClipboardCheck />;
            case 'COMMENT':
                return <FaComment />;
            case 'client':
                return <FaUser />;
            case 'vehicle':
                return <FaCar />;
            case 'notification':
                return <FaBell />;
            case 'system':
                return <FaCog />;
            default:
                return <FaInfoCircle />;
        }
    };

    // Kolor dla kategorii
    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'APPOINTMENT':
                return '#3498db';
            case 'PROTOCOL':
                return '#2ecc71';
            case 'COMMENT':
                return '#9b59b6';
            case 'client':
                return '#f39c12';
            case 'vehicle':
                return '#1abc9c';
            case 'notification':
                return '#34495e';
            case 'system':
                return '#95a5a6';
            default:
                return '#bdc3c7';
        }
    };

    // Generowanie linku do encji
    const getEntityLink = (entity: any) => {
        if (!entity) return '#';

        switch (entity.type) {
            case 'APPOINTMENT':
                return `/visits/${entity.id}`;
            case 'client':
                return `/clients/owners?search=${entity.displayName}`;
            case 'vehicle':
                return `/clients/vehicles?search=${entity.displayName}`;
            case 'PROTOCOL':
                return `/visits/${entity.id}`;
            default:
                return '/clients-vehicles?tab=vehicles&vehicleId=2';
        }
    };

    if (loading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie aktywności...</LoadingText>
            </LoadingContainer>
        );
    }

    return (
        <TimelineContainer>
            {sortedDates.map(dateKey => (
                <DayGroup key={dateKey}>
                    <DayHeader>
                        <DayLabel>{formatDayLabel(dateKey)}</DayLabel>
                        <DayDate>{format(new Date(dateKey), 'd MMMM yyyy', { locale: pl })}</DayDate>
                        <ActivityCount>
                            {groupedActivities[dateKey].length} {groupedActivities[dateKey].length === 1 ? 'aktywność' : 'aktywności'}
                        </ActivityCount>
                    </DayHeader>

                    <ActivityList>
                        {groupedActivities[dateKey].map((activity, index) => (
                            <ActivityItemDiv key={activity.id}>
                                <TimelineIndicator
                                    $color={getCategoryColor(activity.category)}
                                    $isLast={index === groupedActivities[dateKey].length - 1}
                                >
                                    <ActivityIcon $color={getCategoryColor(activity.category)}>
                                        {getCategoryIcon(activity.category)}
                                    </ActivityIcon>
                                </TimelineIndicator>

                                <ActivityContent>
                                    <ActivityCard>
                                        <ActivityHeader>
                                            <ActivityTime>
                                                {format(new Date(activity.timestamp), 'HH:mm')}
                                            </ActivityTime>

                                            {activity.userName && (
                                                <UserInfo>
                                                    <UserAvatar $color={activity.userColor || '#64748b'}>
                                                        {activity.userName.split(' ').map(n => n[0]).join('')}
                                                    </UserAvatar>
                                                    <UserName>{activity.userName}</UserName>
                                                </UserInfo>
                                            )}
                                        </ActivityHeader>

                                        <ActivityMessage>{activity.message}</ActivityMessage>

                                        {activity.entities && activity.entities.length > 0 && (
                                            <EntitiesSection>
                                                <EntitiesLabel>Powiązane:</EntitiesLabel>
                                                <EntitiesList>
                                                    {activity.entities.map((entity, entityIndex) => (
                                                        <EntityLink
                                                            key={entity.id}
                                                            to={getEntityLink(entity)}
                                                        >
                                                            <EntityName>{entity.displayName}</EntityName>
                                                            <FaChevronRight />
                                                        </EntityLink>
                                                    ))}
                                                </EntitiesList>
                                            </EntitiesSection>
                                        )}

                                        {activity.metadata && (
                                            <MetadataSection>
                                                {activity.metadata.notes && (
                                                    <MetadataNotes>{activity.metadata.notes}</MetadataNotes>
                                                )}
                                            </MetadataSection>
                                        )}
                                    </ActivityCard>
                                </ActivityContent>
                            </ActivityItemDiv>
                        ))}
                    </ActivityList>
                </DayGroup>
            ))}
        </TimelineContainer>
    );
};

// Styled Components
const TimelineContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xl};
    color: ${brandTheme.text.muted};
    min-height: 300px;
`;

const LoadingSpinner = styled.div`
    width: 32px;
    height: 32px;
    border: 2px solid ${brandTheme.border};
    border-top: 2px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: ${brandTheme.spacing.md};

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.p`
    font-size: 16px;
    margin: 0;
`;

const EmptyContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    border: 2px dashed ${brandTheme.border};
    text-align: center;
    min-height: 300px;
`;

const EmptyIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${brandTheme.text.muted};
    margin-bottom: ${brandTheme.spacing.lg};
`;

const EmptyTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
`;

const EmptyDescription = styled.p`
    font-size: 14px;
    color: ${brandTheme.text.muted};
    margin: 0;
    line-height: 1.5;
`;

const DayGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

const DayHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md} 0;
    border-bottom: 2px solid ${brandTheme.border};

    @media (max-width: 768px) {
        flex-wrap: wrap;
        gap: ${brandTheme.spacing.sm};
    }
`;

const DayLabel = styled.h2`
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0;
    text-transform: capitalize;
    flex-shrink: 0;
`;

const DayDate = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    flex-shrink: 0;
`;

const ActivityCount = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};
    margin-left: auto;
    flex-shrink: 0;

    @media (max-width: 768px) {
        margin-left: 0;
        order: 3;
        width: 100%;
        text-align: center;
    }
`;

const ActivityList = styled.div`
    position: relative;
`;

const ActivityItemDiv = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.lg};

    &:last-child {
        margin-bottom: 0;
    }
`;

const TimelineIndicator = styled.div<{ $color: string; $isLast: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: 48px;
        left: 50%;
        transform: translateX(-50%);
        width: 2px;
        height: calc(100% + ${brandTheme.spacing.lg});
        background: ${props => props.$isLast ? 'transparent' : brandTheme.border};
    }
`;

const ActivityIcon = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    background: ${props => props.$color};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    box-shadow: ${brandTheme.shadow.sm};
    position: relative;
    z-index: 2;
    border: 3px solid ${brandTheme.surface};
`;

const ActivityContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const ActivityCard = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
    padding: ${brandTheme.spacing.lg};
    box-shadow: ${brandTheme.shadow.xs};
    transition: all 0.2s ease;

    &:hover {
        box-shadow: ${brandTheme.shadow.sm};
        border-color: ${brandTheme.primaryLight};
    }
`;

const ActivityHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${brandTheme.spacing.sm};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${brandTheme.spacing.xs};
    }
`;

const ActivityTime = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${brandTheme.text.muted};
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const UserAvatar = styled.div<{ $color: string }>`
    width: 24px;
    height: 24px;
    background: ${props => props.$color};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
`;

const UserName = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const ActivityMessage = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.primary};
    line-height: 1.5;
    margin-bottom: ${brandTheme.spacing.sm};
    font-weight: 500;
`;

const EntitiesSection = styled.div`
    margin-top: ${brandTheme.spacing.md};
    padding-top: ${brandTheme.spacing.md};
    border-top: 1px solid ${brandTheme.border};
`;

const EntitiesLabel = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 600;
    margin-bottom: ${brandTheme.spacing.xs};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const EntitiesList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${brandTheme.spacing.xs};
`;

const EntityLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    border-radius: ${brandTheme.radius.sm};
    text-decoration: none;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
    border: 1px solid transparent;

    &:hover {
        background: ${brandTheme.primary};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
    }

    svg {
        font-size: 10px;
        opacity: 0.7;
    }
`;

const EntityName = styled.span`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
`;

const MetadataSection = styled.div`
    margin-top: ${brandTheme.spacing.sm};
`;

const MetadataNotes = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    font-style: italic;
    background: ${brandTheme.surfaceAlt};
    padding: ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.sm};
    border-left: 3px solid ${brandTheme.primary};
`;

export default ActivityTimelineList;