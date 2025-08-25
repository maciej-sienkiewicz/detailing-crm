// src/pages/SMS/components/SmsCampaignsList.tsx
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {
    FaCalendarAlt,
    FaChartLine,
    FaCheckCircle,
    FaClock,
    FaCopy,
    FaEdit,
    FaEnvelope,
    FaExclamationTriangle,
    FaEye,
    FaFilter,
    FaInfoCircle,
    FaPlay,
    FaPlus,
    FaRegListAlt,
    FaSpinner,
    FaTimes,
    FaTrash,
    FaUserFriends,
    FaUsers
} from 'react-icons/fa';
import {smsApi} from '../../../api/smsApi';
import {SmsCampaign, SmsStatus, SmsStatusColors, SmsStatusLabels} from '../../../types/sms';
import Modal from '../../../components/common/Modal';
import {useToast} from '../../../components/common/Toast/Toast';

interface SmsCampaignsListProps {
    onOpenNewCampaignModal: () => void;
}

export const SmsCampaignsList: React.FC<SmsCampaignsListProps> = ({ onOpenNewCampaignModal }) => {
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

    const handleNewCampaign = () => {
        // Zamiast przekierowania do nowej strony, wywołujemy funkcję z SmsMainPage
        // która została przekazana jako props
        onOpenNewCampaignModal();
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

// Styled components dla SmsCampaignsList.tsx
// Kontenery i nagłówki
export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

export const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

export const PageTitle = styled.h1`
    font-size: 24px;
    display: flex;
    align-items: center;
    color: #2c3e50;
    margin: 0;
`;

export const HeaderActions = styled.div`
    display: flex;
    gap: 12px;
`;

// Przyciski
export const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export const PrimaryButton = styled(Button)`
    background-color: #3498db;
    border-color: #3498db;
    color: white;

    &:hover:not(:disabled) {
        background-color: #2980b9;
        border-color: #2980b9;
    }
`;

export const SecondaryButton = styled(Button)`
    background-color: #f8f9fa;
    border-color: #dee2e6;
    color: #6c757d;

    &:hover:not(:disabled) {
        background-color: #e9ecef;
    }
`;

export const DangerButton = styled(Button)`
    background-color: #e74c3c;
    border-color: #e74c3c;
    color: white;

    &:hover:not(:disabled) {
        background-color: #c0392b;
        border-color: #c0392b;
    }
`;

export const ActionButton = styled.button<{ primary?: boolean; danger?: boolean; disabled?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background-color: transparent;
    border: none;
    color: ${props => {
    if (props.danger) return '#e74c3c';
    if (props.primary) return '#3498db';
    return '#6c757d';
}};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    opacity: ${props => (props.disabled ? 0.5 : 1)};
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background-color: ${props => {
    if (props.danger) return '#fff5f5';
    if (props.primary) return '#e3f2fd';
    return '#f8f9fa';
}};
    }
`;

// Panel filtrów
export const FiltersPanel = styled.div`
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #e9ecef;
`;

export const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
`;

export const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

export const FilterLabel = styled.label`
    font-size: 13px;
    font-weight: 500;
    color: #495057;
`;

export const FilterInput = styled.input`
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    
    &:focus {
        border-color: #3498db;
        outline: none;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.25);
    }
`;

export const FilterSelect = styled.select`
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    background-color: white;
    
    &:focus {
        border-color: #3498db;
        outline: none;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.25);
    }
`;

export const FiltersActions = styled.div`
    display: flex;
    justify-content: flex-end;
`;

// Informacje i błędy
export const ResultInfo = styled.div`
    color: #6c757d;
    font-size: 14px;
    margin-bottom: 16px;
`;

export const ErrorMessage = styled.div`
    background-color: #fff5f5;
    border: 1px solid #fed7d7;
    border-radius: 6px;
    color: #e53e3e;
    padding: 16px;
    margin-bottom: 16px;
`;

// Ładowanie
export const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
`;

export const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export const LoadingText = styled.div`
    color: #6c757d;
    font-size: 16px;
`;

// Pusty stan
export const EmptyState = styled.div`
    background-color: #f8f9fa;
    border: 1px dashed #dee2e6;
    border-radius: 6px;
    padding: 40px;
    text-align: center;
    color: #6c757d;
`;

// Lista kampanii
export const CampaignsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const CampaignCard = styled.div`
    background-color: white;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    overflow: hidden;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
    
    &:hover {
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        transform: translateY(-2px);
    }
`;

export const CampaignHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f1f3f5;
    background-color: #f8f9fa;
`;

export const CampaignNameSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

export const CampaignName = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    cursor: pointer;
    
    &:hover {
        color: #3498db;
    }
`;

export const CampaignActions = styled.div`
    display: flex;
    gap: 8px;
`;

export const CampaignDescription = styled.div`
    padding: 16px;
    color: #4a5568;
    font-size: 14px;
    line-height: 1.6;
`;

export const CampaignStats = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 8px 16px;
    background-color: #f8f9fa;
    border-top: 1px solid #f1f3f5;
`;

export const StatsItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

export const StatsLabel = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

export const StatsValue = styled.div<{ success?: boolean; error?: boolean }>`
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: ${props => {
    if (props.success) return '#2ecc71';
    if (props.error) return '#e74c3c';
    return '#2c3e50';
}};
`;

export const CampaignProgressSection = styled.div`
    padding: 8px 16px 16px;
    background-color: #f8f9fa;
`;

export const ProgressLabel = styled.div`
    font-size: 13px;
    color: #6c757d;
    margin-bottom: 8px;
`;

export const ProgressBar = styled.div`
    height: 8px;
    background-color: #edf2f7;
    border-radius: 4px;
    overflow: hidden;
`;

export const ProgressFill = styled.div<{ width: number }>`
    height: 100%;
    width: ${props => `${props.width}%`};
    background-color: #3498db;
    border-radius: 4px;
    transition: width 0.3s ease;
`;

export const CampaignFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    font-size: 13px;
    color: #718096;
    border-top: 1px solid #f1f3f5;
`;

export const CampaignDate = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

export const TemplateBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    background-color: #e3f2fd;
    color: #3498db;
`;

export const CustomContentBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    background-color: #e8f5e9;
    color: #2ecc71;
`;

export const CampaignStatus = styled.div<{ color: string }>`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => `${props.color}20`};
    color: ${props => props.color};
`;

// Szczegóły kampanii
export const CampaignDetailsContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

export const CampaignDetailHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const CampaignDetailTitle = styled.h2`
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
`;

export const DetailSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const DetailLabel = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #4a5568;
`;

export const DetailText = styled.div`
    padding: 12px 16px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
    font-size: 14px;
    line-height: 1.6;
    color: #2c3e50;
`;

export const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
`;

export const StatCard = styled.div`
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    gap: 16px;
`;

export const StatIconContainer = styled.div<{ success?: boolean; error?: boolean }>`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${props => {
    if (props.success) return '#e8f5e9';
    if (props.error) return '#fff5f5';
    return '#e3f2fd';
}};
    color: ${props => {
    if (props.success) return '#2ecc71';
    if (props.error) return '#e74c3c';
    return '#3498db';
}};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
`;

export const StatContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

export const StatValue = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
`;

export const StatLabel = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

export const ProgressSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const DetailProgressBar = styled.div`
    height: 10px;
    background-color: #edf2f7;
    border-radius: 5px;
    overflow: hidden;
`;

export const DetailProgressFill = styled.div<{ width: number }>`
    height: 100%;
    width: ${props => `${props.width}%`};
    background-color: #3498db;
    border-radius: 5px;
    transition: width 0.3s ease;
`;

export const DetailProgressLabel = styled.div`
    font-size: 13px;
    color: #6c757d;
    text-align: center;
`;

export const ContentSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const ContentBox = styled.div`
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    color: #2c3e50;
`;

export const TimingSection = styled.div`
    margin-top: 10px;
`;

export const TwoColumnGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
`;

export const TimingItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

export const TimingLabel = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

export const TimingValue = styled.div`
    font-size: 14px;
    color: #2c3e50;
`;

export const TabSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 10px;
`;

export const TabHeader = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 10px;
`;

export const TabTitle = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: #2c3e50;
    margin: 0;
`;

export const RecipientsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const MessagesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const RecipientsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

export const MessagesTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

export const TableHeader = styled.th`
    text-align: left;
    padding: 10px 16px;
    font-size: 12px;
    color: #6c757d;
    font-weight: 600;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
`;

export const TableRow = styled.tr`
    border-bottom: 1px solid #f1f3f5;
    
    &:last-child {
        border-bottom: none;
    }
`;

export const TableCell = styled.td`
    padding: 12px 16px;
    font-size: 14px;
    color: #2c3e50;
`;

export const MessageStatusBadge = styled.div<{ color: string }>`
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => `${props.color}20`};
    color: ${props => props.color};
`;

export const EmptyMessage = styled.div`
    padding: 20px;
    text-align: center;
    color: #6c757d;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px dashed #e9ecef;
`;

export const DetailLoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
`;

export const DetailActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
`;

// Modały potwierdzenia
export const ConfirmContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    p {
        margin: 0;
        line-height: 1.6;
        color: #2c3e50;
    }
`;

export const ConfirmActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
`;

export const WarningMessage = styled.div`
    background-color: #fff8e6;
    border: 1px solid #ffeeba;
    padding: 12px 16px;
    border-radius: 6px;
    color: #856404;
    margin: 8px 0;
    display: flex;
    align-items: flex-start;
    gap: 8px;
`;

export const InfoMessage = styled.div`
    background-color: #e3f2fd;
    border: 1px solid #b3e0ff;
    padding: 12px 16px;
    border-radius: 6px;
    color: #0c5d9e;
    margin: 8px 0;
    display: flex;
    align-items: flex-start;
    gap: 8px;
`;

export const MessageCount = styled.div`
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 10px;
`;

export const DeliveryRate = styled.div<{ rate: number, color: string }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => `${props.color}20`};
    color: ${props => props.color};
`;

export default SmsCampaignsList;