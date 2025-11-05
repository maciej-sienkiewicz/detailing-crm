// src/features/reservations/components/ReservationForm.tsx
/**
 * Main reservation form component
 * Simplified form for creating reservations without client/vehicle profiles
 */

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ReservationFormProps } from '../libs/types';
import { useReservationForm } from '../hooks/useReservationForm';
import { useReservationSubmit } from '../hooks/useReservationSubmit';
import { ReservationFormHeader } from './ReservationFormHeader';
import VisitTitleSection from '../../../pages/Protocols/form/components/VisitTitleSection';
import { ReservationContactSection } from './ReservationContactSection';
import { ReservationVehicleSection } from './ReservationVehicleSection';
import { ReservationScheduleSection } from './ReservationScheduleSection';
import { ReservationServicesSection } from './ReservationServicesSection';
import { ReservationNotesSection } from './ReservationNotesSection';
import { ReservationFormActions } from './ReservationFormActions';

const brandTheme = {
    surface: '#ffffff',
    surfaceHover: '#f8fafc',
    border: '#e2e8f0',
    status: {
        error: '#dc2626',
        errorLight: '#fee2e2'
    },
    spacing: {
        xl: '32px'
    },
    radius: {
        xl: '16px'
    },
    shadow: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }
};

export const ReservationForm: React.FC<ReservationFormProps> = ({
                                                                    onSuccess,
                                                                    onCancel,
                                                                    initialStartDate,
                                                                    initialEndDate
                                                                }) => {
    const navigate = useNavigate();

    const {
        formData,
        errors,
        validateForm,
        handleFieldChange,
        handleAllDayToggle,
        handleDateChange,
        isAllDay,
        resetForm
    } = useReservationForm({ initialStartDate, initialEndDate });

    const { submitReservation, loading, error } = useReservationSubmit({
        onSuccess: (reservationId) => {
            console.log('✅ Reservation created successfully:', reservationId);

            if (onSuccess) {
                onSuccess(reservationId);
            } else {
                // Default behavior - navigate to reservations list or details
                navigate(`/reservations/${reservationId}`);
            }

            resetForm();
        },
        onError: (errorMessage) => {
            console.error('❌ Error creating reservation:', errorMessage);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('📝 Validating reservation form...');

        if (!validateForm()) {
            console.warn('⚠️ Form validation failed:', errors);
            return;
        }

        console.log('✅ Form validation passed, submitting...');
        await submitReservation(formData);
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate(-1);
        }
    };

    return (
        <FormContainer>
            <ReservationFormHeader />

            {error && (
                <ErrorMessage>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorText>{error}</ErrorText>
                </ErrorMessage>
            )}

            <Form onSubmit={handleSubmit}>
                {/* Title and Color Selection */}
                <VisitTitleSection
                    title={formData.title}
                    selectedColorId={formData.calendarColorId}
                    onChange={handleFieldChange}
                    error={errors.title}
                />

                {/* Contact Information */}
                <ReservationContactSection
                    contactPhone={formData.contactPhone}
                    contactName={formData.contactName}
                    errors={errors}
                    onChange={handleFieldChange}
                />

                {/* Vehicle Information */}
                <ReservationVehicleSection
                    vehicleMake={formData.vehicleMake}
                    vehicleModel={formData.vehicleModel}
                    errors={errors}
                    onChange={handleFieldChange}
                />

                {/* Schedule */}
                <ReservationScheduleSection
                    startDate={formData.startDate}
                    endDate={formData.endDate}
                    isAllDay={isAllDay}
                    errors={errors}
                    onStartDateChange={(value) => handleDateChange('startDate', value)}
                    onEndDateChange={(value) => handleDateChange('endDate', value)}
                    onAllDayToggle={handleAllDayToggle}
                />

                {/* Services (Optional) */}
                <ReservationServicesSection
                    services={formData.selectedServices}
                />

                {/* Notes */}
                <ReservationNotesSection
                    notes={formData.notes || ''}
                    onChange={handleFieldChange}
                />

                {/* Form Actions */}
                <ReservationFormActions
                    onCancel={handleCancel}
                    loading={loading}
                />
            </Form>
        </FormContainer>
    );
};

// Styled Components
const FormContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 768px) {
        border-radius: 12px;
    }
`;

const Form = styled.form`
    padding: ${brandTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};

    @media (max-width: 576px) {
        padding: 24px;
        gap: 24px;
    }
`;

const ErrorMessage = styled.div`
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    padding: 16px 32px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    border-bottom: 1px solid ${brandTheme.border};
`;

const ErrorIcon = styled.span`
    font-size: 18px;
`;

const ErrorText = styled.span`
    font-size: 14px;
`;

export default ReservationForm;