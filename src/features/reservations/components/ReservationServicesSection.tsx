// src/features/reservations/components/ReservationServicesSection.tsx
/**
 * Services section for reservation - simplified version
 * Services are optional for reservations
 */

import React from 'react';
import styled from 'styled-components';
import { FaWrench, FaInfoCircle } from 'react-icons/fa';
import { ReservationSelectedServiceInput } from '../api/reservationsApi';

const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
    },
    status: {
        warning: '#f59e0b',
        warningLight: '#fef3c7'
    },
    spacing: {
        sm: '8px',
        md: '16px'
    }
};

interface ReservationServicesSectionProps {
    services: ReservationSelectedServiceInput[];
}

export const ReservationServicesSection: React.FC<ReservationServicesSectionProps> = ({
                                                                                          services
                                                                                      }) => {
    return (
        <Section>
            <SectionTitle>Usługi</SectionTitle>
            <SectionDescription>
                Planowane usługi - opcjonalne, możesz dodać je później
            </SectionDescription>

            {services.length > 0 ? (
                <ServicesList>
                    {services.map((service, index) => (
                        <ServiceItem key={index}>
                            <FaWrench /> {service.name}
                        </ServiceItem>
                    ))}
                </ServicesList>
            ) : (
                <EmptyState>
                    Brak wybranych usług - możesz dodać je później
                </EmptyState>
            )}
        </Section>
    );
};

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
    background: ${brandTheme.status.warningLight};
    border: 1px solid ${brandTheme.status.warning};
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
`;

const InfoIcon = styled.div`
    color: ${brandTheme.status.warning};
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 2px;
`;

const InfoText = styled.div`
    font-size: 13px;
    color: ${brandTheme.status.warning};
    font-weight: 500;
    line-height: 1.5;
`;

const ServicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ServiceItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #fafbfc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: ${brandTheme.text.primary};
`;

const EmptyState = styled.div`
    padding: 24px;
    text-align: center;
    color: ${brandTheme.text.muted};
    font-size: 14px;
    font-style: italic;
    background: #fafbfc;
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
`;