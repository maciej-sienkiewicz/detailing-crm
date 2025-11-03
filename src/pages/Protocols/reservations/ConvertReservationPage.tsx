// src/pages/Protocols/reservations/ConvertReservationPage.tsx
/**
 * Page for converting a reservation to a full visit
 * Pre-fills form with reservation data and collects remaining information
 */

import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { reservationsApi, Reservation, ConvertToVisitRequest } from '../../../api/reservationsApi';
import { servicesApi } from '../../../api/servicesApi';
import { PageContainer } from '../styles';
import { PageHeader } from '../../../components/common/PageHeader';
import { EditProtocolForm } from '../form/components/EditProtocolForm';
import { useToast } from '../../../components/common/Toast/Toast';
import { BiTransferAlt } from 'react-icons/bi';
import { CarReceptionProtocol, ProtocolStatus } from '../../../types';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const ConvertReservationPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                setError('Brak identyfikatora rezerwacji');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const [reservationData, servicesData] = await Promise.all([
                    reservationsApi.getReservation(id),
                    servicesApi.fetchServices()
                ]);

                setReservation(reservationData);
                setAvailableServices(servicesData);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Nie udało się załadować danych rezerwacji');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSave = async (protocol: CarReceptionProtocol, showConfirmationModal: boolean) => {
        if (!reservation) return;

        try {
            // Prepare conversion request
            const convertRequest: ConvertToVisitRequest = {
                ownerName: protocol.ownerName,
                email: protocol.email,
                companyName: protocol.companyName,
                taxId: protocol.taxId,
                address: protocol.address,
                licensePlate: protocol.licensePlate,
                productionYear: protocol.productionYear || undefined,
                vin: undefined,
                color: undefined,
                mileage: protocol.mileage || undefined,
                selectedServices: protocol.selectedServices.map(service => ({
                    id: service.id,
                    name: service.name,
                    price: {
                        inputPrice: service.basePrice.priceNetto,
                        inputType: 'netto' as const
                    },
                    quantity: service.quantity || 1,
                    vatRate: 23,
                    discountType: service.discountType,
                    discountValue: service.discountValue,
                    note: service.note
                })),
                keysProvided: protocol.keysProvided,
                documentsProvided: protocol.documentsProvided,
                additionalNotes: protocol.notes
            };

            // Convert reservation to visit
            const visitResponse = await reservationsApi.convertToVisit(reservation.id, convertRequest);

            showToast('success', 'Rezerwacja została przekształcona w wizytę', 3000);

            // Navigate to the new visit
            navigate(`/visits/${visitResponse.id}`);
        } catch (error) {
            console.error('Error converting reservation:', error);
            showToast(
                'error',
                error instanceof Error
                    ? error.message
                    : 'Nie udało się przekształcić rezerwacji',
                5000
            );
        }
    };

    const handleCancel = () => {
        navigate('/visits');
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingMessage>Ładowanie danych rezerwacji...</LoadingMessage>
            </PageContainer>
        );
    }

    if (error || !reservation) {
        return (
            <PageContainer>
                <PageHeader
                    icon={BiTransferAlt}
                    title="Błąd"
                    subtitle=""
                    actions={
                        <button
                            onClick={handleCancel}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <FaArrowLeft />
                            <span>Powrót</span>
                        </button>
                    }
                />
                <ErrorMessage>{error || 'Nie znaleziono rezerwacji'}</ErrorMessage>
            </PageContainer>
        );
    }

    // Map reservation to protocol format for the form
    const initialProtocolData: Partial<CarReceptionProtocol> = {
        title: reservation.title,
        calendarColorId: reservation.calendarColorId,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        make: reservation.vehicleMake,
        model: reservation.vehicleModel,
        phone: reservation.contactPhone,
        ownerName: reservation.contactName || '',
        notes: reservation.notes || '',
        status: ProtocolStatus.IN_PROGRESS,
        selectedServices: [],
        keysProvided: true,
        documentsProvided: false,
        // Fields to be filled by user:
        licensePlate: '',
        email: '',
        companyName: '',
        taxId: '',
        address: '',
        productionYear: null,
        mileage: 0
    };

    return (
        <PageContainer>
            <PageHeader
                icon={BiTransferAlt}
                title="Rozpocznij wizytę z rezerwacji"
                subtitle="Uzupełnij brakujące dane aby rozpocząć wizytę"
                actions={
                    <button
                        onClick={handleCancel}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#64748b',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <FaArrowLeft />
                        <span>Anuluj</span>
                    </button>
                }
            />

            <ContentWrapper>
                <InfoBanner>
                    <InfoIcon>ℹ️</InfoIcon>
                    <InfoText>
                        <strong>Dane z rezerwacji:</strong> {reservation.vehicleMake} {reservation.vehicleModel},
                        telefon: {reservation.contactPhone}
                        {reservation.contactName && `, kontakt: ${reservation.contactName}`}
                    </InfoText>
                </InfoBanner>

                <EditProtocolForm
                    protocol={null}
                    availableServices={availableServices}
                    initialData={initialProtocolData}
                    appointmentId={undefined}
                    isFullProtocol={true}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onServiceAdded={async () => {
                        const services = await servicesApi.fetchServices();
                        setAvailableServices(services);
                    }}
                />
            </ContentWrapper>
        </PageContainer>
    );
};

// Styled Components
const LoadingMessage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    font-size: 16px;
    color: ${theme.text.muted};
`;

const ErrorMessage = styled.div`
    background: ${theme.errorBg};
    color: ${theme.error};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    border-radius: ${theme.radius.lg};
    margin: ${theme.spacing.xl};
    font-weight: 500;
`;

const ContentWrapper = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
`;

const InfoBanner = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    margin-bottom: ${theme.spacing.xl};
`;

const InfoIcon = styled.div`
    font-size: 20px;
    flex-shrink: 0;
`;

const InfoText = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    line-height: 1.5;

    strong {
        color: ${theme.text.primary};
        font-weight: 600;
    }
`;

export default ConvertReservationPage;