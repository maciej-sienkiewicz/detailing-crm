import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaMoneyBillWave, FaPlus, FaMinus } from 'react-icons/fa';
import { CashTransaction, TransactionType, TransactionTypeLabels } from '../../../types/cash';

interface AddCashTransactionModalProps {
    isOpen: boolean;
    transaction: CashTransaction | null;
    onSave: (transaction: Omit<CashTransaction, 'id' | 'createdAt' | 'createdBy'>) => void;
    onClose: () => void;
}

const AddCashTransactionModal: React.FC<AddCashTransactionModalProps> = ({
                                                                             isOpen,
                                                                             transaction,
                                                                             onSave,
                                                                             onClose
                                                                         }) => {
    const [formData, setFormData] = useState<Omit<CashTransaction, 'id' | 'createdAt' | 'createdBy'>>({
        type: TransactionType.INCOME,
        description: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Inicjalizacja formularza danymi z transakcji, jeśli jest edytowana
    useEffect(() => {
        if (transaction) {
            setFormData({
                type: transaction.type,
                description: transaction.description,
                date: new Date(transaction.date).toISOString().split('T')[0],
                visitId: transaction.visitId,
                visitNumber: transaction.visitNumber,
                amount: transaction.amount,
            });
        } else {
            // Reset formularza dla nowej transakcji
            setFormData({
                type: TransactionType.INCOME,
                description: '',
                date: new Date().toISOString().split('T')[0],
                amount: 0,
            });
        }
    }, [transaction]);

    // Obsługa zmiany wartości w formularzu
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'amount') {
            // Konwersja wartości na liczbę, a jeśli nie jest liczbą, ustaw 0
            const numericValue = parseFloat(value);
            setFormData(prev => ({
                ...prev,
                [name]: isNaN(numericValue) ? 0 : numericValue
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Usuwamy błędy dla edytowanego pola
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Walidacja formularza
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.description?.trim()) {
            errors.description = 'Opis jest wymagany';
        }

        if (!formData.date) {
            errors.date = 'Data jest wymagana';
        }

        if (formData.amount <= 0) {
            errors.amount = 'Kwota musi być większa od zera';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Obsługa zapisu formularza
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSave(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>
                        {transaction ? 'Edytuj transakcję' : 'Dodaj nową transakcję'}
                    </ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>
                <ModalContent>
                    <Form onSubmit={handleSubmit}>
                        <FormSection>
                            <FormGroup>
                                <Label htmlFor="type">Rodzaj transakcji*</Label>
                                <TypeSelector>
                                    <TypeOption
                                        type={TransactionType.INCOME}
                                        isSelected={formData.type === TransactionType.INCOME}
                                        onClick={() => setFormData(prev => ({ ...prev, type: TransactionType.INCOME }))}
                                    >
                                        <FaPlus />
                                        <span>Wpłata do kasy</span>
                                    </TypeOption>
                                    <TypeOption
                                        type={TransactionType.EXPENSE}
                                        isSelected={formData.type === TransactionType.EXPENSE}
                                        onClick={() => setFormData(prev => ({ ...prev, type: TransactionType.EXPENSE }))}
                                    >
                                        <FaMinus />
                                        <span>Wypłata z kasy</span>
                                    </TypeOption>
                                </TypeSelector>
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="description">Opis transakcji*</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Np. Płatność za usługę detailingową"
                                    rows={3}
                                />
                                {formErrors.description && <ErrorText>{formErrors.description}</ErrorText>}
                            </FormGroup>

                            <FormGroupRow>
                                <FormGroup>
                                    <Label htmlFor="date">Data transakcji*</Label>
                                    <Input
                                        id="date"
                                        name="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                    {formErrors.date && <ErrorText>{formErrors.date}</ErrorText>}
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="amount">Kwota*</Label>
                                    <InputWithIcon>
                                        <AmountInput
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={formData.amount || ''}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            required
                                        />
                                        <InputIcon>PLN</InputIcon>
                                    </InputWithIcon>
                                    {formErrors.amount && <ErrorText>{formErrors.amount}</ErrorText>}
                                </FormGroup>
                            </FormGroupRow>

                            <FormGroup>
                                <Label htmlFor="visitNumber">Powiązana wizyta (opcjonalnie)</Label>
                                <Input
                                    id="visitNumber"
                                    name="visitNumber"
                                    value={formData.visitNumber || ''}
                                    onChange={handleChange}
                                    placeholder="Np. WIZ/2024/123"
                                />
                                <HelpText>Wprowadź numer wizyty, jeśli transakcja jest powiązana z konkretną wizytą.</HelpText>
                            </FormGroup>
                        </FormSection>

                        <FormActions>
                            <CancelButton type="button" onClick={onClose}>
                                Anuluj
                            </CancelButton>
                            <SaveButton type="submit">
                                {transaction ? 'Zapisz zmiany' : 'Dodaj transakcję'}
                            </SaveButton>
                        </FormActions>
                    </Form>
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Style komponentów
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
    z-index: 1000;
    padding: 20px;
`;

const ModalContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 600px;
    max-width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    background-color: #f8f9fa;
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    &:hover {
        color: #34495e;
    }
`;

const ModalContent = styled.div`
    overflow-y: auto;
    padding: 0;
`;

const Form = styled.form`
    padding: 20px;
`;

const FormSection = styled.div`
    margin-bottom: 24px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
`;

const FormGroupRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    
    @media (max-width: 576px) {
        grid-template-columns: 1fr;
    }
`;

const Label = styled.label`
    font-size: 14px;
    color: #34495e;
    font-weight: 500;
`;

const TypeSelector = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    
    @media (max-width: 576px) {
        grid-template-columns: 1fr;
    }
`;

const TypeOption = styled.div<{ type: TransactionType; isSelected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 4px;
    cursor: pointer;
    background-color: ${props => props.isSelected ? `${props.type === TransactionType.INCOME ? '#2ecc7122' : '#e74c3c22'}` : '#f8f9fa'};
    border: 2px solid ${props => props.isSelected ? (props.type === TransactionType.INCOME ? '#2ecc71' : '#e74c3c') : '#dfe6e9'};
    color: ${props => props.isSelected ? (props.type === TransactionType.INCOME ? '#2ecc71' : '#e74c3c') : '#34495e'};
    font-weight: ${props => props.isSelected ? '600' : '400'};
    transition: all 0.2s ease;
    
    &:hover {
        background-color: ${props => props.type === TransactionType.INCOME ? '#2ecc7122' : '#e74c3c22'};
    }
    
    svg {
        font-size: 16px;
    }
`;

const Input = styled.input`
    padding: 10px 12px;
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

const Textarea = styled.textarea`
    padding: 10px 12px;
    border: 1px solid #dfe6e9;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }
`;

const InputWithIcon = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const AmountInput = styled(Input)`
    padding-right: 50px;
`;

const InputIcon = styled.div`
    position: absolute;
    right: 12px;
    color: #7f8c8d;
    font-weight: 500;
    font-size: 14px;
`;

const ErrorText = styled.div`
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
`;

const HelpText = styled.div`
    color: #7f8c8d;
    font-size: 12px;
    margin-top: 4px;
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    
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

const CancelButton = styled(Button)`
    background-color: white;
    color: #2c3e50;
    border: 1px solid #dfe6e9;

    &:hover {
        background-color: #f8f9fa;
    }
`;

const SaveButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;

    &:hover {
        background-color: #2980b9;
    }
`;

export default AddCashTransactionModal;