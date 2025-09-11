import React from 'react';
import styled from 'styled-components';
import { FaArrowRight, FaEnvelope, FaPhone, FaUser, FaUsers } from 'react-icons/fa';
import { Section, SectionTitle, EmptyMessage, EmptyIcon, EmptyText } from './VehicleDetailStyles';
import {theme} from "../../../../styles/theme";

interface FullOwnerInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    fullName: string;
}

interface VehicleOwnersProps {
    owners: FullOwnerInfo[];
    onOwnerClick: (ownerId: string) => void;
}

const VehicleOwners: React.FC<VehicleOwnersProps> = ({ owners, onOwnerClick }) => {
    if (owners.length === 0) {
        return (
            <Section>
                <SectionTitle>
                    <FaUsers />
                    Właściciele pojazdu
                </SectionTitle>
                <EmptyMessage>
                    <EmptyIcon>
                        <FaUser />
                    </EmptyIcon>
                    <EmptyText>Brak przypisanych właścicieli</EmptyText>
                </EmptyMessage>
            </Section>
        );
    }

    return (
        <Section>
            <SectionTitle>
                <FaUsers />
                Właściciele pojazdu ({owners.length})
            </SectionTitle>

            <OwnersList>
                {owners.map(owner => (
                    <OwnerItem
                        key={owner.id}
                        onClick={() => onOwnerClick(owner.id)}
                    >
                        <OwnerIcon>
                            <FaUser />
                        </OwnerIcon>
                        <OwnerInfo>
                            <OwnerName>{owner.fullName}</OwnerName>
                            <OwnerContact>
                                {owner.email && (
                                    <ContactItem>
                                        <FaEnvelope />
                                        <span>{owner.email}</span>
                                    </ContactItem>
                                )}
                                {owner.phone && (
                                    <ContactItem>
                                        <FaPhone />
                                        <span>{owner.phone}</span>
                                    </ContactItem>
                                )}
                            </OwnerContact>
                        </OwnerInfo>
                        <OwnerActionIcon>
                            <FaArrowRight />
                        </OwnerActionIcon>
                    </OwnerItem>
                ))}
            </OwnersList>
        </Section>
    );
};

const OwnersList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const OwnerItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.borderLight};
    transition: all ${theme.transitions.normal};
    cursor: pointer;

    &:hover {
        background: ${theme.primaryGhost};
        border-color: ${theme.primary}30;
        transform: translateX(4px);
        box-shadow: ${theme.shadow.md};
    }
`;

const OwnerIcon = styled.div`
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primary}08 100%);
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: ${theme.shadow.xs};
`;

const OwnerInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const OwnerName = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.sm};
    line-height: 1.3;
`;

const OwnerContact = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const ContactItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 13px;
    color: ${theme.text.secondary};

    svg {
        font-size: 11px;
        color: ${theme.text.muted};
        width: 12px;
        flex-shrink: 0;
    }

    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const OwnerActionIcon = styled.div`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.text.muted};
    font-size: 10px;
    transition: all ${theme.transitions.fast};
    flex-shrink: 0;

    ${OwnerItem}:hover & {
        color: ${theme.primary};
        transform: translateX(2px);
    }
`;

export default VehicleOwners;