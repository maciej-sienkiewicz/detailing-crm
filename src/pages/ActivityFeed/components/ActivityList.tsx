import React, { useMemo } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaSpinner,
    FaInfoCircle,
    FaCalendarAlt,
    FaClipboardCheck,
    FaComment,
    FaPhone,
    FaUser,
    FaCar,
    FaBell,
    FaCog
} from 'react-icons/fa';
import { ActivityItem } from '../../../types/activity';
import ActivityGroup from './ActivityGroup';
import ActivityListItem from './ActivityListItem';

interface ActivityListProps {
    activities: ActivityItem[];
    loading: boolean;
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, loading }) => {
    // Grupowanie aktywności według daty
    const groupedActivities = useMemo(() => {
        const groups: { [key: string]: ActivityItem[] } = {};

        // Funkcja pomocnicza do uzyskania klucza daty (dzisiaj, wczoraj, data)
        const getDateKey = (timestamp: string): string => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const date = new Date(timestamp);
            date.setHours(0, 0, 0, 0);

            if (date.getTime() === today.getTime()) {
                return 'today';
            } else if (date.getTime() === yesterday.getTime()) {
                return 'yesterday';
            } else {
                return format(date, 'yyyy-MM-dd');
            }
        };

        // Grupowanie według daty
        activities.forEach(activity => {
            const dateKey = getDateKey(activity.timestamp);
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(activity);
        });

        // Sortowanie wewnątrz grup według czasu (od najnowszych)
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });
        });

        return groups;
    }, [activities]);

    // Formatowanie nagłówków grup
    const formatGroupTitle = (key: string): string => {
        if (key === 'today') {
            return 'Dzisiaj';
        } else if (key === 'yesterday') {
            return 'Wczoraj';
        } else {
            const date = new Date(key);
            return format(date, 'd MMMM yyyy', { locale: pl });
        }
    };

    // Ikona dla kategorii aktywności
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'appointment':
                return <FaCalendarAlt />;
            case 'protocol':
                return <FaClipboardCheck />;
            case 'comment':
                return <FaComment />;
            case 'call':
                return <FaPhone />;
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

    // Renderowanie listy aktywności
    if (loading) {
        return (
            <LoadingContainer>
                <FaSpinner className="spinner" />
                <p>Ładowanie aktywności...</p>
            </LoadingContainer>
        );
    }

    if (activities.length === 0) {
        return (
            <EmptyContainer>
                <FaInfoCircle />
                <p>Brak aktywności w wybranym okresie.</p>
            </EmptyContainer>
        );
    }

    // Sortowanie kluczy dat (dzisiaj, wczoraj, a potem reszta dat)
    const sortedDateKeys = Object.keys(groupedActivities).sort((a, b) => {
        if (a === 'today') return -1;
        if (b === 'today') return 1;
        if (a === 'yesterday') return -1;
        if (b === 'yesterday') return 1;
        return new Date(b).getTime() - new Date(a).getTime();
    });

    return (
        <ListContainer>
            {sortedDateKeys.map((dateKey) => (
                <ActivityGroup
                    key={dateKey}
                    date={dateKey}
                    title={formatGroupTitle(dateKey)}
                >
                    {groupedActivities[dateKey].map((activity) => (
                        <ActivityListItem
                            key={activity.id}
                            activity={activity}
                            icon={getCategoryIcon(activity.category)}
                        />
                    ))}
                </ActivityGroup>
            ))}
        </ListContainer>
    );
};

// Styled components
const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #7f8c8d;
  
  .spinner {
    animation: spin 1s linear infinite;
    font-size: 32px;
    margin-bottom: 15px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    font-size: 16px;
    margin: 0;
  }
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #7f8c8d;
  background-color: #f9f9f9;
  border-radius: 8px;
  
  svg {
    font-size: 32px;
    margin-bottom: 15px;
    opacity: 0.5;
  }
  
  p {
    font-size: 16px;
    margin: 0;
  }
`;

export default ActivityList;