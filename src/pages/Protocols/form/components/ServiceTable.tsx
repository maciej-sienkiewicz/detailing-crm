import React, { useState } from 'react';
import { FaTrash, FaPlus, FaEdit, FaStickyNote } from 'react-icons/fa';
import { DiscountType, DiscountTypeLabels, SelectedService } from '../../../../types';
import {
    ServicesTableContainer,
    ServicesTable as Table,
    TableHeader,
    TableCell,
    TableFooterCell,
    DiscountContainer,
    DiscountInputGroup,
    DiscountInput,
    DiscountTypeSelect,
    DiscountPercentage,
    ActionButton,
    AddItemRow,
    TotalAmount,
    TotalValue
} from '../styles';
import styled from 'styled-components';
import ServiceNoteModal from "../../shared/modals/SerivceNoteModal";

// Styl dla menu kontekstowego
const ContextMenu = styled.div`
    position: absolute;
    z-index: 100;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 5px 0;
    min-width: 150px;
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

// Nowy komponent dla pola ilości
const QuantityInput = styled.input`
    width: 60px;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    text-align: center;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    &[type=number] {
        -moz-appearance: textfield;
    }

    @media (max-width: 768px) {
        width: 50px;
        padding: 4px 6px;
    }
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

// Nowy komponent dla komórki z rabatem
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

const EditPriceButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
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
    flex-direction: column;
    width: 100%;
`;

// Kontener dla przycisków akcji
const ActionButtonsContainer = styled.div`
    display: flex;
    gap: 5px;
`;

// Rozszerzenie interfejsu SelectedService o pole note
interface ServiceWithNote extends SelectedService {
    note?: string;
}

interface ServiceTableProps {
    services: ServiceWithNote[];
    onRemoveService: (serviceId: string) => void;
    onDiscountTypeChange: (serviceId: string, discountType: DiscountType) => void;
    onDiscountValueChange: (serviceId: string, discountValue: number) => void;
    onBasePriceChange: (serviceId: string, newPrice: number) => void;
    onQuantityChange: (serviceId: string, quantity: number) => void;  // Nowa funkcja do obsługi zmiany ilości
    onAddNote?: (serviceId: string, note: string) => void;
    calculateTotals: () => { totalPrice: number; totalDiscount: number; totalFinalPrice: number };
}

const ServiceTable: React.FC<ServiceTableProps> = ({
                                                       services,
                                                       onRemoveService,
                                                       onDiscountTypeChange,
                                                       onDiscountValueChange,
                                                       onBasePriceChange,
                                                       onQuantityChange,  // Nowy prop
                                                       onAddNote,
                                                       calculateTotals
                                                   }) => {
    const { totalPrice, totalDiscount, totalFinalPrice } = calculateTotals();

    // State dla menu kontekstowego
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

    // State dla wyskakującego okna edycji
    const [editPopup, setEditPopup] = useState<{
        visible: boolean;
        x: number;
        y: number;
        serviceId: string;
        currentPrice: number;
    }>({
        visible: false,
        x: 0,
        y: 0,
        serviceId: '',
        currentPrice: 0
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

    // Obsługa kliknięcia prawym przyciskiem na cenę
    const handlePriceRightClick = (e: React.MouseEvent, service: ServiceWithNote) => {
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
                currentPrice: service.price
            });

            setNewPrice(service.price.toString());
        }
    };

    // Zapisz nową cenę
    const handleSavePrice = () => {
        // Konwertuj string na liczbę, ale tylko jeśli nie jest pusty
        const parsedPrice = newPrice.trim() === '' ? 0 : parseFloat(newPrice);

        if (!isNaN(parsedPrice) && parsedPrice >= 0) {
            onBasePriceChange(editPopup.serviceId, parsedPrice);
        }

        setEditPopup({...editPopup, visible: false});
    };

    // Obsługa zmiany ilości
    const handleQuantityChange = (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);

        // Minimalna ilość to 1
        const quantity = isNaN(value) || value < 1 ? 1 : value;

        onQuantityChange(serviceId, quantity);
    };

    // Otwórz modal dodawania/edycji notatki
    const handleOpenNoteModal = (service: ServiceWithNote) => {
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

    return (
        <ServicesTableContainer>
            <Table>
                <thead>
                <tr>
                    <TableHeader>Nazwa</TableHeader>
                    <TableHeader>Cena bazowa</TableHeader>
                    <TableHeader>Ilość</TableHeader> {/* Nowa kolumna */}
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
                    services.map(service => (
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
                                        currentPrice: service.price
                                    });
                                    setNewPrice(service.price.toString());
                                }}
                            >
                                <PriceContainer>
                                    <PriceValue>
                                        {service.price.toFixed(2)} zł
                                    </PriceValue>
                                    <EditIcon>
                                        <FaEdit />
                                    </EditIcon>
                                </PriceContainer>
                            </EditablePriceCell>
                            {/* Nowa kolumna z polem do wprowadzania ilości */}
                            <TableCell>
                                <QuantityInput
                                    type="number"
                                    min="1"
                                    value={service.quantity || 1}
                                    onChange={(e) => handleQuantityChange(service.id, e)}
                                />
                            </TableCell>
                            <DiscountCell>
                                <DiscountCellContent>
                                    <StyledDiscountContainer>
                                        <DiscountInputGroup>
                                            <DiscountTypeSelect
                                                value={service.discountType}
                                                onChange={(e) => onDiscountTypeChange(service.id, e.target.value as DiscountType)}
                                            >
                                                {Object.entries(DiscountTypeLabels).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </DiscountTypeSelect>
                                            <DiscountInput
                                                type="number"
                                                min="0"
                                                max={service.discountType === DiscountType.PERCENTAGE ? 100 : undefined}
                                                value={service.discountValue}
                                                onChange={(e) => onDiscountValueChange(service.id, parseFloat(e.target.value) || 0)}
                                            />
                                        </DiscountInputGroup>
                                        {service.discountType === DiscountType.PERCENTAGE && (
                                            <DiscountPercentage>
                                                ({(service.price * service.quantity * service.discountValue / 100).toFixed(2)} zł)
                                            </DiscountPercentage>
                                        )}
                                    </StyledDiscountContainer>
                                </DiscountCellContent>
                            </DiscountCell>
                            <TableCell>
                                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                    {service.finalPrice.toFixed(2)} zł
                                </div>
                            </TableCell>
                            <TableCell>
                                <ActionButtonsContainer>
                                    <ActionButton
                                        type="button"
                                        onClick={() => handleOpenNoteModal(service)}
                                        title="Dodaj notatkę"
                                        note={!!service.note}
                                    >
                                        <FaStickyNote />
                                    </ActionButton>
                                    <ActionButton
                                        type="button"
                                        onClick={() => onRemoveService(service.id)}
                                        title="Usuń usługę"
                                        danger
                                    >
                                        <FaTrash />
                                    </ActionButton>
                                </ActionButtonsContainer>
                            </TableCell>
                        </tr>
                    ))
                )}
                </tbody>
                <tfoot>
                <tr>
                    <TableFooterCell>Suma:</TableFooterCell>
                    <TableFooterCell colSpan={2}>{totalPrice.toFixed(2)} zł</TableFooterCell>
                    <TableFooterCell>
                        {totalDiscount.toFixed(2)} zł
                    </TableFooterCell>
                    <TableFooterCell>{totalFinalPrice.toFixed(2)} zł</TableFooterCell>
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
                            placeholder="Wprowadź nową cenę"
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