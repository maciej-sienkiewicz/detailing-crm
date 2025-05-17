// src/pages/SMS/components/SmsAutomationsList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    FaRobot,
    FaPlus,
    FaEdit,
    FaTrash,
    FaCopy,
    FaToggleOn,
    FaToggleOff,
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaListAlt,
    FaEnvelope,
    FaCheckCircle,
    FaClock,
    FaArrowRight,
    FaTags,
    FaBirthdayCake,
    FaCarSide,
    FaHistory,
    FaChartLine,
    FaInfoCircle, FaTimes
} from 'react-icons/fa';
import { smsApi } from '../../../api/smsApi';
import {
    SmsAutomation,
    SmsAutomationTrigger,
    SmsAutomationTriggerLabels
} from '../../../types/sms';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../components/common/Toast/Toast';

export const SmsAutomationsList: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Stan komponentu
    const [automations, setAutomations] = useState<SmsAutomation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stan filtrowania
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [triggerFilter, setTriggerFilter] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<string>('');

    // Stany modali
    const [selectedAutomation, setSelectedAutomation] = useState<SmsAutomation | null>(null);
    const [showAutomationDetails, setShowAutomationDetails] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [automationMessages, setAutomationMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Pobierz automatyzacje przy pierwszym renderowaniu
    useEffect(() => {
        fetchAutomations();
    }, []);

    // Pobieranie automatyzacji
    const fetchAutomations = async () => {
        try {
            setLoading(true);
            const data = await smsApi.fetchAutomations();
            setAutomations(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching automations:', err);
            setError('Nie udało się pobrać automatyzacji SMS');
        } finally {
            setLoading(false);
        }
    };

    // Filtrowanie automatyzacji
    const filteredAutomations = React.useMemo(() => {
        let result = [...automations];

        // Filtrowanie po frazie
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                automation =>
                    automation.name.toLowerCase().includes(query) ||
                    (automation.description && automation.description.toLowerCase().includes(query))
            );
        }

        // Filtrowanie po wyzwalaczu
        if (triggerFilter) {
            result = result.filter(automation => automation.trigger === triggerFilter);
        }

        // Filtrowanie po statusie aktywności
        if (activeFilter) {
            const isActive = activeFilter === 'active';
            result = result.filter(automation => automation.isActive === isActive);
        }

        // Sortowanie: najpierw aktywne, potem według daty utworzenia (od najnowszych)
        return result.sort((a, b) => {
            if (a.isActive !== b.isActive) {
                return a.isActive ? -1 : 1;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [automations, searchQuery, triggerFilter, activeFilter]);

    // Resetowanie filtrów
    const resetFilters = () => {
        setSearchQuery('');
        setTriggerFilter('');
        setActiveFilter('');
    };

    // Przejdź do strony nowej automatyzacji
    const handleNewAutomation = () => {
        navigate('/sms/automations/new');
    };

    // Podgląd szczegółów automatyzacji
    const handleViewAutomation = (automation: SmsAutomation) => {
        setSelectedAutomation(automation);
        setShowAutomationDetails(true);
    };

    // Edycja automatyzacji
    const handleEditAutomation = (automation: SmsAutomation) => {
        navigate(`/sms/automations/edit/${automation.id}`);
    };

    // Duplikowanie automatyzacji
    const handleDuplicateAutomation = (automation: SmsAutomation) => {
        navigate(`/sms/automations/duplicate/${automation.id}`);
    };

    // Aktywacja automatyzacji
    const handleActivateAutomation = async (id: string) => {
        try {
            await smsApi.activateAutomation(id);
            showToast('success', 'Automatyzacja została aktywowana', 3000);

            // Aktualizacja lokalnego stanu
            setAutomations(prev =>
                prev.map(automation =>
                    automation.id === id
                        ? { ...automation, isActive: true }
                        : automation
                )
            );
        } catch (err) {
            console.error('Error activating automation:', err);
            showToast('error', 'Nie udało się aktywować automatyzacji', 3000);
        }
    };

    // Dezaktywacja automatyzacji
    const handleDeactivateAutomation = async (id: string) => {
        try {
            await smsApi.deactivateAutomation(id);
            showToast('success', 'Automatyzacja została dezaktywowana', 3000);

            // Aktualizacja lokalnego stanu
            setAutomations(prev =>
                prev.map(automation =>
                    automation.id === id
                        ? { ...automation, isActive: false }
                        : automation
                )
            );
        } catch (err) {
            console.error('Error deactivating automation:', err);
            showToast('error', 'Nie udało się dezaktywować automatyzacji', 3000);
        }
    };

    // Usuwanie automatyzacji
    const handleDeleteAutomation = (automation: SmsAutomation) => {
        setSelectedAutomation(automation);
        setShowDeleteConfirm(true);
    };

    // Potwierdzenie usunięcia automatyzacji
    const confirmDeleteAutomation = async () => {
        if (!selectedAutomation) return;

        try {
            await smsApi.deleteAutomation(selectedAutomation.id);
            showToast('success', 'Automatyzacja została usunięta', 3000);

            // Aktualizacja lokalnego stanu
            setAutomations(prev =>
                prev.filter(automation => automation.id !== selectedAutomation.id)
            );

            setShowDeleteConfirm(false);

            // Zamknij również modal szczegółów, jeśli jest otwarty
            if (showAutomationDetails) {
                setShowAutomationDetails(false);
            }
        } catch (err) {
            console.error('Error deleting automation:', err);
            showToast('error', 'Nie udało się usunąć automatyzacji', 3000);
        }
    };

    // Wyświetlenie historii wiadomości automatyzacji
    const handleViewHistory = async (automation: SmsAutomation) => {
        try {
            setSelectedAutomation(automation);
            setLoadingMessages(true);

            const messages = await smsApi.fetchAutomationMessages(automation.id);
            setAutomationMessages(messages);
            setShowHistoryModal(true);

            setLoadingMessages(false);
        } catch (err) {
            console.error('Error fetching automation messages:', err);
            showToast('error', 'Nie udało się pobrać historii wiadomości', 3000);
            setLoadingMessages(false);
        }
    };

    // Formatowanie daty
    const formatDate = (dateString: string): string => {
        if (!dateString) return '—';

        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Renderowanie ikony wyzwalacza
    const renderTriggerIcon = (trigger: SmsAutomationTrigger) => {
        switch (trigger) {
            case SmsAutomationTrigger.BEFORE_APPOINTMENT:
            case SmsAutomationTrigger.AFTER_APPOINTMENT:
                return <FaCalendarAlt />;
            case SmsAutomationTrigger.STATUS_CHANGE:
                return <FaArrowRight />;
            case SmsAutomationTrigger.CLIENT_BIRTHDAY:
                return <FaBirthdayCake />;
            case SmsAutomationTrigger.NO_VISIT_PERIOD:
                return <FaHistory />;
            case SmsAutomationTrigger.INVOICE_STATUS_CHANGE:
                return <FaListAlt />;
            case SmsAutomationTrigger.VEHICLE_ANNIVERSARY:
                return <FaCarSide />;
            case SmsAutomationTrigger.VEHICLE_MILEAGE:
                return <FaChartLine />;
            default:
                return <FaRobot />;
        }
    };

    // Renderowanie parametrów wyzwalacza
    const renderTriggerParameters = (trigger: SmsAutomationTrigger, parameters: Record<string, any>) => {
        switch (trigger) {
            case SmsAutomationTrigger.BEFORE_APPOINTMENT:
                return `${parameters.days || 1} ${parameters.days === 1 ? 'dzień' : 'dni'} przed wizytą`;
            case SmsAutomationTrigger.AFTER_APPOINTMENT:
                return `${parameters.days || 1} ${parameters.days === 1 ? 'dzień' : 'dni'} po wizycie`;
            case SmsAutomationTrigger.STATUS_CHANGE:
                return `Zmiana statusu na: ${parameters.status || 'dowolny'}`;
            case SmsAutomationTrigger.CLIENT_BIRTHDAY:
                return parameters.withDiscount
                    ? 'Urodziny klienta (z rabatem)'
                    : 'Urodziny klienta';
            case SmsAutomationTrigger.NO_VISIT_PERIOD:
                return `${parameters.months || 3} ${parameters.months === 1 ? 'miesiąc' : parameters.months < 5 ? 'miesiące' : 'miesięcy'} bez wizyty`;
            case SmsAutomationTrigger.INVOICE_STATUS_CHANGE:
                return `Zmiana statusu faktury na: ${parameters.status || 'dowolny'}`;
            case SmsAutomationTrigger.VEHICLE_ANNIVERSARY:
                return `${parameters.years || 1} ${parameters.years === 1 ? 'rok' : parameters.years < 5 ? 'lata' : 'lat'} od pierwszej wizyty`;
            case SmsAutomationTrigger.VEHICLE_MILEAGE:
                return `Przekroczenie ${parameters.mileage || 10000} km przebiegu`;
            default:
                return 'Niestandardowe parametry';
        }
    };

    return (
        <Container>
            <PageHeader>
                <PageTitle>
                    <FaRobot style={{ marginRight: '10px' }} />
                    Automatyzacje SMS
                </PageTitle>
                <HeaderActions>
                    <Button onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter /> {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
                    </Button>
                    <PrimaryButton onClick={handleNewAutomation}>
                        <FaPlus /> Nowa automatyzacja
                    </PrimaryButton>
                </HeaderActions>
            </PageHeader>

            {/* Panel filtrów */}
            {showFilters && (
                <FiltersPanel>
                    <FiltersGrid>
                        <FilterGroup>
                            <FilterLabel>Szukaj</FilterLabel>
                            <FilterInput
                                type="text"
                                placeholder="Nazwa lub opis automatyzacji"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Wyzwalacz</FilterLabel>
                            <FilterSelect
                                value={triggerFilter}
                                onChange={(e) => setTriggerFilter(e.target.value)}
                            >
                                <option value="">Wszystkie wyzwalacze</option>
                                {Object.entries(SmsAutomationTriggerLabels).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </FilterSelect>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Status</FilterLabel>
                            <FilterSelect
                                value={activeFilter}
                                onChange={(e) => setActiveFilter(e.target.value)}
                            >
                                <option value="">Wszystkie statusy</option>
                                <option value="active">Aktywne</option>
                                <option value="inactive">Nieaktywne</option>
                            </FilterSelect>
                        </FilterGroup>
                    </FiltersGrid>

                    <FiltersActions>
                        <SecondaryButton onClick={resetFilters}>
                            Wyczyść filtry
                        </SecondaryButton>
                    </FiltersActions>
                </FiltersPanel>
            )}

            {/* Wyświetlanie błędu */}
            {error && <ErrorMessage>{error}</ErrorMessage>}

            {/* Informacja o wynikach */}
            <ResultInfo>
                {loading ? (
                    'Ładowanie automatyzacji...'
                ) : (
                    `Znaleziono ${filteredAutomations.length} automatyzacji`
                )}
            </ResultInfo>

            {/* Lista automatyzacji */}
            {loading ? (
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie automatyzacji SMS...</LoadingText>
                </LoadingContainer>
            ) : filteredAutomations.length === 0 ? (
                <EmptyState>
                    {searchQuery || triggerFilter || activeFilter
                        ? 'Nie znaleziono automatyzacji spełniających kryteria.'
                        : 'Brak automatyzacji SMS. Kliknij "Nowa automatyzacja", aby utworzyć pierwszą automatyzację.'}
                </EmptyState>
            ) : (
                <AutomationsList>
                    {filteredAutomations.map(automation => (
                        <AutomationCard key={automation.id} $isActive={automation.isActive}>
                            <AutomationHeader>
                                <AutomationLeft>
                                    <AutomationStatus $isActive={automation.isActive}>
                                          {automation.isActive ? (
                                            <>
                                                <FaToggleOn style={{ marginRight: '5px' }} />
                                                Aktywna
                                            </>
                                        ) : (
                                            <>
                                                <FaToggleOff style={{ marginRight: '5px' }} />
                                                Nieaktywna
                                            </>
                                        )}
                                    </AutomationStatus>
                                    <AutomationName onClick={() => handleViewAutomation(automation)}>
                                        {automation.name}
                                    </AutomationName>
                                </AutomationLeft>

                                <TriggerBadge>
                                    {renderTriggerIcon(automation.trigger)}
                                    <span>{SmsAutomationTriggerLabels[automation.trigger]}</span>
                                </TriggerBadge>
                            </AutomationHeader>

                            <AutomationDescription onClick={() => handleViewAutomation(automation)}>
                                {automation.description || 'Brak opisu'}
                            </AutomationDescription>

                            <AutomationDetails>
                                <DetailItem>
                                    <DetailLabel>Wyzwalacz:</DetailLabel>
                                    <DetailValue>
                                        {renderTriggerParameters(
                                            automation.trigger,
                                            automation.triggerParameters
                                        )}
                                    </DetailValue>
                                </DetailItem>

                                <DetailItem>
                                    <DetailLabel>Szablon:</DetailLabel>
                                    <DetailValue>
                                        <FaListAlt style={{ marginRight: '5px' }} />
                                        {automation.templateId || 'Brak'}
                                    </DetailValue>
                                </DetailItem>

                                <StatsItem>
                                    <StatsLabel>Wysłane wiadomości:</StatsLabel>
                                    <StatsValue>
                                        <FaEnvelope style={{ marginRight: '5px' }} />
                                        {automation.messagesSent}
                                    </StatsValue>
                                </StatsItem>
                            </AutomationDetails>

                            <AutomationTimingInfo>
                                {automation.lastRun && (
                                    <TimingItem>
                                        <FaHistory style={{ marginRight: '5px' }} />
                                        Ostatnie uruchomienie: {formatDate(automation.lastRun)}
                                    </TimingItem>
                                )}

                                {automation.nextScheduledRun && (
                                    <TimingItem>
                                        <FaCalendarAlt style={{ marginRight: '5px' }} />
                                        Następne uruchomienie: {formatDate(automation.nextScheduledRun)}
                                    </TimingItem>
                                )}
                            </AutomationTimingInfo>

                            <AutomationFooter>
                                <AutomationDate>
                                    <FaClock style={{ marginRight: '5px' }} />
                                    Utworzono: {formatDate(automation.createdAt)}
                                </AutomationDate>

                                <AutomationActions>
                                    {automation.isActive ? (
                                        <ActionButton
                                            onClick={() => handleDeactivateAutomation(automation.id)}
                                            title="Dezaktywuj automatyzację"
                                            danger
                                        >
                                            <FaToggleOff />
                                        </ActionButton>
                                    ) : (
                                        <ActionButton
                                            onClick={() => handleActivateAutomation(automation.id)}
                                            title="Aktywuj automatyzację"
                                            success
                                        >
                                            <FaToggleOn />
                                        </ActionButton>
                                    )}

                                    <ActionButton
                                        onClick={() => handleViewHistory(automation)}
                                        title="Historia wiadomości"
                                    >
                                        <FaHistory />
                                    </ActionButton>

                                    <ActionButton
                                        onClick={() => handleEditAutomation(automation)}
                                        title="Edytuj automatyzację"
                                    >
                                        <FaEdit />
                                    </ActionButton>

                                    <ActionButton
                                        onClick={() => handleDuplicateAutomation(automation)}
                                        title="Duplikuj automatyzację"
                                    >
                                        <FaCopy />
                                    </ActionButton>

                                    <ActionButton
                                        onClick={() => handleDeleteAutomation(automation)}
                                        title="Usuń automatyzację"
                                        danger
                                    >
                                        <FaTrash />
                                    </ActionButton>
                                </AutomationActions>
                            </AutomationFooter>
                        </AutomationCard>
                    ))}
                </AutomationsList>
            )}

            {/* Modal ze szczegółami automatyzacji */}
            {showAutomationDetails && selectedAutomation && (
                <Modal
                    isOpen={showAutomationDetails}
                    onClose={() => setShowAutomationDetails(false)}
                    title="Szczegóły automatyzacji SMS"
                >
                    <AutomationDetailsContent>
                        <DetailHeaderSection>
                            <DetailTitle>{selectedAutomation.name}</DetailTitle>
                            <StatusBadge $isActive={selectedAutomation.isActive}>
                                {selectedAutomation.isActive ? (
                                    <>
                                        <FaToggleOn style={{ marginRight: '5px' }} />
                                        Aktywna
                                    </>
                                ) : (
                                    <>
                                        <FaToggleOff style={{ marginRight: '5px' }} />
                                        Nieaktywna
                                    </>
                                )}
                            </StatusBadge>
                        </DetailHeaderSection>

                        <DetailSection>
                            <DetailLabel>Opis:</DetailLabel>
                            <DetailText>
                                {selectedAutomation.description || 'Brak opisu'}
                            </DetailText>
                        </DetailSection>

                        <TriggerSection>
                            <TriggerHeader>
                                <TriggerIcon>
                                    {renderTriggerIcon(selectedAutomation.trigger)}
                                </TriggerIcon>
                                <TriggerInfo>
                                    <TriggerInfoTitle>
                                        {SmsAutomationTriggerLabels[selectedAutomation.trigger]}
                                    </TriggerInfoTitle>
                                    <TriggerParameters>
                                        {renderTriggerParameters(selectedAutomation.trigger, selectedAutomation.triggerParameters)}
                                    </TriggerParameters>
                                </TriggerInfo>
                            </TriggerHeader>

                            <TriggerDescription>
                                <FaInfoCircle style={{ marginRight: '8px' }} />
                                {getTriggerDescription(selectedAutomation.trigger)}
                            </TriggerDescription>
                        </TriggerSection>

                        <TemplateSection>
                            <DetailLabel>Szablon wiadomości:</DetailLabel>
                            <TemplateBox>
                                <FaListAlt style={{ color: '#3498db', marginRight: '10px' }} />
                                <TemplateId>{selectedAutomation.templateId || 'Brak'}</TemplateId>
                            </TemplateBox>
                        </TemplateSection>

                        <StatsSection>
                            <DetailLabel>Statystyki:</DetailLabel>
                            <StatsDetails>
                                <StatsBox>
                                    <StatsBoxLabel>Wysłane wiadomości</StatsBoxLabel>
                                    <StatsBoxValue>{selectedAutomation.messagesSent}</StatsBoxValue>
                                </StatsBox>

                                {selectedAutomation.lastRun && (
                                    <StatsBox>
                                        <StatsBoxLabel>Ostatnie uruchomienie</StatsBoxLabel>
                                        <StatsBoxValue>{formatDate(selectedAutomation.lastRun)}</StatsBoxValue>
                                    </StatsBox>
                                )}

                                {selectedAutomation.nextScheduledRun && (
                                    <StatsBox>
                                        <StatsBoxLabel>Następne uruchomienie</StatsBoxLabel>
                                        <StatsBoxValue>{formatDate(selectedAutomation.nextScheduledRun)}</StatsBoxValue>
                                    </StatsBox>
                                )}
                            </StatsDetails>
                        </StatsSection>

                        <TimestampsSection>
                            <TimestampItem>
                                <TimestampLabel>Data utworzenia:</TimestampLabel>
                                <TimestampValue>{formatDate(selectedAutomation.createdAt)}</TimestampValue>
                            </TimestampItem>

                            <TimestampItem>
                                <TimestampLabel>Ostatnia aktualizacja:</TimestampLabel>
                                <TimestampValue>{formatDate(selectedAutomation.updatedAt)}</TimestampValue>
                            </TimestampItem>
                        </TimestampsSection>

                        <DetailActions>
                            <Button onClick={() => handleViewHistory(selectedAutomation)}>
                                <FaHistory /> Historia wiadomości
                            </Button>

                            <Button onClick={() => handleEditAutomation(selectedAutomation)}>
                                <FaEdit /> Edytuj
                            </Button>

                            <Button onClick={() => handleDuplicateAutomation(selectedAutomation)}>
                                <FaCopy /> Duplikuj
                            </Button>

                            {selectedAutomation.isActive ? (
                                <DangerButton onClick={() => {
                                    handleDeactivateAutomation(selectedAutomation.id);
                                    setSelectedAutomation({
                                        ...selectedAutomation,
                                        isActive: false
                                    });
                                }}>
                                    <FaToggleOff /> Dezaktywuj
                                </DangerButton>
                            ) : (
                                <SuccessButton onClick={() => {
                                    handleActivateAutomation(selectedAutomation.id);
                                    setSelectedAutomation({
                                        ...selectedAutomation,
                                        isActive: true
                                    });
                                }}>
                                    <FaToggleOn /> Aktywuj
                                </SuccessButton>
                            )}
                        </DetailActions>
                    </AutomationDetailsContent>
                </Modal>
            )}

            {/* Modal z historią wiadomości */}
            {showHistoryModal && selectedAutomation && (
                <Modal
                    isOpen={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    title={`Historia wiadomości automatyzacji: ${selectedAutomation.name}`}
                >
                    <MessagesHistoryContent>
                        {loadingMessages ? (
                            <LoadingContainer>
                                <LoadingSpinner />
                                <LoadingText>Ładowanie historii wiadomości...</LoadingText>
                            </LoadingContainer>
                        ) : automationMessages.length === 0 ? (
                            <EmptyState>
                                Ta automatyzacja nie wysłała jeszcze żadnych wiadomości.
                            </EmptyState>
                        ) : (
                            <>
                                <MessageCount>
                                    Wysłane wiadomości: <strong>{automationMessages.length}</strong>
                                </MessageCount>

                                <MessagesList>
                                    {automationMessages.map((message) => (
                                        <MessageItem key={message.id}>
                                            <MessageHeader>
                                                <div>
                                                    <RecipientName>{message.recipientName}</RecipientName>
                                                    <RecipientPhone>{message.recipientPhone}</RecipientPhone>
                                                </div>
                                                <MessageStatus color={message.status === 'DELIVERED' ? '#2ecc71' : '#e74c3c'}>
                                                    {message.status === 'DELIVERED' ? (
                                                        <>
                                                            <FaCheckCircle /> Dostarczono
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaTimes /> Błąd
                                                        </>
                                                    )}
                                                </MessageStatus>
                                            </MessageHeader>

                                            <MessageContent>
                                                {message.content}
                                            </MessageContent>

                                            <MessageFooter>
                                                <FaClock style={{ marginRight: '5px' }} />
                                                {formatDate(message.sentDate || message.createdAt)}
                                            </MessageFooter>
                                        </MessageItem>
                                    ))}
                                </MessagesList>
                            </>
                        )}
                    </MessagesHistoryContent>
                </Modal>
            )}

            {/* Modal z potwierdzeniem usunięcia */}
            {showDeleteConfirm && selectedAutomation && (
                <Modal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    title="Potwierdź usunięcie"
                >
                    <ConfirmContent>
                        <p>Czy na pewno chcesz usunąć automatyzację <strong>{selectedAutomation.name}</strong>?</p>
                        <p>Ta operacja jest nieodwracalna.</p>

                        {selectedAutomation.messagesSent > 0 && (
                            <WarningMessage>
                                <strong>Uwaga:</strong> Ta automatyzacja wysłała już {selectedAutomation.messagesSent} wiadomości.
                                Usunięcie jej spowoduje utratę historii tych wiadomości.
                            </WarningMessage>
                        )}

                        <ConfirmActions>
                            <SecondaryButton onClick={() => setShowDeleteConfirm(false)}>
                                Anuluj
                            </SecondaryButton>
                            <DangerButton onClick={confirmDeleteAutomation}>
                                Usuń automatyzację
                            </DangerButton>
                        </ConfirmActions>
                    </ConfirmContent>
                </Modal>
            )}
        </Container>
    );
};

// Funkcja pomocnicza do generowania opisów wyzwalaczy
const getTriggerDescription = (trigger: SmsAutomationTrigger): string => {
    switch (trigger) {
        case SmsAutomationTrigger.BEFORE_APPOINTMENT:
            return 'Automatyzacja wysyła wiadomość określoną liczbę dni przed zaplanowaną wizytą.';
        case SmsAutomationTrigger.AFTER_APPOINTMENT:
            return 'Automatyzacja wysyła wiadomość określoną liczbę dni po zakończonej wizycie.';
        case SmsAutomationTrigger.STATUS_CHANGE:
            return 'Automatyzacja wysyła wiadomość gdy status zlecenia zmienia się na określoną wartość.';
        case SmsAutomationTrigger.CLIENT_BIRTHDAY:
            return 'Automatyzacja wysyła wiadomość w dniu urodzin klienta, opcjonalnie z kodem rabatowym.';
        case SmsAutomationTrigger.NO_VISIT_PERIOD:
            return 'Automatyzacja wysyła wiadomość gdy klient nie odwiedził warsztatu przez określony czas.';
        case SmsAutomationTrigger.INVOICE_STATUS_CHANGE:
            return 'Automatyzacja wysyła wiadomość gdy status faktury zmienia się na określoną wartość.';
        case SmsAutomationTrigger.VEHICLE_ANNIVERSARY:
            return 'Automatyzacja wysyła wiadomość w rocznicę pierwszej wizyty pojazdu w warsztacie.';
        case SmsAutomationTrigger.VEHICLE_MILEAGE:
            return 'Automatyzacja wysyła wiadomość gdy przebieg pojazdu przekroczy określoną wartość.';
        default:
            return 'Niestandardowa automatyzacja wiadomości SMS.';
    }
};

// Styled components
const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const PageTitle = styled.h1`
    font-size: 24px;
    display: flex;
    align-items: center;
    color: #2c3e50;
    margin: 0;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 10px;
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 4px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #495057;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: #e9ecef;
    }
`;

const PrimaryButton = styled(Button)`
    background-color: #3498db;
    border-color: #3498db;
    color: white;

    &:hover {
        background-color: #2980b9;
        border-color: #2980b9;
    }
`;

const SecondaryButton = styled(Button)`
    background-color: white;
    border-color: #ced4da;
    color: #6c757d;

    &:hover {
        background-color: #f8f9fa;
    }
`;

const DangerButton = styled(Button)`
    background-color: #e74c3c;
    border-color: #e74c3c;
    color: white;

    &:hover {
        background-color: #c0392b;
        border-color: #c0392b;
    }
`;

const SuccessButton = styled(Button)`
    background-color: #2ecc71;
    border-color: #2ecc71;
    color: white;

    &:hover {
        background-color: #27ae60;
        border-color: #27ae60;
    }
`;

const FiltersPanel = styled.div`
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e9ecef;
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const FilterLabel = styled.label`
    font-size: 12px;
    font-weight: 500;
    color: #495057;
`;

const FilterInput = styled.input`
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const FilterSelect = styled.select`
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const FiltersActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
`;

const ResultInfo = styled.div`
    color: #6c757d;
    font-size: 14px;
`;

const ErrorMessage = styled.div`
    padding: 12px 16px;
    background-color: #fff5f5;
    border: 1px solid #fee2e2;
    border-radius: 4px;
    color: #e53e3e;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
`;

const LoadingSpinner = styled.div`
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    margin-bottom: 16px;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    color: #6c757d;
    font-size: 14px;
`;

const EmptyState = styled.div`
    padding: 40px;
    text-align: center;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px dashed #dee2e6;
    color: #6c757d;
`;

const AutomationsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const AutomationCard = styled.div<{ $isActive: boolean }>`
    background-color: white;
    border-radius: 6px;
    border: 1px solid ${props => props.$isActive ? '#cee5fd' : '#e9ecef'};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: all 0.2s;
    ${props => props.$isActive && `
        background-color: #f9fcff;
    `}

    &:hover {
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
    }
`;

const AutomationHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f1f3f5;
`;

const AutomationLeft = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const AutomationStatus = styled.div<{ $isActive: boolean }>`
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    color: ${props => props.$isActive ? '#2ecc71' : '#6c757d'};
`;

const AutomationName = styled.h3`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    cursor: pointer;
`;

const TriggerBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background-color: #f8fafc;
    border: 1px solid #e3edf9;
    border-radius: 20px;
    font-size: 12px;
    color: #3498db;
`;

const AutomationDescription = styled.div`
    padding: 16px;
    font-size: 14px;
    color: #2c3e50;
    cursor: pointer;
`;

const AutomationDetails = styled.div`
    padding: 12px 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    background-color: #f8f9fa;
    border-top: 1px solid #f1f3f5;
    border-bottom: 1px solid #f1f3f5;
`;

const DetailItem = styled.div`
    flex: 1;
    min-width: 180px;
`;

const DetailLabel = styled.div`
    font-size: 12px;
    color: #6c757d;
    margin-bottom: 4px;
`;

const DetailValue = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #2c3e50;
`;

const StatsItem = styled.div`
    flex: 0 0 auto;
`;

const StatsLabel = styled.div`
    font-size: 12px;
    color: #6c757d;
    margin-bottom: 4px;
`;

const StatsValue = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: #3498db;
`;

const AutomationTimingInfo = styled.div`
    padding: 12px 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
`;

const TimingItem = styled.div`
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #6c757d;
`;

const AutomationFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
`;

const AutomationDate = styled.div`
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #6c757d;
`;

const AutomationActions = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button<{ primary?: boolean, success?: boolean, danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    background-color: ${props => {
    if (props.success) return '#e3fceb';
    if (props.danger) return '#fff5f5';
    if (props.primary) return '#e3f2fd';
    return 'transparent';
}};
    border: none;
    color: ${props => {
    if (props.success) return '#2ecc71';
    if (props.danger) return '#e74c3c';
    if (props.primary) return '#3498db';
    return '#6c757d';
}};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: ${props => {
    if (props.success) return '#d0f7de';
    if (props.danger) return '#fee2e2';
    if (props.primary) return '#bddff8';
    return '#f1f3f5';
}};
    }
`;

// Styled components dla szczegółów automatyzacji
const AutomationDetailsContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const DetailHeaderSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const DetailTitle = styled.h2`
    margin: 0;
    font-size: 20px;
    color: #2c3e50;
`;

const StatusBadge = styled.div<{ $isActive: boolean }>`
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    background-color: ${props => props.$isActive ? '#e3fceb' : '#f8f9fa'};
    color: ${props => props.$isActive ? '#2ecc71' : '#6c757d'};
`;

const DetailSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const DetailText = styled.div`
    padding: 12px 16px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    font-size: 14px;
    color: #2c3e50;
    white-space: pre-wrap;
    line-height: 1.5;
`;

const TriggerSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background-color: #f8fafc;
    border: 1px solid #e3edf9;
    border-radius: 6px;
`;

const TriggerHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const TriggerIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background-color: #ebf5ff;
    border-radius: 8px;
    color: #3498db;
    font-size: 20px;
`;

const TriggerInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const TriggerInfoTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
`;

const TriggerParameters = styled.div`
    font-size: 14px;
    color: #6c757d;
`;

const TriggerDescription = styled.div`
    display: flex;
    align-items: flex-start;
    font-size: 13px;
    color: #6c757d;
    padding-top: 8px;
    border-top: 1px dashed #cee5fd;
`;

const TemplateSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const TemplateBox = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
`;

const TemplateId = styled.div`
    font-size: 14px;
    color: #2c3e50;
    font-family: monospace;
`;

const StatsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const StatsDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
`;

const StatsBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
`;

const StatsBoxLabel = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const StatsBoxValue = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
`;

const TimestampsSection = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
`;

const TimestampItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 200px;
`;

const TimestampLabel = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const TimestampValue = styled.div`
    font-size: 14px;
    color: #2c3e50;
`;

const DetailActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
`;

// Styled components dla historii wiadomości
const MessagesHistoryContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const MessageCount = styled.div`
    font-size: 14px;
    color: #2c3e50;
`;

const MessagesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
`;

const MessageItem = styled.div`
    display: flex;
    flex-direction: column;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
`;

const MessageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
`;

const RecipientName = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
`;

const RecipientPhone = styled.div`
    font-size: 12px;
    color: #6c757d;
    font-family: monospace;
`;

const MessageStatus = styled.div<{ color: string }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${({ color }) => `${color}20`};
    color: ${({ color }) => color};
`;

const MessageContent = styled.div`
    font-size: 14px;
    color: #2c3e50;
    padding: 8px;
    background-color: white;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    margin-bottom: 8px;
`;

const MessageFooter = styled.div`
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #6c757d;
`;

// Styled components dla potwierdzenia usunięcia
const ConfirmContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;

    p {
        margin: 0;
        line-height: 1.5;
        color: #2c3e50;
    }
`;

const WarningMessage = styled.div`
    padding: 12px 16px;
    background-color: #fff8e6;
    border: 1px solid #ffeeba;
    border-radius: 4px;
    color: #856404;
    font-size: 14px;
    line-height: 1.5;
`;

const ConfirmActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 8px;
`;

export default SmsAutomationsList;