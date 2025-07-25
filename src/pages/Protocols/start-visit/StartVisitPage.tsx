import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CarReceptionProtocol, ProtocolStatus } from '../../../types';
import { protocolsApi } from '../../../api/protocolsApi';
import { servicesApi } from '../../../api/servicesApi';

import {
    PageContainer,
    PageHeader,
    HeaderLeft,
    BackButton,
    LoadingMessage,
    ErrorMessage
} from '../styles';

// Komponenty
import StartVisitForm from './components/StartVisitForm';
import ProtocolConfirmationModal from "../shared/modals/ProtocolConfirmationModal";

const StartVisitPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [protocol, setProtocol] = useState<CarReceptionProtocol | null>(null);
    const [availableServices, setAvailableServices] = useState<any[]>([]);

    // Stan do obsługi modalu po zapisie
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [savedProtocol, setSavedProtocol] = useState<CarReceptionProtocol | null>(null);

    // Sprawdzanie, czy strona została wywołana dla anulowanego protokołu w celu przywrócenia
    const isRestoringCancelled = location.search.includes('restoreFromCancelled=true');

    // Pobieranie protokołu
    useEffect(() => {
        const fetchProtocol = async () => {
            if (!id) {
                setError('Brak identyfikatora protokołu');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const fetchedProtocol = await protocolsApi.getProtocolDetails(id);

                if (!fetchedProtocol) {
                    setError('Nie znaleziono protokołu');
                    return;
                }

                // Sprawdzamy, czy protokół jest w statusie SCHEDULED lub CANCELLED
                if (fetchedProtocol.status !== ProtocolStatus.SCHEDULED &&
                    !(fetchedProtocol.status === ProtocolStatus.CANCELLED && isRestoringCancelled)) {

                    if (fetchedProtocol.status === ProtocolStatus.CANCELLED && !isRestoringCancelled) {
                        setError('Anulowane wizyty można przywrócić tylko przez opcję przywracania');
                    } else {
                        setError('Tylko protokoły w statusie "Zaplanowano" mogą być rozpoczęte');
                    }
                    return;
                }

                // Jeśli przywracamy anulowany protokół, aktualizujemy status na IN_PROGRESS
                if (fetchedProtocol.status === ProtocolStatus.CANCELLED && isRestoringCancelled) {
                    // Aktualizacja statusu na IN_PROGRESS
                    const updatedProtocol = {
                        ...fetchedProtocol,
                        status: ProtocolStatus.IN_PROGRESS,
                        statusUpdatedAt: new Date().toISOString()
                    };
                    setProtocol(updatedProtocol);
                } else {
                    setProtocol(fetchedProtocol);
                }

                setError(null);

                // Pobierz dostępne usługi
                try {
                    const services = await servicesApi.fetchServices();
                    setAvailableServices(services);
                } catch (err) {
                    console.error('Błąd podczas pobierania listy usług', err);
                }
            } catch (err) {
                console.error('Błąd podczas pobierania protokołu:', err);
                setError('Wystąpił błąd podczas ładowania danych protokołu');
            } finally {
                setLoading(false);
            }
        };

        fetchProtocol();
    }, [id, isRestoringCancelled]);

    // Obsługa powrotu
    const handleGoBack = () => {
        navigate(`/visits/${id}`);
    };

    // Obsługa zapisania formularza
    const handleSaveProtocol = (savedProtocol: CarReceptionProtocol) => {
        setSavedProtocol(savedProtocol);
        setShowConfirmationModal(true);
    };

    // Obsługa zamknięcia modalu potwierdzenia
    const handleConfirmationClose = () => {
        setShowConfirmationModal(false);
        if (savedProtocol) {
            navigate(`/visits/${savedProtocol.id}`);
        }
    };

    // Obsługa potwierdzenia z modala
    const handleConfirmationConfirm = (options: { print: boolean; sendEmail: boolean }) => {
        // Printing and email sending are handled by the ProtocolConfirmationModal component
        // We just need to handle the navigation after the confirmation
        setShowConfirmationModal(false);
        if (savedProtocol) {
            navigate(`/visits/${savedProtocol.id}`);
        }
    };

    if (loading) {
        return <LoadingMessage>Ładowanie danych...</LoadingMessage>;
    }

    if (error || !protocol) {
        return (
            <PageContainer>
                <PageHeader>
                    <HeaderLeft>
                        <BackButton onClick={handleGoBack}>
                            <FaArrowLeft />
                        </BackButton>
                        <h1>Błąd</h1>
                    </HeaderLeft>
                </PageHeader>
                <ErrorMessage>{error || 'Nie znaleziono protokołu'}</ErrorMessage>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderLeft>
                    <BackButton onClick={handleGoBack}>
                        <FaArrowLeft />
                    </BackButton>
                    <h1>{isRestoringCancelled ? 'Przywracanie anulowanej wizyty' : 'Rozpocznij wizytę'}</h1>
                </HeaderLeft>
            </PageHeader>

            <StartVisitForm
                protocol={protocol}
                availableServices={availableServices}
                onSave={handleSaveProtocol}
                onCancel={handleGoBack}
                isRestoringCancelled={isRestoringCancelled}
            />

            {/* Modal potwierdzenia protokołu */}
            {showConfirmationModal && savedProtocol && (
                <ProtocolConfirmationModal
                    isOpen={showConfirmationModal}
                    onClose={handleConfirmationClose}
                    protocolId={savedProtocol.id}
                    clientEmail={savedProtocol.email || ''}
                    onConfirm={handleConfirmationConfirm}
                />
            )}
        </PageContainer>
    );
};

export default StartVisitPage;