// src/components/calendar/AppointmentDetails.tsx - FIXED VERSION
import React, {useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';
import {format} from 'date-fns';
import {pl} from 'date-fns/locale';
import {
    FaCalendarAlt,
    FaCar,
    FaClipboardCheck,
    FaClock,
    FaEdit,
    FaExternalLinkAlt,
    FaTimes,
    FaTools,
    FaTrash,
    FaUser,
    FaSync,
    FaHistory,
    FaCheck,
    FaCheckCircle
} from 'react-icons/fa';
import {Appointment, ProtocolStatus} from '../../types';
import {
    EventOccurrenceResponse,
    RecurringEventResponse,
    OccurrenceStatusLabels,
    ConvertToVisitResponse,
    EventType,
    OccurrenceStatus
} from '../../types/recurringEvents';
import {useNavigate} from 'react-router-dom';
import {theme} from '../../styles/theme';
import {recurringEventsApi} from '../../api/recurringEventsApi';
import {useToast} from "../common/Toast/Toast";
import ConvertToVisitModal from "./ConvertToVisitModal";
import {canConvertToVisit, isAlreadyConverted, isRecurringVisit} from "../../utils/recurringVisitUtils";

interface AppointmentDetailsProps {
    appointment: Appointment;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (status: any) => void;
    onCreateProtocol: () => void;
    onConvertToVisit?: (visitResponse: ConvertToVisitResponse) => void;
}

// Utility functions for recurring events
const isRecurringEventAppointment = (appointmentId: string): boolean => {
    return appointmentId.startsWith('recurring-');
};

const extractOccurrenceId = (appointmentId: string): string | null => {
    if (isRecurringEventAppointment(appointmentId)) {
        return appointmentId.replace('recurring-', '');
    }
    return null;
};

// FIXED: Helper function to determine if this is a SIMPLE_EVENT
const isSimpleEvent = (appointment: Appointment): boolean => {
    const occurrenceData = (appointment as any).recurringEventData as EventOccurrenceResponse;

    // FIXED: Check in recurringEvent first (the correct field name)
    if (occurrenceData?.recurringEvent?.type) {
        return occurrenceData.recurringEvent.type === EventType.SIMPLE_EVENT;
    }

    return false;
};

// Helper function to check if event is already completed
const isEventCompleted = (appointment: Appointment): boolean => {
    const occurrenceData = (appointment as any).recurringEventData as EventOccurrenceResponse;
    return occurrenceData?.status === OccurrenceStatus.COMPLETED;
};

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
                                                                   appointment,
                                                                   onEdit,
                                                                   onDelete,
                                                                   onStatusChange,
                                                                   onCreateProtocol,
                                                                   onConvertToVisit
                                                               }) => {
    const navigate = useNavigate();
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [recurringEventDetails, setRecurringEventDetails] = useState<RecurringEventResponse | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const isRecurringEvent = isRecurringVisit(appointment);
    const isSimpleEventType = isSimpleEvent(appointment);
    const isCompleted = isEventCompleted(appointment);
    const canConvert = canConvertToVisit(appointment);
    const alreadyConverted = isAlreadyConverted(appointment);

    const occurrenceData = (appointment as any).recurringEventData as EventOccurrenceResponse;

    const [showConvertModal, setShowConvertModal] = useState(false);
    const { showToast } = useToast();

    // Load recurring event details if this is a recurring event
    useEffect(() => {
        if (isRecurringEvent && occurrenceData && !recurringEventDetails) {
            setLoadingDetails(true);
            recurringEventsApi.getRecurringEventById(occurrenceData.recurringEventId)
                .then(details => {
                    setRecurringEventDetails(details);
                })
                .catch(err => {
                    console.error('Failed to load recurring event details:', err);
                })
                .finally(() => {
                    setLoadingDetails(false);
                });
        }
    }, [isRecurringEvent, occurrenceData, recurringEventDetails]);

    const formatDateTime = (date: Date) => {
        return format(date, 'EEEE, dd MMMM yyyy • HH:mm', { locale: pl });
    };

    const formatTimeOnly = (date: Date) => {
        return format(date, 'HH:mm', { locale: pl });
    };

    const handleGoToProtocol = () => {
        if (appointment.isProtocol && appointment.id) {
            const protocolId = appointment.id.replace('protocol-', '');
            navigate(`/visits/${protocolId}`);
        }
    };

    const handleGoToRecurringEvent = () => {
        if (isRecurringEvent && occurrenceData) {
            navigate(`/recurring-events/${occurrenceData.recurringEventId}`);
        }
    };

    const calculateNetPrice = (grossPrice: number): number => {
        return grossPrice / 1.23;
    };

    const calculateTotalValue = (): { gross: number; net: number } => {
        if (!appointment.services || appointment.services.length === 0) {
            return { gross: 0, net: 0 };
        }

        const gross = appointment.services.reduce((sum, service) => sum + service.price, 0);
        const net = calculateNetPrice(gross);

        return { gross, net };
    };

    const totalValue = calculateTotalValue();

    const handleDeleteClick = () => {
        setShowConfirmDelete(true);
    };

    const confirmDelete = () => {
        onDelete();
        setShowConfirmDelete(false);
    };

    // Handle marking simple event as completed
    const handleMarkAsCompleted = useCallback(async () => {
        if (!occurrenceData) {
            showToast('error', 'Brak danych wystąpienia', 3000);
            return;
        }

        setUpdatingStatus(true);
        try {
            await recurringEventsApi.updateOccurrenceStatus(
                occurrenceData.recurringEventId,
                occurrenceData.id,
                {
                    status: OccurrenceStatus.COMPLETED,
                    notes: 'Oznaczone jako wykonane przez użytkownika'
                }
            );

            showToast('success', 'Wydarzenie zostało oznaczone jako wykonane', 4000);

            // Update the status in parent component
            onStatusChange('COMPLETED');

        } catch (error) {
            console.error('Error marking event as completed:', error);
            showToast('error', 'Nie udało się oznaczyć wydarzenia jako wykonane', 5000);
        } finally {
            setUpdatingStatus(false);
        }
    }, [occurrenceData, showToast, onStatusChange]);

    const handleConvertToVisit = useCallback(() => {
        if (!canConvert) {
            if (alreadyConverted) {
                showToast('info', 'Ta cykliczna wizyta została już przekształcona w wizytę', 4000);
            } else {
                showToast('error', 'Tej cyklicznej wizyty nie można przekształcić', 4000);
            }
            return;
        }

        setShowConvertModal(true);
    }, [canConvert, alreadyConverted, showToast]);

    const handleConvertSuccess = useCallback((visitResponse: ConvertToVisitResponse) => {
        setShowConvertModal(false);

        if (onConvertToVisit) {
            onConvertToVisit(visitResponse);
        }
    }, [onConvertToVisit]);

    return (
        <DetailsContainer>
            {/* Header */}
            <DetailsHeader $isRecurring={isRecurringEvent}>
                <HeaderContent>
                    <HeaderInfo>
                        <AppointmentTitle>
                            {appointment.title}
                        </AppointmentTitle>
                        <AppointmentMeta>
                            {isRecurringEvent ? (
                                <>
                                    {isSimpleEventType ? 'Proste wydarzenie' : 'Cykliczna wizyta'} • Status: {occurrenceData ? OccurrenceStatusLabels[occurrenceData.status] : 'Nieznany'}
                                    {loadingDetails && ' • Ładowanie szczegółów...'}
                                </>
                            ) : (
                                appointment.customerId && `Właściciel: ${appointment.customerId}`
                            )}
                        </AppointmentMeta>
                    </HeaderInfo>

                    {isRecurringEvent ? (
                        <RecurringActionButton onClick={handleGoToRecurringEvent}>
                            <FaHistory />
                            <span>Pokaż {isSimpleEventType ? 'wydarzenie' : 'cykliczne wydarzenie'}</span>
                        </RecurringActionButton>
                    ) : appointment.isProtocol && (appointment.status as unknown as ProtocolStatus) !== ProtocolStatus.SCHEDULED && (
                        <ProtocolActionButton onClick={handleGoToProtocol}>
                            <FaExternalLinkAlt />
                            <span>Otwórz protokół</span>
                        </ProtocolActionButton>
                    )}
                </HeaderContent>
            </DetailsHeader>

            {/* Recurring Event Details Section */}
            {isRecurringEvent && recurringEventDetails && (
                <RecurringEventSection>
                    <SectionHeader>
                        <SectionTitle>
                            Szczegóły {isSimpleEventType ? 'wydarzenia' : 'cyklicznego wydarzenia'}
                        </SectionTitle>
                    </SectionHeader>
                    <RecurringEventContent>
                        <RecurringEventGrid>
                            {!isSimpleEventType && (
                                <RecurringEventItem>
                                    <InfoIcon><FaSync /></InfoIcon>
                                    <InfoContent>
                                        <InfoLabel>Częstotliwość</InfoLabel>
                                        <InfoValue>
                                            {recurringEventDetails.recurrencePattern.frequency}
                                            {recurringEventDetails.recurrencePattern.interval > 1 &&
                                                ` (co ${recurringEventDetails.recurrencePattern.interval})`
                                            }
                                        </InfoValue>
                                    </InfoContent>
                                </RecurringEventItem>
                            )}

                            {!isSimpleEventType && recurringEventDetails.recurrencePattern.daysOfWeek && (
                                <RecurringEventItem>
                                    <InfoIcon><FaCalendarAlt /></InfoIcon>
                                    <InfoContent>
                                        <InfoLabel>Dni tygodnia</InfoLabel>
                                        <InfoValue>
                                            {recurringEventDetails.recurrencePattern.daysOfWeek.join(', ')}
                                        </InfoValue>
                                    </InfoContent>
                                </RecurringEventItem>
                            )}

                            {!isSimpleEventType && recurringEventDetails.recurrencePattern.endDate && (
                                <RecurringEventItem>
                                    <InfoIcon><FaClock /></InfoIcon>
                                    <InfoContent>
                                        <InfoLabel>Koniec serii</InfoLabel>
                                        <InfoValue>
                                            {format(new Date(recurringEventDetails.recurrencePattern.endDate), 'dd MMMM yyyy', { locale: pl })}
                                        </InfoValue>
                                    </InfoContent>
                                </RecurringEventItem>
                            )}

                            {isSimpleEventType && (
                                <RecurringEventItem>
                                    <InfoIcon><FaCalendarAlt /></InfoIcon>
                                    <InfoContent>
                                        <InfoLabel>Typ wydarzenia</InfoLabel>
                                        <InfoValue>Jednorazowe wydarzenie</InfoValue>
                                    </InfoContent>
                                </RecurringEventItem>
                            )}
                        </RecurringEventGrid>

                        {recurringEventDetails.description && (
                            <RecurringEventDescription>
                                <InfoLabel>Opis wydarzenia</InfoLabel>
                                <InfoValue>{recurringEventDetails.description}</InfoValue>
                            </RecurringEventDescription>
                        )}
                    </RecurringEventContent>
                </RecurringEventSection>
            )}

            {/* Schedule Information */}
            <InfoSection>
                <SectionHeader>
                    <SectionTitle>Szczegóły terminu</SectionTitle>
                </SectionHeader>
                <InfoGrid>
                    <InfoItem>
                        <InfoIcon>
                            <FaCalendarAlt />
                        </InfoIcon>
                        <InfoContent>
                            <InfoLabel>Data i godzina rozpoczęcia</InfoLabel>
                            <InfoValue>{formatDateTime(appointment.start)}</InfoValue>
                        </InfoContent>
                    </InfoItem>

                    <InfoItem>
                        <InfoIcon>
                            <FaClock />
                        </InfoIcon>
                        <InfoContent>
                            <InfoLabel>Czas trwania</InfoLabel>
                            <InfoValue>
                                {formatTimeOnly(appointment.start)} - {formatTimeOnly(appointment.end)}
                            </InfoValue>
                        </InfoContent>
                    </InfoItem>
                </InfoGrid>
            </InfoSection>

            {/* Client & Vehicle Information */}
            {(appointment.customerId || appointment.vehicleId || (isRecurringEvent && recurringEventDetails?.visitTemplate)) && (
                <InfoSection>
                    <SectionHeader>
                        <SectionTitle>Klient i pojazd</SectionTitle>
                    </SectionHeader>
                    <InfoGrid>
                        {(appointment.customerId || recurringEventDetails?.visitTemplate?.clientId) && (
                            <InfoItem>
                                <InfoIcon>
                                    <FaUser />
                                </InfoIcon>
                                <InfoContent>
                                    <InfoLabel>Klient</InfoLabel>
                                    <InfoValue>
                                        {appointment.customerId ||
                                            (recurringEventDetails?.visitTemplate?.clientId ?
                                                `Klient #${recurringEventDetails.visitTemplate.clientId}` :
                                                'Nie przypisano')}
                                    </InfoValue>
                                </InfoContent>
                            </InfoItem>
                        )}

                        {(appointment.vehicleId || recurringEventDetails?.visitTemplate?.vehicleId) && (
                            <InfoItem>
                                <InfoIcon>
                                    <FaCar />
                                </InfoIcon>
                                <InfoContent>
                                    <InfoLabel>Pojazd</InfoLabel>
                                    <InfoValue>
                                        {appointment.vehicleId ||
                                            (recurringEventDetails?.visitTemplate?.vehicleId ?
                                                `Pojazd #${recurringEventDetails.visitTemplate.vehicleId}` :
                                                'Nie przypisano')}
                                    </InfoValue>
                                </InfoContent>
                            </InfoItem>
                        )}
                    </InfoGrid>
                </InfoSection>
            )}

            {/* Services Section */}
            {((appointment.services && appointment.services.length > 0) ||
                (isRecurringEvent && !isSimpleEventType && recurringEventDetails?.visitTemplate?.defaultServices.length)) && (
                <ServicesSection>
                    <SectionHeader>
                        <SectionTitleWithIcon>
                            <FaTools />
                            <span>Wykaz usług ({
                                appointment.services?.length ||
                                recurringEventDetails?.visitTemplate?.defaultServices.length || 0
                            })</span>
                        </SectionTitleWithIcon>
                        <TotalValue>
                            <TotalLabel>Wartość łączna:</TotalLabel>
                            <TotalAmount>
                                {isRecurringEvent && !appointment.services?.length ?
                                    'Szacowana według szablonu' :
                                    `${totalValue.gross.toFixed(2)} zł`}
                            </TotalAmount>
                        </TotalValue>
                    </SectionHeader>

                    <ServicesContent>
                        <ServicesList>
                            {(appointment.services || recurringEventDetails?.visitTemplate?.defaultServices || []).map((service, index) => (
                                <ServiceItem key={index}>
                                    <ServiceInfo>
                                        <ServiceName>{service.name}</ServiceName>
                                        <ServiceMeta>
                                            {isRecurringEvent && !appointment.services?.length ?
                                                'Usługa z szablonu' :
                                                `Pozycja ${index + 1} z ${appointment.services?.length || 0}`}
                                        </ServiceMeta>
                                    </ServiceInfo>

                                    <ServicePricing>
                                        <PriceRow>
                                            <PriceLabel>Cena bazowa:</PriceLabel>
                                            <PriceValue $primary>
                                                {((service as any).finalPrice || (service as any).basePrice || 0).toFixed(2)} zł
                                            </PriceValue>
                                        </PriceRow>
                                        {isRecurringEvent && !appointment.services?.length && (
                                            <ServiceNote>
                                                Ostateczna cena będzie ustalona podczas wizyty
                                            </ServiceNote>
                                        )}
                                    </ServicePricing>
                                </ServiceItem>
                            ))}
                        </ServicesList>

                        {!isRecurringEvent && appointment.services && appointment.services.length > 0 && (
                            <ServicesSummary>
                                <SummaryRow>
                                    <SummaryLabel>Razem netto:</SummaryLabel>
                                    <SummaryValue>{totalValue.net.toFixed(2)} zł</SummaryValue>
                                </SummaryRow>
                                <SummaryRow $primary>
                                    <SummaryLabel>Razem brutto:</SummaryLabel>
                                    <SummaryValue $primary>{totalValue.gross.toFixed(2)} zł</SummaryValue>
                                </SummaryRow>
                            </ServicesSummary>
                        )}
                    </ServicesContent>
                </ServicesSection>
            )}

            {/* Action Buttons */}
            <ActionsSection>
                {isRecurringEvent ? (
                    <RecurringEventActions>
                        <SecondaryAction onClick={handleGoToRecurringEvent}>
                            <FaHistory />
                            <span>{isSimpleEventType ? 'Pokaż wydarzenie' : 'Zarządzaj serią'}</span>
                        </SecondaryAction>

                        {/* Different actions based on event type */}
                        {isSimpleEventType ? (
                            // Actions for SIMPLE_EVENT
                            isCompleted ? (
                                <CompletedAction>
                                    <FaCheckCircle />
                                    <ActionContent>
                                        <ActionLabel>Wykonane</ActionLabel>
                                        <ActionHint>Wydarzenie zakończone</ActionHint>
                                    </ActionContent>
                                </CompletedAction>
                            ) : (
                                <PrimaryAction onClick={handleMarkAsCompleted} disabled={updatingStatus}>
                                    {updatingStatus ? (
                                        <LoadingSpinner>⟳</LoadingSpinner>
                                    ) : (
                                        <FaCheckCircle />
                                    )}
                                    <ActionContent>
                                        <ActionLabel>
                                            {updatingStatus ? 'Aktualizowanie...' : 'Oznacz jako wykonane'}
                                        </ActionLabel>
                                        <ActionHint>Zakończ wydarzenie</ActionHint>
                                    </ActionContent>
                                </PrimaryAction>
                            )
                        ) : (
                            // Actions for RECURRING_VISIT
                            canConvert ? (
                                <PrimaryAction onClick={handleConvertToVisit}>
                                    <FaClipboardCheck />
                                    <ActionContent>
                                        <ActionLabel>Przekształć na wizytę</ActionLabel>
                                        <ActionHint>Utwórz pełny protokół</ActionHint>
                                    </ActionContent>
                                </PrimaryAction>
                            ) : alreadyConverted ? (
                                <ConvertedAction>
                                    <FaCheck />
                                    <ActionContent>
                                        <ActionLabel>Przekształcone</ActionLabel>
                                        <ActionHint>Wizyta została utworzona</ActionHint>
                                    </ActionContent>
                                </ConvertedAction>
                            ) : (
                                <DisabledAction>
                                    <FaTimes />
                                    <ActionContent>
                                        <ActionLabel>Nie można przekształcić</ActionLabel>
                                        <ActionHint>Status nie pozwala</ActionHint>
                                    </ActionContent>
                                </DisabledAction>
                            )
                        )}

                        <DangerAction onClick={() => onStatusChange('CANCELLED')}>
                            <FaTimes />
                            <span>{isSimpleEventType ? 'Anuluj wydarzenie' : 'Anuluj wystąpienie'}</span>
                        </DangerAction>
                    </RecurringEventActions>
                ) : appointment.isProtocol && (appointment.status as unknown as ProtocolStatus) === ProtocolStatus.SCHEDULED ? (
                    <ActionGrid>
                        <SecondaryAction onClick={onEdit}>
                            <FaEdit />
                            <span>Edytuj</span>
                        </SecondaryAction>

                        <PrimaryAction onClick={onCreateProtocol}>
                            <FaClipboardCheck />
                            <ActionContent>
                                <ActionLabel>Rozpocznij wizytę</ActionLabel>
                                <ActionHint>Utwórz protokół</ActionHint>
                            </ActionContent>
                        </PrimaryAction>

                        <DangerAction onClick={handleDeleteClick}>
                            <FaTrash />
                            <span>Usuń</span>
                        </DangerAction>
                    </ActionGrid>
                ) : !appointment.isProtocol ? (
                    <ActionGrid>
                        <SecondaryAction onClick={onEdit}>
                            <FaEdit />
                            <span>Edytuj</span>
                        </SecondaryAction>

                        <PrimaryAction onClick={onCreateProtocol}>
                            <FaClipboardCheck />
                            <ActionContent>
                                <ActionLabel>Rozpocznij wizytę</ActionLabel>
                                <ActionHint>Utwórz protokół</ActionHint>
                            </ActionContent>
                        </PrimaryAction>

                        <DangerAction onClick={handleDeleteClick}>
                            <FaTrash />
                            <span>Usuń</span>
                        </DangerAction>
                    </ActionGrid>
                ) : null}
            </ActionsSection>

            {/* Delete Confirmation Modal */}
            {showConfirmDelete && (
                <ConfirmModal>
                    <ModalOverlay onClick={() => setShowConfirmDelete(false)} />
                    <ModalContent>
                        <ModalHeader>
                            <ModalIcon>
                                <FaTrash />
                            </ModalIcon>
                            <ModalTitle>
                                {isRecurringEvent ? 'Potwierdź anulowanie' : 'Potwierdź usunięcie'}
                            </ModalTitle>
                        </ModalHeader>

                        <ModalBody>
                            <WarningText>
                                {isRecurringEvent ?
                                    `Czy na pewno chcesz anulować ${isSimpleEventType ? 'to wydarzenie' : 'to wystąpienie cyklicznego wydarzenia'} "${appointment.title}"?` :
                                    `Czy na pewno chcesz usunąć wizytę "${appointment.title}"?`
                                }
                            </WarningText>
                            <WarningSubtext>
                                {isRecurringEvent ?
                                    isSimpleEventType ?
                                        'To wydarzenie zostanie oznaczone jako anulowane.' :
                                        'To wystąpienie zostanie oznaczone jako anulowane, ale pozostałe w serii pozostaną bez zmian.' :
                                    'Ta operacja jest nieodwracalna. Wszystkie dane zostaną trwale usunięte.'
                                }
                            </WarningSubtext>
                        </ModalBody>

                        <ModalActions>
                            <ModalButton $variant="secondary" onClick={() => setShowConfirmDelete(false)}>
                                <FaTimes />
                                Anuluj
                            </ModalButton>
                            <ModalButton $variant="danger" onClick={confirmDelete}>
                                <FaTrash />
                                {isRecurringEvent ?
                                    (isSimpleEventType ? 'Anuluj wydarzenie' : 'Anuluj wystąpienie') :
                                    'Usuń wizytę'
                                }
                            </ModalButton>
                        </ModalActions>
                    </ModalContent>
                </ConfirmModal>
            )}

            {showConvertModal && isRecurringEvent && !isSimpleEventType && occurrenceData && (
                <ConvertToVisitModal
                    isOpen={showConvertModal}
                    occurrence={occurrenceData}
                    recurringEventDetails={recurringEventDetails}
                    onClose={() => setShowConvertModal(false)}
                    onSuccess={handleConvertSuccess}
                />
            )}
        </DetailsContainer>
    );
};

// Styled Components (adding new ones for simple events)
const LoadingSpinner = styled.span`
    display: inline-block;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const CompletedAction = styled.div`
    background: ${theme.success}15;
    color: ${theme.success};
    border: 2px solid ${theme.success};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    cursor: default;
    font-weight: 600;

    svg {
        font-size: 20px;
        margin-bottom: ${theme.spacing.xs};
    }
`;

// ... rest of the existing styled components remain the same
const DetailsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    max-width: 100%;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
`;

const ConvertedAction = styled.div`
    background: ${theme.surface};
    color: ${theme.success};
    border-color: ${theme.success};
    flex-direction: column;
    gap: ${theme.spacing.xs};
    opacity: 0.8;
    cursor: default;
    padding: ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        transform: none;
        box-shadow: none;
        background: ${theme.surface};
    }
`;

const DisabledAction = styled.div`
    background: ${theme.surface};
    color: ${theme.text.muted};
    border-color: ${theme.border};
    flex-direction: column;
    gap: ${theme.spacing.xs};
    opacity: 0.6;
    cursor: not-allowed;
    padding: ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        transform: none;
        box-shadow: none;
        background: ${theme.surface};
    }
`;

const DetailsHeader = styled.div<{ $isRecurring?: boolean }>`
    background: ${props => props.$isRecurring ?
            'linear-gradient(135deg, #8b5cf615 0%, #a78bfa15 100%)' :
            theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
    ${props => props.$isRecurring && `
        border-left: 4px solid #8b5cf6;
    `}
`;

const HeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xxl};
`;

const HeaderInfo = styled.div`
    flex: 1;
`;

const AppointmentTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
    line-height: 1.3;
`;

const AppointmentMeta = styled.div`
    font-size: 14px;
    color: ${theme.text.tertiary};
    font-weight: 400;
`;

const RecurringActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
    color: white;
    border: none;
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }

    &:active {
        transform: translateY(0);
    }

    svg {
        font-size: 13px;
    }
`;

const ProtocolActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surface};
    color: ${theme.primary};
    border: 2px solid ${theme.primary};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primary};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:active {
        transform: translateY(0);
    }

    svg {
        font-size: 13px;
    }
`;

const RecurringEventSection = styled.div`
    background: linear-gradient(135deg, #8b5cf608 0%, #a78bfa08 100%);
    border: 1px solid #8b5cf620;
    border-radius: ${theme.radius.lg};
    margin: ${theme.spacing.lg} ${theme.spacing.xxl};
`;

const RecurringEventContent = styled.div`
    padding: ${theme.spacing.lg} ${theme.spacing.xxl};
`;

const RecurringEventGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.lg};
`;

const RecurringEventItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    background: ${theme.surface};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.md};
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        border-color: #8b5cf6;
    }
`;

const RecurringEventDescription = styled.div`
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.md};
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg} ${theme.spacing.xxl} ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    border-bottom: 1px solid ${theme.borderLight};
`;

const SectionTitle = styled.h3`
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const SectionTitleWithIcon = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
        color: ${theme.text.tertiary};
        font-size: 14px;
    }
`;

const InfoSection = styled.div`
    border-bottom: 1px solid ${theme.borderLight};
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg} ${theme.spacing.xxl};
`;

const InfoItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.md};
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
    }
`;

const InfoIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${theme.surfaceElevated};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    color: ${theme.text.tertiary};
    font-size: 14px;
    flex-shrink: 0;
`;

const InfoContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    flex: 1;
`;

const InfoLabel = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${theme.text.primary};
    line-height: 1.4;
`;

const ServicesSection = styled.div`
    border-bottom: 1px solid ${theme.borderLight};
`;

const TotalValue = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: ${theme.spacing.xs};
`;

const TotalLabel = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TotalAmount = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.primary};
`;

const ServicesContent = styled.div`
    padding: ${theme.spacing.lg} ${theme.spacing.xxl};
`;

const ServicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.xl};
`;

const ServiceItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.md};
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
    }
`;

const ServiceInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    flex: 1;
`;

const ServiceName = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${theme.text.primary};
`;

const ServiceMeta = styled.div`
    font-size: 12px;
    color: ${theme.text.muted};
    font-weight: 400;
`;

const ServiceNote = styled.div`
    font-size: 11px;
    color: ${theme.text.tertiary};
    font-style: italic;
    margin-top: ${theme.spacing.xs};
`;

const ServicePricing = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    align-items: flex-end;
`;

const PriceRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const PriceLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-weight: 400;
`;

const PriceValue = styled.div<{ $primary?: boolean }>`
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.$primary ? theme.primary : theme.text.secondary};
    min-width: 80px;
    text-align: right;
`;

const ServicesSummary = styled.div`
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceElevated};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const SummaryRow = styled.div<{ $primary?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    ${props => props.$primary && `
        padding-top: ${theme.spacing.md};
        border-top: 1px solid ${theme.border};
    `}
`;

const SummaryLabel = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.primary};
`;

const SummaryValue = styled.div<{ $primary?: boolean }>`
    font-size: ${props => props.$primary ? '16px' : '14px'};
    font-weight: ${props => props.$primary ? '600' : '500'};
    color: ${props => props.$primary ? theme.primary : theme.text.primary};
`;

const ActionsSection = styled.div`
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
`;

const ActionGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const RecurringEventActions = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const BaseAction = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    min-height: 48px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;

        &:hover {
            transform: none;
            box-shadow: none;
        }
    }
`;

const PrimaryAction = styled(BaseAction)`
    background: ${theme.primary};
    color: white;
    border-color: ${theme.primary};
    flex-direction: column;
    gap: ${theme.spacing.xs};

    &:hover:not(:disabled) {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
    }
`;

const SecondaryAction = styled(BaseAction)`
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border-color: ${theme.border};

    &:hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
        color: ${theme.text.primary};
    }
`;

const DangerAction = styled(BaseAction)`
    background: ${theme.surface};
    color: ${theme.error};
    border-color: ${theme.border};

    &:hover {
        background: ${theme.errorBg};
        border-color: ${theme.error};
    }
`;

const ActionContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
`;

const ActionLabel = styled.div`
    font-size: 14px;
    font-weight: 500;
`;

const ActionHint = styled.div`
    font-size: 11px;
    opacity: 0.8;
    font-weight: 400;
`;

// Confirmation Modal
const ConfirmModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.lg};
`;

const ModalOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
    position: relative;
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    box-shadow: ${theme.shadow.xl};
    max-width: 400px;
    width: 100%;
    overflow: hidden;
    border: 1px solid ${theme.border};
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
`;

const ModalIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.errorBg};
    color: ${theme.error};
    border-radius: ${theme.radius.md};
    font-size: 16px;
`;

const ModalTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const ModalBody = styled.div`
    padding: ${theme.spacing.xl};
`;

const WarningText = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.md};
    line-height: 1.5;
`;

const WarningSubtext = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    line-height: 1.5;
`;

const ModalActions = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border-top: 1px solid ${theme.border};
`;

const ModalButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    flex: 1;
    justify-content: center;
    min-height: 40px;

    ${props => {
        switch (props.$variant) {
            case 'secondary':
                return `
                    background: ${theme.surface};
                    color: ${theme.text.secondary};
                    border-color: ${theme.border};
                    
                    &:hover {
                        background: ${theme.surfaceHover};
                        border-color: ${theme.borderActive};
                    }
                `;
            case 'danger':
                return `
                    background: ${theme.error};
                    color: white;
                    border-color: ${theme.error};
                    
                    &:hover {
                        background: ${theme.error};
                        opacity: 0.9;
                    }
                `;
            default:
                return `
                    background: ${theme.primary};
                    color: white;
                    border-color: ${theme.primary};
                    
                    &:hover {
                        background: ${theme.primaryDark};
                    }
                `;
        }
    }}
`;

export default AppointmentDetails;