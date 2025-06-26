import React, { useState } from 'react';
import styled from 'styled-components';
import { FaMoneyBillWave, FaPercentage, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { ExtendedEmployee } from '../EmployeesPage';
import {
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalBody,
    CloseButton,
    Form,
    FormGroup,
    FormRow,
    Label,
    Input,
    Select,
    HelpText,
    ButtonGroup,
    Button,
    ErrorText
} from '../styles/ModalStyles';

// Brand Theme
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    text: {
        primary: '#1e293b',
        secondary: '#475569',
        muted: '#64748b'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px'
    },
    radius: {
        md: '8px',
        lg: '12px'
    },
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7'
    }
};

interface SalaryModalProps {
    employee: ExtendedEmployee;
    onSave: (employee: ExtendedEmployee) => void;
    onCancel: () => void;
}

export const SalaryModal: React.FC<SalaryModalProps> = ({
                                                            employee,
                                                            onSave,
                                                            onCancel
                                                        }) => {
    const [formData, setFormData] = useState({
        hourlyRate: employee.hourlyRate || 25.00,
        bonusFromRevenue: employee.bonusFromRevenue || 0,
        workingHoursPerWeek: employee.workingHoursPerWeek || 40,
        contractType: employee.contractType || 'EMPLOYMENT',
        overtimeRate: 1.5, // Mnożnik za nadgodziny
        vacationDays: 26, // Dni urlopu w roku
        sickLeaveDays: 33, // Dni zwolnienia chorobowego
        notes: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const contractTypes = [
        { value: 'EMPLOYMENT', label: 'Umowa o pracę' },
        { value: 'B2B', label: 'Umowa B2B' },
        { value: 'MANDATE', label: 'Umowa zlecenie' }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value
        });

        // Usuwanie błędów przy edycji pola
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (formData.hourlyRate <= 0) {
            errors.hourlyRate = 'Stawka godzinowa musi być większa od 0';
        }

        if (formData.bonusFromRevenue < 0 || formData.bonusFromRevenue > 100) {
            errors.bonusFromRevenue = 'Bonus musi być między 0 a 100%';
        }

        if (formData.workingHoursPerWeek <= 0 || formData.workingHoursPerWeek > 168) {
            errors.workingHoursPerWeek = 'Godziny pracy muszą być między 1 a 168 na tydzień';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            const updatedEmployee: ExtendedEmployee = {
                ...employee,
                hourlyRate: formData.hourlyRate,
                bonusFromRevenue: formData.bonusFromRevenue,
                workingHoursPerWeek: formData.workingHoursPerWeek,
                contractType: formData.contractType as 'EMPLOYMENT' | 'B2B' | 'MANDATE'
            };

            onSave(updatedEmployee);
        }
    };

    // Obliczenia finansowe
    const monthlyGrossSalary = (formData.hourlyRate * formData.workingHoursPerWeek * 4.33).toFixed(2);
    const yearlyGrossSalary = (formData.hourlyRate * formData.workingHoursPerWeek * 52).toFixed(2);

    return (
        <ModalOverlay>
            <ModalContainer style={{ maxWidth: '700px' }}>
                <ModalHeader>
                    <h2>Zarządzanie wynagrodzeniem - {employee.fullName}</h2>
                    <CloseButton onClick={onCancel}>&times;</CloseButton>
                </ModalHeader>

                <ModalBody>
                    <SalaryOverview>
                        <OverviewCard>
                            <OverviewIcon $color={brandTheme.primary}>
                                <FaMoneyBillWave />
                            </OverviewIcon>
                            <OverviewContent>
                                <OverviewValue>{monthlyGrossSalary} zł</OverviewValue>
                                <OverviewLabel>Miesięczne wynagrodzenie brutto</OverviewLabel>
                            </OverviewContent>
                        </OverviewCard>

                        <OverviewCard>
                            <OverviewIcon $color={brandTheme.status.success}>
                                <FaCalendarAlt />
                            </OverviewIcon>
                            <OverviewContent>
                                <OverviewValue>{yearlyGrossSalary} zł</OverviewValue>
                                <OverviewLabel>Roczne wynagrodzenie brutto</OverviewLabel>
                            </OverviewContent>
                        </OverviewCard>

                        <OverviewCard>
                            <OverviewIcon $color={brandTheme.status.warning}>
                                <FaPercentage />
                            </OverviewIcon>
                            <OverviewContent>
                                <OverviewValue>{formData.bonusFromRevenue}%</OverviewValue>
                                <OverviewLabel>Bonus od obrotu</OverviewLabel>
                            </OverviewContent>
                        </OverviewCard>

                        <OverviewCard>
                            <OverviewIcon $color={brandTheme.primary}>
                                <FaClock />
                            </OverviewIcon>
                            <OverviewContent>
                                <OverviewValue>{formData.workingHoursPerWeek}h</OverviewValue>
                                <OverviewLabel>Godzin tygodniowo</OverviewLabel>
                            </OverviewContent>
                        </OverviewCard>
                    </SalaryOverview>

                    <Form onSubmit={handleSubmit}>
                        <SectionTitle>Podstawowe wynagrodzenie</SectionTitle>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="hourlyRate">Stawka godzinowa (zł)*</Label>
                                <Input
                                    id="hourlyRate"
                                    name="hourlyRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.hourlyRate}
                                    onChange={handleChange}
                                    required
                                />
                                {formErrors.hourlyRate && <ErrorText>{formErrors.hourlyRate}</ErrorText>}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="workingHoursPerWeek">Godziny pracy tygodniowo*</Label>
                                <Input
                                    id="workingHoursPerWeek"
                                    name="workingHoursPerWeek"
                                    type="number"
                                    min="1"
                                    max="168"
                                    value={formData.workingHoursPerWeek}
                                    onChange={handleChange}
                                    required
                                />
                                {formErrors.workingHoursPerWeek && <ErrorText>{formErrors.workingHoursPerWeek}</ErrorText>}
                            </FormGroup>
                        </FormRow>

                        <FormGroup>
                            <Label htmlFor="contractType">Typ umowy*</Label>
                            <Select
                                id="contractType"
                                name="contractType"
                                value={formData.contractType}
                                onChange={handleChange}
                                required
                            >
                                {contractTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <SectionTitle>Bonusy i dodatki</SectionTitle>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="bonusFromRevenue">Bonus od obrotu (%)</Label>
                                <Input
                                    id="bonusFromRevenue"
                                    name="bonusFromRevenue"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={formData.bonusFromRevenue}
                                    onChange={handleChange}
                                />
                                <HelpText>Procent od miesięcznego obrotu firmy</HelpText>
                                {formErrors.bonusFromRevenue && <ErrorText>{formErrors.bonusFromRevenue}</ErrorText>}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="overtimeRate">Mnożnik za nadgodziny</Label>
                                <Input
                                    id="overtimeRate"
                                    name="overtimeRate"
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="3"
                                    value={formData.overtimeRate}
                                    onChange={handleChange}
                                />
                                <HelpText>Mnożnik stawki godzinowej za nadgodziny</HelpText>
                            </FormGroup>
                        </FormRow>

                        <SectionTitle>Urlopy i zwolnienia</SectionTitle>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="vacationDays">Dni urlopu w roku</Label>
                                <Input
                                    id="vacationDays"
                                    name="vacationDays"
                                    type="number"
                                    min="20"
                                    max="50"
                                    value={formData.vacationDays}
                                    onChange={handleChange}
                                />
                                <HelpText>Standardowo 26 dni dla umowy o pracę</HelpText>
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="sickLeaveDays">Dni zwolnienia chorobowego</Label>
                                <Input
                                    id="sickLeaveDays"
                                    name="sickLeaveDays"
                                    type="number"
                                    min="0"
                                    max="365"
                                    value={formData.sickLeaveDays}
                                    onChange={handleChange}
                                />
                                <HelpText>Standardowo 33 dni płatnego zwolnienia</HelpText>
                            </FormGroup>
                        </FormRow>

                        <FormGroup>
                            <Label htmlFor="notes">Notatki dodatkowe</Label>
                            <NotesTextarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Dodatkowe informacje o wynagrodzeniu, premie, benefity itp."
                                rows={4}
                            />
                        </FormGroup>

                        <SalaryCalculations>
                            <CalculationsTitle>Podsumowanie finansowe</CalculationsTitle>
                            <CalculationsGrid>
                                <CalculationItem>
                                    <CalculationLabel>Stawka podstawowa:</CalculationLabel>
                                    <CalculationValue>{formData.hourlyRate} zł/h</CalculationValue>
                                </CalculationItem>
                                <CalculationItem>
                                    <CalculationLabel>Stawka za nadgodziny:</CalculationLabel>
                                    <CalculationValue>{(formData.hourlyRate * formData.overtimeRate).toFixed(2)} zł/h</CalculationValue>
                                </CalculationItem>
                                <CalculationItem>
                                    <CalculationLabel>Tygodniowe wynagrodzenie:</CalculationLabel>
                                    <CalculationValue>{(formData.hourlyRate * formData.workingHoursPerWeek).toFixed(2)} zł</CalculationValue>
                                </CalculationItem>
                                <CalculationItem>
                                    <CalculationLabel>Potencjalny bonus miesięczny:</CalculationLabel>
                                    <CalculationValue>
                                        {formData.bonusFromRevenue > 0
                                            ? `${formData.bonusFromRevenue}% od obrotu`
                                            : 'Brak bonusu'
                                        }
                                    </CalculationValue>
                                </CalculationItem>
                            </CalculationsGrid>
                        </SalaryCalculations>

                        <ButtonGroup>
                            <Button type="button" secondary onClick={onCancel}>
                                Anuluj
                            </Button>
                            <Button type="submit" primary>
                                Zapisz wynagrodzenie
                            </Button>
                        </ButtonGroup>
                    </Form>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const SalaryOverview = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: ${brandTheme.spacing.md};
    margin-bottom: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.lg};
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
`;

const OverviewCard = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid rgba(0, 0, 0, 0.05);
`;

const OverviewIcon = styled.div<{ $color: string }>`
    width: 36px;
    height: 36px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
`;

const OverviewContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const OverviewValue = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin-bottom: 2px;
`;

const OverviewLabel = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: ${brandTheme.spacing.lg} 0 ${brandTheme.spacing.md} 0;
    padding-bottom: ${brandTheme.spacing.sm};
    border-bottom: 2px solid ${brandTheme.surfaceAlt};
    
    &:first-of-type {
        margin-top: 0;
    }
`;

const NotesTextarea = styled.textarea`
    width: 100%;
    min-height: 80px;
    padding: ${brandTheme.spacing.md};
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    resize: vertical;
    transition: all 0.2s ease;
    font-family: inherit;

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

const SalaryCalculations = styled.div`
    background: ${brandTheme.surfaceAlt};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    margin: ${brandTheme.spacing.lg} 0;
`;

const CalculationsTitle = styled.h4`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.md} 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const CalculationsGrid = styled.div`
    display: grid;
    gap: ${brandTheme.spacing.sm};
`;

const CalculationItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.sm} 0;
`;

const CalculationLabel = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const CalculationValue = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.primary};
    font-weight: 600;
`;