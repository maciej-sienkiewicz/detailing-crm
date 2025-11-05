// src/features/reservations/components/ReservationContactSection.tsx
/**
 * Contact information section for reservation form
 * Only phone number required, name is optional
 */

import React from 'react';
import styled from 'styled-components';
import { FaPhone, FaUser } from 'react-icons/fa';
import { ReservationFormErrors } from '../libs/types';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
    },
    border: '#e2e8f0',
    status: {
        error: '#dc2626',
        errorLight: '#fee2e2'
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
    transitions: {
        normal: '0.2s ease'
    }
};

interface ReservationContactSectionProps {
    contactPhone: string;
    contactName?: string;
    errors: ReservationFormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ReservationContactSection: React.FC<ReservationContactSectionProps> = ({
                                                                                        contactPhone,
                                                                                        contactName,
                                                                                        errors,
                                                                                        onChange
                                                                                    }) => {
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Remove all non-digits
        value = value.replace(/[^\d]/g, '');

        // Format with spaces
        if (value.length > 0) {
            value = value.replace(/(\d{3})(?=\d)/g, '$1 ');
        }

        // Limit to 11 digits
        if (value.replace(/\s/g, '').length > 11) {
            return;
        }

        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                name: 'contactPhone',
                value: value
            }
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
    };

    return (
        <Section>
            <SectionTitle>Dane kontaktowe</SectionTitle>
            <SectionDescription>
                Podaj dane kontaktowe - wystarczy numer telefonu
            </SectionDescription>

            <FormRow>
                <FormGroup>
                    <Label htmlFor="contactPhone">
                        <LabelIcon><FaPhone /></LabelIcon>
                        <span>Numer telefonu</span>
                        <RequiredBadge>Wymagane</RequiredBadge>
                    </Label>
                    <InputWithPrefix>
                        <PhonePrefix>+48</PhonePrefix>
                        <Input
                            id="contactPhone"
                            name="contactPhone"
                            type="text"
                            value={contactPhone}
                            onChange={handlePhoneChange}
                            placeholder="123 456 789"
                            required
                            $hasError={!!errors.contactPhone}
                            $hasPrefix
                            inputMode="numeric"
                        />
                    </InputWithPrefix>
                    {errors.contactPhone && <ErrorText>{errors.contactPhone}</ErrorText>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="contactName">
                        <LabelIcon><FaUser /></LabelIcon>
                        <span>Imię</span>
                        <OptionalBadge>Opcjonalne</OptionalBadge>
                    </Label>
                    <Input
                        id="contactName"
                        name="contactName"
                        type="text"
                        value={contactName || ''}
                        onChange={onChange}
                        placeholder="np. Jan"
                        $hasError={!!errors.contactName}
                    />
                    {errors.contactName && <ErrorText>{errors.contactName}</ErrorText>}
                    <HelpText>
                        Możesz podać tylko imię lub pozostawić puste
                    </HelpText>
                </FormGroup>
            </FormRow>
        </Section>
    );
};

// Styled Components
const Section = styled.section`
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

const SectionDescription = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const FormRow = styled.div`
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
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const LabelIcon = styled.span`
    color: ${brandTheme.primary};
    font-size: 12px;
`;

const RequiredBadge = styled.span`
    background: ${brandTheme.primary};
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-left: auto;
`;

const OptionalBadge = styled.span`
    background: ${brandTheme.text.muted};
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-left: auto;
    opacity: 0.8;
`;

const InputWithPrefix = styled.div`
    position: relative;
    width: 100%;
`;

const PhonePrefix = styled.span`
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${brandTheme.text.muted};
    font-weight: 500;
    font-size: 14px;
    pointer-events: none;
    z-index: 2;
`;

const Input = styled.input<{ $hasError?: boolean; $hasPrefix?: boolean }>`
    width: 100%;
    height: 44px;
    padding: 0 ${brandTheme.spacing.md} 0 ${props => props.$hasPrefix ? '48px' : brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};
    ${props => props.$hasPrefix && 'font-variant-numeric: tabular-nums;'}

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? brandTheme.status.error : brandTheme.primary};
        box-shadow: 0 0 0 3px ${props =>
    props.$hasError ? brandTheme.status.errorLight : brandTheme.primaryGhost
};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const ErrorText = styled.div`
    color: ${brandTheme.status.error};
    font-size: 12px;
    font-weight: 500;
    margin-top: ${brandTheme.spacing.xs};
`;

const HelpText = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    line-height: 1.4;
    font-weight: 400;
    margin-top: ${brandTheme.spacing.xs};
`;