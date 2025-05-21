import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCheck, FaPlus, FaPencilAlt, FaTrash, FaLayerGroup } from 'react-icons/fa';
import {SelectedService} from "../../../../types";

interface InvoiceItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (items: SelectedService[]) => void;
    services: SelectedService[];
}

const InvoiceItemsModal: React.FC<InvoiceItemsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    services
}) => {
    const [editedServices, setEditedServices] = useState<SelectedService[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');

    // Inicjalizacja stanu po otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            // Tworzymy głęboką kopię usług, aby ich nie modyfikować bezpośrednio
            setEditedServices(
                services.map(service => ({
                    ...service,
                    originalName: service.name, // Zachowujemy oryginalną nazwę do przywrócenia
                    originalPrice: service.price, // Zachowujemy oryginalną cenę do przywrócenia
                    originalFinalPrice: service.finalPrice // Zachowujemy oryginalną cenę końcową do przywrócenia
                }))
            );
            setIsEditing(null);
        }
    }, [isOpen, services]);

    // Rozpocznij edycję pozycji
    const handleStartEdit = (index: number) => {
        const service = editedServices[index];
        setIsEditing(index);
        setEditName(service.name);
        setEditPrice(service.finalPrice.toString());
    };

    // Zapisz edytowaną pozycję
    const handleSaveEdit = () => {
        if (isEditing === null) return;

        const parsedPrice = parseFloat(editPrice);
        if (isNaN(parsedPrice) || parsedPrice <= 0) return;

        const updatedServices = [...editedServices];
        updatedServices[isEditing] = {
            ...updatedServices[isEditing],
            name: editName,
            finalPrice: parsedPrice,
            // Aktualizujemy także price, aby utrzymać spójność danych
            price: parsedPrice
        };

        setEditedServices(updatedServices);
        setIsEditing(null);
    };

    // Anuluj edycję
    const handleCancelEdit = () => {
        setIsEditing(null);
    };

    // Usuń pozycję
    const handleRemoveItem = (index: number) => {
        const updatedServices = [...editedServices];
        updatedServices.splice(index, 1);
        setEditedServices(updatedServices);
    };

    // Połącz wszystkie pozycje w jedną
    const handleMergeAll = () => {
        // Obliczamy sumę wszystkich cen końcowych
        const totalPrice = editedServices.reduce(
            (sum, service) => sum + service.finalPrice, 0
        );

        // Tworzymy nową usługę z sumą wszystkich
        const mergedService: SelectedService = {
            id: `merged_${Date.now()}`,
            name: 'Usługi detailingowe', // Domyślna nazwa dla połączonych usług
            price: totalPrice,
            discountType: 'PERCENTAGE',
            discountValue: 0,
            finalPrice: totalPrice,
            // Możemy dodać notatkę o tym, które usługi zostały połączone
            note: `Połączone usługi: ${editedServices.map(s => s.name).join(', ')}`
        };

        setEditedServices([mergedService]);
    };

    // Zapisz zmiany i zamknij modal
    const handleSave = () => {
        onSave(editedServices);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>Edytuj pozycje faktury</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>
                <ModalBody>
                    <InfoMessage>
                        Możesz edytować nazwy i ceny poszczególnych usług, które pojawią się na fakturze, lub połączyć wszystkie usługi w jedną pozycję.
                    </InfoMessage>

                    <MergeAllButton onClick={handleMergeAll}>
                        <FaLayerGroup /> Połącz w jedną pozycję
                    </MergeAllButton>

                    <ServicesTable>
                        <TableHeader>
                            <HeaderCell>Nazwa usługi</HeaderCell>
                            <HeaderCell>Cena końcowa (brutto)</HeaderCell>
                            <HeaderCell>Akcje</HeaderCell>
                        </TableHeader>

                        <TableBody>
                            {editedServices.length === 0 ? (
                                <EmptyRow>
                                    <EmptyCell colSpan={3}>Brak usług do wyświetlenia</EmptyCell>
                                </EmptyRow>
                            ) : (
                                editedServices.map((service, index) => (
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
                                                    <EditInput
                                                        type="number"
                                                        value={editPrice}
                                                        onChange={(e) => setEditPrice(e.target.value)}
                                                        placeholder="Cena"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <ActionButtons>
                                                        <ActionButton onClick={handleSaveEdit} title="Zapisz">
                                                            <FaCheck />
                                                        </ActionButton>
                                                        <ActionButton onClick={handleCancelEdit} title="Anuluj" danger>
                                                            <FaTimes />
                                                        </ActionButton>
                                                    </ActionButtons>
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell>{service.name}</TableCell>
                                                <TableCell>{service.finalPrice.toFixed(2)} zł</TableCell>
                                                <TableCell>
                                                    <ActionButtons>
                                                        <ActionButton onClick={() => handleStartEdit(index)} title="Edytuj">
                                                            <FaPencilAlt />
                                                        </ActionButton>
                                                        <ActionButton onClick={() => handleRemoveItem(index)} title="Usuń" danger>
                                                            <FaTrash />
                                                        </ActionButton>
                                                    </ActionButtons>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </ServicesTable>

                    <TotalSummary>
                        <TotalLabel>Suma brutto:</TotalLabel>
                        <TotalValue>
                            {editedServices.reduce((sum, service) => sum + service.finalPrice, 0).toFixed(2)} zł
                        </TotalValue>
                    </TotalSummary>
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={onClose}>
                        Anuluj
                    </CancelButton>
                    <SaveButton onClick={handleSave} disabled={editedServices.length === 0}>
                        <FaCheck /> Zastosuj zmiany
                    </SaveButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled components
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100; /* Wyższy z-index niż poprzedni modal */
`;

const ModalContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 750px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 1101;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    color: #34495e;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #7f8c8d;
    
    &:hover {
        color: #34495e;
    }
`;

const ModalBody = styled.div`
    padding: 20px;
    overflow-y: auto;
    max-height: calc(90vh - 130px);
`;

const InfoMessage = styled.div`
    background-color: #f0f7ff;
    color: #3498db;
    padding: 12px 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    font-size: 14px;
`;

const MergeAllButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 20px;
    
    &:hover {
        background-color: #d5e9f9;
    }
`;

const ServicesTable = styled.div`
    width: 100%;
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 20px;
`;

const TableHeader = styled.div`
    display: flex;
    background-color: #f9f9f9;
    border-bottom: 1px solid #eee;
    font-weight: 500;
`;

const HeaderCell = styled.div`
    padding: 12px 15px;
    color: #7f8c8d;
    font-size: 14px;
    
    &:nth-child(1) {
        flex: 3;
    }
    
    &:nth-child(2) {
        flex: 2;
        text-align: right;
    }
    
    &:nth-child(3) {
        flex: 1;
        text-align: center;
    }
`;

const TableBody = styled.div`
    max-height: 300px;
    overflow-y: auto;
`;

const TableRow = styled.div`
    display: flex;
    border-bottom: 1px solid #eee;
    
    &:last-child {
        border-bottom: none;
    }
    
    &:hover {
        background-color: #f9f9f9;
    }
`;

const TableCell = styled.div`
    padding: 12px 15px;
    font-size: 14px;
    color: #34495e;
    
    &:nth-child(1) {
        flex: 3;
    }
    
    &:nth-child(2) {
        flex: 2;
        text-align: right;
    }
    
    &:nth-child(3) {
        flex: 1;
        display: flex;
        justify-content: center;
    }
`;

const EmptyRow = styled.div`
    display: flex;
    padding: 20px 0;
    justify-content: center;
`;

const EmptyCell = styled.div`
    color: #95a5a6;
    font-size: 14px;
    text-align: center;
    width: 100%;
`;

const EditInput = styled.input`
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background-color: ${props => props.danger ? '#fef2f2' : '#f0f7ff'};
    color: ${props => props.danger ? '#e74c3c' : '#3498db'};
    border: 1px solid ${props => props.danger ? '#fde8e8' : '#d5e9f9'};
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        background-color: ${props => props.danger ? '#fde8e8' : '#d5e9f9'};
    }
`;

const TotalSummary = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
`;

const TotalLabel = styled.div`
    font-weight: 500;
    font-size: 15px;
    color: #34495e;
`;

const TotalValue = styled.div`
    font-weight: 600;
    font-size: 16px;
    color: #2ecc71;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
`;

const CancelButton = styled(Button)`
    background-color: white;
    color: #7f8c8d;
    border: 1px solid #ddd;
    
    &:hover {
        background-color: #f5f5f5;
    }
`;

const SaveButton = styled(Button)<{ disabled?: boolean }>`
    background-color: ${props => props.disabled ? '#95a5a6' : '#2ecc71'};
    color: white;
    border: none;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    
    &:hover:not(:disabled) {
        background-color: #27ae60;
    }
`;

export default InvoiceItemsModal;