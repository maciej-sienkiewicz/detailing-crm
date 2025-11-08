// src/features/services/components/ServiceTable.tsx
import React, {useState} from 'react';
import {FaEdit, FaStickyNote, FaTrash} from 'react-icons/fa';
import {SelectedService} from '../../../../types';
import styled from 'styled-components';
import ServiceNoteModal from '../../../../pages/Protocols/shared/modals/SerivceNoteModal';
import {theme} from '../../../../styles/theme';
import {DiscountType} from "../../../reservations/api/reservationsApi";

// Professional theme matching the form design
const formTheme = {
    colors: {
        primary: '#2563eb',
        primaryHover: '#1d4ed8',
        primaryLight: 'rgba(37, 99, 235, 0.08)',
        primaryGhost: 'rgba(37, 99, 235, 0.04)',

        success: '#059669',
        successLight: 'rgba(5, 150, 105, 0.1)',
        warning: '#d97706',
        warningLight: 'rgba(217, 119, 6, 0.1)',
        error: '#dc2626',
        errorLight: 'rgba(220, 38, 38, 0.1)',

        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textTertiary: '#64748b',
        textMuted: '#94a3b8',
        textDisabled: '#cbd5e1',

        surface: '#ffffff',
        surfaceElevated: '#fafbfc',
        surfaceHover: '#f8fafc',
        surfaceActive: '#f1f5f9',
        surfaceDisabled: '#f3f4f6',

        border: '#e2e8f0',
        borderLight: '#f1f5f9',
        borderHover: '#cbd5e1',
        borderActive: '#94a3b8',
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
    },
    borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
    },
    shadows: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        focus: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    }
};

// Extended discount types
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


const mapFromStandardDiscountType = (standardType: DiscountType): ExtendedDiscountType => {
    switch (standardType) {
        case DiscountType.PERCENT:
            return ExtendedDiscountType.PERCENTAGE;
        case DiscountType.FIXED_AMOUNT_OFF_BRUTTO:
            return ExtendedDiscountType.AMOUNT_GROSS;
        case DiscountType.FIXED_AMOUNT_OFF_NETTO:
            return ExtendedDiscountType.AMOUNT_NET;
        case DiscountType.FIXED_FINAL_BRUTTO:
            return ExtendedDiscountType.FIXED_PRICE_GROSS;
        case DiscountType.FIXED_FINAL_NETTO:
            return ExtendedDiscountType.FIXED_PRICE_NET;
        default:
            return ExtendedDiscountType.PERCENTAGE;
    }
};

const mapToStandardDiscountType = (extendedType: ExtendedDiscountType): DiscountType => {
    switch (extendedType) {
        case ExtendedDiscountType.FIXED_PRICE_NET:
            return DiscountType.FIXED_FINAL_NETTO;
        case ExtendedDiscountType.FIXED_PRICE_GROSS:
            return DiscountType.FIXED_FINAL_BRUTTO;
        case ExtendedDiscountType.AMOUNT_NET:
            return DiscountType.FIXED_AMOUNT_OFF_NETTO;
        case ExtendedDiscountType.AMOUNT_GROSS:
            return DiscountType.FIXED_AMOUNT_OFF_BRUTTO;
        case ExtendedDiscountType.PERCENTAGE:
            return DiscountType.PERCENT;
        default:
            return DiscountType.PERCENT;
    }
};

interface ServiceExtended extends SelectedService {
    note?: string;
    extendedDiscountType?: ExtendedDiscountType;
}

interface ServiceTableProps {
    services: ServiceExtended[];
    onRemoveService: (serviceId: string) => void;
    onDiscountTypeChange: (serviceId: string, discountType: DiscountType) => void;
    onDiscountValueChange: (serviceId: string, discountValue: number) => void;
    onBasePriceChange: (serviceId: string, newPrice: number) => void;
    onAddNote?: (serviceId: string, note: string) => void;
    calculateTotals: () => { totalPrice: number; totalDiscount: number; totalFinalPrice: number };
    readOnly?: boolean;
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
                                                              services,
                                                              onRemoveService,
                                                              onDiscountTypeChange,
                                                              onDiscountValueChange,
                                                              onBasePriceChange,
                                                              onAddNote,
                                                              calculateTotals,
                                                              readOnly = false
                                                          }) => {
    const { totalPrice, totalDiscount, totalFinalPrice } = calculateTotals();

    // State management
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        serviceId: string;
    }>({
        visible: false,
        x: 0,
        y: 0,
        serviceId: ''
    });

    const [extendedDiscountTypes, setExtendedDiscountTypes] = useState<Record<string, ExtendedDiscountType>>({});

    const [editPopup, setEditPopup] = useState<{
        visible: boolean;
        x: number;
        y: number;
        serviceId: string;
        currentPrice: number;
        isPriceGross: boolean;
    }>({
        visible: false,
        x: 0,
        y: 0,
        serviceId: '',
        currentPrice: 0,
        isPriceGross: true
    });

    const [noteModal, setNoteModal] = useState<{
        visible: boolean;
        serviceId: string;
        serviceName: string;
        currentNote: string;
    }>({
        visible: false,
        serviceId: '',
        serviceName: '',
        currentNote: ''
    });

    const [newPrice, setNewPrice] = useState<string>('');

    // Initialize extended discount types
    React.useEffect(() => {
        const updatedTypes: Record<string, ExtendedDiscountType> = {...extendedDiscountTypes};
        let hasUpdates = false;

        services.forEach(service => {
            if (!extendedDiscountTypes[service.rowId]) {
                updatedTypes[service.rowId] = service.extendedDiscountType ||
                    mapFromStandardDiscountType(service.discountType);
                hasUpdates = true;
            }
        });

        if (hasUpdates) {
            setExtendedDiscountTypes(updatedTypes);
        }
    }, [services]);

    // Event handlers
    const handlePriceRightClick = (e: React.MouseEvent, service: ServiceExtended) => {
        if (readOnly) return;
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            serviceId: service.id
        });
    };

    const handleEditPrice = () => {
        const service = services.find(s => s.id === contextMenu.serviceId);
        if (!service) return;

        setContextMenu({...contextMenu, visible: false});

        const rect = document.getElementById(`price-${service.id}`)?.getBoundingClientRect();
        if (rect) {
            setEditPopup({
                visible: true,
                x: rect.left,
                y: rect.bottom + window.scrollY,
                serviceId: service.id,
                currentPrice: service.basePrice.priceNetto,
                isPriceGross: true
            });
            setNewPrice(service.basePrice.priceBrutto.toString());
        }
    };

    const handleSavePrice = () => {
        const normalizedPrice = newPrice.trim().replace(',', '.');

        if (normalizedPrice === '') {
            onBasePriceChange(editPopup.serviceId, 0);
            setEditPopup({...editPopup, visible: false});
            return;
        }

        const parsedPrice = parseFloat(normalizedPrice);

        if (isNaN(parsedPrice) || parsedPrice < 0) {
            console.error("Niepoprawna lub ujemna cena.");
            return;
        }

        const parts = normalizedPrice.split('.');
        if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) {
            console.error("Cena ma zbyt wiele miejsc po przecinku.");
            return;
        }

        onBasePriceChange(editPopup.serviceId, parsedPrice);
        setEditPopup({...editPopup, visible: false});
    };

    const handlePriceTypeChange = (isPriceGross: boolean) => {
        setEditPopup({...editPopup, isPriceGross});

        const service = services.find(s => s.id === editPopup.serviceId);
        if (service) {
            if (isPriceGross) {
                setNewPrice(service.basePrice.priceBrutto.toFixed(2).replace('.', ','));
            } else {
                setNewPrice(service.basePrice.priceNetto.toFixed(2).replace('.', ','));
            }
        }
    };

    const handleExtendedDiscountTypeChange = (rowId: string, newExtendedType: ExtendedDiscountType) => {
        const standardType = mapToStandardDiscountType(newExtendedType);
        setExtendedDiscountTypes({
            ...extendedDiscountTypes,
            [rowId]: newExtendedType
        });
        onDiscountTypeChange(rowId, standardType);
    };

    const handleOpenNoteModal = (service: ServiceExtended) => {
        setNoteModal({
            visible: true,
            serviceId: service.id,
            serviceName: service.name,
            currentNote: service.note || ''
        });
    };

    const handleSaveNote = (note: string) => {
        if (onAddNote && noteModal.serviceId) {
            onAddNote(noteModal.serviceId, note);
        }
        setNoteModal({...noteModal, visible: false});
    };

    // Click outside handlers
    React.useEffect(() => {
        const handleClickOutside = () => {
            setContextMenu({...contextMenu, visible: false});
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [contextMenu]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEditPopup({...editPopup, visible: false});
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editPopup]);

    // Calculate totals for netto and brutto separately
    const totalBasePriceBrutto = services.reduce((sum, s) => sum + s.basePrice.priceBrutto, 0);
    const totalBasePriceNetto = services.reduce((sum, s) => sum + s.basePrice.priceNetto, 0);
    const totalFinalPriceBrutto = services.reduce((sum, s) => sum + s.finalPrice.priceBrutto, 0);
    const totalFinalPriceNetto = services.reduce((sum, s) => sum + s.finalPrice.priceNetto, 0);

    return (
        <TableContainer>
            <TableWrapper>
                <Table>
                    <TableHead>
                        <tr>
                            <TableHeader>Nazwa usługi</TableHeader>
                            <TableHeader>Cena bazowa</TableHeader>
                            {!readOnly && <TableHeader>Rabat</TableHeader>}
                            <TableHeader>Cena końcowa</TableHeader>
                            {!readOnly && <TableHeader>Akcje</TableHeader>}
                        </tr>
                    </TableHead>
                    <TableBody>
                        {services.length === 0 ? (
                            <tr>
                                <EmptyStateCell colSpan={readOnly ? 3 : 5}>
                                    <EmptyStateContent>
                                        <EmptyStateText>
                                            <EmptyStateTitle>Brak wybranych usług</EmptyStateTitle>
                                            <EmptyStateSubtitle>
                                                {readOnly
                                                    ? 'Brak usług w tej rezerwacji'
                                                    : 'Użyj pola wyszukiwania powyżej, aby dodać usługi do protokołu'
                                                }
                                            </EmptyStateSubtitle>
                                        </EmptyStateText>
                                    </EmptyStateContent>
                                </EmptyStateCell>
                            </tr>
                        ) : (
                            services.map(service => {
                                const extendedType = extendedDiscountTypes[service.id] ||
                                    mapFromStandardDiscountType(service.discountType);

                                return (
                                    <TableRow key={service.rowId}>
                                        <TableCell>
                                            <ServiceInfo>
                                                <ServiceName>{service.name}</ServiceName>
                                                {service.note && (
                                                    <ServiceNote>{service.note}</ServiceNote>
                                                )}
                                            </ServiceInfo>
                                        </TableCell>

                                        <PriceCell
                                            id={`price-${service.rowId}`}
                                            onContextMenu={(e) => handlePriceRightClick(e, service)}
                                            onClick={readOnly ? undefined : (e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setEditPopup({
                                                    visible: true,
                                                    x: rect.left,
                                                    y: rect.bottom + window.scrollY,
                                                    serviceId: service.rowId,
                                                    currentPrice: service.basePrice.priceNetto,
                                                    isPriceGross: true
                                                });
                                                setNewPrice(service.basePrice.priceBrutto.toFixed(2).replace('.', ','));
                                            }}
                                            $readOnly={readOnly}
                                        >
                                            <PriceContainer>
                                                <PriceInfo>
                                                    <PriceRow>
                                                        <PriceValue>{service.basePrice.priceBrutto.toFixed(2)} zł</PriceValue>
                                                        <PriceLabel>brutto</PriceLabel>
                                                    </PriceRow>
                                                    <PriceRow>
                                                        <PriceValue secondary>
                                                            {service.basePrice.priceNetto.toFixed(2)} zł
                                                        </PriceValue>
                                                        <PriceLabel>netto</PriceLabel>
                                                    </PriceRow>
                                                </PriceInfo>
                                                {!readOnly && (
                                                    <EditIcon>
                                                        <FaEdit />
                                                    </EditIcon>
                                                )}
                                            </PriceContainer>
                                        </PriceCell>

                                        {!readOnly && (
                                            <DiscountCell>
                                                <DiscountContainer>
                                                    <DiscountTypeSelect
                                                        value={extendedType}
                                                        onChange={(e) => handleExtendedDiscountTypeChange(
                                                            service.rowId,
                                                            e.target.value as ExtendedDiscountType
                                                        )}
                                                    >
                                                        {Object.entries(DiscountTypeLabelsExtended).map(([value, label]) => (
                                                            <option key={value} value={value}>{label}</option>
                                                        ))}
                                                    </DiscountTypeSelect>
                                                    <DiscountInputGroup>
                                                        <DiscountInput
                                                            type="number"
                                                            min="0"
                                                            max={service.discountType === DiscountType.PERCENT ? 100 : undefined}
                                                            value={service.discountValue}
                                                            onChange={(e) => onDiscountValueChange(
                                                                service.rowId,
                                                                parseFloat(e.target.value) || 0
                                                            )}
                                                        />
                                                        {service.discountType === DiscountType.PERCENT && (
                                                            <DiscountCalculation>
                                                                ({(service.basePrice.priceBrutto * service.discountValue / 100).toFixed(2)} zł)
                                                            </DiscountCalculation>
                                                        )}
                                                    </DiscountInputGroup>
                                                </DiscountContainer>
                                            </DiscountCell>
                                        )}

                                        <TableCell>
                                            <PriceInfo>
                                                <PriceRow>
                                                    <PriceValue>{service.finalPrice.priceBrutto.toFixed(2)} zł</PriceValue>
                                                    <PriceLabel>brutto</PriceLabel>
                                                </PriceRow>
                                                <PriceRow>
                                                    <PriceValue secondary>
                                                        {service.finalPrice.priceNetto.toFixed(2)} zł
                                                    </PriceValue>
                                                    <PriceLabel>netto</PriceLabel>
                                                </PriceRow>
                                            </PriceInfo>
                                        </TableCell>

                                        {!readOnly && (
                                            <TableCell>
                                                <ActionButtonsGroup>
                                                    <ActionButton
                                                        type="button"
                                                        onClick={() => handleOpenNoteModal(service)}
                                                        title="Dodaj/edytuj notatkę"
                                                        $variant={service.note ? 'warning' : 'secondary'}
                                                    >
                                                        <FaStickyNote />
                                                    </ActionButton>
                                                    <ActionButton
                                                        onClick={() => onRemoveService(service.rowId)}
                                                        title="Usuń usługę"
                                                        $variant="danger"
                                                    >
                                                        <FaTrash />
                                                    </ActionButton>
                                                </ActionButtonsGroup>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                    <TableFooter>
                        <tr>
                            <FooterCell>
                                <TotalLabel>Podsumowanie:</TotalLabel>
                            </FooterCell>
                            <FooterCell>
                                <PriceInfo>
                                    <PriceRow>
                                        <TotalValue>{totalBasePriceBrutto.toFixed(2)} zł</TotalValue>
                                        <PriceLabel>brutto</PriceLabel>
                                    </PriceRow>
                                    <PriceRow>
                                        <TotalValue secondary>
                                            {totalBasePriceNetto.toFixed(2)} zł
                                        </TotalValue>
                                        <PriceLabel>netto</PriceLabel>
                                    </PriceRow>
                                </PriceInfo>
                            </FooterCell>
                            {!readOnly && (
                                <FooterCell>
                                    <PriceInfo>
                                        <PriceRow>
                                            <TotalValue>
                                                {(totalBasePriceBrutto - totalFinalPriceBrutto).toFixed(2)} zł
                                            </TotalValue>
                                            <PriceLabel>brutto</PriceLabel>
                                        </PriceRow>
                                        <PriceRow>
                                            <TotalValue secondary>
                                                {(totalBasePriceNetto - totalFinalPriceNetto).toFixed(2)} zł
                                            </TotalValue>
                                            <PriceLabel>netto</PriceLabel>
                                        </PriceRow>
                                    </PriceInfo>
                                </FooterCell>
                            )}
                            <FooterCell>
                                <PriceInfo>
                                    <PriceRow>
                                        <TotalValue primary>{totalFinalPriceBrutto.toFixed(2)} zł</TotalValue>
                                        <PriceLabel>brutto</PriceLabel>
                                    </PriceRow>
                                    <PriceRow>
                                        <TotalValue secondary>
                                            {totalFinalPriceNetto.toFixed(2)} zł
                                        </TotalValue>
                                        <PriceLabel>netto</PriceLabel>
                                    </PriceRow>
                                </PriceInfo>
                            </FooterCell>
                            {!readOnly && <FooterCell></FooterCell>}
                        </tr>
                    </TableFooter>
                </Table>
            </TableWrapper>

            {/* Context Menu */}
            {contextMenu.visible && !readOnly && (
                <ContextMenu
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MenuItem onClick={handleEditPrice}>
                        <FaEdit /> Edytuj cenę bazową
                    </MenuItem>
                </ContextMenu>
            )}

            {/* Price Edit Popup */}
            {editPopup.visible && !readOnly && (
                <EditPricePopup
                    style={{
                        position: 'absolute',
                        top: editPopup.y,
                        left: editPopup.x
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <PopupHeader>
                        <PopupTitle>Edytuj cenę bazową</PopupTitle>
                    </PopupHeader>
                    <PopupContent>
                        <FormGroup>
                            <Label>Typ ceny:</Label>
                            <PriceTypeSelect
                                value={editPopup.isPriceGross ? "gross" : "net"}
                                onChange={(e) => handlePriceTypeChange(e.target.value === "gross")}
                            >
                                <option value="gross">Cena brutto</option>
                                <option value="net">Cena netto</option>
                            </PriceTypeSelect>
                        </FormGroup>
                        <FormGroup>
                            <Label>Nowa cena:</Label>
                            <PriceInput
                                type="text"
                                value={newPrice}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const normalizedValue = value.replace(',', '.');

                                    if (value === '') {
                                        setNewPrice(value);
                                        return;
                                    }

                                    if (/^\d*[.]?\d{0,2}$/.test(normalizedValue)) {
                                        setNewPrice(value);
                                    }
                                }}
                                placeholder={`Wprowadź cenę ${editPopup.isPriceGross ? 'brutto' : 'netto'}`}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSavePrice();
                                    }
                                }}
                            />
                        </FormGroup>
                    </PopupContent>
                    <PopupActions>
                        <Button
                            type="button"
                            onClick={() => setEditPopup({...editPopup, visible: false})}
                        >
                            Anuluj
                        </Button>
                        <Button
                            type="button"
                            $primary
                            onClick={handleSavePrice}
                        >
                            Zapisz
                        </Button>
                    </PopupActions>
                </EditPricePopup>
            )}

            {/* Service Note Modal */}
            {!readOnly && (
                <ServiceNoteModal
                    isOpen={noteModal.visible}
                    onClose={() => setNoteModal({...noteModal, visible: false})}
                    onSave={handleSaveNote}
                    serviceName={noteModal.serviceName}
                    initialNote={noteModal.currentNote}
                />
            )}
        </TableContainer>
    );
};

// Styled Components

const TableContainer = styled.div`
    background: ${formTheme.colors.surface};
    border: 1px solid ${formTheme.colors.border};
    border-radius: ${formTheme.borderRadius.lg};
    box-shadow: ${formTheme.shadows.sm};
    overflow: hidden;
    margin-top: ${formTheme.spacing.lg};
`;

const TableWrapper = styled.div`
    overflow-x: auto;

    &::-webkit-scrollbar {
        height: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${formTheme.colors.surfaceElevated};
    }

    &::-webkit-scrollbar-thumb {
        background: ${formTheme.colors.borderHover};
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${formTheme.colors.borderActive};
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const TableHead = styled.thead`
    background: linear-gradient(135deg, ${formTheme.colors.surfaceElevated} 0%, ${formTheme.colors.surfaceHover} 100%);
    border-bottom: 2px solid ${formTheme.colors.border};
`;

const TableHeader = styled.th`
    padding: ${formTheme.spacing.lg} ${formTheme.spacing.lg};
    text-align: left;
    font-weight: 600;
    font-size: 14px;
    color: ${formTheme.colors.textPrimary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid ${formTheme.colors.border};

    &:first-child {
        border-top-left-radius: ${formTheme.borderRadius.lg};
    }

    &:last-child {
        border-top-right-radius: ${formTheme.borderRadius.lg};
    }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
    transition: all 0.2s ease;

    &:hover {
        background: ${formTheme.colors.surfaceHover};
    }

    &:not(:last-child) {
        border-bottom: 1px solid ${formTheme.colors.borderLight};
    }
`;

const TableCell = styled.td`
    padding: ${formTheme.spacing.lg};
    vertical-align: middle;
    font-size: 14px;
    color: ${formTheme.colors.textPrimary};
`;

const EmptyStateCell = styled(TableCell)`
    padding: ${formTheme.spacing.xxl};
    text-align: center;
`;

const EmptyStateContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${formTheme.spacing.lg};
    color: ${formTheme.colors.textTertiary};
`;

const EmptyStateText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${formTheme.spacing.sm};
    text-align: center;
`;

const EmptyStateTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${formTheme.colors.textSecondary};
`;

const EmptyStateSubtitle = styled.div`
    font-size: 14px;
    color: ${formTheme.colors.textTertiary};
    line-height: 1.5;
`;

const ServiceInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${formTheme.spacing.xs};
`;

const ServiceName = styled.div`
    font-weight: 600;
    color: ${formTheme.colors.textPrimary};
    line-height: 1.4;
`;

const ServiceNote = styled.div`
    font-size: 12px;
    color: ${formTheme.colors.textTertiary};
    font-style: italic;
    line-height: 1.3;
    padding: ${formTheme.spacing.xs} ${formTheme.spacing.sm};
    background: ${formTheme.colors.primaryLight};
    border-radius: ${formTheme.borderRadius.sm};
    border-left: 3px solid ${formTheme.colors.primary};
`;

const PriceCell = styled(TableCell)<{ $readOnly?: boolean }>`
    cursor: ${props => props.$readOnly ? 'default' : 'pointer'};
    transition: all 0.2s ease;
    position: relative;

    &:hover {
        background: ${props => props.$readOnly ? 'transparent' : formTheme.colors.primaryGhost};
        border-radius: ${formTheme.borderRadius.sm};
    }
`;

const PriceContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${formTheme.spacing.md};
`;

const PriceInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${formTheme.spacing.xs};
`;

const PriceRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${formTheme.spacing.sm};
`;

const PriceValue = styled.span<{ secondary?: boolean; primary?: boolean }>`
    font-weight: ${props => props.primary ? 700 : props.secondary ? 500 : 600};
    color: ${props =>
    props.primary ? formTheme.colors.primary :
        props.secondary ? formTheme.colors.textSecondary :
            formTheme.colors.textPrimary
};
    font-size: ${props => props.secondary ? '13px' : '14px'};
`;

const PriceLabel = styled.span`
    font-size: 11px;
    color: ${formTheme.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${formTheme.colors.surfaceElevated};
    padding: 2px 6px;
    border-radius: ${formTheme.borderRadius.sm};
`;

const EditIcon = styled.div`
    color: ${formTheme.colors.primary};
    opacity: 1;
    transition: all 0.2s ease;
    font-size: 12px;
`;

const DiscountCell = styled(TableCell)`
    min-width: 280px;
    width: 280px;

    @media (max-width: 1200px) {
        min-width: 250px;
        width: 250px;
    }
`;

const DiscountContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${formTheme.spacing.sm};
`;

const DiscountTypeSelect = styled.select`
    padding: ${formTheme.spacing.sm} ${formTheme.spacing.md};
    border: 1px solid ${formTheme.colors.border};
    border-radius: ${formTheme.borderRadius.md};
    background: ${formTheme.colors.surface};
    color: ${formTheme.colors.textPrimary};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${formTheme.colors.primary};
        box-shadow: ${formTheme.shadows.focus};
    }

    &:hover {
        border-color: ${formTheme.colors.borderHover};
    }
`;

const DiscountInputGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${formTheme.spacing.sm};
`;

const DiscountInput = styled.input`
    width: 80px;
    padding: ${formTheme.spacing.sm};
    border: 1px solid ${formTheme.colors.border};
    border-radius: ${formTheme.borderRadius.sm};
    background: ${formTheme.colors.surface};
    color: ${formTheme.colors.textPrimary};
    font-size: 13px;
    font-weight: 500;
    text-align: right;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${formTheme.colors.primary};
        box-shadow: ${formTheme.shadows.focus};
    }

    &:hover {
        border-color: ${formTheme.colors.borderHover};
    }
`;

const DiscountCalculation = styled.span`
    font-size: 12px;
    color: ${formTheme.colors.textTertiary};
    font-weight: 500;
`;

const ActionButtonsGroup = styled.div`
    display: flex;
    gap: ${formTheme.spacing.sm};
    justify-content: center;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' | 'warning' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: ${formTheme.borderRadius.md};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;

    ${props => {
    switch (props.$variant) {
        case 'danger':
            return `
                    background: ${formTheme.colors.errorLight};
                    color: ${formTheme.colors.error};
                    
                    &:hover {
                        background: ${formTheme.colors.error};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${formTheme.shadows.md};
                    }
                `;
        case 'warning':
            return `
                    background: ${formTheme.colors.warningLight};
                    color: ${formTheme.colors.warning};
                    
                    &:hover {
                        background: ${formTheme.colors.warning};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${formTheme.shadows.md};
                    }
                `;
        case 'primary':
            return `
                    background: ${formTheme.colors.primaryLight};
                    color: ${formTheme.colors.primary};
                    
                    &:hover {
                        background: ${formTheme.colors.primary};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${formTheme.shadows.md};
                    }
                `;
        default:
            return `
                    background: ${formTheme.colors.surfaceElevated};
                    color: ${formTheme.colors.textSecondary};
                    
                    &:hover {
                        background: ${formTheme.colors.surfaceActive};
                        color: ${formTheme.colors.textPrimary};
                        transform: translateY(-1px);
                        box-shadow: ${formTheme.shadows.sm};
                    }
                `;
    }
}}
`;

const TableFooter = styled.tfoot`
    background: linear-gradient(135deg, rgba(26, 54, 93, 0.1) 0%, ${theme.primary} 100%);
    border-top: 2px solid ${formTheme.colors.border};
`;

const FooterCell = styled(TableCell)`
    font-weight: 600;
    background: transparent;
    border-top: 1px solid ${formTheme.colors.border};
`;

const TotalLabel = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${formTheme.colors.textPrimary};
`;

const TotalValue = styled.span<{ secondary?: boolean; primary?: boolean }>`
    font-weight: ${props => props.primary ? 700 : 600};
    color: ${props =>
    props.primary ? formTheme.colors.primary :
        props.secondary ? formTheme.colors.textSecondary :
            formTheme.colors.textPrimary
};
    font-size: ${props => props.primary ? '16px' : props.secondary ? '13px' : '14px'};
`;

const ContextMenu = styled.div`
    background: ${formTheme.colors.surface};
    border: 1px solid ${formTheme.colors.border};
    border-radius: ${formTheme.borderRadius.md};
    box-shadow: ${formTheme.shadows.lg};
    z-index: 1000;
    overflow: hidden;
    min-width: 200px;
`;

const MenuItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${formTheme.spacing.md};
    padding: ${formTheme.spacing.md} ${formTheme.spacing.lg};
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: ${formTheme.colors.textPrimary};
    transition: all 0.2s ease;

    &:hover {
        background: ${formTheme.colors.surfaceHover};
        color: ${formTheme.colors.primary};
    }

    svg {
        font-size: 12px;
    }
`;

const EditPricePopup = styled.div`
    background: ${formTheme.colors.surface};
    border: 1px solid ${formTheme.colors.border};
    border-radius: ${formTheme.borderRadius.lg};
    box-shadow: ${formTheme.shadows.lg};
    z-index: 1000;
    width: 320px;
    overflow: hidden;
`;

const PopupHeader = styled.div`
    padding: ${formTheme.spacing.lg} ${formTheme.spacing.lg} 0;
    border-bottom: 1px solid ${formTheme.colors.borderLight};
`;

const PopupTitle = styled.h3`
    margin: 0 0 ${formTheme.spacing.md} 0;
    font-size: 16px;
    font-weight: 600;
    color: ${formTheme.colors.textPrimary};
`;

const PopupContent = styled.div`
    padding: ${formTheme.spacing.lg};
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${formTheme.spacing.sm};
    margin-bottom: ${formTheme.spacing.lg};

    &:last-child {
        margin-bottom: 0;
    }
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${formTheme.colors.textPrimary};
`;

const PriceTypeSelect = styled.select`
    padding: ${formTheme.spacing.md};
    border: 1px solid ${formTheme.colors.border};
    border-radius: ${formTheme.borderRadius.md};
    background: ${formTheme.colors.surface};
    color: ${formTheme.colors.textPrimary};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${formTheme.colors.primary};
        box-shadow: ${formTheme.shadows.focus};
    }
`;

const PriceInput = styled.input`
    padding: ${formTheme.spacing.md};
    border: 1px solid ${formTheme.colors.border};
    border-radius: ${formTheme.borderRadius.md};
    background: ${formTheme.colors.surface};
    color: ${formTheme.colors.textPrimary};
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${formTheme.colors.primary};
        box-shadow: ${formTheme.shadows.focus};
    }

    &::placeholder {
        color: ${formTheme.colors.textTertiary};
        font-weight: 400;
    }
`;

const PopupActions = styled.div`
    display: flex;
    gap: ${formTheme.spacing.md};
    justify-content: flex-end;
    padding: ${formTheme.spacing.lg};
    border-top: 1px solid ${formTheme.colors.borderLight};
    background: ${formTheme.colors.surfaceElevated};
`;

const Button = styled.button<{ $primary?: boolean }>`
    padding: ${formTheme.spacing.sm} ${formTheme.spacing.lg};
    border: 1px solid ${props => props.$primary ? formTheme.colors.primary : formTheme.colors.border};
    border-radius: ${formTheme.borderRadius.md};
    background: ${props => props.$primary ? formTheme.colors.primary : formTheme.colors.surface};
    color: ${props => props.$primary ? 'white' : formTheme.colors.textPrimary};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$primary ? formTheme.colors.primaryHover : formTheme.colors.surfaceHover};
        transform: translateY(-1px);
        box-shadow: ${formTheme.shadows.sm};
    }

    &:active {
        transform: translateY(0);
    }
`;