// src/features/reservations/components/ReservationDetails/ReservationDetails.tsx
import React from 'react';
import styled from 'styled-components';
import {
    FaArrowRight,
    FaEdit,
    FaCar,
    FaPhone,
    FaUser,
    FaClock,
    FaCalendarAlt,
    FaStickyNote,
    FaTools,
    FaPalette,
    FaCheckCircle,
    FaExclamationCircle,
    FaBan,
    FaTimes,
    FaClipboardCheck
} from 'react-icons/fa';
import { Reservation, ReservationStatus } from '../../api/reservationsApi';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { theme } from '../../../../styles/theme';

interface ReservationDetailsProps {
    reservation: Reservation;
    onStartVisit: (reservation: Reservation) => void;
    onEdit: (reservationId: string) => void;
    onClose?: () => void;
}

export const ReservationDetails: React.FC<ReservationDetailsProps> = ({
                                                                          reservation,
                                                                          onStartVisit,
                                                                          onEdit,
                                                                          onClose
                                                                      }) => {
    const formatDateTime = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return format(date, 'EEEE, dd MMMM yyyy • HH:mm', { locale: pl });
        } catch {
            return dateString;
        }
    };

    const getStatusConfig = (status: ReservationStatus) => {
        switch (status) {
            case ReservationStatus.CONFIRMED:
                return {
                    label: 'Potwierdzona',
                    color: theme.success,
                    bgColor: theme.successBg,
                    icon: FaCheckCircle
                };
            case ReservationStatus.CONVERTED:
                return {
                    label: 'Przekonwertowana',
                    color: theme.info,
                    bgColor: theme.infoBg,
                    icon: FaCheckCircle
                };
            case ReservationStatus.CANCELLED:
                return {
                    label: 'Anulowana',
                    color: theme.error,
                    bgColor: theme.errorBg,
                    icon: FaBan
                };
            default:
                return {
                    label: status,
                    color: theme.text.secondary,
                    bgColor: theme.surfaceAlt,
                    icon: FaExclamationCircle
                };
        }
    };

    const statusConfig = getStatusConfig(reservation.status);
    const canStartVisit = reservation.canBeConverted;
    const StatusIcon = statusConfig.icon;

    return (
        <DetailsContainer>
            <DetailsHeader>
                <HeaderContent>
                    <HeaderInfo>
                        <AppointmentTitle>{reservation.title}</AppointmentTitle>
                    </HeaderInfo>
                    <HeaderActions>
                        <StatusBadge $color={statusConfig.color} $bgColor={statusConfig.bgColor}>
                            <StatusIcon />
                            <span>{statusConfig.label}</span>
                        </StatusBadge>
                        {onClose && (
                            <CloseButton onClick={onClose} aria-label="Zamknij">
                                <FaTimes />
                            </CloseButton>
                        )}
                    </HeaderActions>
                </HeaderContent>
            </DetailsHeader>

            <DetailsSection>
                {reservation.visitId && (
                    <ConversionNotice>
                        <NoticeIcon>
                            <FaCheckCircle />
                        </NoticeIcon>
                        <NoticeContent>
                            <NoticeTitle>Rezerwacja przekonwertowana</NoticeTitle>
                            <NoticeText>Ta rezerwacja została już przekształcona w wizytę #{reservation.visitId}</NoticeText>
                        </NoticeContent>
                    </ConversionNotice>
                )}

                <InfoSection>
                    <SectionHeader>
                        <SectionTitle>Klient i pojazd</SectionTitle>
                    </SectionHeader>
                    <InfoGrid>
                        <InfoItem>
                            <InfoIcon>
                                <FaCar />
                            </InfoIcon>
                            <InfoContent>
                                <InfoLabel>Marka i model</InfoLabel>
                                <InfoValue>{reservation.vehicleDisplay}</InfoValue>
                            </InfoContent>
                        </InfoItem>
                        {reservation.contactName && (
                            <InfoItem>
                                <InfoIcon>
                                    <FaUser />
                                </InfoIcon>
                                <InfoContent>
                                    <InfoLabel>Osoba kontaktowa</InfoLabel>
                                    <InfoValue>{reservation.contactName}</InfoValue>
                                </InfoContent>
                            </InfoItem>
                        )}
                        <InfoItem>
                            <InfoIcon>
                                <FaPhone />
                            </InfoIcon>
                            <InfoContent>
                                <InfoLabel>Numer telefonu</InfoLabel>
                                <InfoValue>{reservation.contactPhone}</InfoValue>
                            </InfoContent>
                        </InfoItem>
                    </InfoGrid>
                </InfoSection>

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
                                <InfoValue>{formatDateTime(reservation.startDate)}</InfoValue>
                            </InfoContent>
                        </InfoItem>

                        {reservation.endDate && (
                            <InfoItem>
                                <InfoIcon>
                                    <FaClock />
                                </InfoIcon>
                                <InfoContent>
                                    <InfoLabel>Data i godzina zakończenia</InfoLabel>
                                    <InfoValue>{formatDateTime(reservation.endDate)}</InfoValue>
                                </InfoContent>
                            </InfoItem>
                        )}
                    </InfoGrid>
                </InfoSection>

                {reservation.services && reservation.services.length > 0 && (
                    <ServicesSection>
                        <SectionHeader>
                            <SectionTitleWithIcon>
                                <FaTools />
                                <span>Wykaz usług ({reservation.serviceCount})</span>
                            </SectionTitleWithIcon>
                            <TotalValue>
                                <TotalLabel>Wartość łączna:</TotalLabel>
                                <TotalAmount>
                                    {reservation.totalPriceBrutto.toFixed(2)} PLN
                                </TotalAmount>
                            </TotalValue>
                        </SectionHeader>

                        <ServicesContent>
                            <ServicesList>
                                {reservation.services.map((service, index) => (
                                    <ServiceItem key={index}>
                                        <ServiceInfo>
                                            <ServiceName>{service.name}</ServiceName>
                                            <ServiceMeta>
                                                Ilość: {service.quantity}
                                            </ServiceMeta>
                                            {service.note && (
                                                <ServiceNote>
                                                    <FaStickyNote />
                                                    <span>{service.note}</span>
                                                </ServiceNote>
                                            )}
                                        </ServiceInfo>

                                        <ServicePricing>
                                            <PriceRow>
                                                <PriceLabel>Netto:</PriceLabel>
                                                <PriceValue>
                                                    {service.finalPrice.priceNetto.toFixed(2)} zł
                                                </PriceValue>
                                            </PriceRow>
                                            <PriceRow>
                                                <PriceLabel>Brutto:</PriceLabel>
                                                <PriceValue $primary>
                                                    {service.finalPrice.priceBrutto.toFixed(2)} zł
                                                </PriceValue>
                                            </PriceRow>
                                        </ServicePricing>
                                    </ServiceItem>
                                ))}
                            </ServicesList>

                            <ServicesSummary>
                                <SummaryRow>
                                    <SummaryLabel>Razem netto:</SummaryLabel>
                                    <SummaryValue>{reservation.totalPriceNetto.toFixed(2)} zł</SummaryValue>
                                </SummaryRow>
                                <SummaryRow>
                                    <SummaryLabel>VAT:</SummaryLabel>
                                    <SummaryValue>{reservation.totalTaxAmount.toFixed(2)} zł</SummaryValue>
                                </SummaryRow>
                                <SummaryRow $primary>
                                    <SummaryLabel>Razem brutto:</SummaryLabel>
                                    <SummaryValue $primary>{reservation.totalPriceBrutto.toFixed(2)} zł</SummaryValue>
                                </SummaryRow>
                            </ServicesSummary>
                        </ServicesContent>
                    </ServicesSection>
                )}

                {reservation.notes && (
                    <InfoSection>
                        <SectionHeader>
                            <SectionTitle>Dodatkowe notatki</SectionTitle>
                        </SectionHeader>
                        <ContentPadding>
                            <NotesContent>{reservation.notes}</NotesContent>
                        </ContentPadding>
                    </InfoSection>
                )}

                <InfoSection>
                    <SectionHeader>
                        <SectionTitle>Metadane</SectionTitle>
                    </SectionHeader>
                    <InfoGrid>
                        <InfoItem>
                            <InfoIcon>
                                <FaCalendarAlt />
                            </InfoIcon>
                            <InfoContent>
                                <InfoLabel>Utworzono</InfoLabel>
                                <InfoValue>{formatDateTime(reservation.createdAt)}</InfoValue>
                            </InfoContent>
                        </InfoItem>
                        <InfoItem>
                            <InfoIcon>
                                <FaClock />
                            </InfoIcon>
                            <InfoContent>
                                <InfoLabel>Ostatnia aktualizacja</InfoLabel>
                                <InfoValue>{formatDateTime(reservation.updatedAt)}</InfoValue>
                            </InfoContent>
                        </InfoItem>
                    </InfoGrid>
                </InfoSection>

            </DetailsSection>

            <ActionsSection>
                <ActionGrid>
                    <SecondaryAction onClick={() => onEdit(reservation.id)}>
                        <FaEdit />
                        <span>Edytuj rezerwację</span>
                    </SecondaryAction>

                    <PrimaryAction
                        onClick={() => onStartVisit(reservation)}
                        disabled={!canStartVisit}
                        title={canStartVisit ? 'Rozpocznij wizytę na podstawie rezerwacji' : 'Ta rezerwacja została już przekonwertowana'}
                    >
                        <FaClipboardCheck />
                        <ActionContent>
                            <ActionLabel>Rozpocznij wizytę</ActionLabel>
                            <ActionHint>
                                {canStartVisit ? 'Przekształć w pełną wizytę' : 'Już przekonwertowana'}
                            </ActionHint>
                        </ActionContent>
                    </PrimaryAction>
                </ActionGrid>
            </ActionsSection>
        </DetailsContainer>
    );
};

const DetailsContainer = styled.div`
    display: flex;
    flex-direction: column;
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    max-height: 90vh;
    border: 1px solid ${theme.border};
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

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg} ${theme.spacing.xl};
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.lg};
    }
`;

const HeaderInfo = styled.div`
    flex: 1;
`;

const AppointmentTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    line-height: 1.3;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    flex-shrink: 0;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    color: ${theme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
        background: ${theme.surfaceHover};
        color: ${theme.error};
        border-color: ${theme.error};
    }

    &:active {
        transform: scale(0.95);
    }

    svg {
        font-size: 16px;
    }
`;

const StatusBadge = styled.div<{ $color: string; $bgColor: string }>`
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    background: ${props => props.$bgColor};
    color: ${props => props.$color};
    border-radius: ${theme.radius.lg};
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid ${props => props.$color}30;
    flex-shrink: 0;

    svg {
        font-size: 14px;
    }
`;

const ConversionNotice = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.infoBg};
    border: 1px solid ${theme.info}30;
    border-radius: ${theme.radius.lg};
    margin: ${theme.spacing.lg} ${theme.spacing.xxl};

    @media (max-width: 768px) {
        margin: ${theme.spacing.lg} ${theme.spacing.xl};
    }
`;

const NoticeIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${theme.info}20;
    color: ${theme.info};
    border-radius: ${theme.radius.md};
    font-size: 16px;
    flex-shrink: 0;
`;

const NoticeContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const NoticeTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.info};
    margin-bottom: 2px;
`;

const NoticeText = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    line-height: 1.4;
`;

const DetailsSection = styled.div`
    display: flex;
    flex-direction: column;
    max-height: 70vh;
    overflow-y: auto;

    @media (max-width: 768px) {
        max-height: 75vh;
    }

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: ${theme.surfaceAlt};
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${theme.border};
        border-radius: 4px;

        &:hover {
            background: ${theme.text.muted};
        }
    }
`;

const InfoSection = styled.div`
    border-bottom: 1px solid ${theme.borderLight};
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg} ${theme.spacing.xxl} ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    border-bottom: 1px solid ${theme.borderLight};

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg} ${theme.spacing.xl} ${theme.spacing.md};
    }
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

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg} ${theme.spacing.xxl};

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg} ${theme.spacing.xl};
    }
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

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg} ${theme.spacing.xl};
    }
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
    align-items: flex-start;
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.md};
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.lg};
        align-items: stretch;
    }
`;

const ServiceInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    flex: 1;
    padding-right: ${theme.spacing.lg};
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

const ServiceNote = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    margin-top: ${theme.spacing.md};
    padding-top: ${theme.spacing.md};
    border-top: 1px solid ${theme.borderLight};
    font-size: 13px;
    color: ${theme.text.secondary};
    font-style: italic;

    svg {
        font-size: 12px;
        margin-top: 2px;
        flex-shrink: 0;
        color: ${theme.text.muted};
    }
`;

const ServicePricing = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    align-items: flex-end;
    flex-shrink: 0;

    @media (max-width: 768px) {
        align-items: flex-start;
        flex-direction: row;
        gap: ${theme.spacing.xl};
    }
`;

const PriceRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    justify-content: flex-end;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.xs};
    }
`;

const PriceLabel = styled.div`
    font-size: 12px;
    color: ${theme.text.tertiary};
    font-weight: 400;
`;

const PriceValue = styled.div<{ $primary?: boolean }>`
    font-size: 14px;
    font-weight: ${props => props.$primary ? '600' : '500'};
    color: ${props => props.$primary ? theme.primary : theme.text.secondary};
    min-width: 80px;
    text-align: right;

    @media (max-width: 768px) {
        text-align: left;
        font-size: 15px;
    }
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

const ContentPadding = styled.div`
    padding: ${theme.spacing.lg} ${theme.spacing.xxl};

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg} ${theme.spacing.xl};
    }
`;

const ColorPreview = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.lg};
`;

const ColorSwatch = styled.div`
    width: 48px;
    height: 48px;
    border-radius: ${theme.radius.md};
    border: 2px solid ${theme.surface};
    box-shadow: ${theme.shadow.sm};
    flex-shrink: 0;
`;

const ColorInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const ColorName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const ColorCode = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${theme.text.tertiary};
    font-family: monospace;
`;

const NotesContent = styled.div`
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.lg};
    font-size: 14px;
    color: ${theme.text.primary};
    line-height: 1.6;
    white-space: pre-wrap;
`;

const ActionsSection = styled.div`
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
    border-top: 1px solid ${theme.borderLight};

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg} ${theme.spacing.xl};
    }
`;

const ActionGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr;
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

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;

        &:hover {
            transform: none;
            box-shadow: none;
        }
    }
`;

const PrimaryAction = styled(BaseAction)`
    background: ${theme.primary};
    color: white;
    border-color: ${theme.primary};
    flex-direction: column;
    gap: ${theme.spacing.xs};

    &:hover:not(:disabled) {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
    }

    svg {
        font-size: 20px;
    }
`;

const SecondaryAction = styled(BaseAction)`
    background: ${theme.surface};
    color: ${theme.text.secondary};
    border-color: ${theme.border};

    &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderActive};
        color: ${theme.text.primary};
    }
`;

const ActionContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
`;

const ActionLabel = styled.div`
    font-size: 15px;
    font-weight: 500;
`;

const ActionHint = styled.div`
    font-size: 12px;
    opacity: 0.8;
    font-weight: 400;
`;

export default ReservationDetails;