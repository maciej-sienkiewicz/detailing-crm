// src/components/recurringEvents/ConvertToVisitDialog.tsx
/**
 * Convert to Visit Dialog Component
 * Handles conversion of event occurrences to full visits
 */

import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    FaUser,
    FaCar,
    FaTools,
    FaSave,
    FaTimes,
    FaPlus,
    FaTrash,
    FaInfoCircle
} from 'react-icons/fa';
import {
    EventOccurrenceResponse,
    ConvertToVisitRequest,
    VisitTemplateResponse
} from '../../types/recurringEvents';
import Modal from '../common/Modal';
import { theme } from '../../styles/theme';

interface ConvertToVisitDialogProps {
    open: boolean;
    occurrence: EventOccurrenceResponse;
    visitTemplate?: VisitTemplateResponse;
    onClose: () => void;
    onConfirm: (data: ConvertToVisitRequest) => Promise<void>;
}

interface ConvertFormData {
    clientId: number;
    vehicleId: number;
    additionalServices: Array<{
        name: string;
        basePrice: number;
    }>;
    notes: string;
}

// Validation schema
const validationSchema = yup.object({
    clientId: yup
        .number()
        .required('Wybór klienta jest wymagany')
        .min(1, 'Wybierz prawidłowego klienta'),
    vehicleId: yup
        .number()
        .required('Wybór pojazdu jest wymagany')
        .min(1, 'Wybierz prawidłowy pojazd'),
    additionalServices: yup
        .array()
        .of(yup.object({
            name: yup.string().required('Nazwa usługi jest wymagana'),
            basePrice: yup.number().min(0, 'Cena musi być większa lub równa 0').required('Cena jest wymagana')
        })),
    notes: yup
        .string()
        .max(500, 'Notatki mogą mieć maksymalnie 500 znaków')
});

const ConvertToVisitDialog: React.FC<ConvertToVisitDialogProps> = ({
                                                                       open,
                                                                       occurrence,
                                                                       visitTemplate,
                                                                       onClose,
                                                                       onConfirm
                                                                   }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form setup
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
        reset
    } = useForm<ConvertFormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            clientId: visitTemplate?.clientId || 0,
            vehicleId: visitTemplate?.vehicleId || 0,
            additionalServices: [],
            notes: visitTemplate?.notes || ''
        },
        mode: 'onChange'
    });

    // Watch additional services for calculations
    const watchedServices = watch('additionalServices');

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            reset({
                clientId: visitTemplate?.clientId || 0,
                vehicleId: visitTemplate?.vehicleId || 0,
                additionalServices: [],
                notes: visitTemplate?.notes || ''
            });
        }
    }, [open, visitTemplate, reset]);

    // Add additional service
    const addAdditionalService = useCallback(() => {
        const currentServices = watchedServices || [];
        setValue('additionalServices', [
            ...currentServices,
            { name: '', basePrice: 0 }
        ]);
    }, [watchedServices, setValue]);

    // Remove additional service
    const removeAdditionalService = useCallback((index: number) => {
        const currentServices = watchedServices || [];
        const newServices = currentServices.filter((_, i) => i !== index);
        setValue('additionalServices', newServices);
    }, [watchedServices, setValue]);

    // Calculate total estimated cost
    const calculateTotalCost = useCallback(() => {
        let total = 0;

        // Add default services from template
        if (visitTemplate?.defaultServices) {
            total += visitTemplate.defaultServices.reduce((sum, service) => sum + service.basePrice, 0);
        }

        // Add additional services
        if (watchedServices) {
            total += watchedServices.reduce((sum, service) => sum + (service.basePrice || 0), 0);
        }

        return total;
    }, [visitTemplate, watchedServices]);

    // Handle form submission
    const onSubmit = useCallback(async (data: ConvertFormData) => {
        setIsSubmitting(true);
        try {
            await onConfirm({
                clientId: data.clientId,
                vehicleId: data.vehicleId,
                additionalServices: data.additionalServices,
                notes: data.notes || undefined
            });
        } catch (error) {
            console.error('Error converting to visit:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [onConfirm]);

    // Handle dialog close
    const handleClose = useCallback(() => {
        if (!isSubmitting) {
            onClose();
        }
    }, [isSubmitting, onClose]);

    return (
        <Modal
            isOpen={open}
            onClose={handleClose}
            title=""
            size="lg"
        >
            <DialogContainer>
                <DialogHeader>
                    <HeaderIcon>
                        <FaTools />
                    </HeaderIcon>
                    <HeaderContent>
                        <HeaderTitle>Konwertuj na wizytę</HeaderTitle>
                        <HeaderSubtitle>
                            Przekształć wystąpienie "{occurrence.recurringEvent?.title}" na pełnoprawną wizytę
                        </HeaderSubtitle>
                    </HeaderContent>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        {/* Template Info */}
                        {visitTemplate && (
                            <TemplateInfo>
                                <InfoHeader>
                                    <FaInfoCircle />
                                    <span>Szablon wizyty</span>
                                </InfoHeader>
                                <InfoGrid>
                                    {visitTemplate.clientName && (
                                        <InfoItem>
                                            <InfoLabel>Sugerowany klient:</InfoLabel>
                                            <InfoValue>{visitTemplate.clientName}</InfoValue>
                                        </InfoItem>
                                    )}
                                    {visitTemplate.vehicleName && (
                                        <InfoItem>
                                            <InfoLabel>Sugerowany pojazd:</InfoLabel>
                                            <InfoValue>{visitTemplate.vehicleName}</InfoValue>
                                        </InfoItem>
                                    )}
                                    <InfoItem>
                                        <InfoLabel>Szacowany czas:</InfoLabel>
                                        <InfoValue>{visitTemplate.estimatedDurationMinutes} minut</InfoValue>
                                    </InfoItem>
                                    {visitTemplate.defaultServices.length > 0 && (
                                        <InfoItem>
                                            <InfoLabel>Domyślne usługi:</InfoLabel>
                                            <ServicesList>
                                                {visitTemplate.defaultServices.map((service, index) => (
                                                    <ServiceItem key={index}>
                                                        <ServiceName>{service.name}</ServiceName>
                                                        <ServicePrice>{service.basePrice.toFixed(2)} zł</ServicePrice>
                                                    </ServiceItem>
                                                ))}
                                            </ServicesList>
                                        </InfoItem>
                                    )}
                                </InfoGrid>
                            </TemplateInfo>
                        )}

                        {/* Client Selection */}
                        <FormSection>
                            <SectionTitle>
                                <FaUser />
                                Klient
                            </SectionTitle>
                            <Controller
                                name="clientId"
                                control={control}
                                render={({ field }) => (
                                    <ClientSelect
                                        {...field}
                                        $hasError={!!errors.clientId}
                                        disabled={isSubmitting}
                                    >
                                        <option value={0}>Wybierz klienta</option>
                                        {/* Here you would populate with actual clients */}
                                        {visitTemplate?.clientId && (
                                            <option value={visitTemplate.clientId}>
                                                {visitTemplate.clientName || `Klient ID: ${visitTemplate.clientId}`}
                                            </option>
                                        )}
                                    </ClientSelect>
                                )}
                            />
                            {errors.clientId && (
                                <ErrorMessage>{errors.clientId.message}</ErrorMessage>
                            )}
                        </FormSection>

                        {/* Vehicle Selection */}
                        <FormSection>
                            <SectionTitle>
                                <FaCar />
                                Pojazd
                            </SectionTitle>
                            <Controller
                                name="vehicleId"
                                control={control}
                                render={({ field }) => (
                                    <VehicleSelect
                                        {...field}
                                        $hasError={!!errors.vehicleId}
                                        disabled={isSubmitting}
                                    >
                                        <option value={0}>Wybierz pojazd</option>
                                        {/* Here you would populate with actual vehicles */}
                                        {visitTemplate?.vehicleId && (
                                            <option value={visitTemplate.vehicleId}>
                                                {visitTemplate.vehicleName || `Pojazd ID: ${visitTemplate.vehicleId}`}
                                            </option>
                                        )}
                                    </VehicleSelect>
                                )}
                            />
                            {errors.vehicleId && (
                                <ErrorMessage>{errors.vehicleId.message}</ErrorMessage>
                            )}
                        </FormSection>

                        {/* Additional Services */}
                        <FormSection>
                            <SectionTitle>
                                <FaTools />
                                Dodatkowe usługi
                            </SectionTitle>
                            <Controller
                                name="additionalServices"
                                control={control}
                                render={({ field }) => (
                                    <AdditionalServicesContainer>
                                        {field.value?.map((service, index) => (
                                            <ServiceRow key={index}>
                                                <ServiceNameInput
                                                    value={service.name}
                                                    onChange={(e) => {
                                                        const newServices = [...field.value];
                                                        newServices[index].name = e.target.value;
                                                        field.onChange(newServices);
                                                    }}
                                                    placeholder="Nazwa usługi"
                                                    disabled={isSubmitting}
                                                />
                                                <ServicePriceInput
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={service.basePrice}
                                                    onChange={(e) => {
                                                        const newServices = [...field.value];
                                                        newServices[index].basePrice = parseFloat(e.target.value) || 0;
                                                        field.onChange(newServices);
                                                    }}
                                                    placeholder="0.00"
                                                    disabled={isSubmitting}
                                                />
                                                <PriceLabel>zł</PriceLabel>
                                                <RemoveServiceButton
                                                    type="button"
                                                    onClick={() => removeAdditionalService(index)}
                                                    disabled={isSubmitting}
                                                >
                                                    <FaTrash />
                                                </RemoveServiceButton>
                                            </ServiceRow>
                                        ))}
                                        <AddServiceButton
                                            type="button"
                                            onClick={addAdditionalService}
                                            disabled={isSubmitting}
                                        >
                                            <FaPlus />
                                            Dodaj usługę
                                        </AddServiceButton>
                                    </AdditionalServicesContainer>
                                )}
                            />
                        </FormSection>

                        {/* Notes */}
                        <FormSection>
                            <SectionTitle>Notatki do wizyty</SectionTitle>
                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <NotesTextArea
                                        {...field}
                                        placeholder="Dodatkowe informacje do wizyty..."
                                        rows={3}
                                        $hasError={!!errors.notes}
                                        disabled={isSubmitting}
                                    />
                                )}
                            />
                            {errors.notes && (
                                <ErrorMessage>{errors.notes.message}</ErrorMessage>
                            )}
                        </FormSection>

                        {/* Cost Summary */}
                        <CostSummary>
                            <SummaryTitle>Podsumowanie kosztów</SummaryTitle>
                            <SummaryRow>
                                <SummaryLabel>Szacowana wartość łączna:</SummaryLabel>
                                <SummaryValue>{calculateTotalCost().toFixed(2)} zł</SummaryValue>
                            </SummaryRow>
                            <SummaryNote>
                                * Ostateczne ceny mogą zostać dostosowane podczas wizyty
                            </SummaryNote>
                        </CostSummary>
                    </DialogContent>

                    <DialogActions>
                        <SecondaryButton
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            <FaTimes />
                            Anuluj
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!isValid || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner />
                                    Konwertowanie...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Utwórz wizytę
                                </>
                            )}
                        </PrimaryButton>
                    </DialogActions>
                </form>
            </DialogContainer>
        </Modal>
    );
};

// Styled Components
const DialogContainer = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 800px;
    width: 100%;
`;

const DialogHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xxl} ${theme.spacing.xxl} ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.border};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: ${theme.primary}15;
    color: ${theme.primary};
    border-radius: ${theme.radius.lg};
    font-size: 24px;
`;

const HeaderContent = styled.div`
    flex: 1;
`;

const HeaderTitle = styled.h2`
    font-size: 22px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xs} 0;
`;

const HeaderSubtitle = styled.p`
    font-size: 15px;
    color: ${theme.text.secondary};
    margin: 0;
    line-height: 1.4;
`;

const DialogContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    max-height: 60vh;
    overflow-y: auto;
`;

const TemplateInfo = styled.div`
    background: ${theme.surfaceElevated};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.lg};
`;

const InfoHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.md};

    svg {
        color: ${theme.primary};
    }
`;

const InfoGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const InfoLabel = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: ${theme.text.secondary};
`;

const InfoValue = styled.span`
    font-size: 14px;
    color: ${theme.text.primary};
    font-weight: 500;
`;

const ServicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    margin-top: ${theme.spacing.xs};
`;

const ServiceItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.sm};
    background: ${theme.surface};
    border-radius: ${theme.radius.sm};
`;

const ServiceName = styled.span`
    font-size: 13px;
    color: ${theme.text.primary};
`;

const ServicePrice = styled.span`
    font-size: 13px;
    font-weight: 600;
    color: ${theme.primary};
`;

const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const SectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;

    svg {
        color: ${theme.primary};
        font-size: 14px;
    }
`;

const ClientSelect = styled.select<{ $hasError: boolean }>`
    padding: ${theme.spacing.md};
    border: 1px solid ${props => props.$hasError ? theme.error : theme.border};
    border-radius: ${theme.radius.md};
    font-size: 15px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? theme.error : theme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? theme.error : theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const VehicleSelect = styled(ClientSelect)``;

const AdditionalServicesContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
`;

const ServiceRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const ServiceNameInput = styled.input`
    flex: 1;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 2px ${theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ServicePriceInput = styled.input`
    width: 100px;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    text-align: right;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 2px ${theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const PriceLabel = styled.span`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const RemoveServiceButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${theme.errorBg};
    color: ${theme.error};
    border: 1px solid ${theme.error}30;
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.error};
        color: white;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const AddServiceButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
    background: ${theme.surface};
    color: ${theme.primary};
    border: 2px dashed ${theme.primary};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.primary}08;
        border-style: solid;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const NotesTextArea = styled.textarea<{ $hasError: boolean }>`
    padding: ${theme.spacing.md};
    border: 1px solid ${props => props.$hasError ? theme.error : theme.border};
    border-radius: ${theme.radius.md};
    font-size: 15px;
    font-family: inherit;
    background: ${theme.surface};
    color: ${theme.text.primary};
    resize: vertical;
    min-height: 80px;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? theme.error : theme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? theme.error : theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &::placeholder {
        color: ${theme.text.tertiary};
    }
`;

const CostSummary = styled.div`
    padding: ${theme.spacing.lg};
    background: ${theme.primary}08;
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.md};
`;

const SummaryTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.md} 0;
`;

const SummaryRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing.sm};
`;

const SummaryLabel = styled.span`
    font-size: 15px;
    font-weight: 500;
    color: ${theme.text.primary};
`;

const SummaryValue = styled.span`
    font-size: 18px;
    font-weight: 700;
    color: ${theme.primary};
`;

const SummaryNote = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    font-style: italic;
    margin-top: ${theme.spacing.sm};
`;

const ErrorMessage = styled.div`
    font-size: 13px;
    color: ${theme.error};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    margin-top: ${theme.spacing.xs};

    &::before {
        content: '⚠';
        font-size: 12px;
    }
`;

const DialogActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
    border-top: 1px solid ${theme.border};
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
        color: ${theme.text.primary};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.primary};
    color: white;
    border: 1px solid ${theme.primary};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export default ConvertToVisitDialog;