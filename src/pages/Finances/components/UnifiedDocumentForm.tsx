// src/pages/Finances/components/UnifiedDocumentForm.tsx
import React, {useRef, useState} from 'react';
import styled from 'styled-components';
import {
    FaExchangeAlt,
    FaFileInvoiceDollar,
    FaFilePdf,
    FaFileUpload,
    FaPlus,
    FaReceipt,
    FaSpinner,
    FaTrash
} from 'react-icons/fa';
import {
    DocumentAttachment,
    DocumentItem,
    DocumentStatus,
    DocumentStatusLabels,
    DocumentType,
    DocumentTypeLabels,
    PaymentMethod,
    PaymentMethodLabels,
    TransactionDirection,
    TransactionDirectionLabels,
    UnifiedFinancialDocument
} from '../../../types';
import {unifiedFinancialApi} from '../../../api/unifiedFinancialApi';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';

interface UnifiedDocumentFormProps {
    document?: UnifiedFinancialDocument;
    initialData?: Partial<UnifiedFinancialDocument>;
    onSave: (document: Partial<UnifiedFinancialDocument>, file?: File | null) => void;
    onCancel: () => void;
}

const emptyDocument: Partial<UnifiedFinancialDocument> = {
    title: '',
    type: DocumentType.INVOICE,
    issuedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sellerName: 'Detailing Pro Sp. z o.o.',
    sellerTaxId: '1234567890',
    sellerAddress: 'ul. Polerska 15, 00-123 Warszawa',
    buyerName: '',
    buyerTaxId: '',
    buyerAddress: '',
    status: DocumentStatus.NOT_PAID,
    direction: TransactionDirection.INCOME,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    totalNet: 0,
    totalTax: 0,
    totalGross: 0,
    currency: 'PLN',
    notes: '',
    items: [],
    attachments: []
};

const emptyItem: DocumentItem = {
    id: '',
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 23,
    totalNet: 0,
    totalGross: 0
};

const UnifiedDocumentForm: React.FC<UnifiedDocumentFormProps> = ({
                                                                     document,
                                                                     initialData = {},
                                                                     onSave,
                                                                     onCancel
                                                                 }) => {
    const mergedData = { ...emptyDocument, ...initialData, ...(document || {}) };
    const [formData, setFormData] = useState<Partial<UnifiedFinancialDocument>>(mergedData);

    const [items, setItems] = useState<DocumentItem[]>(document?.items || []);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showExtractConfirmation, setShowExtractConfirmation] = useState<boolean>(false);
    const [isExtracting, setIsExtracting] = useState<boolean>(false);
    const [extractionError, setExtractionError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Obsługa zmian w formularzu
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Usuwamy błędy dla edytowanego pola
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Obsługa zmiany typu dokumentu
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value as DocumentType;

        setFormData(prev => {
            const updated = { ...prev, type };

            // Automatyczne ustawienia w zależności od typu
            if (type === DocumentType.INVOICE) {
                // Faktury mogą być zarówno przychodowe jak i kosztowe
                updated.dueDate = updated.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            } else if (type === DocumentType.RECEIPT) {
                // Paragony zazwyczaj to wydatki i nie mają terminu płatności
                updated.direction = TransactionDirection.EXPENSE;
                updated.dueDate = undefined;
            } else if (type === DocumentType.OTHER) {
                // Inne operacje - usuń termin płatności
                updated.dueDate = undefined;
            }

            return updated;
        });

        // Jeśli nie ma jeszcze pozycji, dodaj jedną domyślną
        if (items.length === 0) {
            const newItem = {
                ...emptyItem,
                id: `temp-${Date.now()}`
            };
            setItems([newItem]);
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
    const handleItemChange = (itemId: string, field: keyof DocumentItem, value: any) => {
        setItems(prev => {
            const updatedItems = prev.map(item => {
                if (item.id === itemId) {
                    const updatedItem = { ...item, [field]: value };

                    // Jeśli zmieniono cenę jednostkową, ilość lub stawkę VAT, przeliczamy wartości
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
            });

            // Przeliczamy sumy bezpośrednio po aktualizacji tablicy items
            const totalNet = updatedItems.reduce((sum, item) => sum + item.totalNet, 0);
            const totalGross = updatedItems.reduce((sum, item) => sum + item.totalGross, 0);
            const totalTax = totalGross - totalNet;

            // Aktualizujemy formData z nowymi sumami
            setFormData(prev => ({
                ...prev,
                totalNet,
                totalGross,
                totalTax
            }));

            return updatedItems;
        });
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

        const file = files[0];
        setSelectedFile(file);

        const newAttachment: DocumentAttachment = {
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            url: URL.createObjectURL(file)
        };

        setFormData(prev => ({
            ...prev,
            attachments: [newAttachment]
        }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Pokazujemy dialog z pytaniem o ekstrakcję danych tylko dla faktur i paragonów
        if (formData.type === DocumentType.INVOICE || formData.type === DocumentType.RECEIPT) {
            setShowExtractConfirmation(true);
        }
    };

    // Obsługa usuwania załącznika
    const handleRemoveAttachment = (attachmentId: string) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments?.filter(att => att.id !== attachmentId) || []
        }));
        setSelectedFile(null);
    };

    // Funkcja do ekstrakcji danych z dokumentu
    const extractDocumentData = async () => {
        setShowExtractConfirmation(false);

        if (!selectedFile) {
            console.error('Brak pliku do ekstrakcji');
            return;
        }

        try {
            setIsExtracting(true);
            setExtractionError(null);

            const result = await unifiedFinancialApi.extractDocumentData(selectedFile);
            const extractedData = result?.extractedInvoiceData

            if (extractedData) {
                const mappedItems: DocumentItem[] = extractedData.items.map((item, index) => ({
                    id: `extracted-${Date.now()}-${index}`,
                    name: item.name,
                    description: item.description || '',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    taxRate: item.taxRate,
                    totalNet: item.totalNet,
                    totalGross: item.totalGross
                }));

                // ✅ Bezpieczna konwersja String na TransactionDirection
                const extractedDirection = result.direction === 'INCOME' ? TransactionDirection.INCOME :
                    result.direction === 'EXPENSE' ? TransactionDirection.EXPENSE :
                        TransactionDirection.INCOME; // fallback

                setFormData(prev => ({
                    ...prev,
                    title: extractedData.generalInfo.title || '',
                    issuedDate: new Date(extractedData.generalInfo.issuedDate).toISOString().split('T')[0],
                    dueDate: extractedData.generalInfo.dueDate ? new Date(extractedData.generalInfo.dueDate).toISOString().split('T')[0] : prev.dueDate,
                    sellerName: extractedData.seller.name,
                    sellerTaxId: extractedData.seller.taxId || '',
                    sellerAddress: extractedData.seller.address || '',
                    buyerName: extractedData.buyer.name,
                    buyerTaxId: extractedData.buyer.taxId || '',
                    buyerAddress: extractedData.buyer.address || '',
                    totalNet: extractedData.summary.totalNet,
                    totalTax: extractedData.summary.totalTax,
                    totalGross: extractedData.summary.totalGross,
                    notes: extractedData.notes || '',
                    direction: extractedDirection // ✅ Poprawny typ TransactionDirection
                }));

                setItems(mappedItems);
            }
        } catch (error) {
            console.error('Błąd podczas ekstrakcji danych z dokumentu:', error);
            setExtractionError('Nie udało się przetworzyć pliku. Sprawdź czy plik jest poprawnym dokumentem.');
        } finally {
            setIsExtracting(false);
        }
    };

    // Walidacja formularza
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.title?.trim()) {
            errors.title = 'Nazwa dokumentu jest wymagana';
        }

        if (!formData.issuedDate) {
            errors.issuedDate = 'Data wystawienia jest wymagana';
        }

        if (!formData.buyerName?.trim()) {
            errors.buyerName = 'Nazwa kontrahenta jest wymagana';
        }

        // Wszystkie typy dokumentów muszą mieć pozycje
        if (items.length === 0) {
            errors.items = 'Dokument musi zawierać co najmniej jedną pozycję';
        }

        // Sprawdzamy pozycje
        if (items.length > 0) {
            items.forEach((item, index) => {
                if (!item.name.trim()) {
                    errors[`item_${index}_name`] = 'Nazwa pozycji jest wymagana';
                }

                if (item.quantity <= 0) {
                    errors[`item_${index}_quantity`] = 'Ilość musi być większa od zera';
                }

                if (item.unitPrice <= 0) {
                    errors[`item_${index}_unitPrice`] = 'Cena jednostkowa musi być większa od zera';
                }
            });
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Obsługa zapisu formularza
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            const documentData: Partial<UnifiedFinancialDocument> = {
                ...formData,
                items,
                protocolId: initialData.protocolId !== undefined ? initialData.protocolId : formData.protocolId
            };

            delete documentData.attachments;
            onSave(documentData, selectedFile);
        }
    };

    // Formatowanie kwoty
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Obsługa anulowania ekstrakcji danych
    const handleCancelExtraction = () => {
        setShowExtractConfirmation(false);
    };

    // Funkcja zwracająca ikonę dla typu dokumentu
    const getDocumentIcon = () => {
        switch (formData.type) {
            case DocumentType.INVOICE:
                return <FaFileInvoiceDollar />;
            case DocumentType.RECEIPT:
                return <FaReceipt />;
            case DocumentType.OTHER:
                return <FaExchangeAlt />;
            default:
                return <FaFileInvoiceDollar />;
        }
    };

    // Inicjalizacja pozycji przy pierwszym renderowaniu
    React.useEffect(() => {
        if (items.length === 0 && !document) {
            const newItem = {
                ...emptyItem,
                id: `temp-${Date.now()}`
            };
            setItems([newItem]);
        }
    }, []);

    const handleNumberInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    // Helper do obsługi zmiany wartości w polach numerycznych
    const handleNumberInputChange = (
        itemId: string,
        field: 'quantity' | 'unitPrice',
        value: string
    ) => {
        // Jeśli wartość jest pusta, użyj 0, w przeciwnym razie sparsuj wartość
        const numValue = value === '' ? 0 : parseFloat(value) || 0;
        handleItemChange(itemId, field, numValue);
    };

    return (
        <FormContainer>
            {/* Spinner podczas ekstrakcji danych */}
            {isExtracting && (
                <ExtractingOverlay>
                    <ExtractingContainer>
                        <FaSpinner className="spinner" />
                        <ExtractingText>Przetwarzanie dokumentu, proszę czekać...</ExtractingText>
                    </ExtractingContainer>
                </ExtractingOverlay>
            )}

            {/* Dialog potwierdzenia ekstrakcji danych */}
            <ConfirmationDialog
                isOpen={showExtractConfirmation}
                title="Uzupełnić formularz automatycznie?"
                message="Czy chcesz uzupełnić formularz na podstawie wgranego dokumentu? Proces może potrwać kilkadziesiąt sekund."
                confirmText="Tak, uzupełnij"
                cancelText="Nie, dziękuję"
                onConfirm={extractDocumentData}
                onCancel={handleCancelExtraction}
            />

            {/* Błąd ekstrakcji */}
            {extractionError && (
                <ErrorBanner>
                    <ErrorText>{extractionError}</ErrorText>
                    <CloseErrorButton onClick={() => setExtractionError(null)}>
                        <FaTrash />
                    </CloseErrorButton>
                </ErrorBanner>
            )}

            <Form onSubmit={handleSubmit}>
                <FormSection>
                    <FormHeader>
                        <DocumentTypeIcon type={formData.type || DocumentType.INVOICE}>
                            {getDocumentIcon()}
                        </DocumentTypeIcon>
                        <DocumentTypeSelect>
                            <Label htmlFor="type">Typ dokumentu*</Label>
                            <Select
                                id="type"
                                name="type"
                                value={formData.type || DocumentType.INVOICE}
                                onChange={handleTypeChange}
                                required
                            >
                                {Object.entries(DocumentTypeLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                        </DocumentTypeSelect>
                    </FormHeader>

                    <SectionTitle>Dane podstawowe</SectionTitle>
                    <FormGrid>
                        <FormGroup>
                            <Label htmlFor="number">Numer dokumentu</Label>
                            <Input
                                id="number"
                                name="number"
                                value={document?.number || ''}
                                disabled
                                readOnly
                            />
                            <HelpText>Numer zostanie nadany automatycznie przez system przy zapisie</HelpText>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="title">Nazwa dokumentu*</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                placeholder="Np. Zakup materiałów do detailingu"
                                required
                            />
                            {formErrors.title && <ErrorText>{formErrors.title}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="direction">Kierunek*</Label>
                            <Select
                                id="direction"
                                name="direction"
                                value={formData.direction || TransactionDirection.INCOME}
                                onChange={handleChange}
                                required
                                disabled={initialData.direction !== undefined}
                            >
                                {Object.entries(TransactionDirectionLabels).map(([key, label]) => (
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

                        {(formData.type === DocumentType.INVOICE) && (
                            <FormGroup>
                                <Label htmlFor="dueDate">Termin płatności</Label>
                                <Input
                                    id="dueDate"
                                    name="dueDate"
                                    type="date"
                                    value={formData.dueDate?.split('T')[0] || ''}
                                    onChange={handleChange}
                                />
                            </FormGroup>
                        )}

                        <FormGroup>
                            <Label htmlFor="status">Status*</Label>
                            <Select
                                id="status"
                                name="status"
                                value={formData.status || DocumentStatus.NOT_PAID}
                                onChange={handleChange}
                                required
                            >
                                {Object.entries(DocumentStatusLabels).map(([key, label]) => (
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
                            <Label htmlFor="protocolId">Protokół</Label>
                            <Input
                                id="protocolId"
                                name="protocolId"
                                value={initialData.protocolId ? `Protokół #${initialData.protocolId}` : formData.protocolNumber || ''}
                                disabled={initialData.protocolId !== undefined}
                                readOnly={initialData.protocolId !== undefined}
                                onChange={handleChange}
                            />
                            {initialData.protocolId && (
                                <HelpText>Dokument jest powiązany z aktualnie przeglądanym zleceniem</HelpText>
                            )}
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

                {/* Pozycje - dla wszystkich typów dokumentów */}
                <FormSection>
                    <SectionTitleRow>
                        <SectionTitle>Pozycje dokumentu</SectionTitle>
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
                                    <NoItems>Brak pozycji. Kliknij "Dodaj pozycję", aby dodać pierwszą pozycję do dokumentu.</NoItems>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <Input
                                            value={item.name}
                                            onChange={(e) => handleItemChange(item.id!, 'name', e.target.value)}
                                            placeholder="Nazwa"
                                            required
                                        />
                                    </td>
                                    <td>
                                        <Input
                                            value={item.description || ''}
                                            onChange={(e) => handleItemChange(item.id!, 'description', e.target.value)}
                                            placeholder="Opis (opcjonalnie)"
                                        />
                                    </td>
                                    <td>
                                        <NumberInput
                                            value={item.quantity === 0 ? '' : item.quantity}
                                            onChange={(e) => handleNumberInputChange(item.id!, 'quantity', e.target.value)}
                                            onFocus={handleNumberInputFocus}
                                            placeholder="0"
                                            min={0.01}
                                            step={0.01}
                                            required
                                        />
                                    </td>
                                    <td>
                                        <NumberInput
                                            value={item.unitPrice === 0 ? '' : item.unitPrice}
                                            onChange={(e) => handleNumberInputChange(item.id!, 'unitPrice', e.target.value)}
                                            onFocus={handleNumberInputFocus}
                                            placeholder="0.00"
                                            min={0}
                                            step={0.01}
                                            required
                                        />
                                    </td>
                                    <td>
                                        <Select
                                            value={item.taxRate}
                                            onChange={(e) => handleItemChange(item.id!, 'taxRate', parseFloat(e.target.value))}
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
                                        <RemoveButton type="button" onClick={() => handleRemoveItem(item.id!)}>
                                            <FaTrash />
                                        </RemoveButton>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                        {items.length > 0 && (
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
                        )}
                    </ItemsTable>
                </FormSection>

                {/* Sekcja załączników */}
                <FormSection>
                    <SectionTitle>Załączniki</SectionTitle>
                    <AttachmentsContainer>
                        <AttachmentsList>
                            {formData.attachments && formData.attachments.length > 0 ? (
                                formData.attachments.map(att => (
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
                                ))
                            ) : (
                                <NoAttachments>
                                    Brak załączników
                                </NoAttachments>
                            )}
                        </AttachmentsList>

                        <UploadButtonContainer>
                            <FileUploadButton
                                htmlFor="document-attachment"
                                disabled={formData.attachments && formData.attachments.length > 0}
                            >
                                <FaFileUpload />
                                <span>Dodaj załącznik</span>
                            </FileUploadButton>
                            <FileInput
                                id="document-attachment"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                                disabled={formData.attachments && formData.attachments.length > 0}
                            />
                        </UploadButtonContainer>
                    </AttachmentsContainer>
                </FormSection>

                {/* Sekcja uwag */}
                <FormSection>
                    <SectionTitle>Uwagi</SectionTitle>
                    <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        placeholder="Dodatkowe uwagi do dokumentu (opcjonalnie)"
                        rows={4}
                    />
                </FormSection>

                <FormActions>
                    <CancelButton type="button" onClick={onCancel}>
                        Anuluj
                    </CancelButton>
                    <SaveButton type="submit">
                        {document ? 'Zapisz zmiany' : 'Dodaj dokument'}
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
    position: relative;
`;

const ExtractingOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ExtractingContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    width: 300px;

    .spinner {
        animation: spin 1s linear infinite;
        font-size: 36px;
        color: #3498db;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;

const ExtractingText = styled.div`
    font-size: 16px;
    font-weight: 500;
    color: #333;
    text-align: center;
`;

const ErrorBanner = styled.div`
    background-color: #fef2f2;
    color: #e74c3c;
    padding: 12px 16px;
    margin-bottom: 16px;
    border-radius: 4px;
    border-left: 4px solid #e74c3c;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ErrorText = styled.div`
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
`;

const CloseErrorButton = styled.button`
    background: none;
    border: none;
    color: #e74c3c;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Form = styled.form`
    padding: 24px;
    position: relative;
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

const FormHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
`;

interface DocumentTypeIconProps {
    type: DocumentType;
}

const DocumentTypeIcon = styled.div<DocumentTypeIconProps>`
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background-color: ${props => {
        switch (props.type) {
            case DocumentType.INVOICE:
                return '#ebf5fb';
            case DocumentType.RECEIPT:
                return '#eafaf1';
            case DocumentType.OTHER:
                return '#f4f6f7';
            default:
                return '#f4f6f7';
        }
    }};
    color: ${props => {
        switch (props.type) {
            case DocumentType.INVOICE:
                return '#3498db';
            case DocumentType.RECEIPT:
                return '#2ecc71';
            case DocumentType.OTHER:
                return '#95a5a6';
            default:
                return '#95a5a6';
        }
    }};
`;

const DocumentTypeSelect = styled.div`
    flex: 1;
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

const HelpText = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    font-style: italic;
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
    table-layout: fixed;

    th, td {
        text-align: left;
        padding: 12px 8px;
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

    th:nth-child(1) { width: 25%; }
    th:nth-child(2) { width: 25%; }
    th:nth-child(3) { width: 8%; }
    th:nth-child(4) { width: 10%; }
    th:nth-child(5) { width: 8%; }
    th:nth-child(6) { width: 10%; }
    th:nth-child(7) { width: 10%; }
    th:nth-child(8) { width: 4%; }

    tfoot td {
        border-top: 2px solid #eef2f7;
        font-weight: 600;
        color: #2c3e50;
        padding: 12px 8px;
    }

    @media (max-width: 992px) {
        display: block;
        overflow-x: auto;
        white-space: nowrap;
    }
`;

const NoItems = styled.div`
    color: #7f8c8d;
    font-style: italic;
    text-align: center;
    padding: 24px;
`;

const AmountDisplay = styled.div<{ bold?: boolean }>`
    text-align: right;
    font-weight: ${props => props.bold ? 'bold' : 'normal'};
    padding: 8px 0;
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

const FileUploadButton = styled.label<{ disabled?: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: ${props => props.disabled ? '#f8f9fa' : '#f0f7ff'};
    color: ${props => props.disabled ? '#adb5bd' : '#3498db'};
    border: 1px solid ${props => props.disabled ? '#dee2e6' : '#d5e9f9'};
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? 0.7 : 1};

    &:hover {
        background-color: ${props => props.disabled ? '#f8f9fa' : '#d5e9f9'};
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

export default UnifiedDocumentForm;