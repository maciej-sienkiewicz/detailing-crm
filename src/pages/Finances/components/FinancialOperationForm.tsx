// Aktualizacja w src/pages/Finances/components/FinancialOperationForm.tsx

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
    FaTimes,
    FaUpload,
    FaSpinner,
    FaExclamationTriangle,
    FaFileInvoiceDollar,
    FaReceipt,
    FaExchangeAlt,
    FaPlus,
    FaTrashAlt
} from 'react-icons/fa';
import {
    FinancialOperation,
    FinancialOperationType,
    FinancialOperationTypeLabels,
    TransactionDirection,
    TransactionDirectionLabels,
    PaymentStatus,
    PaymentStatusLabels,
    PaymentMethod,
    PaymentMethodLabels
} from '../../../types';
import { financialOperationsApi } from '../../../api/financialOperationsApi';

// Dodajmy interfejs dla pozycji faktury
interface InvoiceItem {
    id?: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    totalNet: number;
    totalGross: number;
}

// Zaktualizujmy interfejs FinancialOperation o pozycje faktury
interface ExtendedFinancialOperation extends Partial<FinancialOperation> {
    items?: InvoiceItem[];
}

interface FinancialOperationFormProps {
    operation?: FinancialOperation | null;
    onSave: (operation: Partial<FinancialOperation>, file?: File | null) => void;
    onCancel: () => void;
}

const FinancialOperationForm: React.FC<FinancialOperationFormProps> = ({
                                                                           operation,
                                                                           onSave,
                                                                           onCancel
                                                                       }) => {
    // Inicjalizacja stanu formularza
    const [formData, setFormData] = useState<ExtendedFinancialOperation>({
        type: FinancialOperationType.INVOICE,
        title: '',
        date: new Date().toISOString().split('T')[0],
        direction: TransactionDirection.INCOME,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        counterpartyName: '',
        amount: 0,
        status: PaymentStatus.UNPAID,
        currency: 'PLN',
        items: [] // Pusta lista pozycji na start
    });

    // Errors state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Stan dla obsługi pliku faktury
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileUploading, setFileUploading] = useState<boolean>(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Uzupełnianie formularza danymi istniejącej operacji
    useEffect(() => {
        if (operation) {
            setFormData({
                ...operation,
                date: operation.date.split('T')[0],
                dueDate: operation.dueDate ? operation.dueDate.split('T')[0] : undefined,
                // Jeśli są pozycje faktury, dodajemy je do formularza
                items: operation.items || []
            });
        }
    }, [operation]);

    // Obsługa zmian w formularzu
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Usuwamy błąd po wprowadzeniu wartości
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Obsługa zmian w polach numerycznych
    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (value === '') {
            setFormData(prev => ({
                ...prev,
                [name]: 0
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: parseFloat(value)
            }));
        }

        // Usuwamy błąd po wprowadzeniu wartości
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Dodajmy funkcję do dodawania nowej pozycji faktury
    const handleAddItem = () => {
        // Tworzymy nową pustą pozycję
        const newItem: InvoiceItem = {
            id: `temp-item-${Date.now()}`,
            name: '',
            quantity: 1,
            unitPrice: 0,
            taxRate: 23, // Domyślny VAT 23%
            totalNet: 0,
            totalGross: 0
        };

        // Dodajemy do listy pozycji
        setFormData(prev => ({
            ...prev,
            items: [...(prev.items || []), newItem]
        }));
    };

    // Funkcja do usuwania pozycji faktury
    const handleRemoveItem = (itemId: string | undefined) => {
        if (!itemId) return;

        setFormData(prev => ({
            ...prev,
            items: (prev.items || []).filter(item => item.id !== itemId)
        }));

        // Po usunięciu pozycji przeliczamy sumy
        recalculateTotals();
    };

    // Funkcja do aktualizacji pozycji faktury
    const handleItemChange = (itemId: string | undefined, field: keyof InvoiceItem, value: any) => {
        if (!itemId) return;

        setFormData(prev => {
            const updatedItems = (prev.items || []).map(item => {
                if (item.id === itemId) {
                    const updatedItem = { ...item, [field]: value };

                    // Jeśli zmieniamy cenę, ilość lub stawkę VAT, przeliczamy wartości
                    if (field === 'unitPrice' || field === 'quantity' || field === 'taxRate') {
                        const quantity = field === 'quantity' ? parseFloat(value) : item.quantity;
                        const unitPrice = field === 'unitPrice' ? parseFloat(value) : item.unitPrice;
                        const taxRate = field === 'taxRate' ? parseFloat(value) : item.taxRate;

                        const totalNet = Number((quantity * unitPrice).toFixed(2));
                        const totalGross = Number((totalNet * (1 + taxRate / 100)).toFixed(2));

                        return {
                            ...updatedItem,
                            totalNet,
                            totalGross
                        };
                    }

                    return updatedItem;
                }

                return item;
            });

            // Przeliczamy sumy
            const totalNet = updatedItems.reduce((sum, item) => sum + item.totalNet, 0);
            const totalGross = updatedItems.reduce((sum, item) => sum + item.totalGross, 0);

            return {
                ...prev,
                items: updatedItems,
                amount: totalGross,
                netAmount: totalNet,
                taxAmount: totalGross - totalNet
            };
        });
    };

    // Funkcja do przeliczania sum
    const recalculateTotals = () => {
        setFormData(prev => {
            const items = prev.items || [];

            const totalNet = items.reduce((sum, item) => sum + item.totalNet, 0);
            const totalGross = items.reduce((sum, item) => sum + item.totalGross, 0);

            return {
                ...prev,
                amount: totalGross,
                netAmount: totalNet,
                taxAmount: totalGross - totalNet
            };
        });
    };

    // Walidacja formularza
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title?.trim()) {
            newErrors.title = 'Tytuł jest wymagany';
        }

        if (!formData.date) {
            newErrors.date = 'Data jest wymagana';
        }

        if (!formData.counterpartyName?.trim()) {
            newErrors.counterpartyName = 'Nazwa kontrahenta jest wymagana';
        }

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Kwota musi być większa od zera';
        }

        // Dla faktur wymagamy przynajmniej jednej pozycji
        if (formData.type === FinancialOperationType.INVOICE && (!formData.items || formData.items.length === 0)) {
            newErrors.items = 'Faktura musi zawierać przynajmniej jedną pozycję';
        }

        // Sprawdzamy, czy wszystkie pozycje faktury mają nazwę i poprawne wartości
        if (formData.items && formData.items.length > 0) {
            formData.items.forEach((item, index) => {
                if (!item.name.trim()) {
                    newErrors[`item_${index}_name`] = 'Nazwa pozycji jest wymagana';
                }

                if (item.quantity <= 0) {
                    newErrors[`item_${index}_quantity`] = 'Ilość musi być większa od zera';
                }

                if (item.unitPrice <= 0) {
                    newErrors[`item_${index}_unitPrice`] = 'Cena jednostkowa musi być większa od zera';
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Obsługa zapisu formularza
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSave(formData, selectedFile);
        }
    };

    // Zmiana typu operacji wpływa na zmianę innych pól w zależności od typu
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value as FinancialOperationType;

        setFormData(prev => {
            const updated = {
                ...prev,
                type
            };

            // Automatycznie ustawiamy kierunek w zależności od typu
            if (type === FinancialOperationType.INVOICE) {
                updated.direction = TransactionDirection.INCOME;
            } else if (type === FinancialOperationType.RECEIPT) {
                updated.direction = TransactionDirection.EXPENSE;
            }

            return updated;
        });
    };

    // Obsługa wczytywania pliku
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            return;
        }

        const file = files[0];
        setSelectedFile(file);

        // Sprawdzamy typ pliku (dozwolone tylko PDF i obrazy)
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setFileError('Dozwolone są tylko pliki PDF, JPEG i PNG');
            return;
        }

        // Sprawdzamy rozmiar pliku (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setFileError('Plik nie może być większy niż 10MB');
            return;
        }

        setFileError(null);

        // Jeżeli to faktura, próbujemy ekstrakcję danych
        if (formData.type === FinancialOperationType.INVOICE) {
            extractDataFromInvoice(file);
        }
    };

    // Ekstrakcja danych z faktury
    const extractDataFromInvoice = async (file: File) => {
        setFileUploading(true);
        setFileError(null);

        try {
            const extractedData = await financialOperationsApi.extractInvoiceData(file);

            if (extractedData) {
                // Mapujemy pozycje faktury na nasz format
                const items = extractedData.items.map((item, index) => ({
                    id: `extracted-item-${Date.now()}-${index}`,
                    name: item.name,
                    description: item.description || '',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    taxRate: item.taxRate,
                    totalNet: item.totalNet,
                    totalGross: item.totalGross
                }));

                // Wypełniamy formularz danymi z faktury
                setFormData(prev => ({
                    ...prev,
                    title: extractedData.generalInfo.title || prev.title,
                    date: extractedData.generalInfo.issuedDate,
                    dueDate: extractedData.generalInfo.dueDate,
                    counterpartyName: extractedData.buyer.name,
                    amount: extractedData.summary.totalGross,
                    netAmount: extractedData.summary.totalNet,
                    taxAmount: extractedData.summary.totalTax,
                    description: extractedData.notes || prev.description,
                    items: items
                }));
            }
        } catch (error) {
            console.error('Error extracting data from invoice:', error);
            setFileError('Nie udało się przetworzyć dokumentu. Spróbuj ponownie później.');
        } finally {
            setFileUploading(false);
        }
    };

    // Usunięcie pliku
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFileError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Ikona typu operacji
    const getTypeIcon = () => {
        switch (formData.type) {
            case FinancialOperationType.INVOICE:
                return <FaFileInvoiceDollar />;
            case FinancialOperationType.RECEIPT:
                return <FaReceipt />;
            case FinancialOperationType.OTHER:
                return <FaExchangeAlt />;
            default:
                return <FaExchangeAlt />;
        }
    };

    // Formatowanie kwoty
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: formData.currency || 'PLN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <FormContainer>
            <Form onSubmit={handleSubmit}>
                <FormHeader>
                    <OperationTypeIcon type={formData.type || FinancialOperationType.INVOICE}>
                        {getTypeIcon()}
                    </OperationTypeIcon>
                    <OperationTypeSelect>
                        <Label htmlFor="type">Typ operacji*</Label>
                        <Select
                            id="type"
                            name="type"
                            value={formData.type || FinancialOperationType.INVOICE}
                            onChange={handleTypeChange}
                            required
                        >
                            {Object.entries(FinancialOperationTypeLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </Select>
                    </OperationTypeSelect>
                </FormHeader>

                {/* Sekcja wczytywania pliku - tylko dla faktur i paragonów */}
                {(formData.type === FinancialOperationType.INVOICE || formData.type === FinancialOperationType.RECEIPT) && (
                    <FileUploadSection>
                        <FileUploadLabel>
                            {formData.type === FinancialOperationType.INVOICE ? 'Wczytaj fakturę' : 'Wczytaj paragon'}
                        </FileUploadLabel>

                        {selectedFile ? (
                            <SelectedFileContainer>
                                <SelectedFileName>
                                    <FileTypeIcon type={formData.type || FinancialOperationType.INVOICE}>
                                        {getTypeIcon()}
                                    </FileTypeIcon>
                                    <span>{selectedFile.name}</span>
                                </SelectedFileName>
                                <RemoveFileButton type="button" onClick={handleRemoveFile}>
                                    <FaTimes />
                                </RemoveFileButton>
                            </SelectedFileContainer>
                        ) : (
                            <FileUploadContainer>
                                <FileUploadButton type="button" onClick={() => fileInputRef.current?.click()}>
                                    <FaUpload />
                                    <span>{fileUploading ? 'Przetwarzanie...' : 'Wybierz plik'}</span>
                                    {fileUploading && <FaSpinner className="spinner" />}
                                </FileUploadButton>
                                <FileInput
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                <FileUploadInfo>
                                    {formData.type === FinancialOperationType.INVOICE
                                        ? 'Wczytaj fakturę, aby automatycznie uzupełnić formularz'
                                        : 'Zapisz obraz paragonu jako załącznik'}
                                </FileUploadInfo>
                            </FileUploadContainer>
                        )}

                        {fileError && (
                            <FileErrorMessage>
                                <FaExclamationTriangle />
                                <span>{fileError}</span>
                            </FileErrorMessage>
                        )}
                    </FileUploadSection>
                )}

                <FormGrid>
                    <FormGroup>
                        <Label htmlFor="title">Tytuł operacji*</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title || ''}
                            onChange={handleChange}
                            placeholder="Np. Zakup materiałów"
                            required
                        />
                        {errors.title && <ErrorText>{errors.title}</ErrorText>}
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="direction">Kierunek*</Label>
                        <Select
                            id="direction"
                            name="direction"
                            value={formData.direction || TransactionDirection.INCOME}
                            onChange={handleChange}
                            required
                        >
                            {Object.entries(TransactionDirectionLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="documentNumber">Numer dokumentu</Label>
                        <Input
                            id="documentNumber"
                            name="documentNumber"
                            value={formData.documentNumber || ''}
                            onChange={handleChange}
                            placeholder="Np. FV/2023/123"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="description">Opis</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            placeholder="Dodatkowy opis operacji"
                            rows={3}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="date">Data operacji*</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            value={formData.date || ''}
                            onChange={handleChange}
                            required
                        />
                        {errors.date && <ErrorText>{errors.date}</ErrorText>}
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="dueDate">Termin płatności</Label>
                        <Input
                            id="dueDate"
                            name="dueDate"
                            type="date"
                            value={formData.dueDate || ''}
                            onChange={handleChange}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="counterpartyName">Kontrahent*</Label>
                        <Input
                            id="counterpartyName"
                            name="counterpartyName"
                            value={formData.counterpartyName || ''}
                            onChange={handleChange}
                            placeholder="Nazwa kontrahenta"
                            required
                        />
                        {errors.counterpartyName && <ErrorText>{errors.counterpartyName}</ErrorText>}
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="amount">Kwota brutto*</Label>
                        <CurrencyInput>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount || ''}
                                onChange={handleNumericChange}
                                placeholder="0.00"
                                required
                            />
                            <CurrencySelect
                                id="currency"
                                name="currency"
                                value={formData.currency || 'PLN'}
                                onChange={handleChange}
                            >
                                <option value="PLN">PLN</option>
                                <option value="EUR">EUR</option>
                                <option value="USD">USD</option>
                                <option value="GBP">GBP</option>
                            </CurrencySelect>
                        </CurrencyInput>
                        {errors.amount && <ErrorText>{errors.amount}</ErrorText>}
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
                        <Label htmlFor="status">Status płatności*</Label>
                        <Select
                            id="status"
                            name="status"
                            value={formData.status || PaymentStatus.UNPAID}
                            onChange={handleChange}
                            required
                        >
                            {Object.entries(PaymentStatusLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="paidAmount">Zapłacona kwota</Label>
                        <Input
                            id="paidAmount"
                            name="paidAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.paidAmount || ''}
                            onChange={handleNumericChange}
                            placeholder="0.00"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="protocolId">ID protokołu</Label>
                        <Input
                            id="protocolId"
                            name="protocolId"
                            value={formData.protocolId || ''}
                            onChange={handleChange}
                            placeholder="ID powiązanego protokołu"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="visitId">ID wizyty</Label>
                        <Input
                            id="visitId"
                            name="visitId"
                            value={formData.visitId || ''}
                            onChange={handleChange}
                            placeholder="ID powiązanej wizyty"
                        />
                    </FormGroup>
                </FormGrid>

                {/* Sekcja pozycji faktury - tylko dla faktur */}
                {formData.type === FinancialOperationType.INVOICE && (
                    <ItemsSection>
                        <SectionHeader>
                            <SectionTitle>Pozycje faktury</SectionTitle>
                            <AddItemButton type="button" onClick={handleAddItem}>
                                <FaPlus />
                                <span>Dodaj pozycję</span>
                            </AddItemButton>
                        </SectionHeader>

                        {errors.items && <ErrorText>{errors.items}</ErrorText>}

                        <ItemsTable>
                            <thead>
                            <tr>
                                <th>Nazwa</th>
                                <th>Opis</th>
                                <th>Ilość</th>
                                <th>Cena jedn.</th>
                                <th>VAT %</th>
                                <th>Netto</th>
                                <th>Brutto</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {!formData.items || formData.items.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="empty-items">
                                        <EmptyItemsMessage>
                                            Brak pozycji. Kliknij "Dodaj pozycję", aby dodać pierwszą pozycję do faktury.
                                        </EmptyItemsMessage>
                                    </td>
                                </tr>
                            ) : (
                                formData.items.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td>
                                            <Input
                                                value={item.name}
                                                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                                placeholder="Nazwa pozycji"
                                            />
                                            {errors[`item_${index}_name`] && (
                                                <ErrorText>{errors[`item_${index}_name`]}</ErrorText>
                                            )}
                                        </td>
                                        <td>
                                            <Input
                                                value={item.description || ''}
                                                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                placeholder="Opis (opcjonalnie)"
                                            />
                                        </td>
                                        <td>
                                            <QuantityInput
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                            />
                                            {errors[`item_${index}_quantity`] && (
                                                <ErrorText>{errors[`item_${index}_quantity`]}</ErrorText>
                                            )}
                                        </td>
                                        <td>
                                            <PriceInput
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            />
                                            {errors[`item_${index}_unitPrice`] && (
                                                <ErrorText>{errors[`item_${index}_unitPrice`]}</ErrorText>
                                            )}
                                        </td>
                                        <td>
                                            <TaxSelect
                                                value={item.taxRate}
                                                onChange={(e) => handleItemChange(item.id, 'taxRate', parseFloat(e.target.value))}
                                            >
                                                <option value="0">0%</option>
                                                <option value="5">5%</option>
                                                <option value="8">8%</option>
                                                <option value="23">23%</option>
                                            </TaxSelect>
                                        </td>
                                        <td>
                                            <AmountDisplay>{formatAmount(item.totalNet)}</AmountDisplay>
                                        </td>
                                        <td>
                                            <AmountDisplay>{formatAmount(item.totalGross)}</AmountDisplay>
                                        </td>
                                        <td>
                                            <ItemActionButton
                                                type="button"
                                                onClick={() => handleRemoveItem(item.id)}
                                                title="Usuń pozycję"
                                            >
                                                <FaTrashAlt />
                                            </ItemActionButton>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                            {formData.items && formData.items.length > 0 && (
                                <tfoot>
                                <tr>
                                    <td colSpan={5} className="summary-label">Razem:</td>
                                    <td className="summary-value">
                                        {formatAmount(formData.items.reduce((sum, item) => sum + item.totalNet, 0))}
                                    </td>
                                    <td className="summary-value">
                                        {formatAmount(formData.items.reduce((sum, item) => sum + item.totalGross, 0))}
                                    </td>
                                    <td></td>
                                </tr>
                                </tfoot>
                            )}
                        </ItemsTable>
                    </ItemsSection>
                )}

                <FormActions>
                    <SecondaryButton type="button" onClick={onCancel}>
                        Anuluj
                    </SecondaryButton>
                    <PrimaryButton type="submit">
                        {operation ? 'Zapisz zmiany' : 'Dodaj operację'}
                    </PrimaryButton>
                </FormActions>
            </Form>
        </FormContainer>
    );
};

const FormContainer = styled.div`
    width: 100%; /* Pełna szerokość dostępnego miejsca */
    margin: 0 auto;
`;

const Form = styled.form``;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

interface OperationTypeIconProps {
    type: FinancialOperationType;
}

const OperationTypeIcon = styled.div<OperationTypeIconProps>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background-color: ${props => {
    switch (props.type) {
        case FinancialOperationType.INVOICE:
            return '#ebf5fb';
        case FinancialOperationType.RECEIPT:
            return '#eafaf1';
        case FinancialOperationType.OTHER:
            return '#f4f6f7';
        default:
            return '#f4f6f7';
    }
}};
  color: ${props => {
    switch (props.type) {
        case FinancialOperationType.INVOICE:
            return '#3498db';
        case FinancialOperationType.RECEIPT:
            return '#2ecc71';
        case FinancialOperationType.OTHER:
            return '#95a5a6';
        default:
            return '#95a5a6';
    }
}};
`;

const OperationTypeSelect = styled.div`
  flex: 1;
`;

const FileUploadSection = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ccc;
`;

const FileUploadLabel = styled.div`
  font-weight: 500;
  margin-bottom: 12px;
  color: #2c3e50;
`;

const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const FileUploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: white;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileUploadInfo = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  text-align: center;
`;

const SelectedFileContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #dfe6e9;
`;

const SelectedFileName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #2c3e50;
`;

const FileTypeIcon = styled.div<OperationTypeIconProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: ${props => {
    switch (props.type) {
        case FinancialOperationType.INVOICE:
            return '#3498db';
        case FinancialOperationType.RECEIPT:
            return '#2ecc71';
        default:
            return '#95a5a6';
    }
}};
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #c0392b;
  }
`;

const FileErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  color: #e74c3c;
  font-size: 14px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  padding: 10px 12px;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
  }
`;

const CurrencyInput = styled.div`
  display: flex;
`;

const CurrencySelect = styled(Select)`
  width: 80px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: none;
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
`;

const ItemsSection = styled.div`
  margin-top: 24px;
  margin-bottom: 24px;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eef2f7;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
`;

const AddItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  background-color: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const ItemsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed; /* Dodajemy fixed layout dla lepszej kontroli szerokości kolumn */

    th, td {
        text-align: left;
        padding: 12px;
        font-size: 14px;
        border-bottom: 1px solid #eef2f7;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    th {
        font-weight: 600;
        color: #2c3e50;
        background-color: #f8f9fa;
    }

    /* Ustawiamy konkretne szerokości kolumn */
    th:nth-child(1) { /* Nazwa */
        width: 25%;
    }

    th:nth-child(2) { /* Opis */
        width: 25%;
    }

    th:nth-child(3) { /* Ilość */
        width: 8%;
    }

    th:nth-child(4) { /* Cena jedn. */
        width: 10%;
    }

    th:nth-child(5) { /* VAT % */
        width: 8%;
    }

    th:nth-child(6) { /* Netto */
        width: 10%;
    }

    th:nth-child(7) { /* Brutto */
        width: 10%;
    }

    th:nth-child(8) { /* Akcje */
        width: 4%;
    }

    .empty-items {
        text-align: center;
        padding: 24px;
    }

    tfoot td {
        border-top: 2px solid #eef2f7;
        font-weight: 600;
        color: #2c3e50;
        padding: 12px;
    }

    .summary-label {
        text-align: right;
    }

    .summary-value {
        text-align: right;
        font-weight: 600;
    }

    @media (max-width: 992px) {
        /* Na mniejszych ekranach stosujemy scroll poziomy */
        display: block;
        overflow-x: auto;
        white-space: nowrap;
    }
`;

const EmptyItemsMessage = styled.div`
  color: #7f8c8d;
  font-style: italic;
`;

const QuantityInput = styled.input`
    width: 100%;
    min-width: 60px;
    padding: 8px;
    border: 1px solid #dfe6e9;
    border-radius: 4px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
`;

const PriceInput = styled.input`
    width: 100%;
    min-width: 80px;
    padding: 8px;
    border: 1px solid #dfe6e9;
    border-radius: 4px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
`;


const TaxSelect = styled.select`
    width: 100%;
    min-width: 60px;
    padding: 8px;
    border: 1px solid #dfe6e9;
    border-radius: 4px;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
`;

const AmountDisplay = styled.div`
  text-align: right;
  font-weight: 500;
  padding: 8px 0;
`;

const ItemActionButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #c0392b;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  
  @media (max-width: 576px) {
    flex-direction: column-reverse;
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
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #3498db;
  color: white;
  border: none;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: white;
  color: #2c3e50;
  border: 1px solid #dfe6e9;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

export default FinancialOperationForm;