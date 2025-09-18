import React from 'react';
import {
    FaIdCard,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaBuilding,
    FaStickyNote
} from 'react-icons/fa';
import { Section, SectionTitle, InfoGrid, InfoItem, InfoLabel, InfoValue } from './ClientDetailStyles';
import { ClientExpanded } from '../../../../types';

interface ClientBasicInfoProps {
    client: ClientExpanded;
}

const ClientBasicInfo: React.FC<ClientBasicInfoProps> = ({ client }) => {
    return (
        <>
            {/* Sekcja danych kontaktowych */}
            <Section>
                <SectionTitle>
                    <FaIdCard />
                    Dane kontaktowe
                </SectionTitle>

                <InfoGrid>
                    <InfoItem>
                        <InfoLabel>
                            <FaUser />
                            Imię
                        </InfoLabel>
                        <InfoValue>{client.firstName}</InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>
                            <FaUser />
                            Nazwisko
                        </InfoLabel>
                        <InfoValue>{client.lastName}</InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>
                            <FaEnvelope />
                            Email
                        </InfoLabel>
                        <InfoValue>{client.email}</InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>
                            <FaPhone />
                            Telefon
                        </InfoLabel>
                        <InfoValue>{client.phone}</InfoValue>
                    </InfoItem>

                    {client.address && (
                        <InfoItem>
                            <InfoLabel>
                                <FaMapMarkerAlt />
                                Adres
                            </InfoLabel>
                            <InfoValue>{client.address}</InfoValue>
                        </InfoItem>
                    )}

                    {client.company && (
                        <InfoItem>
                            <InfoLabel>
                                <FaBuilding />
                                Firma
                            </InfoLabel>
                            <InfoValue>{client.company}</InfoValue>
                        </InfoItem>
                    )}

                    {client.taxId && (
                        <InfoItem>
                            <InfoLabel>
                                <FaIdCard />
                                NIP
                            </InfoLabel>
                            <InfoValue>{client.taxId}</InfoValue>
                        </InfoItem>
                    )}
                </InfoGrid>
            </Section>

            {/* NOWA SEKCJA: Notatki o kliencie */}
            {client.notes && (
                <Section>
                    <SectionTitle>
                        <FaStickyNote />
                        Notatki o kliencie
                    </SectionTitle>

                    <NotesContent>
                        {client.notes}
                    </NotesContent>
                </Section>
            )}
        </>
    );
};

// Import potrzebnych styled-components z istniejącego pliku
import styled from 'styled-components';
import { theme } from '../../../../styles/theme';

// NOWY STYLED COMPONENT dla notatek
const NotesContent = styled.div`
    background: ${theme.primaryGhost};
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.lg};
    font-size: 15px;
    line-height: 1.6;
    color: ${theme.text.primary};
    white-space: pre-wrap;
    word-wrap: break-word;
    
    /* Stylowanie dla długich tekstów */
    max-height: 200px;
    overflow-y: auto;
    
    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: ${theme.surface};
        border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: ${theme.border};
        border-radius: 3px;
        
        &:hover {
            background: ${theme.text.muted};
        }
    }
    
    /* Responsywne zachowanie */
    @media (max-width: 768px) {
        font-size: 14px;
        padding: ${theme.spacing.md};
        max-height: 150px;
    }
    
    /* Hover effect for better UX */
    transition: all ${theme.transitions.normal};
    
    &:hover {
        border-color: ${theme.primary}30;
        box-shadow: ${theme.shadow.sm};
    }
`;

export default ClientBasicInfo;