import React, { useState } from 'react';
import { Employee } from '../../../types';
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
    ColorPickerContainer,
    ColorPreview,
    ColorInput,
    HelpText,
    ButtonGroup,
    Button,
    ErrorText
} from '../styles/ModalStyles';

interface EmployeeFormModalProps {
    employee: Employee;
    onSave: (employee: Employee) => void;
    onCancel: () => void;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
                                                                        employee,
                                                                        onSave,
                                                                        onCancel
                                                                    }) => {
    const [formData, setFormData] = useState<Employee>(employee);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
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

        if (!formData.fullName.trim()) {
            errors.fullName = 'Imię i nazwisko jest wymagane';
        }

        if (!formData.position.trim()) {
            errors.position = 'Stanowisko jest wymagane';
        }

        if (!formData.email.trim()) {
            errors.email = 'Adres email jest wymagany';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Podaj prawidłowy adres email';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Numer telefonu jest wymagany';
        }

        if (!formData.birthDate) {
            errors.birthDate = 'Data urodzenia jest wymagana';
        }

        if (!formData.hireDate) {
            errors.hireDate = 'Data zatrudnienia jest wymagana';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSave(formData);
        }
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <h2>{employee.id ? 'Edytuj pracownika' : 'Dodaj nowego pracownika'}</h2>
                    <CloseButton onClick={onCancel}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label htmlFor="fullName">Imię i nazwisko*</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Imię i nazwisko"
                                required
                            />
                            {formErrors.fullName && <ErrorText>{formErrors.fullName}</ErrorText>}
                        </FormGroup>

                        <FormRow>
                            <FormGroup>
                                <Label htmlFor="birthDate">Data urodzenia*</Label>
                                <Input
                                    id="birthDate"
                                    name="birthDate"
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    required
                                />
                                {formErrors.birthDate && <ErrorText>{formErrors.birthDate}</ErrorText>}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="hireDate">Data zatrudnienia*</Label>
                                <Input
                                    id="hireDate"
                                    name="hireDate"
                                    type="date"
                                    value={formData.hireDate}
                                    onChange={handleChange}
                                    required
                                />
                                {formErrors.hireDate && <ErrorText>{formErrors.hireDate}</ErrorText>}
                            </FormGroup>
                        </FormRow>

                        <FormGroup>
                            <Label htmlFor="position">Stanowisko*</Label>
                            <Input
                                id="position"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                placeholder="Stanowisko"
                                required
                            />
                            {formErrors.position && <ErrorText>{formErrors.position}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="email">Adres email*</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="email@example.com"
                                required
                            />
                            {formErrors.email && <ErrorText>{formErrors.email}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="phone">Numer kontaktowy*</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+48 123 456 789"
                                required
                            />
                            {formErrors.phone && <ErrorText>{formErrors.phone}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="color">Kolor*</Label>
                            <ColorPickerContainer>
                                <ColorPreview color={formData.color} />
                                <ColorInput
                                    id="color"
                                    name="color"
                                    type="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    required
                                />
                            </ColorPickerContainer>
                            <HelpText>Kolor będzie używany do oznaczania usług pracownika w kalendarzu</HelpText>
                        </FormGroup>

                        <ButtonGroup>
                            <Button type="button" secondary onClick={onCancel}>
                                Anuluj
                            </Button>
                            <Button type="submit" primary>
                                {employee.id ? 'Zapisz zmiany' : 'Dodaj pracownika'}
                            </Button>
                        </ButtonGroup>
                    </Form>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};