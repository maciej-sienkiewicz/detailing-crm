// src/features/reservations/components/ReservationVehicleSection.tsx
/**
 * Vehicle information section for reservation form
 * Only make and model required - no license plate yet
 */

import React from 'react';
import styled from 'styled-components';
import { FaCar } from 'react-icons/fa';
import { ReservationFormErrors } from '../libs/types';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
    },
    border: '#e2e8f0',
    status: {
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
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

interface ReservationVehicleSectionProps {
    vehicleMake: string;
    vehicleModel: string;
    errors: ReservationFormErrors;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ReservationVehicleSection: React.FC<ReservationVehicleSectionProps> = ({
                                                                                        vehicleMake,
                                                                                        vehicleModel,
                                                                                        errors,
                                                                                        onChange
                                                                                    }) => {
    return (
        <Section>
            <SectionTitle>Informacje o pojeździe</SectionTitle>
            <SectionDescription>
                Podaj markę i model pojazdu - to wystarczy do zaplanowania wizyty
            </SectionDescription>

            <FormRow>
                <FormGroup>
                    <Label htmlFor="vehicleMake">
                        <LabelIcon><FaCar /></LabelIcon>
                        <span>Marka pojazdu</span>
                        <RequiredBadge>Wymagane</RequiredBadge>
                    </Label>
                    <Input
                        id="vehicleMake"
                        name="vehicleMake"
                        type="text"
                        value={vehicleMake}
                        onChange={onChange}
                        placeholder="np. BMW, Audi, Toyota"
                        required
                        $hasError={!!errors.vehicleMake}
                    />
                    {errors.vehicleMake && <ErrorText>{errors.vehicleMake}</ErrorText>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="vehicleModel">
                        <LabelIcon><FaCar /></LabelIcon>
                        <span>Model pojazdu</span>
                        <RequiredBadge>Wymagane</RequiredBadge>
                    </Label>
                    <Input
                        id="vehicleModel"
                        name="vehicleModel"
                        type="text"
                        value={vehicleModel}
                        onChange={onChange}
                        placeholder="np. X5, A4, Corolla"
                        required
                        $hasError={!!errors.vehicleModel}
                    />
                    {errors.vehicleModel && <ErrorText>{errors.vehicleModel}</ErrorText>}
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

const InfoBox = styled.div`
    background: ${brandTheme.status.infoLight};
    border: 1px solid ${brandTheme.status.info};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    display: flex;
    align-items: flex-start;
    gap: ${brandTheme.spacing.sm};
`;

const InfoIcon = styled.div`
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 2px;
`;

const InfoText = styled.div`
    font-size: 13px;
    color: ${brandTheme.status.info};
    font-weight: 500;
    line-height: 1.5;
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

const Input = styled.input<{ $hasError?: boolean }>`
    width: 100%;
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${props => props.$hasError ? brandTheme.status.error : brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all ${brandTheme.transitions.normal};

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