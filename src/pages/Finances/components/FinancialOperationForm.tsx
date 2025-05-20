// src/pages/Finances/components/FinancialOperationForm.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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

interface FinancialOperationFormProps {
    operation?: FinancialOperation | null;
    onSave: (operation: Partial<FinancialOperation>) => void;
    onCancel: () => void;
}

const FinancialOperationForm: React.FC<FinancialOperationFormProps> = ({
                                                                           operation,
                                                                           onSave,
                                                                           onCancel
                                                                       }) => {
    // Inicjalizacja stanu formularza
    const [formData, setFormData] = useState<Partial<FinancialOperation>>({
        type: FinancialOperationType.INVOICE,
        title: '',
        date: new Date().toISOString().split('T')[0],
        direction: TransactionDirection.INCOME,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        counterpartyName: '',
        amount: 0,
        status: PaymentStatus.UNPAID,
        currency: 'PLN'
    });

    // Errors state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Uzupełnianie formularza danymi istniejącej operacji
    useEffect(() => {
        if (operation) {
            setFormData({
                ...operation,
                date: operation.date.split('T')[0],
                dueDate: operation.dueDate ? operation.dueDate.split('T')[0] : undefined
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Obsługa zapisu formularza
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSave(formData);
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

    return (
        <FormContainer>
            <Form onSubmit={handleSubmit}>
                <FormGrid>
                    <FormGroup>
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
  max-width: 800px;
  margin: 0 auto;
`;

const Form = styled.form``;

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