// src/components/calendar/AppointmentDetails.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
    FaCalendarAlt,
    FaClock,
    FaUser,
    FaTag,
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
    FaEye
} from 'react-icons/fa';
import { Appointment, ProtocolStatus, SelectedService } from '../../types';
import { AppointmentStatusManager } from './AppointmentStatusManager';
import { useNavigate } from 'react-router-dom';

// Enterprise Design System - Automotive Grade
const enterprise = {
    // Brand Color System
    primary: 'var(--brand-primary, #2563eb)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',

    // Professional Surfaces
    surface: '#ffffff',
    surfaceElevated: '#fafbfc',
    surfaceHover: '#f8fafc',
    surfaceActive: '#f1f5f9',

    // Executive Typography
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',

    // Technical Borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderActive: '#cbd5e1',

    // Status Colors
    success: '#059669',
    successBg: '#ecfdf5',
    warning: '#d97706',
    warningBg: '#fffbeb',
    error: '#dc2626',
    errorBg: '#fef2f2',
    info: '#0891b2',
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

    // Industrial Shadows
    shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px'
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

    // Enhanced date formatting
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

    // Enhanced price calculations
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

    // Enhanced delete confirmation
    const handleDeleteClick = () => {
        setShowConfirmDelete(true);
    };

    const confirmDelete = () => {
        onDelete();
        setShowConfirmDelete(false);
    };

    return (
        <DetailsContainer>
            {/* Executive Header */}
            <DetailsHeader>
                <HeaderContent>
                    <AppointmentTitle>{appointment.title}</AppointmentTitle>
                    <AppointmentSubtitle>
                        {appointment.isProtocol ? 'Protokół wizyty' : 'Rezerwacja'}
                        {appointment.customerId && ` • ${appointment.customerId}`}
                    </AppointmentSubtitle>
                </HeaderContent>

                {appointment.isProtocol && (
                    <ProtocolBadge>
                        <FaClipboardCheck />
                        Protokół
                    </ProtocolBadge>
                )}
            </DetailsHeader>

            {/* Professional Status Section */}
            <StatusSection>
                <SectionTitle>Status wizyty</SectionTitle>
                <AppointmentStatusManager
                    status={appointment.status}
                    onStatusChange={onStatusChange}
                />
            </StatusSection>

            {/* Enhanced Schedule Information */}
            <InfoSection>
                <SectionTitle>Informacje o terminie</SectionTitle>
                <InfoGrid>
                    <InfoCard>
                        <InfoIcon $color={enterprise.primary}>
                            <FaCalendarAlt />
                        </InfoIcon>
                        <InfoContent>
                            <InfoLabel>Data rozpoczęcia</InfoLabel>
                            <InfoValue>{formatDateTime(appointment.start)}</InfoValue>
                        </InfoContent>
                    </InfoCard>

                    <InfoCard>
                        <InfoIcon $color={enterprise.success}>
                            <FaClock />
                        </InfoIcon>
                        <InfoContent>
                            <InfoLabel>Czas trwania</InfoLabel>
                            <InfoValue>
                                {formatTimeOnly(appointment.start)} - {formatTimeOnly(appointment.end)}
                            </InfoValue>
                        </InfoContent>
                    </InfoCard>
                </InfoGrid>
            </InfoSection>

            {/* Client & Vehicle Information */}
            {(appointment.customerId || appointment.vehicleId) && (
                <InfoSection>
                    <SectionTitle>Informacje o kliencie i pojeździe</SectionTitle>
                    <InfoGrid>
                        {appointment.customerId && (
                            <InfoCard>
                                <InfoIcon $color={enterprise.info}>
                                    <FaUser />
                                </InfoIcon>
                                <InfoContent>
                                    <InfoLabel>Klient</InfoLabel>
                                    <InfoValue>{appointment.customerId}</InfoValue>
                                </InfoContent>
                            </InfoCard>
                        )}

                        {appointment.vehicleId && (
                            <InfoCard>
                                <InfoIcon $color={enterprise.warning}>
                                    <FaCar />
                                </InfoIcon>
                                <InfoContent>
                                    <InfoLabel>Pojazd</InfoLabel>
                                    <InfoValue>{appointment.vehicleId}</InfoValue>
                                </InfoContent>
                            </InfoCard>
                        )}
                    </InfoGrid>
                </InfoSection>
            )}

            {/* Enhanced Services Section */}
            {appointment.services && appointment.services.length > 0 && (
                <ServicesSection>
                    <SectionHeader>
                        <SectionTitle>
                            <FaTools />
                            Wykaz usług ({appointment.services.length})
                        </SectionTitle>
                        <TotalValueDisplay>
                            <TotalLabel>Wartość łączna:</TotalLabel>
                            <TotalAmount>{totalValue.gross.toFixed(2)} zł</TotalAmount>
                        </TotalValueDisplay>
                    </SectionHeader>

                    <ServicesList>
                        {appointment.services.map((service, index) => (
                            <ServiceItem key={index}>
                                <ServiceDetails>
                                    <ServiceName>{service.name}</ServiceName>
                                    <ServiceMeta>
                                        Pozycja {index + 1} z {appointment.services.length}
                                    </ServiceMeta>
                                </ServiceDetails>

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

                        <ServicesSummary>
                            <SummaryRow>
                                <SummaryLabel>Razem netto:</SummaryLabel>
                                <SummaryValue>{totalValue.net.toFixed(2)} zł</SummaryValue>
                            </SummaryRow>
                            <SummaryRow $primary>
                                <SummaryLabel>Razem brutto:</SummaryLabel>
                                <SummaryValue>{totalValue.gross.toFixed(2)} zł</SummaryValue>
                            </SummaryRow>
                        </ServicesSummary>
                    </ServicesList>
                </ServicesSection>
            )}

            {/* Professional Action Buttons */}
            <ActionsSection>
                {(appointment.isProtocol && (appointment.status as unknown as ProtocolStatus) !== ProtocolStatus.SCHEDULED) ? (
                    <PrimaryAction onClick={handleGoToProtocol}>
                        <FaExternalLinkAlt />
                        <span>Przejdź do protokołu</span>
                        <ActionHint>Otwórz szczegółowy widok</ActionHint>
                    </PrimaryAction>
                ) : (
                    <ActionGrid>
                        <SecondaryAction onClick={onEdit}>
                            <FaEdit />
                            <span>Edytuj wizytę</span>
                        </SecondaryAction>

                        <PrimaryAction onClick={onCreateProtocol}>
                            <FaClipboardCheck />
                            <span>Rozpocznij wizytę</span>
                            <ActionHint>Utwórz protokół przyjęcia</ActionHint>
                        </PrimaryAction>

                        <DangerAction onClick={handleDeleteClick}>
                            <FaTrash />
                            <span>Usuń</span>
                        </DangerAction>
                    </ActionGrid>
                )}
            </ActionsSection>

            {/* Delete Confirmation Modal */}
            {showConfirmDelete && (
                <ConfirmModal>
                    <ModalOverlay onClick={() => setShowConfirmDelete(false)} />
                    <ModalContent>
                        <ModalHeader>
                            <ModalIcon $color={enterprise.error}>
                                <FaTrash />
                            </ModalIcon>
                            <ModalTitle>Usuń wizytę</ModalTitle>
                        </ModalHeader>

                        <ModalBody>
                            <WarningText>
                                Czy na pewno chcesz usunąć wizytę "{appointment.title}"?
                            </WarningText>
                            <WarningSubtext>
                                Ta akcja jest nieodwracalna. Wszystkie dane związane z wizytą zostaną trwale usunięte.
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
    gap: ${enterprise.spacing.xxl};
    max-width: 100%;
    padding: ${enterprise.spacing.xxl};
`;

const DetailsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: ${enterprise.spacing.xl};
    border-bottom: 2px solid ${enterprise.borderLight};
`;

const HeaderContent = styled.div`
    flex: 1;
`;

const AppointmentTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: ${enterprise.textPrimary};
    margin: 0 0 ${enterprise.spacing.sm} 0;
    line-height: 1.3;
`;

const AppointmentSubtitle = styled.div`
    font-size: 16px;
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

const ProtocolBadge = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.spacing.sm};
    padding: ${enterprise.spacing.md} ${enterprise.spacing.xl};
    background: linear-gradient(135deg, ${enterprise.primary} 0%, ${enterprise.primaryDark} 100%);
    color: white;
    border-radius: ${enterprise.radius.lg};
    font-weight: 600;
    font-size: 14px;
    box-shadow: ${enterprise.shadow.md};
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
        font-size: 16px;
    }
`;

const StatusSection = styled.div`
    background: ${enterprise.surfaceElevated};
    border: 1px solid ${enterprise.borderLight};
    border-radius: ${enterprise.radius.lg};
    padding: ${enterprise.spacing.xxl};
`;

const InfoSection = styled.div`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    padding: ${enterprise.spacing.xxl};
    box-shadow: ${enterprise.shadow.sm};
`;

const SectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: ${enterprise.spacing.md};
    font-size: 18px;
    font-weight: 600;
    color: ${enterprise.textPrimary};
    margin: 0 0 ${enterprise.spacing.xl} 0;

    svg {
        color: ${enterprise.primary};
        font-size: 16px;
    }
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${enterprise.spacing.xl};
`;

const InfoCard = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.spacing.lg};
    padding: ${enterprise.spacing.lg};
    background: ${enterprise.surfaceHover};
    border: 1px solid ${enterprise.borderLight};
    border-radius: ${enterprise.radius.md};
    transition: all 0.2s ease;

    &:hover {
        background: ${enterprise.surface};
        border-color: ${enterprise.border};
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.sm};
    }
`;

const InfoIcon = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${enterprise.radius.lg};
    font-size: 18px;
    flex-shrink: 0;
`;

const InfoContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.spacing.xs};
`;

const InfoLabel = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${enterprise.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${enterprise.textPrimary};
    line-height: 1.4;
`;

const ServicesSection = styled.div`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    overflow: hidden;
    box-shadow: ${enterprise.shadow.sm};
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${enterprise.spacing.xxl};
    background: ${enterprise.surfaceElevated};
    border-bottom: 1px solid ${enterprise.borderLight};
`;

const TotalValueDisplay = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: ${enterprise.spacing.xs};
`;

const TotalLabel = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${enterprise.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TotalAmount = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: ${enterprise.primary};
`;

const ServicesList = styled.div`
    padding: ${enterprise.spacing.xxl};
`;

const ServiceItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${enterprise.spacing.lg};
    border: 1px solid ${enterprise.borderLight};
    border-radius: ${enterprise.radius.md};
    margin-bottom: ${enterprise.spacing.lg};
    background: ${enterprise.surfaceHover};
    transition: all 0.2s ease;

    &:hover {
        background: ${enterprise.surface};
        border-color: ${enterprise.border};
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.sm};
    }

    &:last-child {
        margin-bottom: ${enterprise.spacing.xl};
    }
`;

const ServiceDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.spacing.xs};
`;

const ServiceName = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${enterprise.textPrimary};
`;

const ServiceMeta = styled.div`
    font-size: 13px;
    color: ${enterprise.textMuted};
    font-weight: 500;
`;

const ServicePricing = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.spacing.xs};
    align-items: flex-end;
`;

const PriceRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.spacing.md};
`;

const PriceLabel = styled.div`
    font-size: 13px;
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

const PriceValue = styled.div<{ $primary?: boolean }>`
    font-size: 15px;
    font-weight: 600;
    color: ${props => props.$primary ? enterprise.primary : enterprise.textSecondary};
    min-width: 80px;
    text-align: right;
`;

const ServicesSummary = styled.div`
    padding: ${enterprise.spacing.xl};
    background: ${enterprise.surfaceElevated};
    border: 2px solid ${enterprise.borderLight};
    border-radius: ${enterprise.radius.lg};
    display: flex;
    flex-direction: column;
    gap: ${enterprise.spacing.md};
`;

const SummaryRow = styled.div<{ $primary?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    ${props => props.$primary && `
        padding-top: ${enterprise.spacing.md};
        border-top: 1px solid ${enterprise.border};
    `}
`;

const SummaryLabel = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${enterprise.textPrimary};
`;

const SummaryValue = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${enterprise.primary};
`;

const ActionsSection = styled.div`
    padding-top: ${enterprise.spacing.xl};
    border-top: 2px solid ${enterprise.borderLight};
`;

const ActionGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: ${enterprise.spacing.lg};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const BaseAction = styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${enterprise.spacing.sm};
    padding: ${enterprise.spacing.xl};
    border-radius: ${enterprise.radius.lg};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid;
    position: relative;
    overflow: hidden;

    span {
        font-size: 16px;
    }

    svg {
        font-size: 20px;
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${enterprise.shadow.lg};
    }

    &:active {
        transform: translateY(-1px);
    }
`;

const PrimaryAction = styled(BaseAction)`
    background: linear-gradient(135deg, ${enterprise.primary} 0%, ${enterprise.primaryDark} 100%);
    color: white;
    border-color: ${enterprise.primary};

    &:hover {
        background: linear-gradient(135deg, ${enterprise.primaryDark} 0%, ${enterprise.primary} 100%);
    }
`;

const SecondaryAction = styled(BaseAction)`
    background: ${enterprise.surface};
    color: ${enterprise.textSecondary};
    border-color: ${enterprise.border};

    &:hover {
        background: ${enterprise.surfaceHover};
        border-color: ${enterprise.primary};
        color: ${enterprise.primary};
    }
`;

const DangerAction = styled(BaseAction)`
    background: ${enterprise.surface};
    color: ${enterprise.error};
    border-color: ${enterprise.error};

    &:hover {
        background: ${enterprise.errorBg};
        border-color: ${enterprise.error};
    }
`;

const ActionHint = styled.div`
    font-size: 12px;
    opacity: 0.8;
    font-weight: 400;
    text-align: center;
`;

// Confirmation Modal Styles
const ConfirmModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${enterprise.spacing.xl};
`;

const ModalOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
    position: relative;
    background: ${enterprise.surface};
    border-radius: ${enterprise.radius.xl};
    box-shadow: ${enterprise.shadow.xl};
    max-width: 480px;
    width: 100%;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.spacing.lg};
    padding: ${enterprise.spacing.xxl};
    background: ${enterprise.surfaceElevated};
    border-bottom: 1px solid ${enterprise.borderLight};
`;

const ModalIcon = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${enterprise.radius.lg};
    font-size: 20px;
`;

const ModalTitle = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: ${enterprise.textPrimary};
    margin: 0;
`;

const ModalBody = styled.div`
    padding: ${enterprise.spacing.xxl};
`;

const WarningText = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${enterprise.textPrimary};
    margin-bottom: ${enterprise.spacing.md};
    line-height: 1.5;
`;

const WarningSubtext = styled.div`
    font-size: 14px;
    color: ${enterprise.textTertiary};
    line-height: 1.5;
`;

const ModalActions = styled.div`
    display: flex;
    gap: ${enterprise.spacing.md};
    padding: ${enterprise.spacing.xxl};
    background: ${enterprise.surfaceElevated};
    border-top: 1px solid ${enterprise.borderLight};
`;

const ModalButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
    display: flex;
    align-items: center;
    gap: ${enterprise.spacing.sm};
    padding: ${enterprise.spacing.md} ${enterprise.spacing.xl};
    border-radius: ${enterprise.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    flex: 1;
    justify-content: center;

    ${props => {
    switch (props.$variant) {
        case 'primary':
            return `
                    background: ${enterprise.primary};
                    color: white;
                    border-color: ${enterprise.primary};
                    
                    &:hover {
                        background: ${enterprise.primaryDark};
                        border-color: ${enterprise.primaryDark};
                        transform: translateY(-1px);
                        box-shadow: ${enterprise.shadow.md};
                    }
                `;
        case 'secondary':
            return `
                    background: ${enterprise.surface};
                    color: ${enterprise.textSecondary};
                    border-color: ${enterprise.border};
                    
                    &:hover {
                        background: ${enterprise.surfaceHover};
                        border-color: ${enterprise.borderActive};
                        color: ${enterprise.textPrimary};
                    }
                `;
        case 'danger':
            return `
                    background: ${enterprise.error};
                    color: white;
                    border-color: ${enterprise.error};
                    
                    &:hover {
                        background: #dc2626;
                        border-color: #dc2626;
                        transform: translateY(-1px);
                        box-shadow: ${enterprise.shadow.md};
                    }
                `;
    }
}}

    svg {
        font-size: 14px;
    }
`;

export default AppointmentDetails;