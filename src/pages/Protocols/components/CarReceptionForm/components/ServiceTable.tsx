import React, { useState } from 'react';
import { FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import { DiscountType, DiscountTypeLabels, SelectedService } from '../../../../../types';
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
} from '../styles/styles';

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

// Import styled
import styled from 'styled-components';

interface ServiceTableProps {
    services: SelectedService[];
    onRemoveService: (serviceId: string) => void;
    onDiscountTypeChange: (serviceId: string, discountType: DiscountType) => void;
    onDiscountValueChange: (serviceId: string, discountValue: number) => void;
    onBasePriceChange: (serviceId: string, newPrice: number) => void;
    calculateTotals: () => { totalPrice: number; totalDiscount: number; totalFinalPrice: number };
}

const ServiceTable: React.FC<ServiceTableProps> = ({
                                                       services,
                                                       onRemoveService,
                                                       onDiscountTypeChange,
                                                       onDiscountValueChange,
                                                       onBasePriceChange,
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

    // State do przechowywania nowej ceny jako string, aby uniknąć problemów z zerami wiodącymi
    const [newPrice, setNewPrice] = useState<string>('');

    // Obsługa kliknięcia prawym przyciskiem na cenę
    const handlePriceRightClick = (e: React.MouseEvent, service: SelectedService) => {
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

            setNewPrice(service.price);
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
                    <TableHeader>Rabat</TableHeader>
                    <TableHeader>Cena końcowa</TableHeader>
                    <TableHeader>Akcje</TableHeader>
                </tr>
                </thead>
                <tbody>
                {services.length === 0 ? (
                    <tr>
                        <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                            Brak wybranych usług. Użyj pola wyszukiwania, aby dodać usługi.
                        </TableCell>
                    </tr>
                ) : (
                    services.map(service => (
                        <tr key={service.id}>
                            <TableCell>{service.name}</TableCell>
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
                            <TableCell>
                                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                    <DiscountContainer>
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
                                                ({(service.price * service.discountValue / 100).toFixed(2)} zł)
                                            </DiscountPercentage>
                                        )}
                                    </DiscountContainer>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                    {service.finalPrice.toFixed(2)} zł
                                </div>
                            </TableCell>
                            <TableCell>
                                <ActionButton
                                    type="button"
                                    onClick={() => onRemoveService(service.id)}
                                    title="Usuń usługę"
                                >
                                    <FaTrash />
                                </ActionButton>
                            </TableCell>
                        </tr>
                    ))
                )}
                </tbody>
                <tfoot>
                <tr>
                    <TableFooterCell>Suma:</TableFooterCell>
                    <TableFooterCell>{totalPrice.toFixed(2)} zł</TableFooterCell>
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
        </ServicesTableContainer>
    );
};

export default ServiceTable;