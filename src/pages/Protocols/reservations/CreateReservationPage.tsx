// src/pages/Protocols/reservations/CreateReservationPage.tsx
/**
 * Page for creating/editing reservations
 * Handles the simplified reservation flow before full visit conversion
 */

import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { reservationsApi, CreateReservationRequest } from '../../../api/reservationsApi';
import { PageContainer } from '../styles';
import { PageHeader } from '../../../components/common/PageHeader';
import { CreateReservationForm } from '../form/components/CreateReservationForm';
import { useToast } from '../../../components/common/Toast/Toast';
import { BiCalendar } from 'react-icons/bi';

const CreateReservationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);

    // Check if we have initial data from navigation state
    const initialData = location.state?.reservationData as Partial<CreateReservationRequest> | undefined;
    const startDateFromCalendar = location.state?.startDate;
    const endDateFromCalendar = location.state?.endDate;

    // Prepare initial data with calendar dates if available
    const preparedInitialData: Partial<CreateReservationRequest> = {
        ...initialData,
        ...(startDateFromCalendar && { startDate: startDateFromCalendar }),
        ...(endDateFromCalendar && { endDate: endDateFromCalendar })
    };

    const handleSubmit = async (data: CreateReservationRequest) => {
        setLoading(true);

        try {
            const createdReservation = await reservationsApi.createReservation(data);

            showToast('success', 'Rezerwacja została pomyślnie utworzona', 3000);

            // Navigate to visits page with "Scheduled" filter
            navigate('/visits', {
                state: {
                    filterStatus: 'Zaplanowane',
                    highlightReservation: createdReservation.id
                }
            });
        } catch (error) {
            console.error('❌ Error creating reservation:', error);
            showToast(
                'error',
                error instanceof Error
                    ? error.message
                    : 'Nie udało się utworzyć rezerwacji',
                5000
            );
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/visits');
    };

    return (
        <PageContainer>
            <PageHeader
                icon={BiCalendar}
                title="Nowa rezerwacja"
                subtitle="Utwórz rezerwację wizyty z minimalnymi danymi"
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
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                    >
                        <FaArrowLeft />
                        <span>Anuluj</span>
                    </button>
                }
            />

            <div style={{
                maxWidth: '1600px',
                margin: '0 auto',
                padding: '32px 48px'
            }}>
                <CreateReservationForm
                    initialData={preparedInitialData}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                />
            </div>
        </PageContainer>
    );
};

export default CreateReservationPage;