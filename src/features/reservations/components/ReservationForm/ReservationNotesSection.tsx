// src/features/reservations/components/ReservationNotesSection.tsx
/**
 * Notes section for reservation form
 */

import React from 'react';
import styled from 'styled-components';
import { FaStickyNote } from 'react-icons/fa';

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

interface ReservationNotesSectionProps {
    notes: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const ReservationNotesSection: React.FC<ReservationNotesSectionProps> = ({
                                                                                    notes,
                                                                                    onChange
                                                                                }) => {
    return (
        <Section>
            <SectionTitle>Uwagi</SectionTitle>
            <SectionDescription>
                Dodatkowe informacje o rezerwacji (opcjonalne)
            </SectionDescription>

            <FormGroup>
                <Label htmlFor="notes">
                    <LabelIcon><FaStickyNote /></LabelIcon>
                    <span>Notatki</span>
                    <OptionalBadge>Opcjonalne</OptionalBadge>
                </Label>
                <Textarea
                    id="notes"
                    name="notes"
                    value={notes}
                    onChange={onChange}
                    placeholder="np. Klient prosi o pilny termin, szczególne wymagania, dodatkowe uwagi..."
                    rows={4}
                />
                <HelpText>
                    Te notatki będą widoczne w kalendarzu i w szczegółach rezerwacji
                </HelpText>
            </FormGroup>
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

const Textarea = styled.textarea`
    padding: ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    resize: vertical;
    min-height: 100px;
    font-family: inherit;
    transition: all ${brandTheme.transitions.normal};
    line-height: 1.5;

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

const HelpText = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    line-height: 1.4;
    font-weight: 400;
    margin-top: ${brandTheme.spacing.xs};
`;