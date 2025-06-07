// src/pages/Finances/components/FixedCostFormModal.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaSave, FaBuilding, FaCalendarAlt } from 'react-icons/fa';
import { brandTheme } from '../styles/theme';
import {
    FixedCost,
    CreateFixedCostRequest,
    UpdateFixedCostRequest,
    FixedCostCategory,
    FixedCostCategoryLabels,
    FixedCostStatus,
    FixedCostStatusLabels,
    CostFrequency,
    CostFrequencyLabels,
    SupplierInfo
} from '../../../api/fixedCostsApi';

interface FixedCostFormModalProps {
    isOpen: boolean;
    fixedCost?: FixedCost;
    onSave: (data: CreateFixedCostRequest | UpdateFixedCostRequest) => Promise<void>;
    onClose: () => void;
}

const FixedCostFormModal: React.FC<FixedCostFormModalProps> = ({
                                                                   isOpen,
                                                                   fixedCost,
                                                                   onSave,
                                                                   onClose
                                                               }) => {
    const [formData, setFormData] = useState<CreateFixedCostRequest | UpdateFixedCostRequest>({
        name: '',
        description: '',
        category: 'OTHER' as keyof FixedCostCategory,
        monthlyAmount: 0,
        frequency: 'MONTHLY' as keyof CostFrequency,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'ACTIVE' as keyof FixedCostStatus,
        autoRenew: false,
        supplierInfo: {
            name: '',
            taxId: ''
        },
        contractNumber: '',
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Initialize form data when modal opens or fixed cost changes
    useEffect(() => {
        if (isOpen) {
            if (fixedCost) {
                setFormData({
                    name: fixedCost.name,
                    description: fixedCost.description || '',
                    category: fixedCost.category,
                    monthlyAmount: fixedCost.monthlyAmount,
                    frequency: fixedCost.frequency,
                    startDate: fixedCost.startDate,
                    endDate: fixedCost.endDate || '',
                    status: fixedCost.status,
                    autoRenew: fixedCost.autoRenew,
                    supplierInfo: fixedCost.supplierInfo || { name: '', taxId: '' },
                    contractNumber: fixedCost.contractNumber || '',
                    notes: fixedCost.notes || ''
                });
            } else {
                // Reset form for new fixed cost
                setFormData({
                    name: '',
                    description: '',
                    category: 'OTHER' as keyof FixedCostCategory,
                    monthlyAmount: 0,
                    frequency: 'MONTHLY' as keyof CostFrequency,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    status: 'ACTIVE' as keyof FixedCostStatus,
                    autoRenew: false,
                    supplierInfo: {
                        name: '',
                        taxId: ''
                    },
                    contractNumber: '',
                    notes: ''
                });
            }
            setErrors({});
        }
    }, [isOpen, fixedCost]);

    if (!isOpen) return null;

    const handleChange = (field: string, value: any) => {
        if (field.startsWith('supplierInfo.')) {
            const supplierField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                supplierInfo: {
                    ...prev.supplierInfo!,
                    [supplierField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nazwa jest wymagana';
        }

        if (!formData.category) {
            newErrors.category = 'Kategoria jest wymagana';
        }

        if (!formData.monthlyAmount || formData.monthlyAmount <= 0) {
            newErrors.monthlyAmount = 'Kwota miesięczna musi być większa od 0';
        }

        if (!formData.frequency) {
            newErrors.frequency = 'Częstotliwość jest wymagana';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Data rozpoczęcia jest wymagana';
        }

        if (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
            newErrors.endDate = 'Data zakończenia musi być późniejsza niż data rozpoczęcia';
        }

        if (formData.supplierInfo?.name && !formData.supplierInfo.name.trim()) {
            newErrors['supplierInfo.name'] = 'Nazwa dostawcy nie może być pusta';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            // Clean up supplier info if empty
            const cleanFormData = { ...formData };
            if (!cleanFormData.supplierInfo?.name?.trim()) {
                cleanFormData.supplierInfo = undefined;
            } else if (!cleanFormData.supplierInfo?.taxId?.trim()) {
                cleanFormData.supplierInfo.taxId = undefined;
            }

            // Clean up optional fields
            if (!cleanFormData.description?.trim()) {
                cleanFormData.description = undefined;
            }
            if (!cleanFormData.endDate?.trim()) {
                cleanFormData.endDate = undefined;
            }
            if (!cleanFormData.contractNumber?.trim()) {
                cleanFormData.contractNumber = undefined;
            }
            if (!cleanFormData.notes?.trim()) {
                cleanFormData.notes = undefined;
            }

            await onSave(cleanFormData);
            onClose();
        } catch (error) {
            console.error('Error saving fixed cost:', error);
            // Error is handled by parent component
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>
                        <TitleIcon>
                            <FaBuilding />
                        </TitleIcon>
                        <TitleText>
                            {fixedCost ? 'Edytuj koszt stały' : 'Dodaj nowy koszt stały'}
                        </TitleText>
                    </ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalContent>
                    <Form onSubmit={handleSubmit}>
                        {/* Basic Information */}
                        <FormSection>
                            <SectionTitle>Podstawowe informacje</SectionTitle>
                            <FormGrid>
                                <FormGroup>
                                    <Label htmlFor="name">
                                        Nazwa kosztu stałego *
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="np. Wynajem lokalu, Abonament oprogramowania"
                                        $hasError={!!errors.name}
                                    />
                                    {errors.name && <ErrorText>{errors.name}</ErrorText>}
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="category">
                                        Kategoria *
                                    </Label>
                                    <Select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => handleChange('category', e.target.value)}
                                        $hasError={!!errors.category}
                                    >
                                        {Object.entries(FixedCostCategoryLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </Select>
                                    {errors.category && <ErrorText>{errors.category}</ErrorText>}
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="monthlyAmount">
                                        Kwota miesięczna *
                                    </Label>
                                    <Input
                                        id="monthlyAmount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={formData.monthlyAmount || ''}
                                        onChange={(e) => handleChange('monthlyAmount', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                        $hasError={!!errors.monthlyAmount}
                                    />
                                    {errors.monthlyAmount && <ErrorText>{errors.monthlyAmount}</ErrorText>}
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="frequency">
                                        Częstotliwość *
                                    </Label>
                                    <Select
                                        id="frequency"
                                        value={formData.frequency}
                                        onChange={(e) => handleChange('frequency', e.target.value)}
                                        $hasError={!!errors.frequency}
                                    >
                                        {Object.entries(CostFrequencyLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </Select>
                                    {errors.frequency && <ErrorText>{errors.frequency}</ErrorText>}
                                </FormGroup>
                            </FormGrid>

                            <FormGroup>
                                <Label htmlFor="description">
                                    Opis
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description || ''}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Dodatkowy opis kosztu stałego (opcjonalnie)"
                                    rows={3}
                                />
                            </FormGroup>
                        </FormSection>

                        {/* Dates and Status */}
                        <FormSection>
                            <SectionTitle>Daty i status</SectionTitle>
                            <FormGrid>
                                <FormGroup>
                                    <Label htmlFor="startDate">
                                        Data rozpoczęcia *
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => handleChange('startDate', e.target.value)}
                                        $hasError={!!errors.startDate}
                                    />
                                    {errors.startDate && <ErrorText>{errors.startDate}</ErrorText>}
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="endDate">
                                        Data zakończenia
                                    </Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate || ''}
                                        onChange={(e) => handleChange('endDate', e.target.value)}
                                        $hasError={!!errors.endDate}
                                    />
                                    {errors.endDate && <ErrorText>{errors.endDate}</ErrorText>}
                                    <HelpText>Pozostaw puste jeśli koszt jest bezterminowy</HelpText>
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="status">
                                        Status
                                    </Label>
                                    <Select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                    >
                                        {Object.entries(FixedCostStatusLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </Select>
                                </FormGroup>

                                <FormGroup>
                                    <CheckboxWrapper>
                                        <Checkbox
                                            id="autoRenew"
                                            type="checkbox"
                                            checked={formData.autoRenew}
                                            onChange={(e) => handleChange('autoRenew', e.target.checked)}
                                        />
                                        <CheckboxLabel htmlFor="autoRenew">
                                            Automatyczne odnawianie
                                        </CheckboxLabel>
                                    </CheckboxWrapper>
                                    <HelpText>Koszt będzie automatycznie odnowiony po zakończeniu</HelpText>
                                </FormGroup>
                            </FormGrid>
                        </FormSection>

                        {/* Supplier Information */}
                        <FormSection>
                            <SectionTitle>Informacje o dostawcy</SectionTitle>
                            <FormGrid>
                                <FormGroup>
                                    <Label htmlFor="supplierName">
                                        Nazwa dostawcy
                                    </Label>
                                    <Input
                                        id="supplierName"
                                        type="text"
                                        value={formData.supplierInfo?.name || ''}
                                        onChange={(e) => handleChange('supplierInfo.name', e.target.value)}
                                        placeholder="np. Landlord Properties Sp. z o.o."
                                        $hasError={!!errors['supplierInfo.name']}
                                    />
                                    {errors['supplierInfo.name'] && <ErrorText>{errors['supplierInfo.name']}</ErrorText>}
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="supplierTaxId">
                                        NIP dostawcy
                                    </Label>
                                    <Input
                                        id="supplierTaxId"
                                        type="text"
                                        value={formData.supplierInfo?.taxId || ''}
                                        onChange={(e) => handleChange('supplierInfo.taxId', e.target.value)}
                                        placeholder="1234567890"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="contractNumber">
                                        Numer umowy
                                    </Label>
                                    <Input
                                        id="contractNumber"
                                        type="text"
                                        value={formData.contractNumber || ''}
                                        onChange={(e) => handleChange('contractNumber', e.target.value)}
                                        placeholder="np. UM/2024/001"
                                    />
                                </FormGroup>
                            </FormGrid>
                        </FormSection>

                        {/* Additional Notes */}
                        <FormSection>
                            <SectionTitle>Dodatkowe informacje</SectionTitle>
                            <FormGroup>
                                <Label htmlFor="notes">
                                    Uwagi
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes || ''}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    placeholder="Dodatkowe uwagi dotyczące kosztu stałego"
                                    rows={4}
                                />
                            </FormGroup>
                        </FormSection>

                        {/* Form Actions */}
                        <FormActions>
                            <CancelButton type="button" onClick={onClose}>
                                Anuluj
                            </CancelButton>
                            <SaveButton type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <LoadingSpinner />
                                        Zapisywanie...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        {fixedCost ? 'Zapisz zmiany' : 'Dodaj koszt stały'}
                                    </>
                                )}
                            </SaveButton>
                        </FormActions>
                    </Form>
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
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
    z-index: ${brandTheme.zIndex.modal};
    padding: ${brandTheme.spacing.lg};
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background-color: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    width: 95vw;
    max-width: 900px;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @media (max-width: ${brandTheme.breakpoints.md}) {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
    }
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    flex-shrink: 0;
`;

const ModalTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const TitleIcon = styled.div`
    width: 40px;
    height: 40px;
    background: ${brandTheme.primaryGhost};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${brandTheme.primary};
    font-size: 18px;
`;

const TitleText = styled.h2`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: ${brandTheme.surfaceHover};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};
    font-size: 18px;

    &:hover {
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
        transform: scale(1.05);
    }

    &:active {
        transform: scale(0.95);
    }
`;

const ModalContent = styled.div`
    overflow-y: auto;
    flex: 1;
    
    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
    }
    
    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.border};
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: ${brandTheme.borderHover};
    }
`;

const Form = styled.form`
    padding: ${brandTheme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};
`;

const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};

    &::before {
        content: '';
        width: 4px;
        height: 18px;
        background: ${brandTheme.primary};
        border-radius: 2px;
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${brandTheme.spacing.md};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const Input = styled.input<{ $hasError?: boolean }>`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? brandTheme.status.error : brandTheme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? brandTheme.status.errorLight : brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        color: ${brandTheme.text.disabled};
        cursor: not-allowed;
    }
`;

const Select = styled.select<{ $hasError?: boolean }>`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? brandTheme.status.error : brandTheme.primary};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? brandTheme.status.errorLight : brandTheme.primaryGhost};
    }

    &:disabled {
        background: ${brandTheme.surfaceAlt};
        color: ${brandTheme.text.disabled};
        cursor: not-allowed;
    }
`;

const Textarea = styled.textarea`
    padding: ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const CheckboxWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const Checkbox = styled.input`
    width: 18px;
    height: 18px;
    accent-color: ${brandTheme.primary};
    cursor: pointer;
`;

const CheckboxLabel = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.primary};
    cursor: pointer;
    margin: 0;
`;

const HelpText = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-style: italic;
    margin-top: ${brandTheme.spacing.xs};
`;

const ErrorText = styled.div`
    font-size: 12px;
    color: ${brandTheme.status.error};
    font-weight: 500;
    margin-top: ${brandTheme.spacing.xs};
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${brandTheme.spacing.md};
    padding-top: ${brandTheme.spacing.lg};
    border-top: 1px solid ${brandTheme.border};

    @media (max-width: 576px) {
        flex-direction: column-reverse;
    }
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 44px;
    min-width: 120px;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    &:not(:disabled):hover {
        transform: translateY(-1px);
    }

    &:not(:disabled):active {
        transform: translateY(0);
    }
`;

const CancelButton = styled(BaseButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 2px solid ${brandTheme.border};

    &:hover:not(:disabled) {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const SaveButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border: 2px solid transparent;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export default FixedCostFormModal;