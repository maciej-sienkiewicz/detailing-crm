// src/components/recurringEvents/ConvertToVisitDialog.tsx
/**
 * Convert to Visit Dialog Component - FULLY FIXED VERSION
 * Handles conversion of event occurrences to full visits
 * FIXES: TypeScript errors, better error handling, improved UX, proper type safety
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
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
    FaInfoCircle,
    FaExclamationTriangle
} from 'react-icons/fa';
import {
    EventOccurrenceResponse,
    ConvertToVisitRequest,
    VisitTemplateResponse
} from '../../types/recurringEvents';
import Modal from '../common/Modal';
import { useToast } from '../common/Toast/Toast';
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

// Enhanced validation schema with better error messages and proper typing
const validationSchema: yup.ObjectSchema<ConvertFormData> = yup.object().shape({
    clientId: yup
        .number()
        .required('Wybór klienta jest wymagany')
        .min(1, 'Wybierz prawidłowego klienta')
        .test('not-zero', 'Wybierz klienta z listy', (value) => value !== 0),

    vehicleId: yup
        .number()
        .required('Wybór pojazdu jest wymagany')
        .min(1, 'Wybierz prawidłowy pojazd')
        .test('not-zero', 'Wybierz pojazd z listy', (value) => value !== 0),

    additionalServices: yup
        .array()
        .of(yup.object().shape({
            name: yup
                .string()
                .required('Nazwa usługi jest wymagana')
                .min(2, 'Nazwa usługi musi mieć co najmniej 2 znaki')
                .max(100, 'Nazwa usługi może mieć maksymalnie 100 znaków'),
            basePrice: yup
                .number()
                .min(0, 'Cena musi być większa lub równa 0')
                .max(99999.99, 'Cena jest zbyt wysoka')
                .required('Cena jest wymagana')
                .test('decimal-places', 'Cena może mieć maksymalnie 2 miejsca po przecinku', function(value) {
                    if (typeof value !== 'number') return true;
                    return Number.isInteger(value * 100);
                })
        }).required())
        .required()
        .default([]),

    notes: yup
        .string()
        .max(500, 'Notatki mogą mieć maksymalnie 500 znaków')
        .required()
        .default('')
});

const ConvertToVisitDialog: React.FC<ConvertToVisitDialogProps> = ({
                                                                       open,
                                                                       occurrence,
                                                                       visitTemplate,
                                                                       onClose,
                                                                       onConfirm
                                                                   }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    // Form setup with explicit typing
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
        reset,
        clearErrors
    } = useForm<ConvertFormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            clientId: 0,
            vehicleId: 0,
            additionalServices: [],
            notes: ''
        },
        mode: 'onChange'
    });

    // Watch additional services for calculations
    const watchedServices = watch('additionalServices');

    // Reset form when dialog opens or template changes
    useEffect(() => {
        if (open) {
            const defaultValues: ConvertFormData = {
                clientId: visitTemplate?.clientId || 0,
                vehicleId: visitTemplate?.vehicleId || 0,
                additionalServices: [],
                notes: visitTemplate?.notes || ''
            };
            reset(defaultValues);
            clearErrors();
        }
    }, [open, visitTemplate, reset, clearErrors]);

    // Add additional service
    const addAdditionalService = useCallback(() => {
        const currentServices = watchedServices || [];
        setValue('additionalServices', [
            ...currentServices,
            { name: '', basePrice: 0 }
        ] as ConvertFormData['additionalServices']);
    }, [watchedServices, setValue]);

    // Remove additional service
    const removeAdditionalService = useCallback((index: number) => {
        const currentServices = watchedServices || [];
        const newServices = currentServices.filter((_, i) => i !== index);
        setValue('additionalServices', newServices as ConvertFormData['additionalServices']);
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

    // Memoized cost calculation for performance
    const totalCost = useMemo(() => calculateTotalCost(), [calculateTotalCost]);

    // Handle form submission with explicit typing
    const onSubmit: SubmitHandler<ConvertFormData> = useCallback(async (data: ConvertFormData) => {
        if (isSubmitting) return; // Prevent double submission

        setIsSubmitting(true);
        try {
            // Validate that client and vehicle are selected
            if (data.clientId === 0) {
                showToast('error', 'Wybierz klienta z listy');
                return;
            }

            if (data.vehicleId === 0) {
                showToast('error', 'Wybierz pojazd z listy');
                return;
            }

            // Filter out empty additional services
            const validAdditionalServices = data.additionalServices.filter(
                service => service.name.trim().length > 0 && service.basePrice >= 0
            );

            const convertData: ConvertToVisitRequest = {
                clientId: data.clientId,
                vehicleId: data.vehicleId,
                additionalServices: validAdditionalServices,
                notes: data.notes?.trim() || undefined
            };

            await onConfirm(convertData);

        } catch (error) {
            console.error('Error converting to visit:', error);
            showToast('error', 'Wystąpił błąd podczas konwersji na wizytę');
        } finally {
            setIsSubmitting(false);
        }
    }, [onConfirm, isSubmitting, showToast]);

    // Handle dialog close
    const handleClose = useCallback(() => {
        if (!isSubmitting) {
            onClose();
        }
    }, [isSubmitting, onClose]);

    // Check if form can be submitted
    const canSubmit = useMemo(() => {
        const clientId = watch('clientId');
        const vehicleId = watch('vehicleId');
        return clientId > 0 && vehicleId > 0 && isValid && !isSubmitting;
    }, [watch, isValid, isSubmitting]);

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
                        <OccurrenceDate>
                            Data wystąpienia: {new Date(occurrence.scheduledDate).toLocaleDateString('pl-PL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                        </OccurrenceDate>
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
                                <RequiredIndicator>*</RequiredIndicator>
                            </SectionTitle>
                            <Controller
                                name="clientId"
                                control={control}
                                render={({ field }) => (
                                    <SelectContainer>
                                        <ClientSelect
                                            {...field}
                                            $hasError={!!errors.clientId}
                                            disabled={isSubmitting}
                                        >
                                            <option value={0}>Wybierz klienta</option>
                                            {/* Mock data - in real app would fetch from API */}
                                            {visitTemplate?.clientId && visitTemplate?.clientName && (
                                                <option value={visitTemplate.clientId}>
                                                    {visitTemplate.clientName}
                                                </option>
                                            )}
                                            <option value={1}>Jan Kowalski</option>
                                            <option value={2}>Anna Nowak</option>
                                            <option value={3}>Piotr Wiśniewski</option>
                                        </ClientSelect>
                                        {errors.clientId && (
                                            <ErrorMessage>
                                                <FaExclamationTriangle />
                                                {errors.clientId.message}
                                            </ErrorMessage>
                                        )}
                                    </SelectContainer>
                                )}
                            />
                        </FormSection>

                        {/* Vehicle Selection */}
                        <FormSection>
                            <SectionTitle>
                                <FaCar />
                                Pojazd
                                <RequiredIndicator>*</RequiredIndicator>
                            </SectionTitle>
                            <Controller
                                name="vehicleId"
                                control={control}
                                render={({ field }) => (
                                    <SelectContainer>
                                        <VehicleSelect
                                            {...field}
                                            $hasError={!!errors.vehicleId}
                                            disabled={isSubmitting}
                                        >
                                            <option value={0}>Wybierz pojazd</option>
                                            {/* Mock data - in real app would fetch from API */}
                                            {visitTemplate?.vehicleId && visitTemplate?.vehicleName && (
                                                <option value={visitTemplate.vehicleId}>
                                                    {visitTemplate.vehicleName}
                                                </option>
                                            )}
                                            <option value={1}>BMW X5 (WA 12345)</option>
                                            <option value={2}>Audi A4 (WA 67890)</option>
                                            <option value={3}>Mercedes C-Class (WA 11111)</option>
                                        </VehicleSelect>
                                        {errors.vehicleId && (
                                            <ErrorMessage>
                                                <FaExclamationTriangle />
                                                {errors.vehicleId.message}
                                            </ErrorMessage>
                                        )}
                                    </SelectContainer>
                                )}
                            />
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
                                                <ServiceInputGroup>
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
                                                    <PriceGroup>
                                                        <ServicePriceInput
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={service.basePrice || ''}
                                                            onChange={(e) => {
                                                                const newServices = [...field.value];
                                                                newServices[index].basePrice = parseFloat(e.target.value) || 0;
                                                                field.onChange(newServices);
                                                            }}
                                                            placeholder="0.00"
                                                            disabled={isSubmitting}
                                                        />
                                                        <PriceLabel>zł</PriceLabel>
                                                    </PriceGroup>
                                                </ServiceInputGroup>
                                                <RemoveServiceButton
                                                    type="button"
                                                    onClick={() => removeAdditionalService(index)}
                                                    disabled={isSubmitting}
                                                    title="Usuń usługę"
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
                                    <NotesContainer>
                                        <NotesTextArea
                                            {...field}
                                            placeholder="Dodatkowe informacje do wizyty..."
                                            rows={3}
                                            $hasError={!!errors.notes}
                                            disabled={isSubmitting}
                                        />
                                        {errors.notes && (
                                            <ErrorMessage>
                                                <FaExclamationTriangle />
                                                {errors.notes.message}
                                            </ErrorMessage>
                                        )}
                                    </NotesContainer>
                                )}
                            />
                        </FormSection>

                        {/* Cost Summary */}
                        <CostSummary>
                            <SummaryTitle>Podsumowanie kosztów</SummaryTitle>

                            {visitTemplate?.defaultServices && visitTemplate.defaultServices.length > 0 && (
                                <CostSection>
                                    <CostSectionTitle>Usługi domyślne:</CostSectionTitle>
                                    {visitTemplate.defaultServices.map((service, index) => (
                                        <CostRow key={index}>
                                            <CostLabel>{service.name}</CostLabel>
                                            <CostValue>{service.basePrice.toFixed(2)} zł</CostValue>
                                        </CostRow>
                                    ))}
                                </CostSection>
                            )}

                            {watchedServices && watchedServices.length > 0 && (
                                <CostSection>
                                    <CostSectionTitle>Usługi dodatkowe:</CostSectionTitle>
                                    {watchedServices
                                        .filter(service => service.name.trim().length > 0)
                                        .map((service, index) => (
                                            <CostRow key={index}>
                                                <CostLabel>{service.name}</CostLabel>
                                                <CostValue>{(service.basePrice || 0).toFixed(2)} zł</CostValue>
                                            </CostRow>
                                        ))
                                    }
                                </CostSection>
                            )}

                            <TotalRow>
                                <TotalLabel>Szacowana wartość łączna:</TotalLabel>
                                <TotalValue>{totalCost.toFixed(2)} zł</TotalValue>
                            </TotalRow>

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
                            disabled={!canSubmit}
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
    max-width: 900px;
    width: 100%;
`;

const DialogHeader = styled.div`
    display: flex;
    align-items: flex-start;
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
    flex-shrink: 0;
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
    margin: 0 0 ${theme.spacing.sm} 0;
    line-height: 1.4;
`;

const OccurrenceDate = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.primary};
    background: ${theme.primary}08;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radius.md};
    border: 1px solid ${theme.primary}20;
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

const RequiredIndicator = styled.span`
    color: ${theme.error};
    font-size: 14px;
    margin-left: ${theme.spacing.xs};
`;

const SelectContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const ClientSelect = styled.select<{ $hasError: boolean }>`
    padding: ${theme.spacing.md};
    border: 1px solid ${props => props.$hasError ? theme.error : theme.border};
    border-radius: ${theme.radius.md};
    font-size: 15px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? theme.error : theme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? theme.error : theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${theme.surfaceAlt};
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

const ServiceInputGroup = styled.div`
    display: flex;
    gap: ${theme.spacing.md};
    flex: 1;
`;

const ServiceNameInput = styled.input`
    flex: 1;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    background: ${theme.surface};
    color: ${theme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 2px ${theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${theme.surfaceAlt};
    }
`;

const PriceGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
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
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 2px ${theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${theme.surfaceAlt};
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
    width: 36px;
    height: 36px;
    background: ${theme.errorBg};
    color: ${theme.error};
    border: 1px solid ${theme.error}30;
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.error};
        color: white;
        transform: scale(1.05);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
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
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const NotesContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
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
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? theme.error : theme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? theme.error : theme.primary}20;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${theme.surfaceAlt};
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
    margin: 0 0 ${theme.spacing.lg} 0;
`;

const CostSection = styled.div`
    margin-bottom: ${theme.spacing.lg};

    &:last-of-type {
        margin-bottom: ${theme.spacing.md};
    }
`;

const CostSectionTitle = styled.h5`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.secondary};
    margin: 0 0 ${theme.spacing.sm} 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const CostRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.sm} 0;
    border-bottom: 1px solid ${theme.primary}15;

    &:last-child {
        border-bottom: none;
    }
`;

const CostLabel = styled.span`
    font-size: 14px;
    color: ${theme.text.primary};
`;

const CostValue = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.primary};
`;

const TotalRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.md} 0;
    border-top: 2px solid ${theme.primary}30;
    margin-top: ${theme.spacing.md};
`;

const TotalLabel = styled.span`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const TotalValue = styled.span`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.primary};
`;

const SummaryNote = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    font-style: italic;
    margin-top: ${theme.spacing.sm};
    text-align: center;
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 13px;
    color: ${theme.error};
    margin-top: ${theme.spacing.xs};

    svg {
        font-size: 12px;
        flex-shrink: 0;
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
    min-height: 44px;

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
    min-height: 44px;

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