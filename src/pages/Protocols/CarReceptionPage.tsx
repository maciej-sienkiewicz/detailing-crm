import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchAvailableServices } from '../../api/mocks/carReceptionMocks';
import {
    PageContainer,
    PageHeader,
    HeaderLeft,
    BackButton,
    AddButton,
    LoadingMessage,
    ErrorMessage
} from './styles';
import {useProtocolList} from "./form/hooks/useProtocolList";
import {useProtocolActions} from "./form/hooks/useProtocolActions";
import {ProtocolFilters} from "./list/ProtocolFilters";
import CarReceptionForm from "./form/CarReceptionForm";
import {ProtocolList} from "./list/ProtocolList";
import ProtocolConfirmationModal from "./shared/modals/ProtocolConfirmationModal";
import { ProtocolStatus } from '../../types';
import {protocolsApi} from "../../api/protocolsApi";

const CarReceptionPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [availableServices, setAvailableServices] = useState<any[]>([]);

    // Stan do sledzenia, czy mamy wyswietlic modal we flow po nawigacji
    const [showModalPostNavigation, setShowModalPostNavigation] = useState(false);
    const [postNavigationProtocol, setPostNavigationProtocol] = useState<any>(null);

    // Custom hooks for protocol management
    const {
        protocols,
        filteredProtocols,
        loading,
        error,
        activeFilter,
        setActiveFilter,
        refreshProtocolsList
    } = useProtocolList();

    const {
        editingProtocol,
        formData,
        handleAddProtocol,
        handleViewProtocol,
        handleEditProtocol,
        handleDeleteProtocol,
        handleSaveProtocol,
        handleFormCancel,
        isShowingConfirmationModal,
        setIsShowingConfirmationModal,
        currentProtocol
    } = useProtocolActions(refreshProtocolsList, setShowForm, navigate);

    // Obsługa zamknięcia modalu protokołu
    const handleProtocolConfirmationClosed = () => {
        console.log('Modal potwierdzenia zamknięty');

        // Sprawdz, ktory modal zamykamy
        if (isShowingConfirmationModal) {
            setIsShowingConfirmationModal(false);

            // Jesli zamykamy modal w trakcie edycji
            if (currentProtocol) {
                console.log(`Kończenie procesu zapisu po zamknięciu modalu, protocol.id: ${currentProtocol.id}`);
                refreshProtocolsList();
                setShowForm(false);
                navigate(`/orders/car-reception/${currentProtocol.id}`);
            }
        } else if (showModalPostNavigation) {
            // Jesli zamykamy modal po nawigacji
            setShowModalPostNavigation(false);
            setPostNavigationProtocol(null);
        }
    };

    // Obsługa potwierdzeń z modalu protokołu
    const handleProtocolConfirmationConfirm = (options: { print: boolean; sendEmail: boolean }) => {
        console.log('Potwierdzenie z modalu:', options);

        // Pobierz odpowiedni protocol z zaleznosci od kontekstu
        const protocol = currentProtocol || postNavigationProtocol;

        // Tutaj można zaimplementować faktyczne drukowanie lub wysyłanie e-maila
        if (options.print && protocol) {
            console.log('Drukowanie protokołu', protocol.id);
            // W rzeczywistej aplikacji wywołalibyśmy usługę drukowania
        }

        if (options.sendEmail && protocol?.email) {
            console.log('Wysyłanie protokołu e-mailem do', protocol.email);
            // W rzeczywistej aplikacji wywołalibyśmy usługę wysyłania e-maila
        }

        // Zamknij modal
        handleProtocolConfirmationClosed();
    };

    // Sprawdzamy, czy mamy dane do stworzenia protokołu z wizyty
    const protocolDataFromAppointment = location.state?.protocolData;
    const appointmentId = location.state?.appointmentId;
    const editProtocolId = location.state?.editProtocolId;
    const isOpenProtocolAction = location.state?.isOpenProtocolAction;
    const startDateFromCalendar = location.state?.startDate;
    const isFullProtocolFromNav = location.state?.isFullProtocol !== undefined
        ? location.state.isFullProtocol
        : true; // domyślnie true, jeśli nie określono

    const [isFullProtocol, setIsFullProtocol] = useState(isFullProtocolFromNav);

    // Efekt do sprawdzania czy mamy wyswietlic modal po nawigacji
    // (otwieramy strone szczegolowa jakiegos protokolu)
    useEffect(() => {
        const checkForProtocolOpening = async () => {
            // Sprawdz, czy jestesmy na stronie szczegolowej protokolu
            const match = location.pathname.match(/\/orders\/car-reception\/(.+)/);
            if (match && match[1]) {
                const protocolId = match[1];

                // Sprawdz, czy mamy flage, ze to bylo "Rozpocznij wizyte"
                if (location.search.includes('showConfirmation=true') ||
                    location.search.includes('isOpenProtocolAction=true')) {

                    try {
                        // Pobierz dane protokolu
                        const protocol = await protocolsApi.getProtocolDetails(protocolId);

                        // Jesli status jest IN_PROGRESS, pokaz modal
                        if (protocol && protocol.status === ProtocolStatus.IN_PROGRESS) {
                            setPostNavigationProtocol(protocol);
                            setShowModalPostNavigation(true);
                        }
                    } catch (error) {
                        console.error('Błąd pobierania danych protokołu:', error);
                    }
                }
            }
        };

        checkForProtocolOpening();
    }, [location.pathname, location.search]);

    // Efekt do pobierania usług
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const servicesData = await fetchAvailableServices();
                setAvailableServices(servicesData);
            } catch (err) {
                console.error('Error fetching available services:', err);
            }
        };

        fetchServices();
    }, []);

    // Obsługa przekierowania z innych widoków
    useEffect(() => {
        setShowForm(false);
        refreshProtocolsList();
    }, [location.key]);

    // Obsługa przekierowania z innych widoków
    useEffect(() => {
        const handleRedirectData = async () => {
            console.log('Obsługa przekierowania z innych widoków');
            console.log('protocolDataFromAppointment:', !!protocolDataFromAppointment);
            console.log('startDateFromCalendar:', !!startDateFromCalendar);
            console.log('editProtocolId:', editProtocolId);
            console.log('isOpenProtocolAction:', isOpenProtocolAction);

            // Jeśli mamy dane z wizyty, automatycznie otworzymy formularz
            if (protocolDataFromAppointment) {
                setShowForm(true);
            }

            // Jeśli przyszliśmy z kalendarza z nową wizytą
            if (startDateFromCalendar) {
                setShowForm(true);
            }

            // Jeśli mamy ID protokołu do edycji, pobieramy go i otwieramy formularz
            if (editProtocolId) {
                await handleEditProtocol(editProtocolId, Boolean(isOpenProtocolAction));
            }
        };

        handleRedirectData();
    }, [protocolDataFromAppointment, editProtocolId, startDateFromCalendar, isOpenProtocolAction]);

    return (
        <PageContainer>
            <PageHeader>
                {showForm ? (
                    <>
                        <HeaderLeft>
                            <BackButton onClick={handleFormCancel}>
                                <FaArrowLeft />
                            </BackButton>
                            <h1>{editingProtocol ? 'Edycja protokołu' : 'Wizyta'}</h1>
                        </HeaderLeft>
                    </>
                ) : (
                    <>
                        <h1>Protokoły przyjęcia pojazdu</h1>
                        <AddButton onClick={handleAddProtocol}>
                            <FaPlus /> Rozpocznij wizytę
                        </AddButton>
                    </>
                )}
            </PageHeader>

            {/* Filtry protokołów - ukrywane podczas wyświetlania formularza */}
            {!showForm && (
                <ProtocolFilters
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
            )}

            {loading ? (
                <LoadingMessage>Ładowanie danych...</LoadingMessage>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : (
                <>
                    {showForm ? (
                        <CarReceptionForm
                            protocol={editingProtocol}
                            availableServices={availableServices}
                            initialData={protocolDataFromAppointment || formData}
                            appointmentId={appointmentId}
                            isFullProtocol={isFullProtocol}
                            onSave={handleSaveProtocol}
                            onCancel={handleFormCancel}
                            isOpenProtocolAction={isOpenProtocolAction}
                        />
                    ) : (
                        <ProtocolList
                            protocols={filteredProtocols}
                            activeFilter={activeFilter}
                            onViewProtocol={handleViewProtocol}
                            onEditProtocol={handleEditProtocol}
                            onDeleteProtocol={handleDeleteProtocol}
                        />
                    )}
                </>
            )}

            {/* Modal potwierdzenia protokołu - wyświetlany po zapisaniu formularza */}
            {isShowingConfirmationModal && currentProtocol && (
                <ProtocolConfirmationModal
                    isOpen={isShowingConfirmationModal}
                    onClose={handleProtocolConfirmationClosed}
                    protocolId={currentProtocol.id}
                    clientEmail={currentProtocol.email || ''}
                    onConfirm={handleProtocolConfirmationConfirm}
                />
            )}

            {/* Modal potwierdzenia protokolu - wyswietlany po nawigacji do szczegolowego widoku */}
            {showModalPostNavigation && postNavigationProtocol && (
                <ProtocolConfirmationModal
                    isOpen={showModalPostNavigation}
                    onClose={handleProtocolConfirmationClosed}
                    protocolId={postNavigationProtocol.id}
                    clientEmail={postNavigationProtocol.email || ''}
                    onConfirm={handleProtocolConfirmationConfirm}
                />
            )}
        </PageContainer>
    );
};

export default CarReceptionPage;