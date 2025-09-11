// src/pages/RecurringEvents/EventCalendarPage.tsx
/**
 * Event Calendar Page - Specialized calendar view for recurring events
 * Integrates with existing calendar infrastructure but focuses on recurring events
 */

import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt,
    FaFilter,
    FaEye,
    FaEdit,
    FaCheckCircle,
    FaTimes,
    FaArrowLeft
} from 'react-icons/fa';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import { PageHeader, SecondaryButton } from '../../components/common/PageHeader';
import AppointmentCalendar from '../../components/calendar/Calendar';
import Modal from '../../components/common/Modal';
import { useEventCalendar, useEventOccurrences } from '../../hooks/useRecurringEvents';
import {
    EventCalendarItem,
    EventType,
    OccurrenceStatus,
    OccurrenceStatusLabels,
    OccurrenceStatusColors,
    EventTypeLabels
} from '../../types/recurringEvents';
import { Appointment } from '../../types';
import { theme } from '../../styles/theme';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

const EventCalendarPage: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [selectedOccurrence, setSelectedOccurrence] = useState<EventCalendarItem | null>(null);
    const [showOccurrenceModal, setShowOccurrenceModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [typeFilters, setTypeFilters] = useState<Set<EventType>>(new Set(Object.values(EventType)));
    const [statusFilters, setStatusFilters] = useState<Set<OccurrenceStatus>>(new Set(Object.values(OccurrenceStatus)));

    // Hooks
    const {
        events,
        dateRange,
        isLoading,
        error,
        updateDateRange,
        updateFilters
    } = useEventCalendar();

    // Convert events to calendar format
    const calendarAppointments = useMemo(() => {
        return events
            .filter(event => typeFilters.has(event.type) && statusFilters.has(event.status))
            .map(event => ({
                id: `occurrence-${event.id}`,
                title: event.title,
                start: new Date(event.date),
                end: new Date(new Date(event.date).getTime() + (event.duration || 60) * 60000),
                isProtocol: false,
                status: event.status,
                customerId: '',
                vehicleId: '',
                services: [],
                // Additional data for recurring events
                recurringEventId: event.recurringEventId,
                eventType: event.type,
                occurrenceStatus: event.status
            })) as Appointment[];
    }, [events, typeFilters, statusFilters]);

    // Handle date range change from calendar
    const handleRangeChange = useCallback((range: { start: Date; end: Date }) => {
        updateDateRange(range.start, range.end);
    }, [updateDateRange]);

    // Handle occurrence selection
    const handleOccurrenceSelect = useCallback((appointment: Appointment) => {
        // Find the corresponding event occurrence
        const eventOccurrence = events.find(event => `occurrence-${event.id}` === appointment.id);
        if (eventOccurrence) {
            setSelectedOccurrence(eventOccurrence);
            setShowOccurrenceModal(true);
        }
    }, [events]);

    // Handle filter changes
    const handleTypeFilterChange = useCallback((type: EventType, enabled: boolean) => {
        setTypeFilters(prev => {
            const newSet = new Set(prev);
            if (enabled) {
                newSet.add(type);
            } else {
                newSet.delete(type);
            }
            return newSet;
        });
    }, []);

    const handleStatusFilterChange = useCallback((status: OccurrenceStatus, enabled: boolean) => {
        setStatusFilters(prev => {
            const newSet = new Set(prev);
            if (enabled) {
                newSet.add(status);
            } else {
                newSet.delete(status);
            }
            return newSet;
        });
    }, []);

    // Apply filters to API
    const applyFilters = useCallback(() => {
        updateFilters({
            eventTypes: Array.from(typeFilters),
            statuses: Array.from(statusFilters)
        });
        setShowFilters(false);
    }, [typeFilters, statusFilters, updateFilters]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        setTypeFilters(new Set(Object.values(EventType)));
        setStatusFilters(new Set(Object.values(OccurrenceStatus)));
        updateFilters({});
    }, [updateFilters]);

    // Navigate to event details
    const handleViewEventDetails = useCallback(() => {
        if (selectedOccurrence) {
            navigate(`/recurring-events/${selectedOccurrence.recurringEventId}`);
        }
    }, [selectedOccurrence, navigate]);

    // Navigate to occurrences management
    const handleManageOccurrences = useCallback(() => {
        if (selectedOccurrence) {
            navigate(`/recurring-events/${selectedOccurrence.recurringEventId}/occurrences`);
        }
    }, [selectedOccurrence, navigate]);

    return (
        <ErrorBoundary>
            <PageContainer>
                {/* Header */}
                <PageHeader
                    icon={FaCalendarAlt}
                    title="Kalendarz Wydarzeń"
                    subtitle="Widok kalendarza wszystkich cyklicznych wydarzeń i ich wystąpień"
                    actions={
                        <HeaderActions>
                            <SecondaryButton onClick={() => navigate('/recurring-events')}>
                                <FaArrowLeft />
                                Powrót do listy
                            </SecondaryButton>
                            <FilterToggleButton
                                onClick={() => setShowFilters(!showFilters)}
                                $active={showFilters}
                            >
                                <FaFilter />
                                Filtry
                            </FilterToggleButton>
                        </HeaderActions>
                    }
                />

                {/* Filters Panel */}
                {showFilters && (
                    <FiltersPanel>
                        <FilterSection>
                            <FilterTitle>Typ wydarzenia:</FilterTitle>
                            <FilterCheckboxGroup>
                                {Object.values(EventType).map(type => (
                                    <FilterCheckbox key={type}>
                                        <CheckboxInput
                                            type="checkbox"
                                            checked={typeFilters.has(type)}
                                            onChange={(e) => handleTypeFilterChange(type, e.target.checked)}
                                        />
                                        <CheckboxLabel>{EventTypeLabels[type]}</CheckboxLabel>
                                    </FilterCheckbox>
                                ))}
                            </FilterCheckboxGroup>
                        </FilterSection>

                        <FilterSection>
                            <FilterTitle>Status wystąpienia:</FilterTitle>
                            <FilterCheckboxGroup>
                                {Object.values(OccurrenceStatus).map(status => (
                                    <FilterCheckbox key={status}>
                                        <CheckboxInput
                                            type="checkbox"
                                            checked={statusFilters.has(status)}
                                            onChange={(e) => handleStatusFilterChange(status, e.target.checked)}
                                        />
                                        <CheckboxLabel>
                                            <StatusDot $color={OccurrenceStatusColors[status]} />
                                            {OccurrenceStatusLabels[status]}
                                        </CheckboxLabel>
                                    </FilterCheckbox>
                                ))}
                            </FilterCheckboxGroup>
                        </FilterSection>

                        <FilterActions>
                            <FilterButton onClick={clearAllFilters} variant="secondary">
                                Wyczyść wszystko
                            </FilterButton>
                            <FilterButton onClick={applyFilters} variant="primary">
                                Zastosuj filtry
                            </FilterButton>
                        </FilterActions>
                    </FiltersPanel>
                )}

                {/* Calendar */}
                <CalendarSection>
                    <AppointmentCalendar
                        key="recurring-events-calendar"
                        events={calendarAppointments}
                        onEventSelect={handleOccurrenceSelect}
                        onRangeChange={handleRangeChange}
                        // Don't allow creating appointments from this calendar
                        onEventCreate={undefined}
                    />

                    {/* Loading/Error Overlays */}
                    {isLoading && (
                        <CalendarOverlay>
                            <LoadingSpinner />
                            <LoadingText>Ładowanie wydarzeń...</LoadingText>
                        </CalendarOverlay>
                    )}

                    {error && !isLoading && (
                        <CalendarOverlay>
                            <ErrorMessage>
                                <ErrorIcon>⚠️</ErrorIcon>
                                <span>{error}</span>
                            </ErrorMessage>
                        </CalendarOverlay>
                    )}
                </CalendarSection>

                {/* Occurrence Details Modal */}
                <Modal
                    isOpen={showOccurrenceModal}
                    onClose={() => setShowOccurrenceModal(false)}
                    title="Szczegóły wystąpienia"
                    size="md"
                >
                    {selectedOccurrence && (
                        <OccurrenceDetails>
                            <OccurrenceHeader>
                                <OccurrenceTitle>{selectedOccurrence.title}</OccurrenceTitle>
                                <OccurrenceStatusBadge $status={selectedOccurrence.status}>
                                    {OccurrenceStatusLabels[selectedOccurrence.status]}
                                </OccurrenceStatusBadge>
                            </OccurrenceHeader>

                            <OccurrenceInfo>
                                <InfoRow>
                                    <InfoLabel>Data wystąpienia:</InfoLabel>
                                    <InfoValue>
                                        {format(new Date(selectedOccurrence.date), 'EEEE, dd MMMM yyyy', { locale: pl })}
                                    </InfoValue>
                                </InfoRow>
                                <InfoRow>
                                    <InfoLabel>Typ wydarzenia:</InfoLabel>
                                    <InfoValue>{EventTypeLabels[selectedOccurrence.type]}</InfoValue>
                                </InfoRow>
                                {selectedOccurrence.duration && (
                                    <InfoRow>
                                        <InfoLabel>Czas trwania:</InfoLabel>
                                        <InfoValue>{selectedOccurrence.duration} minut</InfoValue>
                                    </InfoRow>
                                )}
                            </OccurrenceInfo>

                            <OccurrenceActions>
                                <SecondaryButton onClick={handleViewEventDetails}>
                                    <FaEye />
                                    Szczegóły wydarzenia
                                </SecondaryButton>
                                <SecondaryButton onClick={handleManageOccurrences}>
                                    <FaEdit />
                                    Zarządzaj wystąpieniami
                                </SecondaryButton>
                            </OccurrenceActions>
                        </OccurrenceDetails>
                    )}
                </Modal>
            </PageContainer>
        </ErrorBoundary>
    );
};

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    align-items: center;
`;

const FilterToggleButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.secondary};
    border: 1px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$active ? theme.primaryDark : theme.surfaceHover};
        border-color: ${theme.primary};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }
`;

const FiltersPanel = styled.div`
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    margin: ${theme.spacing.xl};
    margin-top: 0;
    padding: ${theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    box-shadow: ${theme.shadow.sm};
`;

const FilterSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const FilterTitle = styled.h4`
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const FilterCheckboxGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.md};
`;

const FilterCheckbox = styled.label`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    cursor: pointer;
    user-select: none;
`;

const CheckboxInput = styled.input`
    width: 16px;
    height: 16px;
    accent-color: ${theme.primary};
`;

const CheckboxLabel = styled.span`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 14px;
    color: ${theme.text.primary};
`;

const StatusDot = styled.div<{ $color: string }>`
    width: 8px;
    height: 8px;
    background: ${props => props.$color};
    border-radius: 50%;
`;

const FilterActions = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    justify-content: flex-end;
`;

const FilterButton = styled.button<{ variant: 'primary' | 'secondary' }>`
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;

    ${props => props.variant === 'primary' ? `
        background: ${theme.primary};
        color: white;
        border-color: ${theme.primary};

        &:hover {
            background: ${theme.primaryDark};
        }
    ` : `
        background: ${theme.surface};
        color: ${theme.text.secondary};
        border-color: ${theme.border};

        &:hover {
            background: ${theme.surfaceHover};
            border-color: ${theme.borderActive};
        }
    `}
`;

const CalendarSection = styled.section`
    flex: 1;
    margin: ${theme.spacing.xl};
    position: relative;
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    border: 1px solid ${theme.border};
    box-shadow: ${theme.shadow.lg};
    overflow: hidden;
`;

const CalendarOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.lg};
    z-index: 10;
    backdrop-filter: blur(4px);
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid ${theme.borderLight};
    border-top: 3px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${theme.text.tertiary};
    font-weight: 500;
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    font-size: 16px;
    color: ${theme.error};
    font-weight: 500;
`;

const ErrorIcon = styled.div`
    font-size: 24px;
`;

const OccurrenceDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.lg};
`;

const OccurrenceHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: ${theme.spacing.md};
`;

const OccurrenceTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    flex: 1;
`;

const OccurrenceStatusBadge = styled.div<{ $status: OccurrenceStatus }>`
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${props => OccurrenceStatusColors[props.$status]}20;
    color: ${props => OccurrenceStatusColors[props.$status]};
    border: 1px solid ${props => OccurrenceStatusColors[props.$status]}40;
    border-radius: ${theme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const OccurrenceInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const InfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.sm} 0;
    border-bottom: 1px solid ${theme.borderLight};

    &:last-child {
        border-bottom: none;
    }
`;

const InfoLabel = styled.span`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.secondary};
`;

const InfoValue = styled.span`
    font-size: 14px;
    color: ${theme.text.primary};
    font-weight: 500;
`;

const OccurrenceActions = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    justify-content: flex-end;
`;

export default EventCalendarPage;