// src/components/calendar/AppointmentDetails.tsx - REFACTORED VERSION
import React, {useState} from 'react';
import styled from 'styled-components';
import {format} from 'date-fns';
import {pl} from 'date-fns/locale';
import {
    FaCalendarAlt,
    FaCar,
    FaClipboardCheck,
    FaClock,
    FaEdit,
    FaExternalLinkAlt,
    FaTimes,
    FaTools,
    FaTrash,
    FaUser
} from 'react-icons/fa';
import {Appointment, ProtocolStatus} from '../../types';
import {useNavigate} from 'react-router-dom';
import {theme} from '../../styles/theme';

interface AppointmentDetailsProps {
    appointment: Appointment;
    onEdit: () => void;
    onDelete: () => void;
    onStatusChange: (status: any) => void;
    onCreateProtocol: () => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
                                                                   appointment,
                                                                   onEdit,
                                                                   onDelete,
                                                                   onStatusChange,
                                                                   onCreateProtocol
                                                               }) => {
    const navigate = useNavigate();
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const formatDateTime = (date: Date) => {
        return format(date, 'EEEE, dd MMMM yyyy • HH:mm', { locale: pl });
    };

    const formatTimeOnly = (date: Date) => {
        return format(date, 'HH:mm', { locale: pl });
    };

    const handleGoToProtocol = () => {
        if (appointment.isProtocol && appointment.id) {
            const protocolId = appointment.id.replace('protocol-', '');
            navigate(`/visits/${protocolId}`);
        }
    };

    const calculateNetPrice = (grossPrice: number): number => {
        return grossPrice / 1.23;
    };

    const calculateTotalValue = (): { gross: number; net: number } => {
        if (!appointment.services || appointment.services.length === 0) {
            return { gross: 0, net: 0 };
        }

        const gross = appointment.services.reduce((sum, service) => sum + service.finalPrice, 0);
        const net = calculateNetPrice(gross);

        return { gross, net };
    };

    const totalValue = calculateTotalValue();

    const handleDeleteClick = () => {
        setShowConfirmDelete(true);
    };

    const confirmDelete = () => {
        onDelete();
        setShowConfirmDelete(false);
    };

    return (
        <DetailsContainer>
            {/* Header */}
            <DetailsHeader>
                <HeaderContent>
                    <HeaderInfo>
                        <AppointmentTitle>{appointment.title}</AppointmentTitle>
                        <AppointmentMeta>
                            {appointment.customerId && `Właściciel: ${appointment.customerId}`}
                        </AppointmentMeta>
                    </HeaderInfo>
                    {appointment.isProtocol && (appointment.status as unknown as ProtocolStatus) !== ProtocolStatus.SCHEDULED && (
                        <ProtocolActionButton onClick={handleGoToProtocol}>
                            <FaExternalLinkAlt />
                            <span>Otwórz protokół</span>
                        </ProtocolActionButton>
                    )}
                </HeaderContent>
            </DetailsHeader>

            {/* Schedule Information */}
            <InfoSection>
                <SectionHeader>
                    <SectionTitle>Szczegóły terminu</SectionTitle>
                </SectionHeader>
                <InfoGrid>
                    <InfoItem>
                        <InfoIcon>
                            <FaCalendarAlt />
                        </InfoIcon>
                        <InfoContent>
                            <InfoLabel>Data i godzina rozpoczęcia</InfoLabel>
                            <InfoValue>{formatDateTime(appointment.start)}</InfoValue>
                        </InfoContent>
                    </InfoItem>

                    <InfoItem>
                        <InfoIcon>
                            <FaClock />
                        </InfoIcon>
                        <InfoContent>
                            <InfoLabel>Czas trwania</InfoLabel>
                            <InfoValue>
                                {formatTimeOnly(appointment.start)} - {formatTimeOnly(appointment.end)}
                            </InfoValue>
                        </InfoContent>
                    </InfoItem>
                </InfoGrid>
            </InfoSection>

            {/* Client & Vehicle Information */}
            {(appointment.customerId || appointment.vehicleId) && (
                <InfoSection>
                    <SectionHeader>
                        <SectionTitle>Klient i pojazd</SectionTitle>
                    </SectionHeader>
                    <InfoGrid>
                        {appointment.customerId && (
                            <InfoItem>
                                <InfoIcon>
                                    <FaUser />
                                </InfoIcon>
                                <InfoContent>
                                    <InfoLabel>Klient</InfoLabel>
                                    <InfoValue>{appointment.customerId}</InfoValue>
                                </InfoContent>
                            </InfoItem>
                        )}

                        {appointment.vehicleId && (
                            <InfoItem>
                                <InfoIcon>
                                    <FaCar />
                                </InfoIcon>
                                <InfoContent>
                                    <InfoLabel>Pojazd</InfoLabel>
                                    <InfoValue>{appointment.vehicleId}</InfoValue>
                                </InfoContent>
                            </InfoItem>
                        )}
                    </InfoGrid>
                </InfoSection>
            )}

            {/* Services Section */}
            {appointment.services && appointment.services.length > 0 && (
                <ServicesSection>
                    <SectionHeader>
                        <SectionTitleWithIcon>
                            <FaTools />
                            <span>Wykaz usług ({appointment.services.length})</span>
                        </SectionTitleWithIcon>
                        <TotalValue>
                            <TotalLabel>Wartość łączna:</TotalLabel>
                            <TotalAmount>{totalValue.gross.toFixed(2)} zł</TotalAmount>
                        </TotalValue>
                    </SectionHeader>

                    <ServicesContent>
                        <ServicesList>
                            {appointment.services.map((service, index) => (
                                <ServiceItem key={index}>
                                    <ServiceInfo>
                                        <ServiceName>{service.name}</ServiceName>
                                        <ServiceMeta>
                                            Pozycja {index + 1} z {appointment.services.length}
                                        </ServiceMeta>
                                    </ServiceInfo>

                                    <ServicePricing>
                                        <PriceRow>
                                            <PriceLabel>Brutto:</PriceLabel>
                                            <PriceValue $primary>{service.finalPrice.toFixed(2)} zł</PriceValue>
                                        </PriceRow>
                                        <PriceRow>
                                            <PriceLabel>Netto:</PriceLabel>
                                            <PriceValue>{calculateNetPrice(service.finalPrice).toFixed(2)} zł</PriceValue>
                                        </PriceRow>
                                    </ServicePricing>
                                </ServiceItem>
                            ))}
                        </ServicesList>

                        <ServicesSummary>
                            <SummaryRow>
                                <SummaryLabel>Razem netto:</SummaryLabel>
                                <SummaryValue>{totalValue.net.toFixed(2)} zł</SummaryValue>
                            </SummaryRow>
                            <SummaryRow $primary>
                                <SummaryLabel>Razem brutto:</SummaryLabel>
                                <SummaryValue $primary>{totalValue.gross.toFixed(2)} zł</SummaryValue>
                            </SummaryRow>
                        </ServicesSummary>
                    </ServicesContent>
                </ServicesSection>
            )}

            {/* Action Buttons */}
            <ActionsSection>
                {appointment.isProtocol && (appointment.status as unknown as ProtocolStatus) === ProtocolStatus.SCHEDULED ? (
                    <ActionGrid>
                        <SecondaryAction onClick={onEdit}>
                            <FaEdit />
                            <span>Edytuj</span>
                        </SecondaryAction>

                        <PrimaryAction onClick={onCreateProtocol}>
                            <FaClipboardCheck />
                            <ActionContent>
                                <ActionLabel>Rozpocznij wizytę</ActionLabel>
                                <ActionHint>Utwórz protokół</ActionHint>
                            </ActionContent>
                        </PrimaryAction>

                        <DangerAction onClick={handleDeleteClick}>
                            <FaTrash />
                            <span>Usuń</span>
                        </DangerAction>
                    </ActionGrid>
                ) : !appointment.isProtocol ? (
                    <ActionGrid>
                        <SecondaryAction onClick={onEdit}>
                            <FaEdit />
                            <span>Edytuj</span>
                        </SecondaryAction>

                        <PrimaryAction onClick={onCreateProtocol}>
                            <FaClipboardCheck />
                            <ActionContent>
                                <ActionLabel>Rozpocznij wizytę</ActionLabel>
                                <ActionHint>Utwórz protokół</ActionHint>
                            </ActionContent>
                        </PrimaryAction>

                        <DangerAction onClick={handleDeleteClick}>
                            <FaTrash />
                            <span>Usuń</span>
                        </DangerAction>
                    </ActionGrid>
                ) : null}
            </ActionsSection>

            {/* Delete Confirmation Modal */}
            {showConfirmDelete && (
                <ConfirmModal>
                    <ModalOverlay onClick={() => setShowConfirmDelete(false)} />
                    <ModalContent>
                        <ModalHeader>
                            <ModalIcon>
                                <FaTrash />
                            </ModalIcon>
                            <ModalTitle>Potwierdź usunięcie</ModalTitle>
                        </ModalHeader>

                        <ModalBody>
                            <WarningText>
                                Czy na pewno chcesz usunąć wizytę "{appointment.title}"?
                            </WarningText>
                            <WarningSubtext>
                                Ta operacja jest nieodwracalna. Wszystkie dane zostaną trwale usunięte.
                            </WarningSubtext>
                        </ModalBody>

                        <ModalActions>
                            <ModalButton $variant="secondary" onClick={() => setShowConfirmDelete(false)}>
                                <FaTimes />
                                Anuluj
                            </ModalButton>
                            <ModalButton $variant="danger" onClick={confirmDelete}>
                                <FaTrash />
                                Usuń wizytę
                            </ModalButton>
                        </ModalActions>
                    </ModalContent>
                </ConfirmModal>
            )}
        </DetailsContainer>
    );
};

// Styled Components
const DetailsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    max-width: 100%;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
`;

const DetailsHeader = styled.div`
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
`;

const HeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.xxl};
`;

const HeaderInfo = styled.div`
    flex: 1;
`;

const AppointmentTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.sm} 0;
    line-height: 1.3;
`;

const AppointmentMeta = styled.div`
    font-size: 14px;
    color: ${theme.text.tertiary};
    font-weight: 400;
`;

const ProtocolActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surface};
    color: ${theme.primary};
    border: 2px solid ${theme.primary};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primary};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:active {
        transform: translateY(0);
    }

    svg {
        font-size: 13px;
    }
`;

const SectionHeader = styled.div`
    padding: ${theme.spacing.lg} ${theme.spacing.xxl} ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    border-bottom: 1px solid ${theme.borderLight};
`;

const SectionTitle = styled.h3`
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const SectionTitleWithIcon = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
        color: ${theme.text.tertiary};
        font-size: 14px;
    }
`;

const InfoSection = styled.div`
    border-bottom: 1px solid ${theme.borderLight};
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg} ${theme.spacing.xxl};
`;

const InfoItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.md};
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
    }
`;

const InfoIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${theme.surfaceElevated};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    color: ${theme.text.tertiary};
    font-size: 14px;
    flex-shrink: 0;
`;

const InfoContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    flex: 1;
`;

const InfoLabel = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${theme.text.primary};
    line-height: 1.4;
`;

const ServicesSection = styled.div`
    border-bottom: 1px solid ${theme.borderLight};
`;

const TotalValue = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: ${theme.spacing.xs};
`;

const TotalLabel = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${theme.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TotalAmount = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.primary};
`;

const ServicesContent = styled.div`
    padding: ${theme.spacing.lg} ${theme.spacing.xxl};
`;

const ServicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.xl};
`;

const ServiceItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.md};
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
    }
`;

const ServiceInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    flex: 1;
`;

const ServiceName = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${theme.text.primary};
`;

const ServiceMeta = styled.div`
    font-size: 12px;
    color: ${theme.text.muted};
    font-weight: 400;
`;

const ServicePricing = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    align-items: flex-end;
`;

const PriceRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const PriceLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-weight: 400;
`;

const PriceValue = styled.div<{ $primary?: boolean }>`
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.$primary ? theme.primary : theme.text.secondary};
    min-width: 80px;
    text-align: right;
`;

const ServicesSummary = styled.div`
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceElevated};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const SummaryRow = styled.div<{ $primary?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    ${props => props.$primary && `
        padding-top: ${theme.spacing.md};
        border-top: 1px solid ${theme.border};
    `}
`;

const SummaryLabel = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.primary};
`;

const SummaryValue = styled.div<{ $primary?: boolean }>`
    font-size: ${props => props.$primary ? '16px' : '14px'};
    font-weight: ${props => props.$primary ? '600' : '500'};
    color: ${props => props.$primary ? theme.primary : theme.text.primary};
`;

const ActionsSection = styled.div`
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
`;

const ActionGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const BaseAction = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    min-height: 48px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:active {
        transform: translateY(0);
    }
`;

const PrimaryAction = styled(BaseAction)`
    background: ${theme.primary};
    color: white;
    border-color: ${theme.primary};
    flex-direction: column;
    gap: ${theme.spacing.xs};

    &:hover {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
    }
`;

const SecondaryAction = styled(BaseAction)`
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border-color: ${theme.border};

    &:hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
        color: ${theme.text.primary};
    }
`;

const DangerAction = styled(BaseAction)`
    background: ${theme.surface};
    color: ${theme.error};
    border-color: ${theme.border};

    &:hover {
        background: ${theme.errorBg};
        border-color: ${theme.error};
    }
`;

const ActionContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
`;

const ActionLabel = styled.div`
    font-size: 14px;
    font-weight: 500;
`;

const ActionHint = styled.div`
    font-size: 11px;
    opacity: 0.8;
    font-weight: 400;
`;

// Confirmation Modal
const ConfirmModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.lg};
`;

const ModalOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
    position: relative;
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    box-shadow: ${theme.shadow.xl};
    max-width: 400px;
    width: 100%;
    overflow: hidden;
    border: 1px solid ${theme.border};
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border-bottom: 1px solid ${theme.border};
`;

const ModalIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.errorBg};
    color: ${theme.error};
    border-radius: ${theme.radius.md};
    font-size: 16px;
`;

const ModalTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const ModalBody = styled.div`
    padding: ${theme.spacing.xl};
`;

const WarningText = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.md};
    line-height: 1.5;
`;

const WarningSubtext = styled.div`
    font-size: 13px;
    color: ${theme.text.tertiary};
    line-height: 1.5;
`;

const ModalActions = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    background: ${theme.surfaceElevated};
    border-top: 1px solid ${theme.border};
`;

const ModalButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    flex: 1;
    justify-content: center;
    min-height: 40px;

    ${props => {
        switch (props.$variant) {
            case 'secondary':
                return `
                    background: ${theme.surface};
                    color: ${theme.text.secondary};
                    border-color: ${theme.border};
                    
                    &:hover {
                        background: ${theme.surfaceHover};
                        border-color: ${theme.borderActive};
                    }
                `;
            case 'danger':
                return `
                    background: ${theme.error};
                    color: white;
                    border-color: ${theme.error};
                    
                    &:hover {
                        background: ${theme.error};
                        opacity: 0.9;
                    }
                `;
            default:
                return `
                    background: ${theme.primary};
                    color: white;
                    border-color: ${theme.primary};
                    
                    &:hover {
                        background: ${theme.primaryDark};
                    }
                `;
        }
    }}
`;

export default AppointmentDetails;