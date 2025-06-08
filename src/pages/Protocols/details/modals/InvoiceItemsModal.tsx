import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaCheck, FaTimesCircle, FaTimes, FaPencilAlt, FaTrash, FaLayerGroup, FaFileInvoice, FaCalculator, FaSpinner} from 'react-icons/fa';
import {DiscountType, SelectedService, ServiceApprovalStatus} from '../../../../types';
import {protocolsApi} from '../../../../api/protocolsApi';
import {useToast} from "../../../../components/common/Toast/Toast";

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

// Rozszerzony typ rabatu
enum ExtendedDiscountType {
    PERCENTAGE = 'PERCENTAGE',
    AMOUNT_GROSS = 'AMOUNT_GROSS',
    AMOUNT_NET = 'AMOUNT_NET',
    FIXED_PRICE_GROSS = 'FIXED_PRICE_GROSS',
    FIXED_PRICE_NET = 'FIXED_PRICE_NET'
}

const DiscountTypeLabelsExtended: Record<ExtendedDiscountType, string> = {
    [ExtendedDiscountType.PERCENTAGE]: "Procent",
    [ExtendedDiscountType.AMOUNT_GROSS]: "Kwota (brutto)",
    [ExtendedDiscountType.AMOUNT_NET]: "Kwota (netto)",
    [ExtendedDiscountType.FIXED_PRICE_GROSS]: "Cena końcowa (brutto)",
    [ExtendedDiscountType.FIXED_PRICE_NET]: "Cena końcowa (netto)"
};

const mapToStandardDiscountType = (extendedType: ExtendedDiscountType): DiscountType => {
    switch (extendedType) {
        case ExtendedDiscountType.PERCENTAGE:
            return DiscountType.PERCENTAGE;
        case ExtendedDiscountType.AMOUNT_GROSS:
        case ExtendedDiscountType.AMOUNT_NET:
            return DiscountType.AMOUNT;
        case ExtendedDiscountType.FIXED_PRICE_GROSS:
        case ExtendedDiscountType.FIXED_PRICE_NET:
            return DiscountType.FIXED_PRICE;
        default:
            return DiscountType.PERCENTAGE;
    }
};

const mapFromStandardDiscountType = (standardType: DiscountType): ExtendedDiscountType => {
    switch (standardType) {
        case DiscountType.PERCENTAGE:
            return ExtendedDiscountType.PERCENTAGE;
        case DiscountType.AMOUNT:
            return ExtendedDiscountType.AMOUNT_GROSS;
        case DiscountType.FIXED_PRICE:
            return ExtendedDiscountType.FIXED_PRICE_GROSS;
        default:
            return ExtendedDiscountType.PERCENTAGE;
    }
};

const DEFAULT_VAT_RATE = 23;

const calculateNetPrice = (grossPrice: number, vatRate: number = DEFAULT_VAT_RATE): number => {
    return grossPrice / (1 + vatRate / 100);
};

const calculateGrossPrice = (netPrice: number, vatRate: number = DEFAULT_VAT_RATE): number => {
    return netPrice * (1 + vatRate / 100);
};

interface ServiceExtended extends SelectedService {
    isModified?: boolean;
    originalName?: string;
    originalPrice?: number;
    originalFinalPrice?: number;
    originalDiscountType?: DiscountType;
    originalDiscountValue?: number;
    extendedDiscountType?: ExtendedDiscountType;
    mergedFrom?: SelectedService[];
}

interface InvoiceItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (items: SelectedService[]) => void;
    services: SelectedService[];
    protocolId: string;
}

const InvoiceItemsModal: React.FC<InvoiceItemsModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 onSave,
                                                                 services,
                                                                 protocolId
                                                             }) => {
    const [editedServices, setEditedServices] = useState<ServiceExtended[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [isPriceGross, setIsPriceGross] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [extendedDiscountTypes, setExtendedDiscountTypes] = useState<Record<string, ExtendedDiscountType>>({});

    const { showToast } = useToast();

    // Inicjalizacja stanu
    useEffect(() => {
        if (isOpen) {
            const initialServices = services.map(service => ({
                ...service,
                isModified: false,
                originalName: service.name,
                originalPrice: service.price,
                originalFinalPrice: service.finalPrice,
                originalDiscountType: service.discountType,
                originalDiscountValue: service.discountValue
            }));

            setEditedServices(initialServices);
            setIsEditing(null);

            const initialExtendedTypes: Record<string, ExtendedDiscountType> = {};
            services.forEach(service => {
                initialExtendedTypes[service.id] = mapFromStandardDiscountType(service.discountType);
            });
            setExtendedDiscountTypes(initialExtendedTypes);
        }
    }, [isOpen, services]);

    const handleStartEdit = (index: number) => {
        const service = editedServices[index];
        setIsEditing(index);
        setEditName(service.name);

        if (isPriceGross) {
            setEditPrice(service.price.toString());
        } else {
            setEditPrice(calculateNetPrice(service.price).toFixed(2));
        }
    };

    const handleSaveEdit = () => {
        if (isEditing === null) return;

        const parsedPrice = parseFloat(editPrice);
        if (isNaN(parsedPrice) || parsedPrice <= 0) return;

        const updatedServices = [...editedServices];
        const originalService = updatedServices[isEditing];

        const finalPrice = isPriceGross ? parsedPrice : calculateGrossPrice(parsedPrice);

        const isNameChanged = editName !== originalService.originalName;
        const isPriceChanged = Math.abs(finalPrice - (originalService.originalPrice || 0)) > 0.01;

        updatedServices[isEditing] = {
            ...originalService,
            name: editName,
            price: finalPrice,
            finalPrice: finalPrice,
            isModified: isNameChanged || isPriceChanged
        };

        setEditedServices(updatedServices);
        setIsEditing(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(null);
    };

    const handleRemoveItem = (index: number) => {
        const updatedServices = [...editedServices];
        updatedServices.splice(index, 1);
        setEditedServices(updatedServices);
    };

    const handleExtendedDiscountTypeChange = (serviceId: string, newExtendedType: ExtendedDiscountType) => {
        const standardType = mapToStandardDiscountType(newExtendedType);
        const serviceIndex = editedServices.findIndex(s => s.id === serviceId);

        if (serviceIndex === -1) return;

        setExtendedDiscountTypes({
            ...extendedDiscountTypes,
            [serviceId]: newExtendedType
        });

        const updatedServices = [...editedServices];
        const service = updatedServices[serviceIndex];

        let newDiscountValue = service.discountValue;

        if (service.discountType !== standardType) {
            if (standardType === DiscountType.PERCENTAGE) {
                newDiscountValue = 0;
            } else if (standardType === DiscountType.AMOUNT) {
                newDiscountValue = 0;
            } else if (standardType === DiscountType.FIXED_PRICE) {
                newDiscountValue = newExtendedType === ExtendedDiscountType.FIXED_PRICE_NET
                    ? calculateNetPrice(service.price)
                    : service.price;
            }
        }

        updatedServices[serviceIndex] = {
            ...service,
            discountType: standardType,
            discountValue: newDiscountValue,
            finalPrice: calculateFinalPrice(service.price, standardType, newExtendedType, newDiscountValue),
            isModified: true
        };

        setEditedServices(updatedServices);
    };

    const calculateFinalPrice = (
        price: number,
        discountType: DiscountType,
        extendedType: ExtendedDiscountType,
        discountValue: number
    ): number => {
        let finalPrice = price;

        switch (discountType) {
            case DiscountType.PERCENTAGE:
                finalPrice = price * (1 - discountValue / 100);
                break;
            case DiscountType.AMOUNT:
                if (extendedType === ExtendedDiscountType.AMOUNT_NET) {
                    const discountValueGross = calculateGrossPrice(discountValue);
                    finalPrice = Math.max(0, price - discountValueGross);
                } else {
                    finalPrice = Math.max(0, price - discountValue);
                }
                break;
            case DiscountType.FIXED_PRICE:
                if (extendedType === ExtendedDiscountType.FIXED_PRICE_NET) {
                    finalPrice = calculateGrossPrice(discountValue);
                } else {
                    finalPrice = discountValue;
                }
                break;
        }

        return parseFloat(finalPrice.toFixed(2));
    };

    const handleDiscountValueChange = (serviceId: string, value: number) => {
        const serviceIndex = editedServices.findIndex(s => s.id === serviceId);

        if (serviceIndex === -1) return;

        const updatedServices = [...editedServices];
        const service = updatedServices[serviceIndex];
        const extendedType = extendedDiscountTypes[serviceId] ||
            mapFromStandardDiscountType(service.discountType);

        let validatedValue = value;

        if (service.discountType === DiscountType.PERCENTAGE && validatedValue > 100) {
            validatedValue = 100;
        }

        if (validatedValue < 0) {
            validatedValue = 0;
        }

        updatedServices[serviceIndex] = {
            ...service,
            discountValue: validatedValue,
            finalPrice: calculateFinalPrice(service.price, service.discountType, extendedType, validatedValue),
            isModified: true
        };

        setEditedServices(updatedServices);
    };

    const handleMergeAll = () => {
        const totalPrice = editedServices.reduce(
            (sum, service) => sum + service.finalPrice, 0
        );

        const originalServices = [...editedServices];

        const mergedService: ServiceExtended = {
            id: `merged_${Date.now()}`,
            name: 'Usługi detailingowe',
            price: totalPrice,
            discountType: DiscountType.PERCENTAGE,
            discountValue: 0,
            finalPrice: totalPrice,
            isModified: true,
            mergedFrom: originalServices,
            note: '',
            approvalStatus: ServiceApprovalStatus.APPROVED,
        };

        setEditedServices([mergedService]);

        setExtendedDiscountTypes({
            [mergedService.id]: ExtendedDiscountType.PERCENTAGE
        });
    };

    const updateProtocol = async (newServices: SelectedService[]) => {
        setIsLoading(true);
        try {
            const protocolDetails = await protocolsApi.getProtocolDetails(protocolId);

            if (!protocolDetails) {
                throw new Error('Nie udało się pobrać danych protokołu');
            }

            const updatedProtocol = {
                ...protocolDetails,
                selectedServices: newServices,
                updatedAt: new Date().toISOString()
            };

            const result = await protocolsApi.updateProtocol(updatedProtocol);

            if (result) {
                showToast('success', 'Pozycje faktury zostały zaktualizowane', 3000);
                return true;
            } else {
                throw new Error('Nie udało się zaktualizować protokołu');
            }
        } catch (error) {
            console.error('Błąd podczas aktualizacji protokołu:', error);
            showToast('error', 'Wystąpił błąd podczas aktualizacji protokołu', 3000);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        const itemsToSave = editedServices.map(service => {
            const {
                isModified,
                originalName,
                originalPrice,
                originalFinalPrice,
                originalDiscountType,
                originalDiscountValue,
                extendedDiscountType,
                mergedFrom,
                ...serviceData
            } = service;

            return serviceData as SelectedService;
        });

        const newTotal = itemsToSave.reduce((sum, item) => sum + item.finalPrice, 0);
        const originalTotal = services.reduce((sum, item) => sum + item.finalPrice, 0);

        if (Math.abs(newTotal - originalTotal) > 0.01) {
            const confirmed = window.confirm(
                `Suma po modyfikacji (${newTotal.toFixed(2)} zł) różni się od oryginalnej kwoty (${originalTotal.toFixed(2)} zł). Czy na pewno chcesz zapisać zmiany?`
            );

            if (!confirmed) {
                return;
            }
        }

        const success = await updateProtocol(itemsToSave);

        if (success) {
            onSave(itemsToSave);
            onClose();
        }
    };

    const calculateTotals = () => {
        const totalPrice = editedServices.reduce((sum, service) => sum + service.price, 0);
        const totalDiscount = editedServices.reduce((sum, service) => sum + (service.price - service.finalPrice), 0);
        const totalFinalPrice = editedServices.reduce((sum, service) => sum + service.finalPrice, 0);

        return {
            totalPrice,
            totalDiscount,
            totalFinalPrice
        };
    };

    const { totalPrice, totalDiscount, totalFinalPrice } = calculateTotals();

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon>
                            <FaFileInvoice />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Edytuj pozycje faktury</ModalTitle>
                            <ModalSubtitle>Dostosuj nazwy, ceny i rabaty dla dokumentu sprzedaży</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <InstructionsCard>
                        <InstructionsIcon>💡</InstructionsIcon>
                        <InstructionsText>
                            <InstructionsTitle>Edytuj pozycje faktury</InstructionsTitle>
                            <InstructionsDescription>
                                Możesz edytować nazwy i ceny poszczególnych usług, które pojawią się na fakturze,
                                lub połączyć wszystkie usługi w jedną pozycję dla uproszczenia dokumentu.
                            </InstructionsDescription>
                        </InstructionsText>
                    </InstructionsCard>

                    <ActionsSection>
                        <MergeAllButton onClick={handleMergeAll}>
                            <FaLayerGroup />
                            Połącz wszystkie w jedną pozycję
                        </MergeAllButton>

                        <TotalsSummary>
                            <SummaryIcon>
                                <FaCalculator />
                            </SummaryIcon>
                            <SummaryDetails>
                                <SummaryLabel>Suma końcowa</SummaryLabel>
                                <SummaryValue>{totalFinalPrice.toFixed(2)} zł</SummaryValue>
                            </SummaryDetails>
                        </TotalsSummary>
                    </ActionsSection>

                    <ServicesTableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Nazwa usługi</TableHeader>
                                    <TableHeader>Cena bazowa</TableHeader>
                                    <TableHeader>Rabat</TableHeader>
                                    <TableHeader>Cena końcowa</TableHeader>
                                    <TableHeader>Akcje</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {editedServices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <EmptyState>
                                                <EmptyIcon>
                                                    <FaFileInvoice />
                                                </EmptyIcon>
                                                <EmptyText>Brak usług do wyświetlenia</EmptyText>
                                            </EmptyState>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    editedServices.map((service, index) => {
                                        const extendedType = extendedDiscountTypes[service.id] ||
                                            mapFromStandardDiscountType(service.discountType);

                                        return (
                                            <TableRow key={service.id}>
                                                {isEditing === index ? (
                                                    <>
                                                        <TableCell>
                                                            <EditInput
                                                                type="text"
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                placeholder="Nazwa usługi"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <PriceEditContainer>
                                                                <EditPriceInput
                                                                    type="text"
                                                                    value={editPrice}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
                                                                            setEditPrice(value);
                                                                        }
                                                                    }}
                                                                    placeholder={`Cena ${isPriceGross ? 'brutto' : 'netto'}`}
                                                                />
                                                                <PriceTypeToggle>
                                                                    <PriceTypeButton
                                                                        $selected={isPriceGross}
                                                                        onClick={() => setIsPriceGross(true)}
                                                                    >
                                                                        Brutto
                                                                    </PriceTypeButton>
                                                                    <PriceTypeButton
                                                                        $selected={!isPriceGross}
                                                                        onClick={() => setIsPriceGross(false)}
                                                                    >
                                                                        Netto
                                                                    </PriceTypeButton>
                                                                </PriceTypeToggle>
                                                            </PriceEditContainer>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DiscountPreview>
                                                                {service.discountValue > 0 ?
                                                                    service.discountType === DiscountType.PERCENTAGE ?
                                                                        `${service.discountValue}%` :
                                                                        `${service.discountValue} zł`
                                                                    : 'Bez rabatu'
                                                                }
                                                            </DiscountPreview>
                                                        </TableCell>
                                                        <TableCell>
                                                            <PricePreview>
                                                                <PriceValue>
                                                                    {isPriceGross ?
                                                                        parseFloat(editPrice || '0').toFixed(2) :
                                                                        calculateGrossPrice(parseFloat(editPrice || '0')).toFixed(2)
                                                                    } zł
                                                                </PriceValue>
                                                                <PriceType>brutto</PriceType>
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
                                                                <PriceValue>{service.price.toFixed(2)} zł</PriceValue>
                                                                <PriceType>brutto</PriceType>
                                                                <PriceValue>{calculateNetPrice(service.price).toFixed(2)} zł</PriceValue>
                                                                <PriceType>netto</PriceType>
                                                            </PriceDisplay>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DiscountControls>
                                                                <DiscountSelect
                                                                    value={extendedType}
                                                                    onChange={(e) => handleExtendedDiscountTypeChange(
                                                                        service.id,
                                                                        e.target.value as ExtendedDiscountType
                                                                    )}
                                                                >
                                                                    {Object.entries(DiscountTypeLabelsExtended).map(([value, label]) => (
                                                                        <option key={value} value={value}>{label}</option>
                                                                    ))}
                                                                </DiscountSelect>
                                                                <DiscountInputContainer>
                                                                    <DiscountInput
                                                                        type="number"
                                                                        min="0"
                                                                        max={service.discountType === DiscountType.PERCENTAGE ? 100 : undefined}
                                                                        value={service.discountValue}
                                                                        onChange={(e) => handleDiscountValueChange(
                                                                            service.id,
                                                                            parseFloat(e.target.value) || 0
                                                                        )}
                                                                    />
                                                                    {service.discountType === DiscountType.PERCENTAGE && (
                                                                        <DiscountAmount>
                                                                            ({(service.price * service.discountValue / 100).toFixed(2)} zł)
                                                                        </DiscountAmount>
                                                                    )}
                                                                </DiscountInputContainer>
                                                            </DiscountControls>
                                                        </TableCell>
                                                        <TableCell>
                                                            <PriceDisplay>
                                                                <PriceValue>{service.finalPrice.toFixed(2)} zł</PriceValue>
                                                                <PriceType>brutto</PriceType>
                                                                <PriceValue>{calculateNetPrice(service.finalPrice).toFixed(2)} zł</PriceValue>
                                                                <PriceType>netto</PriceType>
                                                            </PriceDisplay>
                                                        </TableCell>
                                                        <TableCell>
                                                            <ActionsContainer>
                                                                <ActionButton onClick={() => handleStartEdit(index)} $variant="primary">
                                                                    <FaPencilAlt />
                                                                </ActionButton>
                                                                <ActionButton onClick={() => handleRemoveItem(index)} $variant="danger">
                                                                    <FaTrash />
                                                                </ActionButton>
                                                            </ActionsContainer>
                                                        </TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                            <TableFoot>
                                <TableRow>
                                    <TableFooterCell>
                                        <TotalLabel>Podsumowanie:</TotalLabel>
                                    </TableFooterCell>
                                    <TableFooterCell>
                                        <TotalPriceDisplay>
                                            <TotalValue>{totalPrice.toFixed(2)} zł</TotalValue>
                                            <PriceType>brutto</PriceType>
                                            <TotalValue>{calculateNetPrice(totalPrice).toFixed(2)} zł</TotalValue>
                                            <PriceType>netto</PriceType>
                                        </TotalPriceDisplay>
                                    </TableFooterCell>
                                    <TableFooterCell>
                                        <TotalPriceDisplay>
                                            <TotalValue>{totalDiscount.toFixed(2)} zł</TotalValue>
                                            <PriceType>oszczędności</PriceType>
                                        </TotalPriceDisplay>
                                    </TableFooterCell>
                                    <TableFooterCell>
                                        <TotalPriceDisplay>
                                            <TotalValue>{totalFinalPrice.toFixed(2)} zł</TotalValue>
                                            <PriceType>do zapłaty</PriceType>
                                        </TotalPriceDisplay>
                                    </TableFooterCell>
                                    <TableFooterCell></TableFooterCell>
                                </TableRow>
                            </TableFoot>
                        </Table>
                    </ServicesTableContainer>
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={onClose}>
                        <FaTimes />
                        Anuluj zmiany
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={handleSave}
                        disabled={editedServices.length === 0 || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className="spinner" />
                                Zapisywanie...
                            </>
                        ) : (
                            <>
                                <FaCheck />
                                Zastosuj zmiany
                            </>
                        )}
                    </PrimaryButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components - Professional Automotive CRM Design
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

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
   background: ${brandTheme.surface};
   border-radius: ${brandTheme.radius.xl};
   box-shadow: ${brandTheme.shadow.xl};
   width: 1200px;
   max-width: 95%;
   max-height: 90vh;
   display: flex;
   flex-direction: column;
   overflow: hidden;
   animation: slideUp 0.3s ease;

   @keyframes slideUp {
       from {
           opacity: 0;
           transform: translateY(20px) scale(0.95);
       }
       to {
           opacity: 1;
           transform: translateY(0) scale(1);
       }
   }
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
   background: ${brandTheme.primaryGhost};
   color: ${brandTheme.primary};
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

   &:hover {
       background: ${brandTheme.status.errorLight};
       border-color: ${brandTheme.status.error};
       color: ${brandTheme.status.error};
       transform: translateY(-1px);
   }
`;

const ModalBody = styled.div`
   padding: ${brandTheme.spacing.xl};
   overflow-y: auto;
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xl};

   /* Custom scrollbar */
   &::-webkit-scrollbar {
       width: 6px;
   }

   &::-webkit-scrollbar-track {
       background: ${brandTheme.surfaceAlt};
   }

   &::-webkit-scrollbar-thumb {
       background: ${brandTheme.border};
       border-radius: 3px;
   }
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

const ActionsSection = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   gap: ${brandTheme.spacing.lg};
`;

const MergeAllButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: ${brandTheme.primaryGhost};
   color: ${brandTheme.primary};
   border: 2px solid ${brandTheme.primary}40;
   border-radius: ${brandTheme.radius.md};
   font-size: 14px;
   font-weight: 600;
   cursor: pointer;
   transition: all ${brandTheme.transitions.normal};

   &:hover {
       background: ${brandTheme.primary}20;
       border-color: ${brandTheme.primary};
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

const TotalsSummary = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.md};
   background: ${brandTheme.status.successLight};
   border: 1px solid ${brandTheme.status.success};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
`;

const SummaryIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 32px;
   height: 32px;
   background: ${brandTheme.status.success};
   color: white;
   border-radius: ${brandTheme.radius.sm};
   font-size: 14px;
`;

const SummaryDetails = styled.div`
   display: flex;
   flex-direction: column;
   gap: 2px;
`;

const SummaryLabel = styled.div`
   font-size: 12px;
   font-weight: 600;
   color: ${brandTheme.text.secondary};
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

const SummaryValue = styled.div`
   font-size: 18px;
   font-weight: 700;
   color: ${brandTheme.status.success};
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

const TableFoot = styled.tfoot`
   background: ${brandTheme.surfaceElevated};
`;

const TableRow = styled.tr`
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

const TableFooterCell = styled(TableCell)`
   font-weight: 600;
   background: ${brandTheme.surfaceElevated};
   border-bottom: none;
   border-top: 2px solid ${brandTheme.border};
`;

const EmptyState = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${brandTheme.spacing.xxl};
   text-align: center;
`;

const EmptyIcon = styled.div`
   font-size: 48px;
   color: ${brandTheme.text.muted};
   margin-bottom: ${brandTheme.spacing.lg};
   opacity: 0.6;
`;

const EmptyText = styled.div`
   font-size: 16px;
   color: ${brandTheme.text.muted};
   font-weight: 500;
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

const PriceValue = styled.span`
   font-weight: 600;
   color: ${brandTheme.text.primary};
   font-size: 14px;
   font-variant-numeric: tabular-nums;
`;

const PriceType = styled.div`
   font-size: 11px;
   color: ${brandTheme.text.muted};
   text-transform: uppercase;
   font-weight: 500;
   letter-spacing: 0.5px;
`;

const DiscountControls = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.sm};
   min-width: 150px;
`;

const DiscountSelect = styled.select`
   padding: ${brandTheme.spacing.sm};
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
`;

const DiscountInputContainer = styled.div`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.xs};
`;

const DiscountInput = styled.input`
   width: 70px;
   padding: ${brandTheme.spacing.sm};
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
`;

const DiscountAmount = styled.span`
   font-size: 11px;
   color: ${brandTheme.text.muted};
   white-space: nowrap;
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

   &:hover {
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

const PriceEditContainer = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.sm};
`;

const EditPriceInput = styled(EditInput)`
   margin-bottom: 0;
`;

const PriceTypeToggle = styled.div`
   display: flex;
   gap: ${brandTheme.spacing.xs};
   border-radius: ${brandTheme.radius.sm};
   overflow: hidden;
   border: 1px solid ${brandTheme.border};
`;

const PriceTypeButton = styled.button<{ $selected: boolean }>`
   flex: 1;
   padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
   background: ${props => props.$selected ? brandTheme.primary : brandTheme.surface};
   color: ${props => props.$selected ? 'white' : brandTheme.text.muted};
   border: none;
   font-size: 11px;
   font-weight: 600;
   cursor: pointer;
   transition: all ${brandTheme.transitions.normal};
   text-transform: uppercase;
   letter-spacing: 0.5px;

   &:hover {
       background: ${props => props.$selected ? brandTheme.primaryDark : brandTheme.surfaceHover};
   }
`;

const DiscountPreview = styled.div`
   font-size: 13px;
   color: ${brandTheme.text.muted};
   font-weight: 500;
`;

const PricePreview = styled.div`
   display: flex;
   flex-direction: column;
   gap: 2px;
`;

const TotalLabel = styled.div`
   font-size: 14px;
   font-weight: 700;
   color: ${brandTheme.text.primary};
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

const TotalPriceDisplay = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const TotalValue = styled.span`
   font-weight: 700;
   color: ${brandTheme.text.primary};
   font-size: 14px;
   font-variant-numeric: tabular-nums;
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

   &:hover {
       background: ${brandTheme.surfaceHover};
       color: ${brandTheme.text.primary};
       border-color: ${brandTheme.borderHover};
       box-shadow: ${brandTheme.shadow.sm};
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

   .spinner {
       animation: spin 1s linear infinite;
   }

   @keyframes spin {
       from { transform: rotate(0deg); }
       to { transform: rotate(360deg); }
   }
`;

export default InvoiceItemsModal;