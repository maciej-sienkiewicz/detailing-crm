// src/pages/SMS/components/SmsCampaignsList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    FaUserFriends,
    FaPlus,
    FaEdit,
    FaTrash,
    FaCopy,
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaRegListAlt,
    FaSpinner,
    FaEnvelope,
    FaPlay,
    FaTimes,
    FaEye,
    FaRegClock,
    FaClock,
    FaUsers,
    FaInfoCircle,
    FaChartLine
} from 'react-icons/fa';
import { smsApi } from '../../../api/smsApi';
import { SmsCampaign, SmsStatus, SmsStatusColors, SmsStatusLabels } from '../../../types/sms';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../components/common/Toast/Toast';

export const SmsCampaignsList: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Stan komponentu
    const [campaigns, setCampaigns] = useState<SmsCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stan filtrowania
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [dateFromFilter, setDateFromFilter] = useState<string>('');
    const [dateToFilter, setDateToFilter] = useState<string>('');

    // Stan modali
    const [selectedCampaign, setSelectedCampaign] = useState<SmsCampaign | null>(null);
    const [showCampaignDetails, setShowCampaignDetails] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showStartConfirm, setShowStartConfirm] = useState(false);
    const [campaignRecipients, setCampaignRecipients] = useState<any[]>([]);
    const [campaignMessages, setCampaignMessages] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Pobierz kampanie przy pierwszym renderowaniu
    useEffect(() => {
        fetchCampaigns();
    }, []);

    // Pobieranie kampanii
    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const data = await smsApi.fetchCampaigns();
            setCampaigns(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching campaigns:', err);
            setError('Nie udało się pobrać kampanii SMS');
        } finally {
            setLoading(false);
        }
    };

    // Filtrowanie kampanii
    const filteredCampaigns = React.useMemo(() => {
        let result = [...campaigns];

        // Filtrowanie po frazie
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                campaign =>
                    campaign.name.toLowerCase().includes(query) ||
                    (campaign.description && campaign.description.toLowerCase().includes(query))
            );
        }

        // Filtrowanie po statusie
        if (statusFilter) {
            result = result.filter(campaign => campaign.status === statusFilter);
        }

        // Filtrowanie po dacie od
        if (dateFromFilter) {
            const fromDate = new Date(dateFromFilter);
            result = result.filter(campaign => {
                const campaignDate = new Date(campaign.createdAt);
                return campaignDate >= fromDate;
            });
        }

        // Filtrowanie po dacie do
        if (dateToFilter) {
            const toDate = new Date(dateToFilter);
            // Ustawienie godziny 23:59:59 dla daty końcowej
            toDate.setHours(23, 59, 59, 999);
            result = result.filter(campaign => {
                const campaignDate = new Date(campaign.createdAt);
                return campaignDate <= toDate;
            });
        }

        // Sortowanie: najpierw zaplanowane i aktywne, potem według daty utworzenia (od najnowszych)
        return result.sort((a, b) => {
            // Najpierw kampanie w trakcie wysyłki
            if (a.status === SmsStatus.PENDING && b.status !== SmsStatus.PENDING) {
                return -1;
            }
            if (a.status !== SmsStatus.PENDING && b.status === SmsStatus.PENDING) {
                return 1;
            }

            // Potem kampanie zaplanowane
            if (a.status === SmsStatus.SCHEDULED && b.status !== SmsStatus.SCHEDULED) {
                return -1;
            }
            if (a.status !== SmsStatus.SCHEDULED && b.status === SmsStatus.SCHEDULED) {
                return 1;
            }

            // Na końcu sortowanie według daty (od najnowszych)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [campaigns, searchQuery, statusFilter, dateFromFilter, dateToFilter]);

    // Obsługa wyszukiwania
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // Obsługa filtrowania statusu
    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
    };

    // Obsługa filtra daty od
    const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateFromFilter(e.target.value);
    };

    // Obsługa filtra daty do
    const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateToFilter(e.target.value);
    };

    // Resetowanie filtrów
    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setDateFromFilter('');
        setDateToFilter('');
    };

    // Przejdź do strony nowej kampanii
    const handleNewCampaign = () => {
        navigate('/sms/campaigns/new');
    };

    // Edycja kampanii
    const handleEditCampaign = (campaign: SmsCampaign) => {
        navigate(`/sms/campaigns/edit/${campaign.id}`);
    };

    // Duplikowanie kampanii
    const handleDuplicateCampaign = (campaign: SmsCampaign) => {
        navigate(`/sms/campaigns/duplicate/${campaign.id}`);
    };

    // Podgląd szczegółów kampanii
    const handleViewCampaign = async (campaign: SmsCampaign) => {
        try {
            setSelectedCampaign(campaign);
            setLoadingDetails(true);

            // Pobieramy odbiorców i wiadomości kampanii równolegle
            const [recipientsData, messagesData] = await Promise.all([
                smsApi.fetchCampaignRecipients(campaign.id),
                smsApi.fetchCampaignMessages(campaign.id)
            ]);

            setCampaignRecipients(recipientsData);
            setCampaignMessages(messagesData);
            setShowCampaignDetails(true);

            setLoadingDetails(false);
        } catch (err) {
            console.error('Error fetching campaign details:', err);
            showToast('error', 'Nie udało się pobrać szczegółów kampanii', 3000);
            setLoadingDetails(false);
        }
    };

    // Uruchomienie kampanii
    const handleStartCampaign = (campaign: SmsCampaign) => {
        setSelectedCampaign(campaign);
        setShowStartConfirm(true);
    };

    // Potwierdzenie uruchomienia kampanii
    const confirmStartCampaign = async () => {
        if (!selectedCampaign) return;

        try {
            const updatedCampaign = await smsApi.startCampaign(selectedCampaign.id);
            showToast('success', 'Kampania została uruchomiona', 3000);

            // Aktualizacja stanu lokalnego
            setCampaigns(prevCampaigns =>
                prevCampaigns.map(campaign =>
                    campaign.id === updatedCampaign.id ? updatedCampaign : campaign
                )
            );

            // Aktualizacja aktualnie wybranej kampanii jeśli modal jest otwarty
            if (showCampaignDetails) {
                setSelectedCampaign(updatedCampaign);
            }

            setShowStartConfirm(false);
        } catch (err) {
            console.error('Error starting campaign:', err);
            showToast('error', 'Nie udało się uruchomić kampanii', 3000);
        }
    };

    // Anulowanie kampanii
    const handleCancelCampaign = (campaign: SmsCampaign) => {
        setSelectedCampaign(campaign);
        setShowCancelConfirm(true);
    };

    // Potwierdzenie anulowania kampanii
    const confirmCancelCampaign = async () => {
        if (!selectedCampaign) return;

        try {
            const updatedCampaign = await smsApi.cancelCampaign(selectedCampaign.id);
            showToast('success', 'Kampania została anulowana', 3000);

            // Aktualizacja stanu lokalnego
            setCampaigns(prevCampaigns =>
                prevCampaigns.map(campaign =>
                    campaign.id === updatedCampaign.id ? updatedCampaign : campaign
                )
            );

            // Aktualizacja aktualnie wybranej kampanii jeśli modal jest otwarty
            if (showCampaignDetails) {
                setSelectedCampaign(updatedCampaign);
            }

            setShowCancelConfirm(false);
        } catch (err) {
            console.error('Error canceling campaign:', err);
            showToast('error', 'Nie udało się anulować kampanii', 3000);
        }
    };

    // Usuwanie kampanii
    const handleDeleteCampaign = (campaign: SmsCampaign) => {
        setSelectedCampaign(campaign);
        setShowDeleteConfirm(true);
    };

    // Potwierdzenie usunięcia
    const confirmDeleteCampaign = async () => {
        if (!selectedCampaign) return;

        // Tu byłaby rzeczywista akcja usuwania kampanii
        // Ponieważ w API nie mamy endpointu do usuwania, symulujemy usunięcie
        showToast('success', 'Kampania została usunięta', 3000);

        // Aktualizacja stanu lokalnego - usuwamy kampanię z listy
        setCampaigns(prevCampaigns =>
            prevCampaigns.filter(campaign => campaign.id !== selectedCampaign.id)
        );

        // Zamknij wszystkie modale
        setShowDeleteConfirm(false);
        if (showCampaignDetails) {
            setShowCampaignDetails(false);
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

    // Obliczanie procentu ukończenia kampanii
    const calculateProgress = (campaign: SmsCampaign): number => {
        if (campaign.recipientCount === 0) return 0;
        return Math.round(((campaign.deliveredCount + campaign.failedCount) / campaign.recipientCount) * 100);
    };

    // Renderowanie statusu kampanii
    const renderCampaignStatus = (status: SmsStatus, showIcon: boolean = true) => {
        return (
            <CampaignStatus color={SmsStatusColors[status]}>
                {showIcon && getStatusIcon(status)}
                {SmsStatusLabels[status]}
            </CampaignStatus>
        );
    };

    // Ikona statusu kampanii
    const getStatusIcon = (status: SmsStatus) => {
        switch (status) {
            case SmsStatus.PENDING:
                return <FaSpinner style={{ marginRight: '5px' }} />;
            case SmsStatus.SENT:
                return <FaEnvelope style={{ marginRight: '5px' }} />;
            case SmsStatus.DELIVERED:
                return <FaCheckCircle style={{ marginRight: '5px' }} />;
            case SmsStatus.FAILED:
                return <FaExclamationTriangle style={{ marginRight: '5px' }} />;
            case SmsStatus.SCHEDULED:
                return <FaCalendarAlt style={{ marginRight: '5px' }} />;
            default:
                return <FaInfoCircle style={{ marginRight: '5px' }} />;
        }
    };

    return (
        <Container>
            <PageHeader>
                <PageTitle>
                    <FaUserFriends style={{ marginRight: '10px' }} />
                    Kampanie SMS
                </PageTitle>
                <HeaderActions>
                    <Button onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter /> {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
                    </Button>
                    <PrimaryButton onClick={handleNewCampaign}>
                        <FaPlus /> Nowa kampania
                    </PrimaryButton>
                </HeaderActions>
            </PageHeader>

            {/* Panel filtrów */}
            {showFilters && (
                <FiltersPanel>
                    <FiltersGrid>
                        <FilterGroup>
                            <FilterLabel>Wyszukaj</FilterLabel>
                            <FilterInput
                                type="text"
                                placeholder="Nazwa kampanii..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Status</FilterLabel>
                            <FilterSelect
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                            >
                                <option value="">Wszystkie statusy</option>
                                {Object.entries(SmsStatusLabels).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </FilterSelect>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Data od</FilterLabel>
                            <FilterInput
                                type="date"
                                value={dateFromFilter}
                                onChange={handleDateFromChange}
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Data do</FilterLabel>
                            <FilterInput
                                type="date"
                                value={dateToFilter}
                                onChange={handleDateToChange}
                            />
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
                    'Ładowanie kampanii...'
                ) : (
                    `Znaleziono ${filteredCampaigns.length} kampanii`
                )}
            </ResultInfo>

            {/* Lista kampanii */}
            {loading ? (
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie kampanii SMS...</LoadingText>
                </LoadingContainer>
            ) : filteredCampaigns.length === 0 ? (
                <EmptyState>
                    {(searchQuery || statusFilter || dateFromFilter || dateToFilter)
                        ? 'Nie znaleziono kampanii spełniających kryteria.'
                        : 'Brak kampanii SMS. Kliknij "Nowa kampania", aby utworzyć pierwszą kampanię.'}
                </EmptyState>
            ) : (
                <CampaignsList>
                    {filteredCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id}>
                            <CampaignHeader>
                                <CampaignNameSection>
                                    {renderCampaignStatus(campaign.status)}
                                    <CampaignName onClick={() => handleViewCampaign(campaign)}>
                                        {campaign.name}
                                    </CampaignName>
                                </CampaignNameSection>
                                <CampaignActions>
                                    {campaign.status === SmsStatus.SCHEDULED && (
                                        <ActionButton
                                            onClick={() => handleStartCampaign(campaign)}
                                            title="Uruchom kampanię"
                                            primary
                                        >
                                            <FaPlay />
                                        </ActionButton>
                                    )}
                                    {(campaign.status === SmsStatus.SCHEDULED || campaign.status === SmsStatus.PENDING) && (
                                        <ActionButton
                                            onClick={() => handleCancelCampaign(campaign)}
                                            title="Anuluj kampanię"
                                            danger
                                        >
                                            <FaTimes />
                                        </ActionButton>
                                    )}
                                    <ActionButton
                                        onClick={() => handleViewCampaign(campaign)}
                                        title="Podgląd kampanii"
                                    >
                                        <FaEye />
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => handleEditCampaign(campaign)}
                                        title="Edytuj kampanię"
                                        disabled={campaign.status !== SmsStatus.SCHEDULED}
                                    >
                                        <FaEdit />
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => handleDuplicateCampaign(campaign)}
                                        title="Duplikuj kampanię"
                                    >
                                        <FaCopy />
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => handleDeleteCampaign(campaign)}
                                        title="Usuń kampanię"
                                        danger
                                    >
                                        <FaTrash />
                                    </ActionButton>
                                </CampaignActions>
                            </CampaignHeader>

                            {campaign.description && (
                                <CampaignDescription onClick={() => handleViewCampaign(campaign)}>
                                    {campaign.description}
                                </CampaignDescription>
                            )}

                            <CampaignStats>
                                <StatsItem>
                                    <StatsLabel>Odbiorcy:</StatsLabel>
                                    <StatsValue>
                                        <FaUsers style={{ marginRight: '5px' }} />
                                        {campaign.recipientCount}
                                    </StatsValue>
                                </StatsItem>

                                <StatsItem>
                                    <StatsLabel>Dostarczono:</StatsLabel>
                                    <StatsValue success>
                                        <FaCheckCircle style={{ marginRight: '5px' }} />
                                        {campaign.deliveredCount}
                                    </StatsValue>
                                </StatsItem>

                                <StatsItem>
                                    <StatsLabel>Nieudane:</StatsLabel>
                                    <StatsValue error>
                                        <FaExclamationTriangle style={{ marginRight: '5px' }} />
                                        {campaign.failedCount}
                                    </StatsValue>
                                </StatsItem>

                                {campaign.status === SmsStatus.SCHEDULED && campaign.scheduledDate && (
                                    <StatsItem>
                                        <StatsLabel>Zaplanowano na:</StatsLabel>
                                        <StatsValue>
                                            <FaCalendarAlt style={{ marginRight: '5px' }} />
                                            {formatDate(campaign.scheduledDate)}
                                        </StatsValue>
                                    </StatsItem>
                                )}
                            </CampaignStats>

                            {(campaign.status === SmsStatus.SENT || campaign.status === SmsStatus.PENDING) && (
                                <CampaignProgressSection>
                                    <ProgressLabel>
                                        Postęp: {calculateProgress(campaign)}%
                                    </ProgressLabel>
                                    <ProgressBar>
                                        <ProgressFill width={calculateProgress(campaign)} />
                                    </ProgressBar>
                                </CampaignProgressSection>
                            )}

                            <CampaignFooter>
                                <CampaignDate>
                                    <FaClock style={{ marginRight: '5px' }} />
                                    Utworzono: {formatDate(campaign.createdAt)}
                                </CampaignDate>

                                {campaign.templateId && (
                                    <TemplateBadge>
                                        <FaRegListAlt style={{ marginRight: '5px' }} />
                                        Szablon
                                    </TemplateBadge>
                                )}

                                {campaign.customContent && (
                                    <CustomContentBadge>
                                        <FaEdit style={{ marginRight: '5px' }} />
                                        Niestandardowa treść
                                    </CustomContentBadge>
                                )}
                            </CampaignFooter>
                        </CampaignCard>
                    ))}
                </CampaignsList>
            )}{/* Modal ze szczegółami kampanii */}
            {showCampaignDetails && selectedCampaign && (
                <Modal
                    isOpen={showCampaignDetails}
                    onClose={() => setShowCampaignDetails(false)}
                    title="Szczegóły kampanii SMS"
                >
                    <CampaignDetailsContent>
                        {loadingDetails ? (
                            <DetailLoadingContainer>
                                <LoadingSpinner />
                                <LoadingText>Ładowanie szczegółów kampanii...</LoadingText>
                            </DetailLoadingContainer>
                        ) : (
                            <>
                                <CampaignDetailHeader>
                                    <CampaignDetailTitle>{selectedCampaign.name}</CampaignDetailTitle>
                                    {renderCampaignStatus(selectedCampaign.status)}
                                </CampaignDetailHeader>

                                {selectedCampaign.description && (
                                    <DetailSection>
                                        <DetailLabel>Opis kampanii:</DetailLabel>
                                        <DetailText>{selectedCampaign.description}</DetailText>
                                    </DetailSection>
                                )}

                                <StatsGrid>
                                    <StatCard>
                                        <StatIconContainer>
                                            <FaUsers />
                                        </StatIconContainer>
                                        <StatContent>
                                            <StatValue>{selectedCampaign.recipientCount}</StatValue>
                                            <StatLabel>Odbiorców</StatLabel>
                                        </StatContent>
                                    </StatCard>

                                    <StatCard>
                                        <StatIconContainer success>
                                            <FaCheckCircle />
                                        </StatIconContainer>
                                        <StatContent>
                                            <StatValue>{selectedCampaign.deliveredCount}</StatValue>
                                            <StatLabel>Dostarczonych</StatLabel>
                                        </StatContent>
                                    </StatCard>

                                    <StatCard>
                                        <StatIconContainer error>
                                            <FaExclamationTriangle />
                                        </StatIconContainer>
                                        <StatContent>
                                            <StatValue>{selectedCampaign.failedCount}</StatValue>
                                            <StatLabel>Nieudanych</StatLabel>
                                        </StatContent>
                                    </StatCard>

                                    <StatCard>
                                        <StatIconContainer>
                                            <FaChartLine />
                                        </StatIconContainer>
                                        <StatContent>
                                            <StatValue>
                                                {selectedCampaign.recipientCount > 0
                                                    ? `${Math.round((selectedCampaign.deliveredCount / selectedCampaign.recipientCount) * 100)}%`
                                                    : '0%'
                                                }
                                            </StatValue>
                                            <StatLabel>Skuteczność</StatLabel>
                                        </StatContent>
                                    </StatCard>
                                </StatsGrid>

                                {(selectedCampaign.status === SmsStatus.SENT || selectedCampaign.status === SmsStatus.PENDING) && (
                                    <ProgressSection>
                                        <DetailLabel>Postęp kampanii:</DetailLabel>
                                        <DetailProgressBar>
                                            <DetailProgressFill width={calculateProgress(selectedCampaign)} />
                                        </DetailProgressBar>
                                        <DetailProgressLabel>
                                            {calculateProgress(selectedCampaign)}% ukończono
                                            ({selectedCampaign.deliveredCount + selectedCampaign.failedCount} z {selectedCampaign.recipientCount})
                                        </DetailProgressLabel>
                                    </ProgressSection>
                                )}

                                <ContentSection>
                                    <DetailLabel>Treść wiadomości:</DetailLabel>
                                    <ContentBox>
                                        {selectedCampaign.customContent ||
                                            (selectedCampaign.templateId &&
                                                `[Szablon ID: ${selectedCampaign.templateId}]`) ||
                                            'Brak dostępnej treści'}
                                    </ContentBox>
                                </ContentSection>

                                <TimingSection>
                                    <TwoColumnGrid>
                                        <TimingItem>
                                            <TimingLabel>Data utworzenia:</TimingLabel>
                                            <TimingValue>{formatDate(selectedCampaign.createdAt)}</TimingValue>
                                        </TimingItem>

                                        {selectedCampaign.scheduledDate && (
                                            <TimingItem>
                                                <TimingLabel>Zaplanowano na:</TimingLabel>
                                                <TimingValue>{formatDate(selectedCampaign.scheduledDate)}</TimingValue>
                                            </TimingItem>
                                        )}

                                        {selectedCampaign.sentDate && (
                                            <TimingItem>
                                                <TimingLabel>Data wysłania:</TimingLabel>
                                                <TimingValue>{formatDate(selectedCampaign.sentDate)}</TimingValue>
                                            </TimingItem>
                                        )}

                                        {selectedCampaign.completedDate && (
                                            <TimingItem>
                                                <TimingLabel>Data zakończenia:</TimingLabel>
                                                <TimingValue>{formatDate(selectedCampaign.completedDate)}</TimingValue>
                                            </TimingItem>
                                        )}
                                    </TwoColumnGrid>
                                </TimingSection>

                                <TabSection>
                                    <TabHeader>
                                        <TabTitle>Odbiorcy i wiadomości</TabTitle>
                                    </TabHeader>

                                    <RecipientsList>
                                        <DetailLabel>Lista odbiorców ({campaignRecipients.length}):</DetailLabel>
                                        {campaignRecipients.length === 0 ? (
                                            <EmptyMessage>Brak odbiorców</EmptyMessage>
                                        ) : (
                                            <RecipientsTable>
                                                <thead>
                                                <tr>
                                                    <TableHeader>Odbiorca</TableHeader>
                                                    <TableHeader>Numer telefonu</TableHeader>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {campaignRecipients.map(recipient => (
                                                    <TableRow key={recipient.id}>
                                                        <TableCell>{recipient.name}</TableCell>
                                                        <TableCell>{recipient.phone}</TableCell>
                                                    </TableRow>
                                                ))}
                                                </tbody>
                                            </RecipientsTable>
                                        )}
                                    </RecipientsList>

                                    <MessagesList>
                                        <DetailLabel>Wysłane wiadomości ({campaignMessages.length}):</DetailLabel>
                                        {campaignMessages.length === 0 ? (
                                            <EmptyMessage>
                                                {selectedCampaign.status === SmsStatus.SCHEDULED
                                                    ? 'Kampania jeszcze nie została uruchomiona'
                                                    : 'Brak wysłanych wiadomości'}
                                            </EmptyMessage>
                                        ) : (
                                            <MessagesTable>
                                                <thead>
                                                <tr>
                                                    <TableHeader>Odbiorca</TableHeader>
                                                    <TableHeader>Status</TableHeader>
                                                    <TableHeader>Data wysłania</TableHeader>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {campaignMessages.map(message => (
                                                    <TableRow key={message.id}>
                                                        <TableCell>{message.recipientName}</TableCell>
                                                        <TableCell>
                                                            <MessageStatusBadge color={SmsStatusColors[message.status]}>
                                                                {getStatusIcon(message.status)}
                                                                {SmsStatusLabels[message.status]}
                                                            </MessageStatusBadge>
                                                        </TableCell>
                                                        <TableCell>{formatDate(message.sentDate || message.createdAt)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                </tbody>
                                            </MessagesTable>
                                        )}
                                    </MessagesList>
                                </TabSection>

                                <DetailActions>
                                    {selectedCampaign.status === SmsStatus.SCHEDULED && (
                                        <PrimaryButton onClick={() => {
                                            setShowCampaignDetails(false);
                                            handleStartCampaign(selectedCampaign);
                                        }}>
                                            <FaPlay /> Uruchom teraz
                                        </PrimaryButton>
                                    )}

                                    {(selectedCampaign.status === SmsStatus.SCHEDULED || selectedCampaign.status === SmsStatus.PENDING) && (
                                        <DangerButton onClick={() => {
                                            setShowCampaignDetails(false);
                                            handleCancelCampaign(selectedCampaign);
                                        }}>
                                            <FaTimes /> Anuluj kampanię
                                        </DangerButton>
                                    )}

                                    {selectedCampaign.status === SmsStatus.SCHEDULED && (
                                        <Button onClick={() => handleEditCampaign(selectedCampaign)}>
                                            <FaEdit /> Edytuj
                                        </Button>
                                    )}

                                    <Button onClick={() => handleDuplicateCampaign(selectedCampaign)}>
                                        <FaCopy /> Duplikuj
                                    </Button>

                                    <DangerButton onClick={() => {
                                        setShowCampaignDetails(false);
                                        handleDeleteCampaign(selectedCampaign);
                                    }}>
                                        <FaTrash /> Usuń
                                    </DangerButton>
                                </DetailActions>
                            </>
                        )}
                    </CampaignDetailsContent>
                </Modal>
            )}

            {/* Modal z potwierdzeniem uruchomienia */}
            {showStartConfirm && selectedCampaign && (
                <Modal
                    isOpen={showStartConfirm}
                    onClose={() => setShowStartConfirm(false)}
                    title="Potwierdź uruchomienie kampanii"
                >
                    <ConfirmContent>
                        <p>Czy na pewno chcesz uruchomić kampanię <strong>{selectedCampaign.name}</strong>?</p>
                        <p>Wiadomości zostaną wysłane do <strong>{selectedCampaign.recipientCount}</strong> odbiorców.</p>

                        {selectedCampaign.scheduledDate && (
                            <InfoMessage>
                                <FaInfoCircle style={{ marginRight: '8px' }} />
                                Ta kampania była zaplanowana na {formatDate(selectedCampaign.scheduledDate)}.
                                Uruchomienie jej teraz spowoduje natychmiastowe rozpoczęcie wysyłki.
                            </InfoMessage>
                        )}

                        <ConfirmActions>
                            <SecondaryButton onClick={() => setShowStartConfirm(false)}>
                                Anuluj
                            </SecondaryButton>
                            <PrimaryButton onClick={confirmStartCampaign}>
                                Uruchom kampanię
                            </PrimaryButton>
                        </ConfirmActions>
                    </ConfirmContent>
                </Modal>
            )}

            {/* Modal z potwierdzeniem anulowania */}
            {showCancelConfirm && selectedCampaign && (
                <Modal
                    isOpen={showCancelConfirm}
                    onClose={() => setShowCancelConfirm(false)}
                    title="Potwierdź anulowanie kampanii"
                >
                    <ConfirmContent>
                        <p>Czy na pewno chcesz anulować kampanię <strong>{selectedCampaign.name}</strong>?</p>
                        {selectedCampaign.status === SmsStatus.PENDING ? (
                            <WarningMessage>
                                <FaExclamationTriangle style={{ marginRight: '8px' }} />
                                Kampania jest w trakcie wysyłki. Anulowanie spowoduje zatrzymanie dalszej wysyłki,
                                ale już wysłane wiadomości ({selectedCampaign.deliveredCount + selectedCampaign.failedCount} z {selectedCampaign.recipientCount})
                                nie zostaną cofnięte.
                            </WarningMessage>
                        ) : (
                            <p>Ta operacja jest nieodwracalna.</p>
                        )}

                        <ConfirmActions>
                            <SecondaryButton onClick={() => setShowCancelConfirm(false)}>
                                Zamknij
                            </SecondaryButton>
                            <DangerButton onClick={confirmCancelCampaign}>
                                Anuluj kampanię
                            </DangerButton>
                        </ConfirmActions>
                    </ConfirmContent>
                </Modal>
            )}

            {/* Modal z potwierdzeniem usunięcia */}
            {showDeleteConfirm && selectedCampaign && (
                <Modal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    title="Potwierdź usunięcie"
                >
                    <ConfirmContent>
                        <p>Czy na pewno chcesz usunąć kampanię <strong>{selectedCampaign.name}</strong>?</p>
                        <p>Ta operacja jest nieodwracalna.</p>

                        <ConfirmActions>
                            <SecondaryButton onClick={() => setShowDeleteConfirm(false)}>
                                Anuluj
                            </SecondaryButton>
                            <DangerButton onClick={confirmDeleteCampaign}>
                                Usuń kampanię
                            </DangerButton>
                        </ConfirmActions>
                    </ConfirmContent>
                </Modal>
            )}
        </Container>
    );
};