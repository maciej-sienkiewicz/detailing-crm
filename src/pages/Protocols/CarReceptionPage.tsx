import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaClipboardCheck, FaPlus } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { servicesApi } from '../../api/servicesApi';
import {
    PageContainer,
    HeaderContainer,
    PageHeader,
    HeaderLeft,
    BackButton,
    LoadingMessage,
    ErrorMessage,
    HeaderTitle,
    TitleContent,
    MainTitle,
    Subtitle,
    TitleIcon,
    PrimaryAction
} from './styles';
import { useProtocolList } from "./form/hooks/useProtocolList";
import { useProtocolActions } from "./form/hooks/useProtocolActions";
import ProtocolConfirmationModal from "./shared/modals/ProtocolConfirmationModal";
import { EditProtocolForm } from "./form/components/EditProtocolForm";
import { VisitsPageContainer } from './VisitsPageContainer';

const CarReceptionPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [availableServices, setAvailableServices] = useState<any[]>([]);

    const [showModalPostNavigation, setShowModalPostNavigation] = useState(false);
    const [postNavigationProtocol, setPostNavigationProtocol] = useState<any>(null);

    const {
        protocols,
        filteredProtocols,
        loading,
        error,
        activeFilter,
        setActiveFilter,
        refreshProtocolsList,
        pagination,
        handlePageChange,
        searchProtocols
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

    const handleProtocolConfirmationClosed = () => {
        if (isShowingConfirmationModal) {
            setIsShowingConfirmationModal(false);

            if (currentProtocol) {
                refreshProtocolsList();
                setShowForm(false);
                navigate(`/visits/${currentProtocol.id}`);
            }
        } else if (showModalPostNavigation) {
            setShowModalPostNavigation(false);
            setPostNavigationProtocol(null);
        }
    };

    const handleProtocolConfirmationConfirm = (options: { print: boolean; sendEmail: boolean }) => {
        const protocol = currentProtocol || postNavigationProtocol;
        handleProtocolConfirmationClosed();
    };

    const protocolDataFromAppointment = location.state?.protocolData;
    const appointmentId = location.state?.appointmentId;
    const editProtocolId = location.state?.editProtocolId;
    const startDateFromCalendar = location.state?.startDate;
    const endDateFromCalendar = location.state?.endDate;
    const isFullProtocolFromNav = location.state?.isFullProtocol !== undefined
        ? location.state.isFullProtocol
        : true;

    // FIXED: Dodana obsługa akcji "new" dla nowych wizyt
    const actionFromState = location.state?.action;

    const [isFullProtocol, setIsFullProtocol] = useState(isFullProtocolFromNav);

    useEffect(() => {
        // FIXED: Sprawdź czy to jest żądanie nowej wizyty
        if (actionFromState === 'new') {
            console.log('🆕 Otwieranie formularza nowej wizyty');
            setShowForm(true);
        } else if (startDateFromCalendar) {
            setShowForm(true);
            console.log('Data z kalendarza początkowa:', startDateFromCalendar);
        }

        if (endDateFromCalendar) {
            console.log('Data z kalendarza końcowa:', endDateFromCalendar);
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
    }, [actionFromState, startDateFromCalendar, endDateFromCalendar]);

    const refreshServices = async () => {
        try {
            const servicesData = await servicesApi.fetchServices();
            setAvailableServices(prevServices => {
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

    useEffect(() => {
        // FIXED: Nie resetuj formy automatycznie jeśli to żądanie nowej wizyty
        if (actionFromState !== 'new') {
            setShowForm(false);
            refreshProtocolsList();
        }
    }, [location.key, actionFromState]);

    useEffect(() => {
        const handleRedirectData = async () => {
            console.log('Obsługa przekierowania z innych widoków');
            console.log('protocolDataFromAppointment:', !!protocolDataFromAppointment);
            console.log('startDateFromCalendar:', !!startDateFromCalendar);
            console.log('endDateFromCalendar:', !!endDateFromCalendar);
            console.log('editProtocolId:', editProtocolId);
            console.log('actionFromState:', actionFromState);

            if (protocolDataFromAppointment) {
                setShowForm(true);
            }

            if (startDateFromCalendar && actionFromState !== 'new') {
                setShowForm(true);
            }

            if (editProtocolId) {
                const isStartVisitAction = location.state?.isOpenProtocolAction;

                if (isStartVisitAction) {
                    navigate(`/visits/${editProtocolId}/open`);
                    return;
                }

                await handleEditProtocol(editProtocolId);
                setShowForm(true);
            }
        };

        handleRedirectData();
    }, [protocolDataFromAppointment, editProtocolId, startDateFromCalendar, endDateFromCalendar, actionFromState]);

    const availableServiceNames = availableServices
        .map(service => service.name)
        .filter((value, index, self) => self.indexOf(value) === index);

    if (showForm) {
        return (
            <PageContainer>
                <HeaderContainer>
                    <PageHeader>
                        <HeaderLeft>
                            <BackButton onClick={handleFormCancel}>
                                <FaArrowLeft />
                            </BackButton>
                            <h1>{editingProtocol ? 'Edycja protokołu' : 'Rezerwacja'}</h1>
                        </HeaderLeft>
                    </PageHeader>
                </HeaderContainer>

                {loading && filteredProtocols.length === 0 ? (
                    <LoadingMessage>Ładowanie danych...</LoadingMessage>
                ) : error ? (
                    <ErrorMessage>{error}</ErrorMessage>
                ) : (
                    <EditProtocolForm
                        protocol={editingProtocol}
                        availableServices={availableServices}
                        initialData={
                            protocolDataFromAppointment ||
                            (startDateFromCalendar ? {
                                ...formData,
                                startDate: startDateFromCalendar,
                                endDate: endDateFromCalendar
                            } : formData)
                        }
                        appointmentId={appointmentId}
                        isFullProtocol={isFullProtocol}
                        onSave={handleSaveProtocol}
                        onCancel={handleFormCancel}
                        onServiceAdded={refreshServices}
                    />
                )}

                {isShowingConfirmationModal && currentProtocol && (
                    <ProtocolConfirmationModal
                        isOpen={isShowingConfirmationModal}
                        onClose={handleProtocolConfirmationClosed}
                        protocolId={currentProtocol.id}
                        clientEmail={currentProtocol.email || ''}
                        onConfirm={handleProtocolConfirmationConfirm}
                    />
                )}

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
    }

    return <VisitsPageContainer />;
};

export default CarReceptionPage;