import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaFileUpload, FaFilePdf } from 'react-icons/fa';
import {
    Invoice,
    InvoiceItem,
    InvoiceStatus,
    InvoiceStatusLabels,
    InvoiceType,
    InvoiceTypeLabels,
    PaymentMethod,
    PaymentMethodLabels,
    InvoiceAttachment
} from '../../../types';
import {HelpText} from "../../Settings/styles/ModalStyles";

interface InvoiceFormProps {
    invoice?: Invoice;
    onSave: (invoice: Partial<Invoice>) => void;
    onCancel: () => void;
}

const emptyInvoice: Partial<Invoice> = {
    number: '(zostanie nadany automatycznie)',
    title: '',
    issuedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sellerName: 'Detailing Pro Sp. z o.o.',
    sellerTaxId: '1234567890',
    sellerAddress: 'ul. Polerska 15, 00-123 Warszawa',
    buyerName: '',
    buyerTaxId: '',
    buyerAddress: '',
    status: InvoiceStatus.DRAFT,
    type: InvoiceType.INCOME,  // Domyślnie faktura przychodowa
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    totalNet: 0,
    totalTax: 0,
    totalGross: 0,
    currency: 'PLN',
    notes: '',
    items: [],
    attachments: []
};

const emptyItem: InvoiceItem = {
    id: '',
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 23,
    totalNet: 0,
    totalGross: 0
};

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Invoice>>(invoice || emptyInvoice);
    const [items, setItems] = useState<InvoiceItem[]>(invoice?.items || []);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Obsługa zmian w formularzu
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Usuwamy błędy dla edytowanego pola
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Obsługa dodawania nowej pozycji
    const handleAddItem = () => {
        const newItem = {
            ...emptyItem,
            id: `temp-${Date.now()}`
        };
        setItems(prev => [...prev, newItem]);
    };

    // Obsługa usuwania pozycji
    const handleRemoveItem = (itemId: string) => {
        setItems(prev => prev.filter(item => item.id !== itemId));
        recalculateTotals();
    };

    // Obsługa zmiany danych pozycji
    const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const updatedItem = { ...item, [field]: value };

                // Jeśli zmieniono cenę jednostkową lub ilość, przeliczamy wartości
                if (field === 'unitPrice' || field === 'quantity' || field === 'taxRate') {
                    const quantity = field === 'quantity' ? parseFloat(value) : item.quantity;
                    const unitPrice = field === 'unitPrice' ? parseFloat(value) : item.unitPrice;
                    const taxRate = field === 'taxRate' ? parseFloat(value) : item.taxRate;

                    const totalNet = quantity * unitPrice;
                    const totalGross = totalNet * (1 + taxRate / 100);

                    return {
                        ...updatedItem,
                        totalNet,
                        totalGross
                    };
                }

                return updatedItem;
            }
            return item;
        }));

        // Po zmianie pozycji przeliczamy sumy
        setTimeout(recalculateTotals, 0);
    };

    // Przeliczanie sum
    const recalculateTotals = () => {
        const totalNet = items.reduce((sum, item) => sum + item.totalNet, 0);
        const totalGross = items.reduce((sum, item) => sum + item.totalGross, 0);
        const totalTax = totalGross - totalNet;

        setFormData(prev => ({
            ...prev,
            totalNet,
            totalGross,
            totalTax
        }));
    };

    // Obsługa przesyłania plików
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newAttachments: InvoiceAttachment[] = Array.from(files).map(file => ({
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            file
        }));

        setFormData(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), ...newAttachments]
        }));

        // Resetujemy input, aby można było wybrać ten sam plik ponownie
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Obsługa usuwania załącznika
    const handleRemoveAttachment = (attachmentId: string) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments?.filter(att => att.id !== attachmentId) || []
        }));
    };

    // Walidacja formularza
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.title?.trim()) {
            errors.title = 'Nazwa faktury jest wymagana';
        }

        if (!formData.issuedDate) {
            errors.issuedDate = 'Data wystawienia jest wymagana';
        }

        if (!formData.dueDate) {
            errors.dueDate = 'Termin płatności jest wymagany';
        }

        if (!formData.buyerName?.trim()) {
            errors.buyerName = 'Nazwa płatnika jest wymagana';
        }

        if (items.length === 0) {
            errors.items = 'Faktura musi zawierać co najmniej jedną pozycję';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Obsługa zapisu formularza
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSave({
                ...formData,
                items
            });
        }
    };

    // Formatowanie kwoty
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    };

    return (
        <FormContainer>
            <Form onSubmit={handleSubmit}>
                <FormSection>
                    <SectionTitle>Dane podstawowe</SectionTitle>
                    <FormGrid>
                        <FormGroup>
                            <Label htmlFor="number">Numer faktury</Label>
                            <Input
                                id="number"
                                name="number"
                                value={invoice?.number || '(zostanie nadany automatycznie)'}
                                disabled
                                readOnly
                            />
                            <HelpText>Numer zostanie nadany automatycznie przez system przy zapisie faktury</HelpText>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="title">Nazwa faktury*</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                placeholder="Np. Usługi detailingowe"
                                required
                            />
                            {formErrors.title && <ErrorText>{formErrors.title}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="type">Typ faktury*</Label>
                            <Select
                                id="type"
                                name="type"
                                value={formData.type || InvoiceType.INCOME}
                                onChange={handleChange}
                                required
                            >
                                {Object.entries(InvoiceTypeLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="issuedDate">Data wystawienia*</Label>
                            <Input
                                id="issuedDate"
                                name="issuedDate"
                                type="date"
                                value={formData.issuedDate?.split('T')[0] || ''}
                                onChange={handleChange}
                                required
                            />
                            {formErrors.issuedDate && <ErrorText>{formErrors.issuedDate}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="dueDate">Termin płatności*</Label>
                            <Input
                                id="dueDate"
                                name="dueDate"
                                type="date"
                                value={formData.dueDate?.split('T')[0] || ''}
                                onChange={handleChange}
                                required
                            />
                            {formErrors.dueDate && <ErrorText>{formErrors.dueDate}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="status">Status*</Label>
                            <Select
                                id="status"
                                name="status"
                                value={formData.status || InvoiceStatus.DRAFT}
                                onChange={handleChange}
                                required
                            >
                                {Object.entries(InvoiceStatusLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="paymentMethod">Metoda płatności*</Label>
                            <Select
                                id="paymentMethod"
                                name="paymentMethod"
                                value={formData.paymentMethod || PaymentMethod.BANK_TRANSFER}
                                onChange={handleChange}
                                required
                            >
                                {Object.entries(PaymentMethodLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="currency">Waluta*</Label>
                            <Select
                                id="currency"
                                name="currency"
                                value={formData.currency || 'PLN'}
                                onChange={handleChange}
                                required
                            >
                                <option value="PLN">PLN</option>
                                <option value="EUR">EUR</option>
                                <option value="USD">USD</option>
                                <option value="GBP">GBP</option>
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="protocolNumber">Numer protokołu</Label>
                            <Input
                                id="protocolNumber"
                                name="protocolNumber"
                                value={formData.protocolNumber || ''}
                                onChange={handleChange}
                                placeholder="Opcjonalnie"
                            />
                        </FormGroup>
                    </FormGrid>
                </FormSection>

                <FormSectionRow>
                    <FormSection flex={1}>
                        <SectionTitle>Sprzedawca</SectionTitle>
                        <FormGrid columns={1}>
                            <FormGroup>
                                <Label htmlFor="sellerName">Nazwa sprzedawcy*</Label>
                                <Input
                                    id="sellerName"
                                    name="sellerName"
                                    value={formData.sellerName || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="sellerTaxId">NIP</Label>
                                <Input
                                    id="sellerTaxId"
                                    name="sellerTaxId"
                                    value={formData.sellerTaxId || ''}
                                    onChange={handleChange}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="sellerAddress">Adres</Label>
                                <Textarea
                                    id="sellerAddress"
                                    name="sellerAddress"
                                    value={formData.sellerAddress || ''}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </FormGroup>
                        </FormGrid>
                    </FormSection>

                    <FormSection flex={1}>
                        <SectionTitle>Nabywca</SectionTitle>
                        <FormGrid columns={1}>
                            <FormGroup>
                                <Label htmlFor="buyerName">Nazwa nabywcy*</Label>
                                <Input
                                    id="buyerName"
                                    name="buyerName"
                                    value={formData.buyerName || ''}
                                    onChange={handleChange}
                                    required
                                />
                                {formErrors.buyerName && <ErrorText>{formErrors.buyerName}</ErrorText>}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="buyerTaxId">NIP</Label>
                                <Input
                                    id="buyerTaxId"
                                    name="buyerTaxId"
                                    value={formData.buyerTaxId || ''}
                                    onChange={handleChange}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="buyerAddress">Adres</Label>
                                <Textarea
                                    id="buyerAddress"
                                    name="buyerAddress"
                                    value={formData.buyerAddress || ''}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </FormGroup>
                        </FormGrid>
                    </FormSection>
                </FormSectionRow>

                <FormSection>
                    <SectionTitleRow>
                        <SectionTitle>Pozycje faktury</SectionTitle>
                        <AddItemButton type="button" onClick={handleAddItem}>
                            <FaPlus />
                            <span>Dodaj pozycję</span>
                        </AddItemButton>
                    </SectionTitleRow>

                    {formErrors.items && <ErrorText>{formErrors.items}</ErrorText>}

                    <ItemsTable>
                        <thead>
                        <tr>
                            <th>Nazwa</th>
                            <th>Opis</th>
                            <th>Ilość</th>
                            <th>Cena jedn. netto</th>
                            <th>VAT %</th>
                            <th>Wartość netto</th>
                            <th>Wartość brutto</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={8}>
                                    <NoItems>Brak pozycji. Kliknij "Dodaj pozycję", aby dodać pierwszą pozycję do faktury.</NoItems>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <Input
                                            value={item.name}
                                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                            placeholder="Nazwa"
                                            required
                                        />
                                    </td>
                                    <td>
                                        <Input
                                            value={item.description || ''}
                                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                            placeholder="Opis (opcjonalnie)"
                                        />
                                    </td>
                                    <td>
                                        <NumberInput
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                            placeholder="Ilość"
                                            min={0.01}
                                            step={0.01}
                                            required
                                        />
                                    </td>
                                    <td>
                                        <NumberInput
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            placeholder="Cena"
                                            min={0}
                                            step={0.01}
                                            required
                                        />
                                    </td>
                                    <td>
                                        <Select
                                            value={item.taxRate}
                                            onChange={(e) => handleItemChange(item.id, 'taxRate', parseFloat(e.target.value))}
                                            required
                                        >
                                            <option value="0">0%</option>
                                            <option value="5">5%</option>
                                            <option value="8">8%</option>
                                            <option value="23">23%</option>
                                        </Select>
                                    </td>
                                    <td>
                                        <AmountDisplay>
                                            {formatAmount(item.totalNet)}
                                        </AmountDisplay>
                                    </td>
                                    <td>
                                        <AmountDisplay>
                                            {formatAmount(item.totalGross)}
                                        </AmountDisplay>
                                    </td>
                                    <td>
                                        <RemoveButton type="button" onClick={() => handleRemoveItem(item.id)}>
                                            <FaTrash />
                                        </RemoveButton>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                Razem:
                            </td>
                            <td>
                                <AmountDisplay bold>
                                    {formatAmount(formData.totalNet || 0)}
                                </AmountDisplay>
                            </td>
                            <td>
                                <AmountDisplay bold>
                                    {formatAmount(formData.totalGross || 0)}
                                </AmountDisplay>
                            </td>
                            <td></td>
                        </tr>
                        </tfoot>
                    </ItemsTable>
                </FormSection>

                <FormSection>
                    <SectionTitle>Załączniki</SectionTitle>
                    <AttachmentsContainer>
                        <AttachmentsList>
                            {formData.attachments?.map(att => (
                                <AttachmentItem key={att.id}>
                                    <AttachmentIcon>
                                        <FaFilePdf />
                                    </AttachmentIcon>
                                    <AttachmentDetails>
                                        <AttachmentName>{att.name}</AttachmentName>
                                        <AttachmentSize>
                                            {Math.round(att.size / 1024)} KB
                                        </AttachmentSize>
                                    </AttachmentDetails>
                                    <RemoveAttachmentButton onClick={() => handleRemoveAttachment(att.id)}>
                                        <FaTrash />
                                    </RemoveAttachmentButton>
                                </AttachmentItem>
                            ))}

                            {(!formData.attachments || formData.attachments.length === 0) && (
                                <NoAttachments>
                                    Brak załączników
                                </NoAttachments>
                            )}
                        </AttachmentsList>

                        <UploadButtonContainer>
                            <FileUploadButton htmlFor="invoice-attachment">
                                <FaFileUpload />
                                <span>Dodaj załącznik</span>
                            </FileUploadButton>
                            <FileInput
                                id="invoice-attachment"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                                multiple
                            />
                        </UploadButtonContainer>
                    </AttachmentsContainer>
                </FormSection>

                <FormSection>
                    <SectionTitle>Uwagi</SectionTitle>
                    <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        placeholder="Dodatkowe uwagi do faktury (opcjonalnie)"
                        rows={4}
                    />
                </FormSection>

                <FormActions>
                    <CancelButton type="button" onClick={onCancel}>
                        Anuluj
                    </CancelButton>
                    <SaveButton type="submit">
                        {invoice ? 'Zapisz zmiany' : 'Dodaj fakturę'}
                    </SaveButton>
                </FormActions>
            </Form>
        </FormContainer>
    );
};

// Style komponentów
const FormContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
`;

const Form = styled.form`
    padding: 24px;
`;

const FormSection = styled.div<{ flex?: number }>`
    margin-bottom: 24px;
    flex: ${props => props.flex || 'auto'};
`;

const FormSectionRow = styled.div`
    display: flex;
    gap: 24px;
    
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const SectionTitle = styled.h3`
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #2c3e50;
    font-weight: 600;
`;

const SectionTitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const FormGrid = styled.div<{ columns?: number }>`
    display: grid;
    grid-template-columns: repeat(${props => props.columns || 2}, 1fr);
    gap: 16px;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Label = styled.label`
    font-size: 14px;
    color: #34495e;
    font-weight: 500;
`;

const Input = styled.input`
    padding: 8px 12px;
    border: 1px solid #dfe6e9;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
`;

const NumberInput = styled.input.attrs({ type: 'number' })`
    padding: 8px 12px;
    border: 1px solid #dfe6e9;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #dfe6e9;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
    width: 100%;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
`;

const Textarea = styled.textarea`
    padding: 8px 12px;
    border: 1px solid #dfe6e9;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;
    width: 100%;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
`;

const AddItemButton = styled(Button)`
    background-color: #ecf0f1;
    color: #2c3e50;
    border: 1px solid #dfe6e9;
    font-size: 14px;
    padding: 8px 12px;
    
    &:hover {
        background-color: #dfe6e9;
    }
`;

const RemoveButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: #e74c3c;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    
    &:hover {
        color: #c0392b;
    }
`;

const ItemsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    
    th {
        padding: 12px 8px;
        background-color: #f8f9fa;
        text-align: left;
        font-weight: 600;
        color: #2c3e50;
        border-bottom: 2px solid #eef2f7;
    }
    
    td {
        padding: 8px;
        border-bottom: 1px solid #eef2f7;
        vertical-align: middle;
    }
    
    tbody tr:hover {
        background-color: #f8f9fa;
    }
    
    tfoot {
        background-color: #f8f9fa;
        font-weight: 500;
    }
    
    tfoot td {
        padding: 12px 8px;
        border-top: 2px solid #eef2f7;
    }
`;

const NoItems = styled.div`
    padding: 16px;
    text-align: center;
    color: #7f8c8d;
    font-style: italic;
`;

const AmountDisplay = styled.div<{ bold?: boolean }>`
    text-align: right;
    font-weight: ${props => props.bold ? 'bold' : 'normal'};
`;

const AttachmentsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const AttachmentsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #eef2f7;
    border-radius: 4px;
    padding: 8px;
    background-color: #f8f9fa;
`;

const AttachmentItem = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: white;
    border-radius: 4px;
    border: 1px solid #eef2f7;
`;

const AttachmentIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-right: 12px;
    color: #e74c3c;
`;

const AttachmentDetails = styled.div`
    flex: 1;
`;

const AttachmentName = styled.div`
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 2px;
`;

const AttachmentSize = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

const RemoveAttachmentButton = styled.button`
    background: none;
    border: none;
    color: #7f8c8d;
    cursor: pointer;
    font-size: 16px;
    
    &:hover {
        color: #e74c3c;
    }
`;

const NoAttachments = styled.div`
    padding: 16px;
    text-align: center;
    color: #7f8c8d;
    font-style: italic;
`;

const UploadButtonContainer = styled.div`
    display: flex;
    justify-content: center;
`;

const FileUploadButton = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #f0f7ff;
    color: #3498db;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        background-color: #d5e9f9;
    }
`;

const FileInput = styled.input`
    position: absolute;
    opacity: 0;
    width: 0.1px;
    height: 0.1px;
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;

    @media (max-width: 576px) {
        flex-direction: column;
    }
`;

const CancelButton = styled(Button)`
    background-color: white;
    color: #2c3e50;
    border: 1px solid #dfe6e9;

    &:hover {
        background-color: #f8f9fa;
    }

    @media (max-width: 576px) {
        order: 2;
    }
`;

const SaveButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;

    &:hover {
        background-color: #2980b9;
    }

    @media (max-width: 576px) {
        order: 1;
    }
`;

const ErrorText = styled.div`
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
`;

export default InvoiceForm;