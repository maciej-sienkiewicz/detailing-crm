// src/pages/SMS/components/SmsMessagesList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    FaEnvelope,
    FaPlus,
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaExclamationTriangle,
    FaCheckCircle,
    FaClock,
    FaSpinner,
    FaTrash,
    FaSync,
    FaEye,
    FaUserFriends,
    FaTimes,
    FaPhoneAlt,
    FaInfoCircle,
    FaCopy
} from 'react-icons/fa';
import { smsApi } from '../../../api/smsApi';
import { SmsMessage, SmsStatus, SmsStatusColors, SmsStatusLabels } from '../../../types/sms';
import { useToast } from '../../../components/common/Toast/Toast';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';

export const SmsMessagesList: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Stan komponentu
    const [messages, setMessages] = useState<SmsMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });

    // Stan filtrowania
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<{
        status: string;
        recipientPhone: string;
        dateFrom: string;
        dateTo: string;
    }>({
        status: '',
        recipientPhone: '',
        dateFrom: '',
        dateTo: ''
    });

    // Stan modali
    const [selectedMessage, setSelectedMessage] = useState<SmsMessage | null>(null);
    const [showMessageDetails, setShowMessageDetails] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Pobieranie wiadomości przy pierwszym renderowaniu i zmianie filtrów/paginacji
    useEffect(() => {
        fetchMessages();
    }, [pagination.currentPage, pagination.pageSize, filters]);

    // Pobieranie wiadomości
    const fetchMessages = async () => {
        try {
            setLoading(true);
            // Przygotowanie filtrów do zapytania API
            const apiFilters: Record<string, any> = {};

            if (filters.status) {
                apiFilters.status = filters.status;
            }

            if (filters.recipientPhone) {
                apiFilters.recipientPhone = filters.recipientPhone;
            }

            if (filters.dateFrom) {
                apiFilters.dateFrom = filters.dateFrom;
            }

            if (filters.dateTo) {
                apiFilters.dateTo = filters.dateTo;
            }

            const response = await smsApi.fetchMessages(
                apiFilters,
                pagination.currentPage,
                pagination.pageSize
            );

            setMessages(response.data);
            setPagination(response.pagination);
            setError(null);
        } catch (err) {
            console.error('Error fetching SMS messages:', err);
            setError('Nie udało się pobrać wiadomości SMS');
        } finally {
            setLoading(false);
        }
    };

    // Obsługa zmiany filtru
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        // Resetuj paginację przy zmianie filtrów
        setPagination(prev => ({
            ...prev,
            currentPage: 0
        }));
    };

    // Resetowanie filtrów
    const resetFilters = () => {
        setFilters({
            status: '',
            recipientPhone: '',
            dateFrom: '',
            dateTo: ''
        });
        // Resetuj paginację
        setPagination(prev => ({
            ...prev,
            currentPage: 0
        }));
    };

    // Otwieranie szczegółów wiadomości
    const handleViewMessage = (message: SmsMessage) => {
        setSelectedMessage(message);
        setShowMessageDetails(true);
    };

    // Anulowanie zaplanowanej wiadomości
    const handleCancelScheduled = (message: SmsMessage) => {
        setSelectedMessage(message);
        setShowCancelConfirm(true);
    };

    // Potwierdzenie anulowania wiadomości
    const confirmCancelScheduled = async () => {
        if (!selectedMessage) return;

        try {
            const result = await smsApi.cancelScheduledMessage(selectedMessage.id);
            if (result) {
                showToast('success', 'Zaplanowana wiadomość została anulowana', 3000);
                fetchMessages(); // Odśwież listę
                setShowCancelConfirm(false);
            } else {
                showToast('error', 'Nie udało się anulować wiadomości', 3000);
            }
        } catch (err) {
            console.error('Error canceling scheduled message:', err);
            showToast('error', 'Nie udało się anulować wiadomości', 3000);
        }
    };

    // Ponowna próba wysłania nieudanej wiadomości
    const handleRetryFailed = async (messageId: string) => {
        try {
            await smsApi.retryFailedMessage(messageId);
            showToast('success', 'Wiadomość została przekazana do ponownej wysyłki', 3000);
            fetchMessages(); // Odśwież listę
        } catch (err) {
            console.error('Error retrying failed message:', err);
            showToast('error', 'Nie udało się ponownie wysłać wiadomości', 3000);
        }
    };

    // Usuwanie wiadomości
    const handleDeleteMessage = (message: SmsMessage) => {
        setSelectedMessage(message);
        setShowDeleteConfirm(true);
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

    // Skopiuj numer telefonu
    const copyPhoneToClipboard = (phone: string) => {
        navigator.clipboard.writeText(phone)
            .then(() => {
                showToast('success', 'Numer telefonu skopiowany do schowka', 2000);
            })
            .catch(err => {
                console.error('Failed to copy phone number:', err);
                showToast('error', 'Nie udało się skopiować numeru telefonu', 3000);
            });
    };

    // Nowa wiadomość
    const handleNewMessage = () => {
        navigate('/sms/messages/new');
    };

    // Zmiana strony paginacji
    const handlePageChange = (page: number) => {
        setPagination(prev => ({
            ...prev,
            currentPage: page - 1 // API jest 0-based, interfejs 1-based
        }));
    };

    return (
        <Container>
            <PageHeader>
                <PageTitle>
                    <FaEnvelope style={{ marginRight: '10px' }} />
                    Wiadomości SMS
                </PageTitle>
                <HeaderActions>
                    <Button onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter /> {showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
                    </Button>
                    <PrimaryButton onClick={handleNewMessage}>
                        <FaPlus /> Nowa wiadomość
                    </PrimaryButton>
                </HeaderActions>
            </PageHeader>

            {/* Panel filtrów */}
            {showFilters && (
                <FiltersPanel>
                    <FiltersGrid>
                        <FilterGroup>
                            <FilterLabel>Status</FilterLabel>
                            <FilterSelect
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
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
                            <FilterLabel>Numer telefonu</FilterLabel>
                            <FilterInput
                                type="text"
                                name="recipientPhone"
                                value={filters.recipientPhone}
                                onChange={handleFilterChange}
                                placeholder="np. +48123456789"
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Data od</FilterLabel>
                            <FilterInput
                                type="date"
                                name="dateFrom"
                                value={filters.dateFrom}
                                onChange={handleFilterChange}
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Data do</FilterLabel>
                            <FilterInput
                                type="date"
                                name="dateTo"
                                value={filters.dateTo}
                                onChange={handleFilterChange}
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
                    'Ładowanie wiadomości...'
                ) : (
                    `Znaleziono ${pagination.totalItems} wiadomości`
                )}
            </ResultInfo>

            {/* Lista wiadomości */}
            {loading ? (
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie wiadomości SMS...</LoadingText>
                </LoadingContainer>
            ) : messages.length === 0 ? (
                <EmptyState>
                    {(filters.status || filters.recipientPhone || filters.dateFrom || filters.dateTo)
                        ? 'Nie znaleziono wiadomości spełniających kryteria.'
                        : 'Brak wysłanych wiadomości SMS. Kliknij "Nowa wiadomość", aby utworzyć pierwszą wiadomość.'}
                </EmptyState>
            ) : (
                <>
                    <MessagesList>
                        {messages.map(message => (
                            <MessageCard key={message.id}>
                                <MessageHeader>
                                    <MessageLeft>
                                        <MessageStatus color={SmsStatusColors[message.status]}>
                                            {getStatusIcon(message.status)}
                                            {SmsStatusLabels[message.status]}
                                        </MessageStatus>
                                        <MessageRecipient onClick={() => handleViewMessage(message)}>
                                            {message.recipientName}
                                        </MessageRecipient>
                                    </MessageLeft>

                                    <MessageRight>
                                        <PhoneNumber
                                            onClick={() => copyPhoneToClipboard(message.recipientPhone)}
                                            title="Kliknij, aby skopiować numer"
                                        >
                                            <FaPhoneAlt style={{ marginRight: '5px' }} />
                                            {message.recipientPhone}
                                        </PhoneNumber>
                                        <MessageActions>
                                            <ActionButton
                                                onClick={() => handleViewMessage(message)}
                                                title="Podgląd wiadomości"
                                            >
                                                <FaEye />
                                            </ActionButton>

                                            {message.status === SmsStatus.SCHEDULED && (
                                                <ActionButton
                                                    onClick={() => handleCancelScheduled(message)}
                                                    title="Anuluj zaplanowaną wiadomość"
                                                    danger
                                                >
                                                    <FaTimes />
                                                </ActionButton>
                                            )}

                                            {message.status === SmsStatus.FAILED && (
                                                <ActionButton
                                                    onClick={() => handleRetryFailed(message.id)}
                                                    title="Ponów próbę wysłania"
                                                    primary
                                                >
                                                    <FaSync />
                                                </ActionButton>
                                            )}

                                            <ActionButton
                                                onClick={() => handleDeleteMessage(message)}
                                                title="Usuń wiadomość"
                                                danger
                                            >
                                                <FaTrash />
                                            </ActionButton>
                                        </MessageActions>
                                    </MessageRight>
                                </MessageHeader>

                                <MessageContent onClick={() => handleViewMessage(message)}>
                                    {message.content}
                                </MessageContent>

                                <MessageFooter>
                                    <MessageTime>
                                        {message.status === SmsStatus.SCHEDULED ? (
                                            <>
                                                <FaCalendarAlt style={{ marginRight: '5px' }} />
                                                Zaplanowana na: {formatDate(message.scheduledDate || '')}
                                            </>
                                        ) : (
                                            <>
                                                <FaClock style={{ marginRight: '5px' }} />
                                                {message.sentDate
                                                    ? `Wysłano: ${formatDate(message.sentDate)}`
                                                    : `Utworzono: ${formatDate(message.createdAt)}`}
                                            </>
                                        )}
                                    </MessageTime>

                                    {message.campaignId && (
                                        <CampaignBadge>
                                            <FaUserFriends style={{ marginRight: '5px' }} />
                                            Kampania
                                        </CampaignBadge>
                                    )}

                                    {message.automationId && (
                                        <AutomationBadge>
                                            <FaClock style={{ marginRight: '5px' }} />
                                            Automatyzacja
                                        </AutomationBadge>
                                    )}

                                    {message.status === SmsStatus.FAILED && message.failedReason && (
                                        <FailureReason title={message.failedReason}>
                                            <FaExclamationTriangle style={{ marginRight: '5px' }} />
                                            Błąd: {message.failedReason.length > 30
                                            ? `${message.failedReason.substring(0, 30)}...`
                                            : message.failedReason}
                                        </FailureReason>
                                    )}
                                </MessageFooter>
                            </MessageCard>
                        ))}
                    </MessagesList>

                    {/* Paginacja */}
                    <Pagination
                        currentPage={pagination.currentPage + 1} // API jest 0-based, interfejs 1-based
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        totalItems={pagination.totalItems}
                        pageSize={pagination.pageSize}
                    />
                </>
            )}

            {/* Modal ze szczegółami wiadomości */}
            {showMessageDetails && selectedMessage && (
                <Modal
                    isOpen={showMessageDetails}
                    onClose={() => setShowMessageDetails(false)}
                    title="Szczegóły wiadomości SMS"
                >
                    <MessageDetailsContent>
                        <DetailHeader>
                            <DetailHeaderLeft>
                                <DetailStatus color={SmsStatusColors[selectedMessage.status]}>
                                    {getStatusIcon(selectedMessage.status)}
                                    {SmsStatusLabels[selectedMessage.status]}
                                </DetailStatus>
                                <DetailRecipient>
                                    {selectedMessage.recipientName}
                                </DetailRecipient>
                            </DetailHeaderLeft>
                            <DetailPhone
                                onClick={() => copyPhoneToClipboard(selectedMessage.recipientPhone)}
                                title="Kliknij, aby skopiować numer"
                            >
                                <FaPhoneAlt style={{ marginRight: '5px' }} />
                                {selectedMessage.recipientPhone}
                            </DetailPhone>
                        </DetailHeader>

                        <DetailSection>
                            <DetailLabel>Treść wiadomości:</DetailLabel>
                            <DetailContent>{selectedMessage.content}</DetailContent>
                        </DetailSection>

                        <DetailSection>
                            <DetailLabel>Historia statusów:</DetailLabel>
                            <StatusTimelineList>
                                <StatusTimelineItem>
                                    <StatusTimelineIcon status="created">
                                        <FaClock />
                                    </StatusTimelineIcon>
                                    <StatusTimelineContent>
                                        <StatusTimelineLabel>Utworzono</StatusTimelineLabel>
                                        <StatusTimelineTime>
                                            {formatDate(selectedMessage.createdAt)}
                                        </StatusTimelineTime>
                                    </StatusTimelineContent>
                                </StatusTimelineItem>

                                {selectedMessage.status !== SmsStatus.SCHEDULED && (
                                    <StatusTimelineItem>
                                        <StatusTimelineIcon
                                            status={selectedMessage.status === SmsStatus.FAILED ? 'failed' : 'sent'}
                                        >
                                            {selectedMessage.status === SmsStatus.FAILED ? (
                                                <FaExclamationTriangle />
                                            ) : (
                                                <FaEnvelope />
                                            )}
                                        </StatusTimelineIcon>
                                        <StatusTimelineContent>
                                            <StatusTimelineLabel>
                                                {selectedMessage.status === SmsStatus.FAILED ? 'Błąd wysyłki' : 'Wysłano'}
                                            </StatusTimelineLabel>
                                            <StatusTimelineTime>
                                                {formatDate(selectedMessage.sentDate || selectedMessage.statusUpdatedAt)}
                                            </StatusTimelineTime>
                                        </StatusTimelineContent>
                                    </StatusTimelineItem>
                                )}

                                {selectedMessage.status === SmsStatus.DELIVERED && (
                                    <StatusTimelineItem>
                                        <StatusTimelineIcon status="delivered">
                                            <FaCheckCircle />
                                        </StatusTimelineIcon>
                                        <StatusTimelineContent>
                                            <StatusTimelineLabel>Dostarczono</StatusTimelineLabel>
                                            <StatusTimelineTime>
                                                {formatDate(selectedMessage.deliveredDate || '')}
                                            </StatusTimelineTime>
                                        </StatusTimelineContent>
                                    </StatusTimelineItem>
                                )}

                                {selectedMessage.status === SmsStatus.SCHEDULED && (
                                    <StatusTimelineItem>
                                        <StatusTimelineIcon status="scheduled">
                                            <FaCalendarAlt />
                                        </StatusTimelineIcon>
                                        <StatusTimelineContent>
                                            <StatusTimelineLabel>Zaplanowano na</StatusTimelineLabel>
                                            <StatusTimelineTime>
                                                {formatDate(selectedMessage.scheduledDate || '')}
                                            </StatusTimelineTime>
                                        </StatusTimelineContent>
                                    </StatusTimelineItem>
                                )}
                            </StatusTimelineList>
                        </DetailSection>

                        {selectedMessage.status === SmsStatus.FAILED && selectedMessage.failedReason && (
                            <ErrorDetailSection>
                                <DetailLabel>Powód błędu:</DetailLabel>
                                <ErrorContent>
                                    <FaExclamationTriangle style={{ marginRight: '8px' }} />
                                    {selectedMessage.failedReason}
                                </ErrorContent>
                            </ErrorDetailSection>
                        )}

                        <MetadataSection>
                            <MetadataTitle>Metadane</MetadataTitle>
                            <MetadataGrid>
                                <MetadataItem>
                                    <MetadataLabel>ID wiadomości:</MetadataLabel>
                                    <MetadataValue>{selectedMessage.id}</MetadataValue>
                                </MetadataItem>

                                <MetadataItem>
                                    <MetadataLabel>Utworzono przez:</MetadataLabel>
                                    <MetadataValue>{selectedMessage.createdBy}</MetadataValue>
                                </MetadataItem>

                                {selectedMessage.templateId && (
                                    <MetadataItem>
                                        <MetadataLabel>ID szablonu:</MetadataLabel>
                                        <MetadataValue>{selectedMessage.templateId}</MetadataValue>
                                    </MetadataItem>
                                )}

                                {selectedMessage.campaignId && (
                                    <MetadataItem>
                                        <MetadataLabel>ID kampanii:</MetadataLabel>
                                        <MetadataValue>{selectedMessage.campaignId}</MetadataValue>
                                    </MetadataItem>
                                )}

                                {selectedMessage.automationId && (
                                    <MetadataItem>
                                        <MetadataLabel>ID automatyzacji:</MetadataLabel>
                                        <MetadataValue>{selectedMessage.automationId}</MetadataValue>
                                    </MetadataItem>
                                )}
                            </MetadataGrid>
                        </MetadataSection>

                        <DetailActions>
                            {selectedMessage.status === SmsStatus.FAILED && (
                                <PrimaryButton onClick={() => {
                                    handleRetryFailed(selectedMessage.id);
                                    setShowMessageDetails(false);
                                }}>
                                    <FaSync /> Ponów próbę wysłania
                                </PrimaryButton>
                            )}

                            {selectedMessage.status === SmsStatus.SCHEDULED && (
                                <DangerButton onClick={() => {
                                    setShowMessageDetails(false);
                                    handleCancelScheduled(selectedMessage);
                                }}>
                                    <FaTimes /> Anuluj zaplanowaną wiadomość
                                </DangerButton>
                            )}

                            <Button onClick={() => {
                                navigator.clipboard.writeText(selectedMessage.content);
                                showToast('success', 'Treść wiadomości skopiowana do schowka', 2000);
                            }}>
                                <FaCopy /> Kopiuj treść
                            </Button>

                            <DangerButton onClick={() => {
                                setShowMessageDetails(false);
                                handleDeleteMessage(selectedMessage);
                            }}>
                                <FaTrash /> Usuń wiadomość
                            </DangerButton>
                        </DetailActions>
                    </MessageDetailsContent>
                </Modal>
            )}

            {/* Modal z potwierdzeniem anulowania */}
            {showCancelConfirm && selectedMessage && (
                <Modal
                    isOpen={showCancelConfirm}
                    onClose={() => setShowCancelConfirm(false)}
                    title="Potwierdź anulowanie"
                >
                    <ConfirmContent>
                        <p>Czy na pewno chcesz anulować zaplanowaną wiadomość do <strong>{selectedMessage.recipientName}</strong>?</p>
                        <p>Ta operacja jest nieodwracalna.</p>

                        <ConfirmActions>
                            <SecondaryButton onClick={() => setShowCancelConfirm(false)}>
                                Anuluj
                            </SecondaryButton>
                            <PrimaryButton onClick={confirmCancelScheduled}>
                                Potwierdzam anulowanie wiadomości
                            </PrimaryButton>
                        </ConfirmActions>
                    </ConfirmContent>
                </Modal>
            )}

            {/* Modal z potwierdzeniem usunięcia */}
            {showDeleteConfirm && selectedMessage && (
                <Modal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    title="Potwierdź usunięcie"
                >
                    <ConfirmContent>
                        <p>Czy na pewno chcesz usunąć wiadomość do <strong>{selectedMessage.recipientName}</strong>?</p>
                        <p>Ta operacja jest nieodwracalna.</p>

                        <ConfirmActions>
                            <SecondaryButton onClick={() => setShowDeleteConfirm(false)}>
                                Anuluj
                            </SecondaryButton>
                            <DangerButton onClick={() => {
                                // W prawdziwej implementacji byłaby tu rzeczywista akcja usuwania
                                // Jako że nie mamy endpointu do usuwania, tylko symulujemy
                                showToast('success', 'Wiadomość została usunięta', 3000);
                                setShowDeleteConfirm(false);
                                // W rzeczywistej implementacji odświeżalibyśmy tutaj listę
                            }}>
                                Usuń wiadomość
                            </DangerButton>
                        </ConfirmActions>
                    </ConfirmContent>
                </Modal>
            )}
        </Container>
    );
};

// Pomocnicza funkcja do renderowania ikon statusu
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

const MessagesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const MessageCard = styled.div`
    background-color: white;
    border-radius: 6px;
    border: 1px solid #e9ecef;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: all 0.2s;

    &:hover {
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
    }
`;

const MessageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f1f3f5;
    background-color: #f8f9fa;
`;

const MessageLeft = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const MessageRight = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
`;

const MessageStatus = styled.div<{ color: string }>`
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    color: ${props => props.color};
`;

const MessageRecipient = styled.h3`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    cursor: pointer;
`;

const PhoneNumber = styled.div`
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #6c757d;
    padding: 2px 6px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: #f0f9ff;
        color: #3498db;
    }
`;

const MessageActions = styled.div`
    display: flex;
    gap: 6px;
`;

const ActionButton = styled.button<{ primary?: boolean, danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    background-color: transparent;
    border: none;
    color: ${props => {
    if (props.danger) return '#e74c3c';
    if (props.primary) return '#3498db';
    return '#6c757d';
}};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: ${props => {
    if (props.danger) return '#fff5f5';
    if (props.primary) return '#e3f2fd';
    return '#f8f9fa';
}};
    }
`;

const MessageContent = styled.div`
    padding: 16px;
    font-size: 14px;
    color: #2c3e50;
    line-height: 1.5;
    cursor: pointer;
`;

const MessageFooter = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background-color: #f8f9fa;
    border-top: 1px solid #f1f3f5;
    gap: 8px;
`;

const MessageTime = styled.div`
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #6c757d;
`;

const CampaignBadge = styled.div`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    background-color: #e3f2fd;
    color: #3498db;
`;

const AutomationBadge = styled.div`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    background-color: #e8f5e9;
    color: #2ecc71;
`;

const FailureReason = styled.div`
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    color: #e74c3c;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

// Styled components dla szczegółów wiadomości
const MessageDetailsContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const DetailHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
`;

const DetailHeaderLeft = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const DetailStatus = styled.div<{ color: string }>`
    display: inline-flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.color};
`;

const DetailRecipient = styled.h2`
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
`;

const DetailPhone = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #6c757d;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: #f0f9ff;
        color: #3498db;
    }
`;

const DetailSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const DetailLabel = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #495057;
`;

const DetailContent = styled.div`
    padding: 12px 16px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.5;
    color: #2c3e50;
    white-space: pre-wrap;
`;

const ErrorDetailSection = styled(DetailSection)`
    margin-top: -10px;
`;

const ErrorContent = styled.div`
    display: flex;
    align-items: flex-start;
    padding: 12px 16px;
    background-color: #fff5f5;
    border: 1px solid #fee2e2;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.5;
    color: #e74c3c;
`;

const StatusTimelineList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
`;

const StatusTimelineItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 16px;
`;

const StatusTimelineIcon = styled.div<{ status: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${props => {
    switch (props.status) {
        case 'created': return '#e3f2fd';
        case 'sent': return '#e8f5e9';
        case 'delivered': return '#e8f5e9';
        case 'failed': return '#fff5f5';
        case 'scheduled': return '#f3e5f5';
        default: return '#f1f3f5';
    }
}};
    color: ${props => {
    switch (props.status) {
        case 'created': return '#3498db';
        case 'sent': return '#2ecc71';
        case 'delivered': return '#2ecc71';
        case 'failed': return '#e74c3c';
        case 'scheduled': return '#9b59b6';
        default: return '#6c757d';
    }
}};
    font-size: 16px;
`;

const StatusTimelineContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
`;

const StatusTimelineLabel = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
`;

const StatusTimelineTime = styled.div`
    font-size: 13px;
    color: #6c757d;
`;

const MetadataSection = styled.div`
    margin-top: 10px;
`;

const MetadataTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 12px 0;
    color: #2c3e50;
`;

const MetadataGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    background-color: #f8f9fa;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #e9ecef;
`;

const MetadataItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const MetadataLabel = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const MetadataValue = styled.div`
    font-size: 13px;
    font-family: monospace;
    color: #2c3e50;
    word-break: break-all;
`;

const DetailActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
`;

// Styled components dla potwierdzeń
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

const ConfirmActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 8px;
`;

export default SmsMessagesList;