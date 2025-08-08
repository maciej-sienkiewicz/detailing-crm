// src/pages/Settings/components/FormField.tsx
import React from 'react';
import {
    FormFieldContainer,
    FieldLabel,
    RequiredMark,
    Input,
    DisplayValue,
    ValidationMessage,
    HelpText
} from '../../styles/companySettings/Form.styles';

interface ValidationResult {
    isValid: boolean;
    message: string;
}

interface FormFieldProps {
    label: string;
    icon?: React.ReactNode;
    required?: boolean;
    isEditing: boolean;
    value: string;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
    placeholder?: string;
    type?: string;
    fullWidth?: boolean;
    validation?: ValidationResult | null;
    validating?: boolean;
    helpText?: string;
    rightElement?: React.ReactNode;
    displayValue?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
                                                        label,
                                                        icon,
                                                        required = false,
                                                        isEditing,
                                                        value,
                                                        onChange,
                                                        onBlur,
                                                        placeholder,
                                                        type = 'text',
                                                        fullWidth = false,
                                                        validation,
                                                        validating = false,
                                                        helpText,
                                                        rightElement,
                                                        displayValue
                                                    }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.(e.target.value);
    };

    return (
        <FormFieldContainer $fullWidth={fullWidth}>
            <FieldLabel>
                {icon && <span className="field-icon">{icon}</span>}
                <span>{label}</span>
                {required && <RequiredMark>*</RequiredMark>}
                {rightElement}
            </FieldLabel>

            {isEditing ? (
                <>
                    <Input
                        type={type}
                        value={value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                    />
                    {validation && (
                        <ValidationMessage $isValid={validation.isValid}>
                            {validation.message}
                        </ValidationMessage>
                    )}
                    {helpText && <HelpText>{helpText}</HelpText>}
                </>
            ) : (
                displayValue || (
                    <DisplayValue $hasValue={!!value}>
                        {value || 'Nie podano'}
                    </DisplayValue>
                )
            )}
        </FormFieldContainer>
    );
};