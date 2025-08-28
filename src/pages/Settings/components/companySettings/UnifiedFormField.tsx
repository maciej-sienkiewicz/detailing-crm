// src/pages/Settings/components/companySettings/UnifiedFormField.tsx
import React from 'react';
import { IconType } from 'react-icons';
import {
    FieldContainer,
    FieldHeader,
    FieldLabel,
    FieldIcon,
    RequiredMarker,
    ValidationIndicator,
    FieldContent,
    Input,
    DisplayValue,
    HelpText,
    ValidationMessage
} from '../../styles/companySettings/UnifiedFormField.styles';

interface ValidationResult {
    isValid: boolean;
    message: string;
}

interface UnifiedFormFieldProps {
    label: string;
    icon?: IconType;
    required?: boolean;
    isEditing: boolean;
    value: string;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
    placeholder?: string;
    type?: string;
    validation?: ValidationResult | null;
    validating?: boolean;
    helpText?: string;
    displayFormatter?: (value: string) => React.ReactNode;
    fullWidth?: boolean;
}

export const UnifiedFormField: React.FC<UnifiedFormFieldProps> = ({
                                                                      label,
                                                                      icon: Icon,
                                                                      required = false,
                                                                      isEditing,
                                                                      value,
                                                                      onChange,
                                                                      onBlur,
                                                                      placeholder,
                                                                      type = 'text',
                                                                      validation,
                                                                      validating = false,
                                                                      helpText,
                                                                      displayFormatter,
                                                                      fullWidth = false
                                                                  }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.(e.target.value);
    };

    const hasValue = (value && value.trim().length > 0) || false;

    return (
        <FieldContainer $fullWidth={fullWidth}>
            <FieldHeader>
                <FieldLabel>
                    {Icon && (
                        <FieldIcon>
                            <Icon />
                        </FieldIcon>
                    )}
                    <span>{label}</span>
                    {required && <RequiredMarker>*</RequiredMarker>}
                </FieldLabel>

                {(validation || validating) && (
                    <ValidationIndicator
                        $isValid={validation?.isValid ?? false}
                        $loading={validating}
                    />
                )}
            </FieldHeader>

            <FieldContent>
                {isEditing ? (
                    <Input
                        type={type}
                        value={value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        $hasError={(validation && !validation.isValid) || false}
                    />
                ) : (
                    <DisplayValue $hasValue={hasValue}>
                        {hasValue ? (
                            displayFormatter ? displayFormatter(value) : value
                        ) : (
                            <span>Nie podano</span>
                        )}
                    </DisplayValue>
                )}

                {validation && !validation.isValid && (
                    <ValidationMessage>
                        {validation.message}
                    </ValidationMessage>
                )}

                {helpText && isEditing && (
                    <HelpText>{helpText}</HelpText>
                )}
            </FieldContent>
        </FieldContainer>
    );
};