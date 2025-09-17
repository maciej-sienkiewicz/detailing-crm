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

                {client.notes && (
                    <InfoItem style={{ gridColumn: '1 / -1' }}>
                        <InfoLabel>
                            <FaStickyNote />
                            Notatki
                        </InfoLabel>
                        <InfoValue>{client.notes}</InfoValue>
                    </InfoItem>
                )}
            </InfoGrid>
        </Section>
    );
};

export default ClientBasicInfo;