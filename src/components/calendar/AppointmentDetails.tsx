// src/components/calendar/AppointmentDetails.tsx - Professional Version
import React, { useState } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaCalendarAlt,
    FaClock,
    FaUser,
    FaEdit,
    FaTrash,
    FaCar,
    FaClipboardCheck,
    FaExternalLinkAlt,
    FaTools,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaIdCard,
    FaMoneyBillWave,
    FaCheckCircle,
    FaTimes,
    FaEye,
    FaFileInvoiceDollar
} from 'react-icons/fa';
import { Appointment, ProtocolStatus, SelectedService } from '../../types';
import { AppointmentStatusManager } from './AppointmentStatusManager';
import { useNavigate } from 'react-router-dom';

// Professional Design System for Corporate CRM
const professional = {
    // Corporate Color Palette
    primary: '#1e293b',
    primaryLight: '#334155',
    primaryDark: '#0f172a',

    // Business Surfaces
    surface: '#ffffff',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    surfaceAccent: '#fafbfc',

    // Professional Typography
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',

    // Corporate Borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderAccent: '#cbd5e1',

    // Business Status Colors
    success: '#0f766e',
    successBg: '#f0fdfa',
    warning: '#b45309',
    warningBg: '#fffbeb',
    error: '#b91c1c',
    errorBg: '#fef2f2',
    info: '#0369a1',
    infoBg: '#f0f9ff',

    // Professional Spacing
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
        xxxl: '32px'
    },

    // Corporate Shadows
    shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    radius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px'
    }
};

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

    // Date formatting functions
    const formatDateTime = (date: Date) => {
        return format(date, 'EEEE, dd MMMM yyyy • HH:mm', { locale: pl });
    };

    const formatTimeOnly = (date: Date) => {
        return format(date, 'HH:mm', { locale: pl });
    };

    // Protocol navigation
    const handleGoToProtocol = () => {
        if (appointment.isProtocol && appointment.id) {
            const protocolId = appointment.id.replace('protocol-', '');
            navigate(`/orders/car-reception/${protocolId}`);
        }
    };

    // Price calculations
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

    // Delete confirmation handlers
    const handleDeleteClick = () => {
        setShowConfirmDelete(true);
    };

    const confirmDelete = () => {
        onDelete();
        setShowConfirmDelete(false);
    };

    return (
        <DetailsContainer>
            {/* Professional Header */}
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

// Professional Styled Components
const DetailsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${professional.spacing.xl};
    max-width: 100%;
    background: ${professional.surface};
    border: 1px solid ${professional.border};
    border-radius: ${professional.radius.lg};
    overflow: hidden;
`;

const DetailsHeader = styled.div`
    background: ${professional.surfaceElevated};
    border-bottom: 1px solid ${professional.border};
`;

const HeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${professional.spacing.xxl};
`;

const HeaderInfo = styled.div`
    flex: 1;
`;

const AppointmentTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: ${professional.textPrimary};
    margin: 0 0 ${professional.spacing.sm} 0;
    line-height: 1.3;
`;

const AppointmentMeta = styled.div`
    font-size: 14px;
    color: ${professional.textTertiary};
    font-weight: 400;
`;

const ProtocolActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${professional.spacing.sm};
    padding: ${professional.spacing.md} ${professional.spacing.lg};
    background: ${professional.surface};
    color: ${professional.primary};
    border: 2px solid ${professional.primary};
    border-radius: ${professional.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;

    &:hover {
        background: ${professional.primary};
        color: white;
        transform: translateY(-1px);
        box-shadow: ${professional.shadow.md};
    }

    &:active {
        transform: translateY(0);
    }

    svg {
        font-size: 13px;
    }
`;

const StatusSection = styled.div`
    border-bottom: 1px solid ${professional.borderLight};
`;

const SectionHeader = styled.div`
    padding: ${professional.spacing.lg} ${professional.spacing.xxl} ${professional.spacing.md};
    background: ${professional.surfaceAccent};
    border-bottom: 1px solid ${professional.borderLight};
`;

const SectionTitle = styled.h3`
    font-size: 15px;
    font-weight: 600;
    color: ${professional.textPrimary};
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const SectionTitleWithIcon = styled.div`
    display: flex;
    align-items: center;
    gap: ${professional.spacing.sm};
    font-size: 15px;
    font-weight: 600;
    color: ${professional.textPrimary};
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
        color: ${professional.textTertiary};
        font-size: 14px;
    }
`;

const StatusContent = styled.div`
    padding: ${professional.spacing.lg} ${professional.spacing.xxl};
`;

const InfoSection = styled.div`
    border-bottom: 1px solid ${professional.borderLight};
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${professional.spacing.lg};
    padding: ${professional.spacing.lg} ${professional.spacing.xxl};
`;

const InfoItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${professional.spacing.lg};
    padding: ${professional.spacing.lg};
    background: ${professional.surface};
    border: 1px solid ${professional.borderLight};
    border-radius: ${professional.radius.md};
    transition: all 0.2s ease;

    &:hover {
        background: ${professional.surfaceHover};
        border-color: ${professional.borderAccent};
    }
`;

const InfoIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${professional.surfaceElevated};
    border: 1px solid ${professional.border};
    border-radius: ${professional.radius.md};
    color: ${professional.textTertiary};
    font-size: 14px;
    flex-shrink: 0;
`;

const InfoContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${professional.spacing.xs};
    flex: 1;
`;

const InfoLabel = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${professional.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${professional.textPrimary};
    line-height: 1.4;
`;

const ServicesSection = styled.div`
    border-bottom: 1px solid ${professional.borderLight};
`;

const TotalValue = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: ${professional.spacing.xs};
`;

const TotalLabel = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${professional.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TotalAmount = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${professional.primary};
`;

const ServicesContent = styled.div`
    padding: ${professional.spacing.lg} ${professional.spacing.xxl};
`;

const ServicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${professional.spacing.md};
    margin-bottom: ${professional.spacing.xl};
`;

const ServiceItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${professional.spacing.lg};
    background: ${professional.surface};
    border: 1px solid ${professional.borderLight};
    border-radius: ${professional.radius.md};
    transition: all 0.2s ease;

    &:hover {
        background: ${professional.surfaceHover};
        border-color: ${professional.borderAccent};
    }
`;

const ServiceInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${professional.spacing.xs};
    flex: 1;
`;

const ServiceName = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${professional.textPrimary};
`;

const ServiceMeta = styled.div`
    font-size: 12px;
    color: ${professional.textMuted};
    font-weight: 400;
`;

const ServicePricing = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${professional.spacing.xs};
    align-items: flex-end;
`;

const PriceRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${professional.spacing.md};
`;

const PriceLabel = styled.div`
    font-size: 12px;
    color: ${professional.textTertiary};
    font-weight: 400;
`;

const PriceValue = styled.div<{ $primary?: boolean }>`
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.$primary ? professional.primary : professional.textSecondary};
    min-width: 80px;
    text-align: right;
`;

const ServicesSummary = styled.div`
    padding: ${professional.spacing.lg};
    background: ${professional.surfaceElevated};
    border: 1px solid ${professional.border};
    border-radius: ${professional.radius.md};
    display: flex;
    flex-direction: column;
    gap: ${professional.spacing.md};
`;

const SummaryRow = styled.div<{ $primary?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    ${props => props.$primary && `
        padding-top: ${professional.spacing.md};
        border-top: 1px solid ${professional.border};
    `}
`;

const SummaryLabel = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${professional.textPrimary};
`;

const SummaryValue = styled.div<{ $primary?: boolean }>`
    font-size: ${props => props.$primary ? '16px' : '14px'};
    font-weight: ${props => props.$primary ? '600' : '500'};
    color: ${props => props.$primary ? professional.primary : professional.textPrimary};
`;

const ActionsSection = styled.div`
    padding: ${professional.spacing.xl} ${professional.spacing.xxl};
    background: ${professional.surfaceElevated};
`;

const ActionGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: ${professional.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const BaseAction = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${professional.spacing.sm};
    padding: ${professional.spacing.lg};
    border-radius: ${professional.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    position: relative;
    overflow: hidden;
    min-height: 48px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${professional.shadow.md};
    }

    &:active {
        transform: translateY(0);
    }
`;

const PrimaryAction = styled(BaseAction)`
    background: ${professional.primary};
    color: white;
    border-color: ${professional.primary};
    flex-direction: column;
    gap: ${professional.spacing.xs};

    &:hover {
        background: ${professional.primaryDark};
        border-color: ${professional.primaryDark};
    }
`;

const SecondaryAction = styled(BaseAction)`
    background: ${professional.surface};
    color: ${professional.textSecondary};
    border-color: ${professional.border};

    &:hover {
        background: ${professional.surfaceHover};
        border-color: ${professional.borderAccent};
        color: ${professional.textPrimary};
    }
`;

const DangerAction = styled(BaseAction)`
    background: ${professional.surface};
    color: ${professional.error};
    border-color: ${professional.border};

    &:hover {
        background: ${professional.errorBg};
        border-color: ${professional.error};
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
    padding: ${professional.spacing.lg};
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
    background: ${professional.surface};
    border-radius: ${professional.radius.lg};
    box-shadow: ${professional.shadow.xl};
    max-width: 400px;
    width: 100%;
    overflow: hidden;
    border: 1px solid ${professional.border};
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${professional.spacing.lg};
    padding: ${professional.spacing.xl};
    background: ${professional.surfaceElevated};
    border-bottom: 1px solid ${professional.border};
`;

const ModalIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${professional.errorBg};
    color: ${professional.error};
    border-radius: ${professional.radius.md};
    font-size: 16px;
`;

const ModalTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${professional.textPrimary};
    margin: 0;
`;

const ModalBody = styled.div`
    padding: ${professional.spacing.xl};
`;

const WarningText = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${professional.textPrimary};
    margin-bottom: ${professional.spacing.md};
    line-height: 1.5;
`;

const WarningSubtext = styled.div`
    font-size: 13px;
    color: ${professional.textTertiary};
    line-height: 1.5;
`;

const ModalActions = styled.div`
    display: flex;
    gap: ${professional.spacing.sm};
    padding: ${professional.spacing.lg} ${professional.spacing.xl};
    background: ${professional.surfaceElevated};
    border-top: 1px solid ${professional.border};
`;

const ModalButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
    display: flex;
    align-items: center;
    gap: ${professional.spacing.sm};
    padding: ${professional.spacing.sm} ${professional.spacing.lg};
    border-radius: ${professional.radius.md};
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
                    background: ${professional.surface};
                    color: ${professional.textSecondary};
                    border-color: ${professional.border};
                    
                    &:hover {
                        background: ${professional.surfaceHover};
                        border-color: ${professional.borderAccent};
                    }
                `;
            case 'danger':
                return `
                    background: ${professional.error};
                    color: white;
                    border-color: ${professional.error};
                    
                    &:hover {
                        background: ${professional.error};
                        opacity: 0.9;
                    }
                `;
            default:
                return `
                    background: ${professional.primary};
                    color: white;
                    border-color: ${professional.primary};
                    
                    &:hover {
                        background: ${professional.primaryDark};
                    }
                `;
        }
    }}
`;

export default AppointmentDetails;