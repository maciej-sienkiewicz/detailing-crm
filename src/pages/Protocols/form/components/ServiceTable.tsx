import React, { useState } from 'react';
import { FaTrash, FaPlus, FaEdit, FaStickyNote } from 'react-icons/fa';
import { DiscountType, DiscountTypeLabels, SelectedService } from '../../../../types';
import {
    ServicesTableContainer,
    ServicesTable as Table,
    TableHeader,
    TableCell,
    TableFooterCell,
    ActionButton,
    AddItemRow,
    TotalAmount,
    TotalValue
} from '../styles';
import styled from 'styled-components';
import ServiceNoteModal from "../../shared/modals/SerivceNoteModal";

// Rozszerzone typy rabatu - zamieniamy na enum dla zgodności
enum ExtendedDiscountType {
    PERCENTAGE = 'PERCENTAGE',
    AMOUNT_GROSS = 'AMOUNT_GROSS',
    AMOUNT_NET = 'AMOUNT_NET',
    FIXED_PRICE_GROSS = 'FIXED_PRICE_GROSS',
    FIXED_PRICE_NET = 'FIXED_PRICE_NET'
}

// Nowe wersje etykiet rabatu uwzględniające ceny netto/brutto
const DiscountTypeLabelsExtended: Record<ExtendedDiscountType, string> = {
    [ExtendedDiscountType.PERCENTAGE]: "Procent",
    [ExtendedDiscountType.AMOUNT_GROSS]: "Kwota (brutto)",
    [ExtendedDiscountType.AMOUNT_NET]: "Kwota (netto)",
    [ExtendedDiscountType.FIXED_PRICE_GROSS]: "Cena końcowa (brutto)",
    [ExtendedDiscountType.FIXED_PRICE_NET]: "Cena końcowa (netto)"
};

// Funkcja do mapowania typów rabatu
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

// Mapowanie standardowego typu rabatu na rozszerzony typ
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

// Stałe
const DEFAULT_VAT_RATE = 23; // Domyślna stawka VAT (23%)

// Styl dla menu kontekstowego
const ContextMenu = styled.div`
    position: absolute;
    z-index: 100;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 5px 0;
    min-width: 200px;
`;

const MenuItem = styled.div`
    padding: 8px 15px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background-color: #f5f5f5;
    }
`;

// Styl dla komórki tabeli z ceną bazową (edytowalna)
const EditablePriceCell = styled(TableCell)`
    cursor: pointer;
    position: relative;
    height: 100%;

    &:hover {
        background-color: #f5f5f5;
    }
`;

const PriceContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
`;

const PriceValue = styled.span`
    flex: 1;
`;

const EditIcon = styled.span`
    font-size: 14px;
    color: #3498db;
    margin-left: 10px;
    display: flex;
    align-items: center;
`;

// Styl dla komórki z rabatem
const DiscountCell = styled(TableCell)`
    min-width: 220px;
    width: 220px;

    @media (max-width: 768px) {
        min-width: 180px;
        width: 180px;
    }

    @media (max-width: 576px) {
        min-width: 160px;
        width: 160px;
    }

    @media (max-width: 480px) {
        min-width: 140px;
        width: 100%;
    }
`;

// Komponenty dla wartości ceny brutto/netto
const PriceWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const PriceType = styled.div`
    font-size: 11px;
    color: #7f8c8d;
    margin-top: 2px;
`;

// Rozszerzamy tablicę usług o dodatkowe pola
interface ServiceExtended extends SelectedService {
    note?: string;
    extendedDiscountType?: ExtendedDiscountType;
}

// Styl dla okna edycji
const EditPricePopup = styled.div`
    position: absolute;
    z-index: 100;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 15px;
    width: 300px;
`;

const PopupTitle = styled.div`
    font-weight: 500;
    font-size: 15px;
    margin-bottom: 10px;
    color: #34495e;
`;

const EditPriceForm = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const EditPriceInput = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

// Selektor typu ceny (brutto/netto)
const PriceTypeSelect = styled.select`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
`;

const EditPriceButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
`;

const Button = styled.button<{ primary?: boolean }>`
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    ${props => props.primary ? `
        background-color: #3498db;
        color: white;
        border: none;
        
        &:hover {
            background-color: #2980b9;
        }
    ` : `
        background-color: white;
        color: #333;
        border: 1px solid #ddd;
        
        &:hover {
            background-color: #f5f5f5;
        }
    `}
`;

// Nowy komponent dla zawartości komórki rabatu
const DiscountCellContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
`;

// Zaktualizowany komponent DiscountContainer
const StyledDiscountContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
`;

// Komponenty związane z rabatem
const DiscountContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const DiscountTypeSelect = styled.select`
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    height: 38px;
`;

const DiscountInputGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const DiscountInput = styled.input`
    width: 80px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    text-align: right;
`;

const DiscountPercentage = styled.span`
    font-size: 12px;
    color: #7f8c8d;
`;

// Kontener dla przycisków akcji
const ActionButtonsContainer = styled.div`
    display: flex;
    gap: 5px;
`;

// Nowy komponent dla notatki
const ServiceNote = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 4px;
    font-style: italic;
    line-height: 1.4;
    padding-top: 4px;
    border-top: 1px dashed #eee;
    word-break: break-word;
`;

// Kontener dla nazwy usługi i notatki
const ServiceNameContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const ServiceName = styled.div`
    font-weight: normal;
    color: #34495e;
`;

// Funkcje pomocnicze dla obliczeń kwot brutto/netto
const calculateNetPrice = (grossPrice: number, vatRate: number = DEFAULT_VAT_RATE): number => {
    return grossPrice / (1 + vatRate / 100);
};

const calculateGrossPrice = (netPrice: number, vatRate: number = DEFAULT_VAT_RATE): number => {
    return netPrice * (1 + vatRate / 100);
};

interface ServiceTableProps {
    services: ServiceExtended[];
    onRemoveService: (serviceId: string) => void;
    onDiscountTypeChange: (serviceId: string, discountType: DiscountType) => void;
    onDiscountValueChange: (serviceId: string, discountValue: number) => void;
    onBasePriceChange: (serviceId: string, newPrice: number) => void;
    onAddNote?: (serviceId: string, note: string) => void;
    calculateTotals: () => { totalPrice: number; totalDiscount: number; totalFinalPrice: number };
}

const ServiceTable: React.FC<ServiceTableProps> = ({
                                                       services,
                                                       onRemoveService,
                                                       onDiscountTypeChange,
                                                       onDiscountValueChange,
                                                       onBasePriceChange,
                                                       onAddNote,
                                                       calculateTotals
                                                   }) => {
    const { totalPrice, totalDiscount, totalFinalPrice } = calculateTotals();

    // Stan dla menu kontekstowego
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

    // Stan do przechowywania rozszerzonych typów rabatów dla każdej usługi
    const [extendedDiscountTypes, setExtendedDiscountTypes] = useState<Record<string, ExtendedDiscountType>>({});

    // State dla wyskakującego okna edycji
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

    // State dla modalu notatki
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

    // State do przechowywania nowej ceny jako string, aby uniknąć problemów z zerami wiodącymi
    const [newPrice, setNewPrice] = useState<string>('');

    // Inicjalizuj rozszerzone typy rabatów dla usług, które ich nie mają
    React.useEffect(() => {
        const updatedTypes: Record<string, ExtendedDiscountType> = {...extendedDiscountTypes};
        let hasUpdates = false;

        services.forEach(service => {
            if (!extendedDiscountTypes[service.id]) {
                updatedTypes[service.id] = service.extendedDiscountType ||
                    mapFromStandardDiscountType(service.discountType);
                hasUpdates = true;
            }
        });

        if (hasUpdates) {
            setExtendedDiscountTypes(updatedTypes);
        }
    }, [services]);

    // Obsługa kliknięcia prawym przyciskiem na cenę
    const handlePriceRightClick = (e: React.MouseEvent, service: ServiceExtended) => {
        e.preventDefault(); // Zapobiegaj domyślnemu menu kontekstowemu przeglądarki

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            serviceId: service.id
        });
    };

    // Obsługa kliknięcia na opcję edycji w menu kontekstowym
    const handleEditPrice = () => {
        // Znajdź usługę, której cena ma być edytowana
        const service = services.find(s => s.id === contextMenu.serviceId);
        if (!service) return;

        // Ukryj menu kontekstowe
        setContextMenu({...contextMenu, visible: false});

        // Pokaż okno edycji ceny
        const rect = document.getElementById(`price-${service.id}`)?.getBoundingClientRect();

        if (rect) {
            setEditPopup({
                visible: true,
                x: rect.left,
                y: rect.bottom + window.scrollY,
                serviceId: service.id,
                currentPrice: service.price,
                isPriceGross: true // Domyślnie edytujemy cenę brutto
            });

            setNewPrice(service.price.toString());
        }
    };

    // Zapisz nową cenę
    const handleSavePrice = () => {
        // Konwertuj string na liczbę, ale tylko jeśli nie jest pusty
        const parsedPrice = newPrice.trim() === '' ? 0 : parseFloat(newPrice);

        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return; // Nie zapisuj nieprawidłowej ceny
        }

        // Jeśli cena jest netto, przelicz ją na brutto przed zapisaniem
        const finalPrice = editPopup.isPriceGross
            ? parsedPrice
            : calculateGrossPrice(parsedPrice);

        onBasePriceChange(editPopup.serviceId, finalPrice);
        setEditPopup({...editPopup, visible: false});
    };

    // Zmiana typu ceny (brutto/netto) w oknie edycji
    const handlePriceTypeChange = (isPriceGross: boolean) => {
        // Przelicz wartość w polu, jeśli jest liczbą
        const parsedPrice = parseFloat(newPrice);
        if (!isNaN(parsedPrice)) {
            if (editPopup.isPriceGross && !isPriceGross) {
                // Zmiana z brutto na netto
                setNewPrice(calculateNetPrice(parsedPrice).toFixed(2));
            } else if (!editPopup.isPriceGross && isPriceGross) {
                // Zmiana z netto na brutto
                setNewPrice(calculateGrossPrice(parsedPrice).toFixed(2));
            }
        }

        setEditPopup({...editPopup, isPriceGross});
    };

    // Obsługa zmiany rozszerzonego typu rabatu
    const handleExtendedDiscountTypeChange = (serviceId: string, newExtendedType: ExtendedDiscountType) => {
        const standardType = mapToStandardDiscountType(newExtendedType);

        // Aktualizuj stan lokalny
        setExtendedDiscountTypes({
            ...extendedDiscountTypes,
            [serviceId]: newExtendedType
        });

        // Wywołaj funkcję do aktualizacji rabatu w głównym komponencie
        onDiscountTypeChange(serviceId, standardType);
    };

    // Funkcja pomocnicza do określania wartości rabatu do wyświetlenia
    const getDiscountDisplayValue = (service: ServiceExtended, extendedType: ExtendedDiscountType): string => {
        if (service.discountType === DiscountType.PERCENTAGE) {
            return `${service.discountValue}%`;
        } else if (service.discountType === DiscountType.AMOUNT) {
            // Dla kwotowego, sprawdź czy to brutto czy netto
            if (extendedType === ExtendedDiscountType.AMOUNT_NET) {
                return `${service.discountValue.toFixed(2)} zł (netto)`;
            } else {
                return `${service.discountValue.toFixed(2)} zł (brutto)`;
            }
        } else if (service.discountType === DiscountType.FIXED_PRICE) {
            // Dla ceny finalnej, sprawdź czy to brutto czy netto
            if (extendedType === ExtendedDiscountType.FIXED_PRICE_NET) {
                return `${service.discountValue.toFixed(2)} zł (netto)`;
            } else {
                return `${service.discountValue.toFixed(2)} zł (brutto)`;
            }
        }
        return `${service.discountValue}`;
    };

    // Otwórz modal dodawania/edycji notatki
    const handleOpenNoteModal = (service: ServiceExtended) => {
        setNoteModal({
            visible: true,
            serviceId: service.id,
            serviceName: service.name,
            currentNote: service.note || ''
        });
    };

    // Zapisz notatkę
    const handleSaveNote = (note: string) => {
        if (onAddNote && noteModal.serviceId) {
            onAddNote(noteModal.serviceId, note);
        }
        setNoteModal({...noteModal, visible: false});
    };

    // Zamknij menu kontekstowe przy kliknięciu na stronę
    React.useEffect(() => {
        const handleClickOutside = () => {
            setContextMenu({...contextMenu, visible: false});
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [contextMenu]);

    // Zamknij okno edycji przy kliknięciu Escape
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEditPopup({...editPopup, visible: false});
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [editPopup]);

    // Oblicz sumę netto
    const calculateTotalNet = () => {
        return calculateNetPrice(totalPrice);
    };

    const calculateFinalTotalNet = () => {
        return calculateNetPrice(totalFinalPrice);
    };

    return (
        <ServicesTableContainer>
            <Table>
                <thead>
                <tr>
                    <TableHeader>Nazwa</TableHeader>
                    <TableHeader>Cena bazowa</TableHeader>
                    <TableHeader>Rabat</TableHeader>
                    <TableHeader>Cena końcowa</TableHeader>
                    <TableHeader>Akcje</TableHeader>
                </tr>
                </thead>
                <tbody>
                {services.length === 0 ? (
                    <tr>
                        <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                            Brak wybranych usług. Użyj pola wyszukiwania, aby dodać usługi.
                        </TableCell>
                    </tr>
                ) : (
                    services.map(service => {
                        // Pobierz rozszerzony typ rabatu dla usługi
                        const extendedType = extendedDiscountTypes[service.id] ||
                            mapFromStandardDiscountType(service.discountType);

                        return (
                            <tr key={service.id}>
                                <TableCell>
                                    <ServiceNameContainer>
                                        <ServiceName>{service.name}</ServiceName>
                                        {service.note && (
                                            <ServiceNote>{service.note}</ServiceNote>
                                        )}
                                    </ServiceNameContainer>
                                </TableCell>
                                <EditablePriceCell
                                    id={`price-${service.id}`}
                                    onContextMenu={(e) => handlePriceRightClick(e, service)}
                                    onClick={(e) => {
                                        // Otwórz okno edycji również po lewym kliknięciu dla lepszej dostępności
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setEditPopup({
                                            visible: true,
                                            x: rect.left,
                                            y: rect.bottom + window.scrollY,
                                            serviceId: service.id,
                                            currentPrice: service.price,
                                            isPriceGross: true
                                        });
                                        setNewPrice(service.price.toString());
                                    }}
                                >
                                    <PriceContainer>
                                        <PriceWrapper>
                                            <PriceValue>{service.price.toFixed(2)} zł</PriceValue>
                                            <PriceType>brutto</PriceType>
                                            <PriceValue>{calculateNetPrice(service.price).toFixed(2)} zł</PriceValue>
                                            <PriceType>netto</PriceType>
                                        </PriceWrapper>
                                        <EditIcon>
                                            <FaEdit />
                                        </EditIcon>
                                    </PriceContainer>
                                </EditablePriceCell>
                                <DiscountCell>
                                    <DiscountCellContent>
                                        <StyledDiscountContainer>
                                            <DiscountTypeSelect
                                                value={extendedType}
                                                onChange={(e) => handleExtendedDiscountTypeChange(
                                                    service.id,
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
                                                    max={service.discountType === DiscountType.PERCENTAGE ? 100 : undefined}
                                                    value={service.discountValue}
                                                    onChange={(e) => onDiscountValueChange(
                                                        service.id,
                                                        parseFloat(e.target.value) || 0
                                                    )}
                                                />
                                                {service.discountType === DiscountType.PERCENTAGE && (
                                                    <DiscountPercentage>
                                                        ({(service.price * service.discountValue / 100).toFixed(2)} zł)
                                                    </DiscountPercentage>
                                                )}
                                            </DiscountInputGroup>
                                        </StyledDiscountContainer>
                                    </DiscountCellContent>
                                </DiscountCell>
                                <TableCell>
                                    <PriceWrapper>
                                        <PriceValue>{service.finalPrice.toFixed(2)} zł</PriceValue>
                                        <PriceType>brutto</PriceType>
                                        <PriceValue>{calculateNetPrice(service.finalPrice).toFixed(2)} zł</PriceValue>
                                        <PriceType>netto</PriceType>
                                    </PriceWrapper>
                                </TableCell>
                                <TableCell>
                                    <ActionButtonsContainer>
                                        <ActionButton
                                            onClick={() => handleOpenNoteModal(service)}
                                            title="Dodaj notatkę"
                                            note={!!service.note}
                                        >
                                            <FaStickyNote />
                                        </ActionButton>
                                        <ActionButton
                                            onClick={() => onRemoveService(service.id)}
                                            title="Usuń usługę"
                                            danger
                                        >
                                            <FaTrash />
                                        </ActionButton>
                                    </ActionButtonsContainer>
                                </TableCell>
                            </tr>
                        );
                    })
                )}
                </tbody>
                <tfoot>
                <tr>
                    <TableFooterCell>Suma:</TableFooterCell>
                    <TableFooterCell>
                        <PriceWrapper>
                            <TotalValue>{totalPrice.toFixed(2)} zł</TotalValue>
                            <PriceType>brutto</PriceType>
                            <TotalValue>{calculateTotalNet().toFixed(2)} zł</TotalValue>
                            <PriceType>netto</PriceType>
                        </PriceWrapper>
                    </TableFooterCell>
                    <TableFooterCell>
                        <TotalValue>{totalDiscount.toFixed(2)} zł</TotalValue>
                    </TableFooterCell>
                    <TableFooterCell>
                        <PriceWrapper>
                            <TotalValue>{totalFinalPrice.toFixed(2)} zł</TotalValue>
                            <PriceType>brutto</PriceType>
                            <TotalValue>{calculateFinalTotalNet().toFixed(2)} zł</TotalValue>
                            <PriceType>netto</PriceType>
                        </PriceWrapper>
                    </TableFooterCell>
                    <TableFooterCell></TableFooterCell>
                </tr>
                </tfoot>
            </Table>

            {/* Menu kontekstowe */}
            {contextMenu.visible && (
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

            {/* Okno edycji ceny */}
            {editPopup.visible && (
                <EditPricePopup
                    style={{
                        position: 'absolute',
                        top: editPopup.y,
                        left: editPopup.x
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <PopupTitle>Edytuj cenę bazową</PopupTitle>
                    <EditPriceForm>
                        <PriceTypeSelect
                            value={editPopup.isPriceGross ? "gross" : "net"}
                            onChange={(e) => handlePriceTypeChange(e.target.value === "gross")}
                        >
                            <option value="gross">Cena brutto</option>
                            <option value="net">Cena netto</option>
                        </PriceTypeSelect>
                        <EditPriceInput
                            type="text"
                            value={newPrice}
                            onChange={(e) => {
                                // Pozwól na wprowadzanie tylko cyfr i kropki/przecinka
                                const value = e.target.value;
                                if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
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
                        <EditPriceButtons>
                            <Button onClick={() => setEditPopup({...editPopup, visible: false})}>
                                Anuluj
                            </Button>
                            <Button primary onClick={handleSavePrice}>
                                Zapisz
                            </Button>
                        </EditPriceButtons>
                    </EditPriceForm>
                </EditPricePopup>
            )}

            {/* Modal notatki */}
            <ServiceNoteModal
                isOpen={noteModal.visible}
                onClose={() => setNoteModal({...noteModal, visible: false})}
                onSave={handleSaveNote}
                serviceName={noteModal.serviceName}
                initialNote={noteModal.currentNote}
            />
        </ServicesTableContainer>
    );
};

export default ServiceTable;