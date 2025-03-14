import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    FaArrowLeft,
    FaEdit,
    FaFilePdf,
    FaCarSide,
    FaCheckSquare // Nowa ikona dla przycisku Zakończ zlecenie
} from 'react-icons/fa';
import { CarReceptionProtocol, ProtocolStatus } from '../../types';
import { fetchCarReceptionProtocol, updateProtocolStatus } from '../../api/mocks/carReceptionMocks';
import ProtocolHeader from './components/ProtocolDetails/ProtocolHeader';
import ProtocolTabs from './components/ProtocolDetails/ProtocolTabs';
import ProtocolSummary from './components/ProtocolDetails/ProtocolSummary';
import ProtocolComments from './components/ProtocolDetails/ProtocolComments';
import ProtocolInvoices from './components/ProtocolDetails/ProtocolInvoices';
import ProtocolClientInfo from './components/ProtocolDetails/ProtocolClientInfo';
import ProtocolVehicleStatus from './components/ProtocolDetails/ProtocolVehicleStatus';
import ProtocolStatusTimeline from './components/ProtocolDetails/ProtocolStatusTimeline';
import QualityVerificationModal from './components/QualityVerificationModal'; // Importujemy komponent modalu weryfikacji
import CustomerNotificationModal from './components/CustomerNotificationModal'; // Importujemy komponent modalu powiadomień

// Define tab types
type TabType = 'summary' | 'comments' | 'invoices' | 'client' | 'vehicle';

const ProtocolDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [protocol, setProtocol] = useState<CarReceptionProtocol | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('summary');

    // Stany dla modali
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);

    // Load protocol data
    useEffect(() => {
        const loadProtocol = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const data = await fetchCarReceptionProtocol(id);

                if (!data) {
                    setError('Protokół nie został znaleziony.');
                    return;
                }

                setProtocol(data);
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

    // Handle status change
    const handleStatusChange = async (newStatus: ProtocolStatus) => {
        if (!protocol) return;

        try {
            const updatedProtocol = await updateProtocolStatus(protocol.id, newStatus);
            setProtocol(updatedProtocol);
        } catch (err) {
            setError('Nie udało się zaktualizować statusu protokołu.');
            console.error('Error updating protocol status:', err);
        }
    };

    // Go back to protocols list
    const handleGoBack = () => {
        navigate('/orders/scheduled');
    };

    // Update protocol data after changes
    const handleProtocolUpdate = (updatedProtocol: CarReceptionProtocol) => {
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
        await handleStatusChange(ProtocolStatus.READY_FOR_PICKUP);

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

    // Render the component based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'summary':
                return <ProtocolSummary protocol={protocol} />;
            case 'comments':
                return <ProtocolComments protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
            case 'invoices':
                return <ProtocolInvoices protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
            case 'client':
                return <ProtocolClientInfo protocol={protocol} />;
            case 'vehicle':
                return <ProtocolVehicleStatus protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
            default:
                return <ProtocolSummary protocol={protocol} />;
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <HeaderLeft>
                    <BackButton onClick={handleGoBack}>
                        <FaArrowLeft />
                    </BackButton>
                    <HeaderTitle>
                        <h1>Protokół #{protocol.id}</h1>
                        <HeaderSubtitle>{protocol.make} {protocol.model} ({protocol.licensePlate})</HeaderSubtitle>
                    </HeaderTitle>
                </HeaderLeft>
                <HeaderActions>
                    {canFinishOrder && (
                        <ActionButton title="Zakończ zlecenie" primary="true" special="true" onClick={handleFinishOrder}>
                            <FaCheckSquare /> Zakończ zlecenie
                        </ActionButton>
                    )}
                    <ActionButton title="Edytuj protokół" onClick={() => navigate(`/orders/car-reception?edit=${protocol.id}`)}>
                        <FaEdit /> Edytuj
                    </ActionButton>
                    <ActionButton title="Drukuj protokół" primary="true">
                        <FaFilePdf /> Drukuj protokół
                    </ActionButton>
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
            />

            {/* Modal powiadomienia klienta */}
            <CustomerNotificationModal
                isOpen={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
                onConfirm={handleNotificationSelection}
                customerPhone={protocol?.phone}
                customerEmail={protocol?.email}
            />
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


const ActionButton = styled.button<{ primary?: string; special?: string }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: ${props => {
        if (props.special) return '#2ecc71';
        return props.primary ? '#3498db' : '#f9f9f9';
    }};
    color: ${props => props.primary || props.special ? 'white' : '#34495e'};
    border: 1px solid ${props => {
        if (props.special) return '#2ecc71';
        return props.primary ? '#3498db' : '#eee';
    }};
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background-color: ${props => {
            if (props.special) return '#27ae60';
            return props.primary ? '#2980b9' : '#f0f0f0';
        }};
        border-color: ${props => {
            if (props.special) return '#27ae60';
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