// src/pages/Protocols/details/components/EditPricesModal.tsx
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaCalculator, FaCheck, FaMoneyBillWave, FaPencilAlt, FaTimes} from 'react-icons/fa';
import {SelectedService} from '../../../../types';
import {PriceResponse} from '../../../../types';
import {useToast} from "../../../../components/common/Toast/Toast";
import {protocolsApi} from "../../../../api/protocolsApi";
import {DiscountType} from "../../../../features/reservations/api/reservationsApi";
import {calculateLocalFinalPrice} from "../../../../features/services/hooks/useServiceCalculations";

// Professional Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    },
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

interface ServiceExtended extends SelectedService {
    isModified?: boolean;
    originalPrice?: PriceResponse;      // ✅ ZMIANA: PriceResponse zamiast number
    originalFinalPrice?: PriceResponse; // ✅ ZMIANA: PriceResponse zamiast number
}

interface EditPricesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (services: SelectedService[]) => void;
    services: SelectedService[];
    protocolId: string;
}

const EditPricesModal: React.FC<EditPricesModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             onSave,
                                                             services,
                                                             protocolId
                                                         }) => {
    const [editedServices, setEditedServices] = useState<ServiceExtended[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editPrice, setEditPrice] = useState('');
    const [editDiscountValue, setEditDiscountValue] = useState('');
    const [isSaving, setIsSaving] = useState(false); // Nowy stan dla loading

    const { showToast } = useToast();

    // Inicjalizacja stanu
    useEffect(() => {
        if (isOpen) {
            const initialServices = services.map(service => ({
                ...service,
                isModified: false,
                originalPrice: service.basePrice,      // ✅ ZMIANA: basePrice to PriceResponse
                originalFinalPrice: service.finalPrice // ✅ ZMIANA: finalPrice to PriceResponse
            }));

            setEditedServices(initialServices);
            setIsEditing(null);
        }
    }, [isOpen, services]);

    const handleStartEdit = (index: number) => {
        const service = editedServices[index];
        setIsEditing(index);
        setEditPrice(service.basePrice.priceBrutto.toString()); // ✅ ZMIANA: używamy basePrice.priceBrutto
        setEditDiscountValue(service.discountValue.toString());
    };

    const DEFAULT_VAT_RATE = 23;

    const calculateNetPrice = (grossPrice: number): number => {
        return grossPrice / (1 + DEFAULT_VAT_RATE / 100);
    };

    const calculateTaxAmount = (netPrice: number): number => {
        return netPrice * (DEFAULT_VAT_RATE / 100);
    };

    // ✅ ZAKTUALIZOWANA: Funkcja kalkulacji ceny końcowej używająca PriceResponse
    const calculateFinalPrice = (
        basePrice: PriceResponse,
        discountType: DiscountType,
        discountValue: number
    ): PriceResponse => {
        let finalPrice = calculateLocalFinalPrice(basePrice, discountType, discountValue);

        return finalPrice;
    };

    const handleSaveEdit = () => {
        if (isEditing === null) return;

        const parsedPriceBrutto = parseFloat(editPrice);
        const parsedDiscountValue = parseFloat(editDiscountValue) || 0;

        if (isNaN(parsedPriceBrutto) || parsedPriceBrutto <= 0) {
            showToast('error', 'Cena musi być większa od 0', 3000);
            return;
        }

        const updatedServices = [...editedServices];
        const originalService = updatedServices[isEditing];

        // ✅ ZMIANA: Tworzymy nową bazową cenę jako PriceResponse
        const priceNetto = calculateNetPrice(parsedPriceBrutto);
        const taxAmount = calculateTaxAmount(priceNetto);

        const newBasePrice: PriceResponse = {
            priceNetto: parseFloat(priceNetto.toFixed(2)),
            priceBrutto: parseFloat(parsedPriceBrutto.toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2))
        };

        const newFinalPrice = calculateFinalPrice(newBasePrice, originalService.discountType, parsedDiscountValue);

        const isPriceChanged = originalService.originalPrice
            ? Math.abs(parsedPriceBrutto - originalService.originalPrice.priceBrutto) > 0.01
            : false;
        const isDiscountChanged = Math.abs(parsedDiscountValue - (originalService.discountValue || 0)) > 0.01;

        updatedServices[isEditing] = {
            ...originalService,
            basePrice: newBasePrice,     // ✅ ZMIANA
            discountValue: parsedDiscountValue,
            finalPrice: newFinalPrice,   // ✅ ZMIANA
            isModified: isPriceChanged || isDiscountChanged
        };

        setEditedServices(updatedServices);
        setIsEditing(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(null);
    };

    const handleDiscountTypeChange = (index: number, newDiscountType: DiscountType) => {
        const updatedServices = [...editedServices];
        const service = updatedServices[index];

        // Reset discount value when changing type
        let newDiscountValue = 0;
        if (newDiscountType === DiscountType.FIXED_AMOUNT_OFF_BRUTTO) {
            newDiscountValue = service.basePrice.priceBrutto; // ✅ ZMIANA: używamy basePrice.priceBrutto
        }

        updatedServices[index] = {
            ...service,
            discountType: newDiscountType,
            discountValue: newDiscountValue,
            finalPrice: calculateFinalPrice(service.basePrice, newDiscountType, newDiscountValue), // ✅ ZMIANA
            isModified: true
        };

        setEditedServices(updatedServices);
    };

    const handleDiscountValueChange = (index: number, value: number) => {
        const updatedServices = [...editedServices];
        const service = updatedServices[index];

        let validatedValue = value;

        if (service.discountType === DiscountType.PERCENT && validatedValue > 100) {
            validatedValue = 100;
        }

        if (validatedValue < 0) {
            validatedValue = 0;
        }

        updatedServices[index] = {
            ...service,
            discountValue: validatedValue,
            finalPrice: calculateFinalPrice(service.basePrice, service.discountType, validatedValue), // ✅ ZMIANA
            isModified: true
        };

        setEditedServices(updatedServices);
    };

    const handleSave = async () => {
        const itemsToSave = editedServices.map(service => {
            const {
                isModified,
                originalPrice,
                originalFinalPrice,
                ...serviceData
            } = service;

            return serviceData as SelectedService;
        });

        try {
            setIsSaving(true); // Rozpocznij loading

            // Wywołaj API do aktualizacji usług
            const success = await protocolsApi.updateServices(protocolId, itemsToSave);

            if (success) {
                showToast('success', 'Ceny usług zostały zaktualizowane', 3000);
                onSave(itemsToSave); // Zaktualizuj lokalny stan
                onClose();
            } else {
                showToast('error', 'Nie udało się zaktualizować cen usług', 4000);
            }
        } catch (error) {
            console.error('Error updating services:', error);
            showToast('error', 'Wystąpił błąd podczas aktualizacji cen', 4000);
        } finally {
            setIsSaving(false); // Zakończ loading
        }
    };

    const calculateTotals = () => {
        // ✅ ZMIANA: używamy .priceBrutto z PriceResponse
        const originalTotal = editedServices.reduce(
            (sum, service) => sum + (service.originalFinalPrice?.priceBrutto || 0),
            0
        );
        const newTotal = editedServices.reduce(
            (sum, service) => sum + service.finalPrice.priceBrutto,
            0
        );
        const difference = newTotal - originalTotal;

        return {
            originalTotal,
            newTotal,
            difference
        };
    };

    const { originalTotal, newTotal, difference } = calculateTotals();

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon>
                            <FaMoneyBillWave />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Edytuj ceny usług</ModalTitle>
                            <ModalSubtitle>Dostosuj ceny i rabaty dla usług w wizycie</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose} disabled={isSaving}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <InstructionsCard>
                        <InstructionsIcon>💰</InstructionsIcon>
                        <InstructionsText>
                            <InstructionsTitle>Edycja cen i rabatów</InstructionsTitle>
                            <InstructionsDescription>
                                Możesz zmodyfikować ceny bazowe usług oraz dostosować rabaty.
                                Zmiany będą zastosowane natychmiast w protokole wizyty.
                            </InstructionsDescription>
                        </InstructionsText>
                    </InstructionsCard>

                    <SummarySection>
                        <SummaryCard>
                            <SummaryIcon>
                                <FaCalculator />
                            </SummaryIcon>
                            <SummaryDetails>
                                <SummaryRow>
                                    <SummaryLabel>Oryginalna suma:</SummaryLabel>
                                    <SummaryValue>{originalTotal.toFixed(2)} zł</SummaryValue>
                                </SummaryRow>
                                <SummaryRow>
                                    <SummaryLabel>Nowa suma:</SummaryLabel>
                                    <SummaryValue $modified={Math.abs(difference) > 0.01}>
                                        {newTotal.toFixed(2)} zł
                                    </SummaryValue>
                                </SummaryRow>
                                {Math.abs(difference) > 0.01 && (
                                    <SummaryRow>
                                        <SummaryLabel>Różnica:</SummaryLabel>
                                        <SummaryValue $difference={difference}>
                                            {difference > 0 ? '+' : ''}{difference.toFixed(2)} zł
                                        </SummaryValue>
                                    </SummaryRow>
                                )}
                            </SummaryDetails>
                        </SummaryCard>
                    </SummarySection>

                    <ServicesTableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Usługa</TableHeader>
                                    <TableHeader>Cena bazowa</TableHeader>
                                    <TableHeader>Rabat</TableHeader>
                                    <TableHeader>Cena końcowa</TableHeader>
                                    <TableHeader>Akcje</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {editedServices.map((service, index) => (
                                    <TableRow key={service.id} $modified={service.isModified}>
                                        {isEditing === index ? (
                                            <>
                                                <TableCell>
                                                    <ServiceName>
                                                        {service.name}
                                                        <EditingBadge>edycja</EditingBadge>
                                                    </ServiceName>
                                                </TableCell>
                                                <TableCell>
                                                    <EditInput
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={editPrice}
                                                        onChange={(e) => setEditPrice(e.target.value)}
                                                        placeholder="Cena bazowa"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <DiscountEditContainer>
                                                        <DiscountTypeSelect
                                                            value={service.discountType}
                                                            onChange={(e) => handleDiscountTypeChange(index, e.target.value as DiscountType)}
                                                        >
                                                            <option value={DiscountType.PERCENT}>Procent</option>
                                                            <option value={DiscountType.FIXED_AMOUNT_OFF_NETTO}>Kwota netto</option>
                                                            <option value={DiscountType.FIXED_AMOUNT_OFF_BRUTTO}>Kwota brutto</option>
                                                            <option value={DiscountType.FIXED_FINAL_NETTO}>Cena końcowa netto</option>
                                                            <option value={DiscountType.FIXED_FINAL_BRUTTO}>Cena końcowa brutto</option>
                                                        </DiscountTypeSelect>
                                                        <EditInput
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max={service.discountType === DiscountType.PERCENT ? 100 : undefined}
                                                            value={editDiscountValue}
                                                            onChange={(e) => setEditDiscountValue(e.target.value)}
                                                            placeholder="Wartość"
                                                        />
                                                    </DiscountEditContainer>
                                                </TableCell>
                                                <TableCell>
                                                    <PricePreview>
                                                        {(() => {
                                                            const priceBrutto = parseFloat(editPrice) || 0;
                                                            const priceNetto = calculateNetPrice(priceBrutto);
                                                            const taxAmount = calculateTaxAmount(priceNetto);
                                                            const tempBasePrice: PriceResponse = {
                                                                priceNetto: parseFloat(priceNetto.toFixed(2)),
                                                                priceBrutto: parseFloat(priceBrutto.toFixed(2)),
                                                                taxAmount: parseFloat(taxAmount.toFixed(2))
                                                            };
                                                            return calculateFinalPrice(
                                                                tempBasePrice,
                                                                service.discountType,
                                                                parseFloat(editDiscountValue) || 0
                                                            ).priceBrutto.toFixed(2);
                                                        })()} zł
                                                    </PricePreview>
                                                </TableCell>
                                                <TableCell>
                                                    <ActionsContainer>
                                                        <ActionButton onClick={handleSaveEdit} $variant="success">
                                                            <FaCheck />
                                                        </ActionButton>
                                                        <ActionButton onClick={handleCancelEdit} $variant="danger">
                                                            <FaTimes />
                                                        </ActionButton>
                                                    </ActionsContainer>
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell>
                                                    <ServiceInfo>
                                                        <ServiceName>
                                                            {service.name}
                                                            {service.isModified && (
                                                                <ModifiedBadge>zmodyfikowano</ModifiedBadge>
                                                            )}
                                                        </ServiceName>
                                                        {service.note && (
                                                            <ServiceNote>{service.note}</ServiceNote>
                                                        )}
                                                    </ServiceInfo>
                                                </TableCell>
                                                <TableCell>
                                                    <PriceDisplay>
                                                        <PriceValue $modified={service.isModified}>
                                                            {service.basePrice.priceBrutto.toFixed(2)} zł
                                                        </PriceValue>
                                                        {service.isModified && service.originalPrice && (
                                                            <OriginalPrice>
                                                                było: {service.originalPrice.priceBrutto.toFixed(2)} zł
                                                            </OriginalPrice>
                                                        )}
                                                    </PriceDisplay>
                                                </TableCell>
                                                <TableCell>
                                                    <DiscountDisplay>
                                                        <DiscountTypeSelect
                                                            value={service.discountType}
                                                            onChange={(e) => handleDiscountTypeChange(index, e.target.value as DiscountType)}
                                                            disabled={isEditing !== null}
                                                        >
                                                            <option value={DiscountType.PERCENT}>Procent</option>
                                                            <option value={DiscountType.FIXED_AMOUNT_OFF_NETTO}>Kwota netto</option>
                                                            <option value={DiscountType.FIXED_AMOUNT_OFF_BRUTTO}>Kwota brutto</option>
                                                            <option value={DiscountType.FIXED_FINAL_NETTO}>Cena końcowa netto</option>
                                                            <option value={DiscountType.FIXED_FINAL_BRUTTO}>Cena końcowa brutto</option>
                                                        </DiscountTypeSelect>

                                                        <DiscountValueInput
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max={service.discountType === DiscountType.PERCENT ? 100 : undefined}
                                                            value={service.discountValue}
                                                            onChange={(e) => handleDiscountValueChange(index, parseFloat(e.target.value) || 0)}
                                                            disabled={isEditing !== null}
                                                        />

                                                        {service.discountValue > 0 && service.discountType === DiscountType.PERCENT && (
                                                            <DiscountAmount>
                                                                (-{(service.basePrice.priceBrutto * service.discountValue / 100).toFixed(2)} zł)
                                                            </DiscountAmount>
                                                        )}
                                                    </DiscountDisplay>
                                                </TableCell>
                                                <TableCell>
                                                    <FinalPriceDisplay>
                                                        <FinalPrice $modified={service.isModified}>
                                                            {service.finalPrice.priceBrutto.toFixed(2)} zł
                                                        </FinalPrice>
                                                        {service.isModified && service.originalFinalPrice && (
                                                            <OriginalPrice>
                                                                było: {service.originalFinalPrice.priceBrutto.toFixed(2)} zł
                                                            </OriginalPrice>
                                                        )}
                                                    </FinalPriceDisplay>
                                                </TableCell>
                                                <TableCell>
                                                    <ActionsContainer>
                                                        <ActionButton
                                                            onClick={() => handleStartEdit(index)}
                                                            $variant="primary"
                                                            disabled={isEditing !== null}
                                                        >
                                                            <FaPencilAlt />
                                                        </ActionButton>
                                                    </ActionsContainer>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ServicesTableContainer>
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={onClose} disabled={isSaving}>
                        <FaTimes />
                        Anuluj
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={handleSave}
                        disabled={isEditing !== null || isSaving}
                    >
                        <FaCheck />
                        {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                    </PrimaryButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
`;

const ModalContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    width: 1100px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${brandTheme.status.successLight};
    color: ${brandTheme.status.success};
    border-radius: ${brandTheme.radius.lg};
    font-size: 18px;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brandTheme.surfaceHover};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    color: ${brandTheme.text.muted};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};

    &:hover:not(:disabled) {
        background: ${brandTheme.status.errorLight};
        border-color: ${brandTheme.status.error};
        color: ${brandTheme.status.error};
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const ModalBody = styled.div`
    padding: ${brandTheme.spacing.xl};
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};
`;

const InstructionsCard = styled.div`
    background: ${brandTheme.status.infoLight};
    border: 1px solid ${brandTheme.status.info};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    display: flex;
    align-items: flex-start;
    gap: ${brandTheme.spacing.sm};
`;

const InstructionsIcon = styled.div`
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 2px;
`;

const InstructionsText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const InstructionsTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.status.info};
`;

const InstructionsDescription = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    line-height: 1.4;
`;

const SummarySection = styled.div`
    display: flex;
    justify-content: center;
`;

const SummaryCard = styled.div`
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    min-width: 300px;
`;

const SummaryIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${brandTheme.status.success};
    color: white;
    border-radius: ${brandTheme.radius.lg};
    font-size: 20px;
`;

const SummaryDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const SummaryRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: 200px;
`;

const SummaryLabel = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.secondary};
`;

const SummaryValue = styled.div<{ $modified?: boolean; $difference?: number }>`
    font-size: 14px;
    font-weight: 600;
    color: ${props => {
        if (props.$difference !== undefined) {
            return props.$difference > 0 ? brandTheme.status.success : brandTheme.status.error;
        }
        return props.$modified ? brandTheme.status.warning : brandTheme.text.primary;
    }};
    font-variant-numeric: tabular-nums;
`;

const ServicesTableContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    box-shadow: ${brandTheme.shadow.md};
    overflow: hidden;
    border: 1px solid ${brandTheme.border};
`;

const Table = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
`;

const TableHead = styled.thead`
    background: ${brandTheme.surfaceAlt};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ $modified?: boolean }>`
    ${props => props.$modified && `
       background: ${brandTheme.status.warningLight};
   `}

    &:hover {
        background: ${brandTheme.surfaceHover};
    }
`;

const TableHeader = styled.th`
    background: ${brandTheme.surfaceAlt};
    color: ${brandTheme.text.primary};
    font-weight: 600;
    text-align: left;
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-bottom: 2px solid ${brandTheme.border};
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TableCell = styled.td`
    padding: ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.borderLight};
    vertical-align: middle;
`;

const ServiceInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const ServiceName = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const ServiceNote = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-style: italic;
    line-height: 1.4;
`;

const ModifiedBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    background: ${brandTheme.status.warning};
    color: white;
    padding: 2px 6px;
    border-radius: ${brandTheme.radius.sm};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const EditingBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    background: ${brandTheme.status.info};
    color: white;
    padding: 2px 6px;
    border-radius: ${brandTheme.radius.sm};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const PriceDisplay = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const PriceValue = styled.span<{ $modified?: boolean }>`
    font-weight: 600;
    color: ${props => props.$modified ? brandTheme.status.warning : brandTheme.text.primary};
    font-size: 14px;
    font-variant-numeric: tabular-nums;
`;

const OriginalPrice = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    text-decoration: line-through;
    font-variant-numeric: tabular-nums;
`;

const DiscountDisplay = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const DiscountTypeSelect = styled.select`
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
    }

    &:disabled {
        background: ${brandTheme.surfaceHover};
        cursor: not-allowed;
        opacity: 0.7;
    }
`;

const DiscountValueInput = styled.input`
    width: 80px;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    font-size: 12px;
    text-align: right;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 2px ${brandTheme.primaryGhost};
    }

    &:disabled {
        background: ${brandTheme.surfaceHover};
        cursor: not-allowed;
        opacity: 0.7;
    }
`;

const DiscountAmount = styled.span`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
`;

const DiscountEditContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const FinalPriceDisplay = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const FinalPrice = styled.span<{ $modified?: boolean }>`
    font-weight: 700;
    color: ${props => props.$modified ? brandTheme.status.success : brandTheme.text.primary};
    font-size: 16px;
    font-variant-numeric: tabular-nums;
`;

const PricePreview = styled.div`
    font-weight: 600;
    color: ${brandTheme.status.success};
    font-size: 14px;
    font-variant-numeric: tabular-nums;
`;

const ActionsContainer = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    justify-content: center;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'success' | 'danger' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${props => {
        switch (props.$variant) {
            case 'success': return brandTheme.status.successLight;
            case 'danger': return brandTheme.status.errorLight;
            default: return brandTheme.primaryGhost;
        }
    }};
    color: ${props => {
        switch (props.$variant) {
            case 'success': return brandTheme.status.success;
            case 'danger': return brandTheme.status.error;
            default: return brandTheme.primary;
        }
    }};
    border: 1px solid ${props => {
        switch (props.$variant) {
            case 'success': return brandTheme.status.success;
            case 'danger': return brandTheme.status.error;
            default: return brandTheme.primary;
        }
    }}40;
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    font-size: 12px;

    &:hover:not(:disabled) {
        border-color: ${props => {
            switch (props.$variant) {
                case 'success': return brandTheme.status.success;
                case 'danger': return brandTheme.status.error;
                default: return brandTheme.primary;
            }
        }};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const EditInput = styled.input`
    width: 100%;
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-top: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    min-height: 44px;
    min-width: 140px;

    &:hover:not(:disabled) {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.status.success} 0%, #27ae60 100%);
    color: white;
    border: 2px solid transparent;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${brandTheme.transitions.spring};
    box-shadow: ${brandTheme.shadow.sm};
    min-height: 44px;
    min-width: 160px;

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #27ae60 0%, ${brandTheme.status.success} 100%);
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        background: ${brandTheme.text.disabled};
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

export default EditPricesModal;