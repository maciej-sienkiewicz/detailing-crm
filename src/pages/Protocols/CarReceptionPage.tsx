import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { servicesApi } from '../../api/servicesApi';
import {
    PageContainer,
    PageHeader,
    HeaderLeft,
    BackButton,
    AddButton,
    LoadingMessage,
    ErrorMessage
} from './styles';
import { useProtocolList } from "./form/hooks/useProtocolList";
import { useProtocolActions } from "./form/hooks/useProtocolActions";
import { ProtocolFilters } from "./list/ProtocolFilters";
import { ProtocolList } from "./list/ProtocolList";
import ProtocolConfirmationModal from "./shared/modals/ProtocolConfirmationModal";
import { ProtocolStatus } from '../../types';
import EditProtocolForm from "./form/components/EditProtocolForm";

const CarReceptionPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [availableServices, setAvailableServices] = useState<any[]>([]);

    // Stan do śledzenia, czy mamy wyświetlić modal we flow po nawigacji
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
        // Sprawdz, ktory modal zamykamy
        if (isShowingConfirmationModal) {
            setIsShowingConfirmationModal(false);

            // Jesli zamykamy modal w trakcie edycji
            if (currentProtocol) {
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

        // Pobierz odpowiedni protocol z zaleznosci od kontekstu
        const protocol = currentProtocol || postNavigationProtocol;

        // Tutaj można zaimplementować faktyczne drukowanie lub wysyłanie e-maila
        if (options.print && protocol) {
            // W rzeczywistej aplikacji wywołalibyśmy usługę drukowania
        }

        if (options.sendEmail && protocol?.email) {
            // W rzeczywistej aplikacji wywołalibyśmy usługę wysyłania e-maila
        }

        // Zamknij modal
        handleProtocolConfirmationClosed();
    };

    // Sprawdzamy, czy mamy dane do stworzenia protokołu z wizyty
    const protocolDataFromAppointment = location.state?.protocolData;
    const appointmentId = location.state?.appointmentId;
    const editProtocolId = location.state?.editProtocolId;
    const startDateFromCalendar = location.state?.startDate;
    const isFullProtocolFromNav = location.state?.isFullProtocol !== undefined
        ? location.state.isFullProtocol
        : true; // domyślnie true, jeśli nie określono

    const [isFullProtocol, setIsFullProtocol] = useState(isFullProtocolFromNav);

    // Efekt do pobierania usług
    useEffect(() => {
        if (startDateFromCalendar) {
            setShowForm(true);
            console.log('Data z kalendarza:', startDateFromCalendar);
        }

        const fetchServices = async () => {
            try {
                const servicesData = await servicesApi.fetchServices();
                setAvailableServices(servicesData);
            } catch (err) {
                console.error('Error fetching available services:', err);
            }
        };

        fetchServices();
    }, []);

    // Funkcja do ponownego załadowania usług po dodaniu nowej
    const refreshServices = async () => {
        try {
            const servicesData = await servicesApi.fetchServices();
            setAvailableServices(prevServices => {
                // Zachowujemy referencję do poprzedniego stanu, jeśli nowy jest pusty
                if (!servicesData || servicesData.length === 0) {
                    console.warn("Pobrano pustą listę usług, zachowuję poprzedni stan");
                    return prevServices;
                }
                return servicesData;
            });
        } catch (err) {
            console.error('Error refreshing services list:', err);
        }
    };

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
                // Sprawdzamy, czy to jest akcja rozpoczynania wizyty
                const isStartVisitAction = location.state?.isOpenProtocolAction;

                if (isStartVisitAction) {
                    // Przekieruj na stronę rozpoczęcia wizyty
                    navigate(`/orders/start-visit/${editProtocolId}`);
                    return;
                }

                // Standardowa edycja
                await handleEditProtocol(editProtocolId);
                setShowForm(true);
            }
        };

        handleRedirectData();
    }, [protocolDataFromAppointment, editProtocolId, startDateFromCalendar]);

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
                        <EditProtocolForm
                            protocol={editingProtocol}
                            availableServices={availableServices}
                            initialData={
                                protocolDataFromAppointment ||
                                (startDateFromCalendar ? {
                                    ...formData,
                                    startDate: startDateFromCalendar
                                } : formData)
                            }
                            appointmentId={appointmentId}
                            isFullProtocol={isFullProtocol}
                            onSave={handleSaveProtocol}
                            onCancel={handleFormCancel}
                            onServiceAdded={refreshServices}
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