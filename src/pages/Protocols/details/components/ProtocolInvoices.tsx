import React, { useState } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaPlus,
    FaFileInvoiceDollar,
    FaBuilding,
    FaCalendarAlt,
    FaTag,
    FaMoneyBillWave,
    FaTrashAlt,
    FaFileDownload
} from 'react-icons/fa';
import { CarReceptionProtocol } from '../../../../types';
import { updateCarReceptionProtocol } from '../../../../api/mocks/carReceptionMocks';

// Purchase invoice interface
interface PurchaseInvoice {
    id: string;
    invoiceNumber: string;
    supplier: string;
    date: string;
    items: PurchaseInvoiceItem[];
    totalAmount: number;
    notes?: string;
}

// Invoice item interface
interface PurchaseInvoiceItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface ProtocolInvoicesProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate: (updatedProtocol: CarReceptionProtocol) => void;
}

const ProtocolInvoices: React.FC<ProtocolInvoicesProps> = ({ protocol, onProtocolUpdate }) => {
    // Get purchase invoices from protocol or initialize empty array
    const [invoices, setInvoices] = useState<PurchaseInvoice[]>(protocol.purchaseInvoices || []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state for new invoice
    const [newInvoice, setNewInvoice] = useState<Omit<PurchaseInvoice, 'id' | 'totalAmount' | 'items'>>({
        invoiceNumber: '',
        supplier: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Form state for invoice items
    const [invoiceItems, setInvoiceItems] = useState<Omit<PurchaseInvoiceItem, 'id' | 'totalPrice'>[]>([
        { name: '', category: 'parts', quantity: 1, unitPrice: 0 }
    ]);

    // Format date for display
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd.MM.yyyy', { locale: pl });
    };

    // Format currency
    const formatCurrency = (amount: number): string => {
        return amount.toFixed(2) + ' zł';
    };

    // Calculate total for an invoice
    const calculateTotal = (items: PurchaseInvoiceItem[]): number => {
        return items.reduce((sum, item) => sum + item.totalPrice, 0);
    };

    // Calculate total for all invoices
    const calculateGrandTotal = (): number => {
        return invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    };

    // Calculate total for current form items
    const calculateFormTotal = (): number => {
        return invoiceItems.reduce(
            (sum, item) => sum + (item.quantity * item.unitPrice),
            0
        );
    };

    // Add another item row
    const handleAddItemRow = () => {
        setInvoiceItems([
            ...invoiceItems,
            { name: '', category: 'parts', quantity: 1, unitPrice: 0 }
        ]);
    };

    // Remove an item row
    const handleRemoveItemRow = (index: number) => {
        if (invoiceItems.length <= 1) return;
        setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    };

    // Update item data
    const handleItemChange = (index: number, field: keyof Omit<PurchaseInvoiceItem, 'id' | 'totalPrice'>, value: any) => {
        const updatedItems = [...invoiceItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setInvoiceItems(updatedItems);
    };

    // Handle invoice form submission
    const handleSubmitInvoice = async () => {
        if (!newInvoice.invoiceNumber.trim() || !newInvoice.supplier.trim() || !newInvoice.date) {
            return;
        }

        // Make sure there's at least one valid item
        if (invoiceItems.length === 0 || !invoiceItems[0].name.trim()) {
            return;
        }

        setIsSubmitting(true);
        try {
            // Calculate total prices for each item
            const itemsWithTotals: PurchaseInvoiceItem[] = invoiceItems.map(item => ({
                id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                ...item,
                totalPrice: item.quantity * item.unitPrice
            }));

            // Create new invoice
            const invoice: PurchaseInvoice = {
                id: `invoice_${Date.now()}`,
                ...newInvoice,
                items: itemsWithTotals,
                totalAmount: itemsWithTotals.reduce((sum, item) => sum + item.totalPrice, 0)
            };

            // Add to local state
            const updatedInvoices = [...invoices, invoice];
            setInvoices(updatedInvoices);

            // Update protocol with new invoice
            const updatedProtocol = {
                ...protocol,
                purchaseInvoices: updatedInvoices,
                updatedAt: new Date().toISOString()
            };

            // Save to backend
            const savedProtocol = await updateCarReceptionProtocol(updatedProtocol);
            onProtocolUpdate(savedProtocol);

            // Reset form
            setNewInvoice({
                invoiceNumber: '',
                supplier: '',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            setInvoiceItems([
                { name: '', category: 'parts', quantity: 1, unitPrice: 0 }
            ]);
            setShowAddForm(false);
        } catch (error) {
            console.error('Error adding invoice:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete invoice
    const handleDeleteInvoice = async (invoiceId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę fakturę?')) {
            return;
        }

        try {
            // Remove from local state
            const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);
            setInvoices(updatedInvoices);

            // Update protocol
            const updatedProtocol = {
                ...protocol,
                purchaseInvoices: updatedInvoices,
                updatedAt: new Date().toISOString()
            };

            // Save to backend
            const savedProtocol = await updateCarReceptionProtocol(updatedProtocol);
            onProtocolUpdate(savedProtocol);
        } catch (error) {
            console.error('Error deleting invoice:', error);
        }
    };

    return (
        <InvoicesContainer>
            <SectionTitleWithAction>
                <SectionTitle>Faktury zakupowe</SectionTitle>
                {!showAddForm && (
                    <AddInvoiceButton onClick={() => setShowAddForm(true)}>
                        <FaPlus /> Dodaj fakturę
                    </AddInvoiceButton>
                )}
            </SectionTitleWithAction>

            {showAddForm && (
                <AddInvoiceForm>
                    <FormTitle>Nowa faktura zakupowa</FormTitle>

                    <FormRow>
                        <FormGroup>
                            <Label>Numer faktury*</Label>
                            <Input
                                value={newInvoice.invoiceNumber}
                                onChange={(e) => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})}
                                placeholder="np. FV/2025/03/123"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Dostawca*</Label>
                            <Input
                                value={newInvoice.supplier}
                                onChange={(e) => setNewInvoice({...newInvoice, supplier: e.target.value})}
                                placeholder="np. Auto Parts Sp. z o.o."
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Data faktury*</Label>
                            <Input
                                type="date"
                                value={newInvoice.date}
                                onChange={(e) => setNewInvoice({...newInvoice, date: e.target.value})}
                            />
                        </FormGroup>
                    </FormRow>

                    <FormTitle>Pozycje faktury*</FormTitle>
                    <ItemsTable>
                        <TableHeader>
                            <HeaderCell wide>Nazwa produktu/usługi</HeaderCell>
                            <HeaderCell>Kategoria</HeaderCell>
                            <HeaderCell narrow>Ilość</HeaderCell>
                            <HeaderCell>Cena jedn.</HeaderCell>
                            <HeaderCell>Wartość</HeaderCell>
                            <HeaderCell action></HeaderCell>
                        </TableHeader>

                        {invoiceItems.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell wide>
                                    <Input
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                        placeholder="Nazwa towaru lub usługi"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={item.category}
                                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                    >
                                        <option value="parts">Części</option>
                                        <option value="materials">Materiały</option>
                                        <option value="consumables">Środki</option>
                                        <option value="outsourcing">Usługi zewnętrzne</option>
                                        <option value="tools">Narzędzia</option>
                                        <option value="other">Inne</option>
                                    </Select>
                                </TableCell>
                                <TableCell narrow>
                                    <NumberInput
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                    />
                                </TableCell>
                                <TableCell>
                                    <PriceInput
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unitPrice}
                                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                    />
                                    <PriceCurrency>zł</PriceCurrency>
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(item.quantity * item.unitPrice)}
                                </TableCell>
                                <TableCell action>
                                    <RemoveItemButton
                                        onClick={() => handleRemoveItemRow(index)}
                                        disabled={invoiceItems.length <= 1}
                                    >
                                        <FaTrashAlt />
                                    </RemoveItemButton>
                                </TableCell>
                            </TableRow>
                        ))}

                        <AddItemRow>
                            <AddItemButton onClick={handleAddItemRow}>
                                <FaPlus /> Dodaj pozycję
                            </AddItemButton>
                            <TotalAmount>
                                Suma: <TotalValue>{formatCurrency(calculateFormTotal())}</TotalValue>
                            </TotalAmount>
                        </AddItemRow>
                    </ItemsTable>

                    <FormGroup>
                        <Label>Uwagi</Label>
                        <Textarea
                            value={newInvoice.notes || ''}
                            onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                            placeholder="Dodatkowe informacje o fakturze..."
                            rows={2}
                        />
                    </FormGroup>

                    <FormActions>
                        <CancelButton onClick={() => setShowAddForm(false)}>
                            Anuluj
                        </CancelButton>
                        <SaveButton
                            onClick={handleSubmitInvoice}
                            disabled={isSubmitting || !newInvoice.invoiceNumber.trim() || !newInvoice.supplier.trim() || invoiceItems.some(item => !item.name.trim())}
                        >
                            <FaPlus /> {isSubmitting ? 'Dodawanie...' : 'Dodaj fakturę'}
                        </SaveButton>
                    </FormActions>
                </AddInvoiceForm>
            )}

            {invoices.length === 0 && !showAddForm && (
                <EmptyState>
                    Brak faktur zakupowych dla tego zlecenia. Faktury zakupowe pozwalają śledzić koszty materiałów i usług zewnętrznych poniesionych podczas realizacji zlecenia.
                </EmptyState>
            )}

            {invoices.length > 0 && (
                <>
                    <InvoicesList>
                        {invoices.map(invoice => (
                            <InvoiceItem key={invoice.id}>
                                <InvoiceHeader>
                                    <InvoiceIcon><FaFileInvoiceDollar /></InvoiceIcon>
                                    <InvoiceHeaderContent>
                                        <InvoiceNumber>{invoice.invoiceNumber}</InvoiceNumber>
                                        <InvoiceSupplier>
                                            <FaBuilding /> {invoice.supplier}
                                        </InvoiceSupplier>
                                    </InvoiceHeaderContent>
                                    <InvoiceHeaderRight>
                                        <InvoiceDate>
                                            <FaCalendarAlt /> {formatDate(invoice.date)}
                                        </InvoiceDate>
                                        <InvoiceAmount>{formatCurrency(invoice.totalAmount)}</InvoiceAmount>
                                    </InvoiceHeaderRight>
                                </InvoiceHeader>

                                <InvoiceItemsList>
                                    {invoice.items.map(item => (
                                        <InvoiceItemRow key={item.id}>
                                            <ItemName>{item.name}</ItemName>
                                            <ItemCategory>
                                                <FaTag /> {getCategoryName(item.category)}
                                            </ItemCategory>
                                            <ItemQuantity>{item.quantity} x {formatCurrency(item.unitPrice)}</ItemQuantity>
                                            <ItemTotal>{formatCurrency(item.totalPrice)}</ItemTotal>
                                        </InvoiceItemRow>
                                    ))}
                                </InvoiceItemsList>

                                {invoice.notes && (
                                    <InvoiceNotes>{invoice.notes}</InvoiceNotes>
                                )}

                                <InvoiceActions>
                                    <InvoiceActionButton title="Pobierz fakturę">
                                        <FaFileDownload /> Pobierz
                                    </InvoiceActionButton>
                                    <InvoiceActionButton
                                        danger
                                        title="Usuń fakturę"
                                        onClick={() => handleDeleteInvoice(invoice.id)}
                                    >
                                        <FaTrashAlt /> Usuń
                                    </InvoiceActionButton>
                                </InvoiceActions>
                            </InvoiceItem>
                        ))}
                    </InvoicesList>

                    <SummarySection>
                        <SummaryTitle>Podsumowanie kosztów</SummaryTitle>
                        <SummaryAmount>
                            <FaMoneyBillWave /> Łączna kwota faktur zakupowych: {formatCurrency(calculateGrandTotal())}
                        </SummaryAmount>
                    </SummarySection>
                </>
            )}
        </InvoicesContainer>
    );
};

// Helper function to get category name
const getCategoryName = (category: string): string => {
    const categories: Record<string, string> = {
        'parts': 'Części',
        'materials': 'Materiały',
        'consumables': 'Środki',
        'outsourcing': 'Usługi zewnętrzne',
        'tools': 'Narzędzia',
        'other': 'Inne'
    };

    return categories[category] || category;
};

// Styled components
const InvoicesContainer = styled.div``;

const SectionTitle = styled.h3`
    font-size: 16px;
    margin: 0;
    color: #2c3e50;
`;

const SectionTitleWithAction = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
`;

const AddInvoiceButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    
    &:hover {
        background-color: #d5e9f9;
    }
`;

const AddInvoiceForm = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 20px;
`;

const FormTitle = styled.h4`
    font-size: 15px;
    margin: 10px 0;
    color: #34495e;
    
    &:first-child {
        margin-top: 0;
    }
`;

const FormRow = styled.div`
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
    
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const FormGroup = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    font-size: 14px;
    color: #34495e;
    margin-bottom: 5px;
`;

const Input = styled.input`
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

const NumberInput = styled(Input)`
    width: 60px;
`;

const PriceInput = styled(Input)`
    padding-right: 30px;
`;

const PriceCurrency = styled.span`
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #7f8c8d;
    font-size: 14px;
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const Textarea = styled.textarea`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;
    font-family: inherit;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;
    
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const CancelButton = styled.button`
    padding: 8px 16px;
    background-color: white;
    color: #7f8c8d;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    
    &:hover {
        background-color: #f5f5f5;
    }
    
    @media (max-width: 768px) {
        order: 2;
    }
`;

const SaveButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    
    &:hover:not(:disabled) {
        background-color: #2980b9;
    }
    
    &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
        order: 1;
        margin-bottom: 10px;
    }
`;

const ItemsTable = styled.div`
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 15px;
    background-color: white;
`;

const TableHeader = styled.div`
    display: flex;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    font-weight: 500;
`;

const HeaderCell = styled.div<{ wide?: boolean; narrow?: boolean; action?: boolean }>`
    padding: 10px;
    font-size: 13px;
    color: #7f8c8d;
    flex: ${props => props.wide ? 2 : props.narrow ? 0.5 : props.action ? 0.3 : 1};
`;

const TableRow = styled.div`
    display: flex;
    border-bottom: 1px solid #eee;
    
    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.div<{ wide?: boolean; narrow?: boolean; action?: boolean }>`
    padding: 10px;
    font-size: 14px;
    color: #34495e;
    flex: ${props => props.wide ? 2 : props.narrow ? 0.5 : props.action ? 0.3 : 1};
    position: relative;
    
    ${Input}, ${Select} {
        width: 100%;
    }
`;

const RemoveItemButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: ${props => props.disabled ? '#f5f5f5' : '#fef5f5'};
    color: ${props => props.disabled ? '#bdc3c7' : '#e74c3c'};
    border: 1px solid ${props => props.disabled ? '#eee' : '#fde8e8'};
    border-radius: 4px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    
    &:hover:not(:disabled) {
        background-color: #fde8e8;
    }
`;

const AddItemRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #f9f9f9;
    border-top: 1px solid #eee;
`;

const AddItemButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    
    &:hover {
        background-color: #d5e9f9;
    }
`;

const TotalAmount = styled.div`
    font-size: 14px;
    color: #34495e;
`;

const TotalValue = styled.span`
    font-weight: 600;
    color: #27ae60;
`;

const EmptyState = styled.div`
    padding: 20px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 4px;
    color: #7f8c8d;
    font-size: 14px;
`;

const InvoicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
`;

const InvoiceItem = styled.div`
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const InvoiceHeader = styled.div`
    display: flex;
    padding: 15px;
    background-color: #f9f9f9;
    border-bottom: 1px solid #eee;
`;

const InvoiceIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #e7f3ff;
    color: #3498db;
    font-size: 18px;
    border-radius: 4px;
    margin-right: 15px;
`;

const InvoiceHeaderContent = styled.div`
    flex: 1;
`;

const InvoiceNumber = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: #34495e;
    margin-bottom: 3px;
`;

const InvoiceSupplier = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    color: #7f8c8d;
`;

const InvoiceHeaderRight = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

const InvoiceDate = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 3px;
`;

const InvoiceAmount = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: #27ae60;
`;

const InvoiceItemsList = styled.div`
    padding: 15px;
`;

const InvoiceItemRow = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
        border-bottom: none;
    }
`;

const ItemName = styled.div`
    flex: 2;
    font-size: 14px;
    color: #34495e;
`;

const ItemCategory = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    color: #7f8c8d;
`;

const ItemQuantity = styled.div`
    flex: 1;
    font-size: 13px;
    color: #7f8c8d;
    text-align: right;
`;

const ItemTotal = styled.div`
    flex: 0.7;
    font-weight: 500;
    font-size: 14px;
    color: #34495e;
    text-align: right;
`;

const InvoiceNotes = styled.div`
    padding: 0 15px 15px;
    font-size: 13px;
    color: #7f8c8d;
    font-style: italic;
`;

const InvoiceActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 10px 15px;
    background-color: #f9f9f9;
    border-top: 1px solid #eee;
`;

const InvoiceActionButton = styled.button<{ danger?: boolean }>`
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: ${props => props.danger ? '#fef5f5' : '#f0f7ff'};
    color: ${props => props.danger ? '#e74c3c' : '#3498db'};
    border: 1px solid ${props => props.danger ? '#fde8e8' : '#d5e9f9'};
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    
    &:hover {
        background-color: ${props => props.danger ? '#fde8e8' : '#d5e9f9'};
    }
`;

const SummarySection = styled.div`
    background-color: #f0f7ff;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SummaryTitle = styled.div`
    font-weight: 500;
    font-size: 15px;
    color: #3498db;
`;

const SummaryAmount = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
    color: #27ae60;
`;

export default ProtocolInvoices;