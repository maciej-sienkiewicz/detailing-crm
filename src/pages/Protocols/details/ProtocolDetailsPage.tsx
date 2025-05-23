import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaBan, FaCheckSquare, FaEdit, FaFilePdf, FaKey, FaRedo } from 'react-icons/fa';
import {protocolsApi} from "../../../api/protocolsApi";
import {Comment, commentsApi} from "../../../api/commentsApi";
import {CarReceptionProtocol, ProtocolStatus, SelectedService} from "../../../types";
import ProtocolSummary from "./components/ProtocolSummary";
import ProtocolComments from "./components/ProtocolComments";
import ProtocolInvoices from "./components/ProtocolInvoices";
import ProtocolClientInfo from "./components/ProtocolClientInfo";
import ProtocolVehicleStatus from "./components/ProtocolVehicleStatus";
import ProtocolGallery from "./components/ProtocolGallery";
import ProtocolHeader from "./components/ProtocolHeader";
import ProtocolStatusTimeline from "./components/ProtocolStatusTimeline";
import ProtocolTabs from "./components/ProtocolTabs";
import QualityVerificationModal from "./modals/QualityVerificationModal";
import CustomerNotificationModal from "./modals/CustomerNotificationModal";
import ClientCommentsModal from "./modals/ClientCommentsModal";
import PaymentModal from "./modals/PaymentModal";
import PDFViewer from "../../../components/PdfViewer";
import CancelProtocolModal, {CancellationReason} from "../shared/components/CancelProtocolModal";
import RestoreProtocolModal, { RestoreOption } from "../shared/components/RestoreProtocolModal";
import RescheduleProtocolModal from "../shared/components/RescheduleProtocolModal";


// Define tab types
type TabType = 'summary' | 'comments' | 'invoices' | 'client' | 'vehicle' | 'gallery';

const ProtocolDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [protocol, setProtocol] = useState<CarReceptionProtocol | null>(null);
    const [comments, setComments] = useState<Comment[] | null>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('summary');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const isCancelled = protocol?.status === ProtocolStatus.CANCELLED;
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);

    // Stany dla modali
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);

    // Stany dla procesu wydania samochodu
    const [showClientCommentsModal, setShowClientCommentsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Stan do obsługi podglądu PDF
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    const handleRestoreProtocol = (option: RestoreOption) => {
        setShowRestoreModal(false);

        if (!protocol) return;

        if (option === 'SCHEDULED') {
            // Pokaż modal do wyboru nowej daty
            setShowRescheduleModal(true);
        } else if (option === 'REALTIME') {
            // Przywracamy wizytę w czasie rzeczywistym (status IN_PROGRESS)
            // Przekieruj do strony rozpoczęcia wizyty
            navigate(`/orders/start-visit/${protocol.id}?restoreFromCancelled=true`);
        }
    };

    const handleRescheduleConfirm = async (dates: { startDate: string; endDate: string }) => {
        try {
            setShowRescheduleModal(false);

            if (!protocol) return;

            // Aktualizuj protokół ze statusem SCHEDULED i nowymi datami
            const updatedProtocol = {
                ...protocol,
                status: ProtocolStatus.SCHEDULED,
                startDate: dates.startDate,
                endDate: dates.endDate,
                statusUpdatedAt: new Date().toISOString()
            };

            // Wywołaj API do przywrócenia protokołu
            const result = await protocolsApi.restoreProtocol(protocol.id, {
                newStatus: ProtocolStatus.SCHEDULED,
                newStartDate: dates.startDate,
                newEndDate: dates.endDate
            });

            if (result) {
                // Aktualizuj stan lokalny
                setProtocol(result);
                alert('Wizyta została przywrócona i zaplanowana na nowy termin');
            } else {
                // Jeśli API restore nie zadziałało, użyj standardowego API update
                const updatedResult = await protocolsApi.updateProtocol(updatedProtocol);

                if (updatedResult) {
                    setProtocol(updatedResult);
                    alert('Wizyta została przywrócona i zaplanowana na nowy termin');
                } else {
                    throw new Error('Nie udało się przywrócić wizyty');
                }
            }
        } catch (error) {
            console.error('Błąd podczas przywracania protokołu z nową datą:', error);
            alert('Wystąpił błąd podczas przywracania wizyty');
        }
    };


    const handleCancelProtocol = async (reason: CancellationReason) => {
        try {
            // Wykorzystujemy istniejącą metodę updateProtocolStatus do zmiany statusu na CANCELLED
            await protocolsApi.updateProtocolStatus(protocol.id, ProtocolStatus.CANCELLED, reason);

            // Aktualizuj lokalny stan
            setProtocol({
                ...protocol,
                status: ProtocolStatus.CANCELLED,
                statusUpdatedAt: new Date().toISOString()
            });

            // Zamknij modal
            setShowCancelModal(false);

            // Opcjonalnie: pokazujemy powiadomienie o sukcesie
            alert('Protokół został anulowany');
        } catch (error) {
            console.error('Błąd podczas anulowania protokołu:', error);
            alert('Wystąpił błąd podczas anulowania protokołu');
        }
    };


    // Load protocol data
    useEffect(() => {
        const loadProtocol = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const data = await protocolsApi.getProtocolDetails(id);
                const comments = await commentsApi.getComments(id)

                if (!data) {
                    setError('Protokół nie został znaleziony.');
                    return;
                }

                setProtocol(data);
                setComments(comments)
                setError(null);
            } catch (err) {
                setError('Wystąpił błąd podczas ładowania protokołu.');
                console.error('Error loading protocol:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProtocol();
    }, [id]);

    // Handle status change - ta funkcja aktualizuje tylko lokalny stan
    const handleStatusChange = (newStatus: ProtocolStatus) => {
        if (!protocol) return;

        // Aktualizujemy lokalnie tylko status, reszta danych protokołu pozostaje bez zmian
        setProtocol({
            ...protocol,
            status: newStatus,
            statusUpdatedAt: new Date().toISOString(),  // Aktualizujemy datę zmiany statusu lokalnie
        });
    };

    // Go back to protocols list
    const handleGoBack = () => {
        navigate('/orders');
    };

    // Update protocol data after changes
    const handleProtocolUpdate = (updatedProtocol: CarReceptionProtocol) => {
        console.log('Protokół zaktualizowany:', updatedProtocol);
        setProtocol(updatedProtocol);
    };

    // Nowa funkcja do obsługi przycisku "Zakończ zlecenie"
    const handleFinishOrder = () => {
        // Pokazujemy modal weryfikacji jakości
        setShowVerificationModal(true);
    };

    // Funkcja wywoływana po zatwierdzeniu w modalu weryfikacji
    const handleQualityVerified = () => {
        // Zamykamy modal weryfikacji
        setShowVerificationModal(false);
        // Otwieramy modal powiadomień
        setShowNotificationModal(true);
    };

    // Funkcja wywoływana po wyborze opcji powiadomienia klienta
    const handleNotificationSelection = async (notificationOptions: {
        sendSms: boolean;
        sendEmail: boolean;
    }) => {
        // Zamykamy modal powiadomień
        setShowNotificationModal(false);

        // Zmieniamy status na "Oczekiwanie na odbiór"
        handleStatusChange(ProtocolStatus.READY_FOR_PICKUP);

        // W tle aktualizujemy status w API
        try {
            await protocolsApi.updateProtocolStatus(protocol!.id, ProtocolStatus.READY_FOR_PICKUP);
        } catch (error) {
            console.error('Błąd podczas aktualizacji statusu w API:', error);
        }

        // Tutaj moglibyśmy zaimplementować faktyczne wysyłanie powiadomień
        if (notificationOptions.sendSms) {
            console.log('Wysyłanie SMS do klienta:', protocol?.phone);
            // W rzeczywistej aplikacji: sendSmsNotification(protocol.phone);
        }

        if (notificationOptions.sendEmail) {
            console.log('Wysyłanie e-mail do klienta:', protocol?.email);
            // W rzeczywistej aplikacji: sendEmailNotification(protocol.email);
        }

        // Możemy dodać komentarz o wysłanym powiadomieniu
        if (notificationOptions.sendSms || notificationOptions.sendEmail) {
            // Dodanie komentarza systemowego o powiadomieniu
            // W rzeczywistej implementacji dodalibyśmy to do protokołu
            console.log('Dodanie informacji o powiadomieniu do historii protokołu');
        }
    };

    // Sprawdzenie czy przycisk "Zakończ zlecenie" powinien być dostępny
    const canFinishOrder = protocol?.status === ProtocolStatus.IN_PROGRESS;

    // Sprawdzenie czy przycisk "Wydaj samochód" powinien być dostępny
    const canReleaseVehicle = protocol?.status === ProtocolStatus.READY_FOR_PICKUP;

    const isScheduled = protocol?.status === ProtocolStatus.SCHEDULED;

    // Obsługa procesu wydania samochodu
    const handleReleaseVehicle = () => {
        // Rozpoczynamy proces wydania samochodu od sprawdzenia komentarzy dla klienta
        if(comments != null && comments.filter(c => c.type === 'customer').length > 0) {
            setShowClientCommentsModal(true);
        } else {
            setShowPaymentModal(true);
        }
    };

    // Funkcja wywoływana po zamknięciu modalu komentarzy dla klienta
    const handleClientCommentsModalClose = () => {
        setShowClientCommentsModal(false);
        setShowPaymentModal(true);
    };

// Zmodyfikuj funkcję handlePaymentConfirm, aby obsługiwała customInvoiceItems
    const handlePaymentConfirm = async (paymentData: {
        paymentMethod: 'cash' | 'card';
        documentType: 'invoice' | 'receipt' | 'other';
        invoiceItems?: SelectedService[];
    }) => {
        try {
            // Zamykamy modal płatności
            setShowPaymentModal(false);

            // Przygotuj dane do wysłania - nie modyfikujemy już protokołu,
            // ponieważ został już zaktualizowany przez handleServiceItemsChange
            const releaseData = {
                paymentMethod: paymentData.paymentMethod,
                documentType: paymentData.documentType,
                // Nie musimy już przekazywać invoiceItems, ponieważ protokół
                // już zawiera zaktualizowane usługi
            };

            // Wywołaj API do wydania pojazdu
            const result = await protocolsApi.releaseVehicle(protocol!.id, releaseData);

            if (result) {
                // Aktualizujemy lokalny stan na podstawie odpowiedzi z serwera
                setProtocol(result);
            } else {
                // W przypadku błędu zmieniamy tylko status lokalnie
                const updatedProtocol = { ...protocol! };
                updatedProtocol.status = ProtocolStatus.COMPLETED;
                updatedProtocol.statusUpdatedAt = new Date().toISOString();
                setProtocol(updatedProtocol);

                // W tle aktualizujemy status w API
                await protocolsApi.updateProtocolStatus(protocol!.id, ProtocolStatus.COMPLETED);
            }

            // Wyświetlamy powiadomienie o sukcesie
            alert('Pojazd został wydany klientowi');
        } catch (error) {
            console.error('Błąd podczas wydawania pojazdu:', error);
            alert('Wystąpił błąd podczas wydawania pojazdu');
        }
    };

    const handleServiceItemsChange = async (services: SelectedService[]) => {
        if (!protocol) return;

        try {
            // Tworzymy kopię protokołu z nowymi usługami
            const updatedProtocol: CarReceptionProtocol = {
                ...protocol,
                selectedServices: services
            };

            // Aktualizujemy lokalny stan
            setProtocol(updatedProtocol);

            // Zapisujemy zmiany na serwerze
            const result = await protocolsApi.updateProtocol(updatedProtocol);

            if (result) {
                // Jeśli aktualizacja się powiodła, zaktualizuj stan lokalny odpowiedzią z serwera
                setProtocol(result);

                // Opcjonalnie pokaż powiadomienie o sukcesie
            }
        } catch (error) {
            console.error('Błąd podczas aktualizacji protokołu:', error);

            // Przywracamy poprzedni stan w przypadku błędu
            setProtocol(protocol);
        }
    };

    // Render the component based on active tab
    const renderTabContent = () => {
        if (!protocol) {
            return <div>Brak danych protokołu</div>;
        }

        switch (activeTab) {
            case 'summary':
                return <ProtocolSummary protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
            case 'comments':
                return <ProtocolComments protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
            case 'invoices':
                return <ProtocolInvoices protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
            case 'client':
                return <ProtocolClientInfo protocol={protocol} />;
            case 'vehicle':
                return <ProtocolVehicleStatus protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
            case 'gallery':
                return <ProtocolGallery protocol={protocol} onProtocolUpdate={handleProtocolUpdate} disabled={protocol.status === ProtocolStatus.CANCELLED} />;
            default:
                return <ProtocolSummary protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
        }
    };

    if (loading) {
        return <LoadingContainer>Ładowanie protokołu...</LoadingContainer>;
    }

    if (error || !protocol) {
        return (
            <ErrorContainer>
                <ErrorMessage>{error || 'Nie znaleziono protokołu.'}</ErrorMessage>
                <BackButton onClick={handleGoBack}>
                    <FaArrowLeft /> Wróć do listy protokołów
                </BackButton>
            </ErrorContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderLeft>
                    <BackButton onClick={handleGoBack}>
                        <FaArrowLeft />
                    </BackButton>
                    <HeaderTitle>
                        <h1>Wizyta #{protocol.id}</h1>
                        <HeaderSubtitle>{protocol.make} {protocol.model} ({protocol.licensePlate})</HeaderSubtitle>
                    </HeaderTitle>
                </HeaderLeft>
                <HeaderActions>

                    {canFinishOrder && (
                        <ActionButton title="Zakończ wizytę" primary="true" special="true" onClick={handleFinishOrder}>
                            <FaCheckSquare /> Zakończ wizytę
                        </ActionButton>
                    )}

                    {canReleaseVehicle && (
                        <ActionButton title="Wydaj samochód" primary="true" release="true" onClick={handleReleaseVehicle}>
                            <FaKey /> Wydaj samochód
                        </ActionButton>
                    )}

                    {protocol.status == ProtocolStatus.SCHEDULED && (
                        <ActionButton title="Edytuj protokół" onClick={() => navigate(`/orders`, {
                            state: {
                                editProtocolId: protocol.id
                            }
                        })}>
                            <FaEdit /> Edytuj
                        </ActionButton>
                    )}

                    {isScheduled && (
                        <ActionButton title="Rozpocznij wizytę" primary="true" onClick={() => navigate(`/orders/start-visit/${protocol.id}`)}>
                            <FaEdit /> Rozpocznij wizytę
                        </ActionButton>
                    )}

                    {!isScheduled && (
                        <ActionButton
                            title="Drukuj protokół"
                            primary="true"
                            onClick={() => setShowPdfPreview(true)}
                        >
                            <FaFilePdf /> Drukuj protokół
                        </ActionButton>
                    )}

                    {!isCancelled && (
                        <ActionButton
                            title="Anuluj wizytę"
                            danger="true"
                            onClick={() => setShowCancelModal(true)}
                        >
                            <FaBan /> Anuluj wizytę
                        </ActionButton>
                    )}
                    {isCancelled && (
                        <ActionButton
                            title="Przywróć wizytę"
                            primary="true"
                            restore="true"
                            onClick={() => setShowRestoreModal(true)}
                        >
                            <FaRedo /> Przywróć wizytę
                        </ActionButton>
                    )}
                </HeaderActions>
            </PageHeader>

            <MainContent>
                <LeftSidebar>
                    <ProtocolHeader protocol={protocol} onStatusChange={handleStatusChange} />
                    <ProtocolStatusTimeline protocol={protocol} />
                </LeftSidebar>
                <ContentArea>
                    <ProtocolTabs activeTab={activeTab} onChange={setActiveTab} />
                    <TabContent>
                        {renderTabContent()}
                    </TabContent>
                </ContentArea>
            </MainContent>

            {/* Modal weryfikacji jakości */}
            <QualityVerificationModal
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                onConfirm={handleQualityVerified}
                protocol={protocol}
            />

            {/* Modal powiadomienia klienta */}
            <CustomerNotificationModal
                isOpen={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
                onConfirm={handleNotificationSelection}
                customerPhone={protocol?.phone}
                customerEmail={protocol?.email}
            />

            {/* Modele procesu wydania samochodu */}
            <ClientCommentsModal
                isOpen={showClientCommentsModal}
                onClose={handleClientCommentsModalClose}
                comments={comments}
            />

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onConfirm={handlePaymentConfirm}
                totalAmount={protocol?.selectedServices.reduce((sum, s) => sum + s.finalPrice, 0) || 0}
                services={protocol?.selectedServices || []}
                onServicesChange={handleServiceItemsChange}
                protocolId={protocol.id} // Dodajemy ID protokołu
            />

            {/* PDF Preview Modal */}
            {showPdfPreview && protocol && (
                <PDFViewer
                    protocolId={protocol.id}
                    onClose={() => setShowPdfPreview(false)}
                    title={`Protokół przyjęcia pojazdu #${protocol.id}`}
                />
            )}

            {showCancelModal && (
                <CancelProtocolModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={handleCancelProtocol}
                    protocolId={protocol.id}
                />
            )}

            {showRestoreModal && (
                <RestoreProtocolModal
                    isOpen={showRestoreModal}
                    onClose={() => setShowRestoreModal(false)}
                    onRestore={handleRestoreProtocol}
                    protocolId={protocol.id}
                />
            )}

            {showRescheduleModal && (
                <RescheduleProtocolModal
                    isOpen={showRescheduleModal}
                    onClose={() => setShowRescheduleModal(false)}
                    onConfirm={handleRescheduleConfirm}
                    protocolId={protocol.id}
                />
            )}

        </PageContainer>
    );
};

// Styled components
const PageContainer = styled.div`
    padding: 20px;
    max-width: 100%;
    overflow-x: hidden;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;


const BackButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 50%;
    margin-right: 15px;
    cursor: pointer;
    color: #34495e;

    &:hover {
        background-color: #f0f0f0;
    }

    @media (max-width: 480px) {
        margin-right: 0;
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;

        ${BackButton} {
            margin-bottom: 10px;
        }
    }
`;

const HeaderTitle = styled.div`
    h1 {
        font-size: 24px;
        margin: 0;
        color: #2c3e50;

        @media (max-width: 768px) {
            font-size: 20px;
        }
    }
`;

const HeaderSubtitle = styled.div`
    font-size: 14px;
    color: #7f8c8d;
    margin-top: 4px;
`;

const ActionButton = styled.button<{
    primary?: string;
    special?: string;
    release?: string;
    danger?: string;
    restore?: string;
}>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: ${props => {
        if (props.special) return '#2ecc71';
        if (props.release) return '#f39c12';
        if (props.danger) return '#e74c3c';
        if (props.restore) return '#3498db';
        return props.primary ? '#3498db' : '#f9f9f9';
    }};
    color: ${props => props.primary || props.special || props.release || props.danger || props.restore ? 'white' : '#34495e'};
    border: 1px solid ${props => {
        if (props.special) return '#2ecc71';
        if (props.release) return '#f39c12';
        if (props.danger) return '#e74c3c';
        if (props.restore) return '#3498db';
        return props.primary ? '#3498db' : '#eee';
    }};
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background-color: ${props => {
            if (props.special) return '#27ae60';
            if (props.release) return '#e67e22';
            if (props.danger) return '#c0392b';
            if (props.restore) return '#2980b9';
            return props.primary ? '#2980b9' : '#f0f0f0';
        }};
        border-color: ${props => {
            if (props.special) return '#27ae60';
            if (props.release) return '#e67e22';
            if (props.danger) return '#c0392b';
            if (props.restore) return '#2980b9';
            return props.primary ? '#2980b9' : '#ddd';
        }};
    }
`;
const HeaderActions = styled.div`
    display: flex;
    gap: 10px;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-end;
    }

    @media (max-width: 480px) {
        flex-direction: column;
        width: 100%;

        ${ActionButton} {
            width: 100%;
            justify-content: center;
        }
    }
`;

const MainContent = styled.div`
    display: flex;
    gap: 20px;

    @media (max-width: 992px) {
        flex-direction: column;
    }
`;

const LeftSidebar = styled.div`
    width: 300px;
    flex-shrink: 0;

    @media (max-width: 992px) {
        width: 100%;
    }
`;

const ContentArea = styled.div`
    flex: 1;
    min-width: 0;

    @media (max-width: 992px) {
        margin-top: 20px;
    }
`;

const TabContent = styled.div`
    background-color: white;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 20px;

    @media (max-width: 768px) {
        padding: 15px;
    }

    @media (max-width: 480px) {
        padding: 12px;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 50px;
    font-size: 16px;
    color: #7f8c8d;

    @media (max-width: 768px) {
        padding: 30px;
    }
`;

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 50px;
    text-align: center;

    @media (max-width: 768px) {
        padding: 30px;
    }

    @media (max-width: 480px) {
        padding: 20px;
    }
`;

const ErrorMessage = styled.div`
    padding: 15px 20px;
    background-color: #fdecea;
    color: #e74c3c;
    border-radius: 4px;
    margin-bottom: 20px;
    font-size: 16px;
    width: 100%;
    max-width: 500px;

    @media (max-width: 480px) {
        padding: 12px 15px;
        font-size: 14px;
    }
`;

export default ProtocolDetailsPage;