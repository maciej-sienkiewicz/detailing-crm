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

const CarReceptionPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [availableServices, setAvailableServices] = useState<any[]>([]);

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
        handleFormCancel
    } = useProtocolActions(refreshProtocolsList, setShowForm, navigate);

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
                await handleEditProtocol(editProtocolId, isOpenProtocolAction || false);
            }
        };

        handleRedirectData();
    }, [protocolDataFromAppointment, editProtocolId, startDateFromCalendar, isOpenProtocolAction]);

    // Efekt dla obsługi odświeżenia komponentu po zmianie ścieżki
    useEffect(() => {
        setShowForm(false);
        refreshProtocolsList();
    }, [location.key]);

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
        </PageContainer>
    );
};

export default CarReceptionPage;