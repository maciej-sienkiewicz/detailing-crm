// src/features/reservations/components/ReservationDetails/ReservationDetails.tsx
/**
 * Premium Reservation Details Component
 * Professional, modern design matching AppointmentDetails styling
 */

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
    FaWrench,
    FaPalette,
    FaCheckCircle,
    FaExclamationCircle,
    FaBan,
    FaTimes
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

    const formatDateOnly = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return format(date, 'dd MMMM yyyy', { locale: pl });
        } catch {
            return dateString;
        }
    };

    const formatTimeOnly = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return format(date, 'HH:mm', { locale: pl });
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
            {/* Header Section */}
            <HeaderSection>
                <HeaderTop>
                    <TitleGroup>
                        <IconWrapper $color={theme.primary}>
                            <FaCalendarAlt />
                        </IconWrapper>
                        <AppointmentTitle>{reservation.title}</AppointmentTitle>
                    </TitleGroup>
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
                </HeaderTop>

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
            </HeaderSection>

            {/* Details Section */}
            <DetailsSection>
                {/* Vehicle Information */}
                <DetailGroup>
                    <DetailHeader>
                        <DetailIcon $color={theme.primary}>
                            <FaCar />
                        </DetailIcon>
                        <DetailTitle>Informacje o pojeździe</DetailTitle>
                    </DetailHeader>
                    <DetailGrid>
                        <DetailItem>
                            <DetailLabel>Marka i model</DetailLabel>
                            <DetailValue $primary>{reservation.vehicleDisplay}</DetailValue>
                        </DetailItem>
                    </DetailGrid>
                </DetailGroup>

                {/* Contact Information */}
                <DetailGroup>
                    <DetailHeader>
                        <DetailIcon $color={theme.info}>
                            <FaPhone />
                        </DetailIcon>
                        <DetailTitle>Dane kontaktowe</DetailTitle>
                    </DetailHeader>
                    <DetailGrid>
                        {reservation.contactName && (
                            <DetailItem>
                                <DetailLabel>
                                    <FaUser /> Osoba kontaktowa
                                </DetailLabel>
                                <DetailValue>{reservation.contactName}</DetailValue>
                            </DetailItem>
                        )}
                        <DetailItem>
                            <DetailLabel>
                                <FaPhone /> Numer telefonu
                            </DetailLabel>
                            <DetailValue>{reservation.contactPhone}</DetailValue>
                        </DetailItem>
                    </DetailGrid>
                </DetailGroup>

                {/* Schedule */}
                <DetailGroup>
                    <DetailHeader>
                        <DetailIcon $color={theme.warning}>
                            <FaClock />
                        </DetailIcon>
                        <DetailTitle>Zaplanowany termin</DetailTitle>
                    </DetailHeader>
                    <TimelineContainer>
                        <TimelineItem>
                            <TimelineMarker $color={theme.success}>
                                <FaClock />
                            </TimelineMarker>
                            <TimelineContent>
                                <TimelineLabel>Rozpoczęcie</TimelineLabel>
                                <TimelineDate>{formatDateTime(reservation.startDate)}</TimelineDate>
                            </TimelineContent>
                        </TimelineItem>
                        {reservation.endDate && (
                            <TimelineItem>
                                <TimelineMarker $color={theme.error}>
                                    <FaClock />
                                </TimelineMarker>
                                <TimelineContent>
                                    <TimelineLabel>Zakończenie</TimelineLabel>
                                    <TimelineDate>{formatDateTime(reservation.endDate)}</TimelineDate>
                                </TimelineContent>
                            </TimelineItem>
                        )}
                    </TimelineContainer>
                </DetailGroup>

                {/* Services */}
                {reservation.services && reservation.services.length > 0 && (
                    <DetailGroup>
                        <DetailHeader>
                            <DetailIcon $color={theme.primary}>
                                <FaWrench />
                            </DetailIcon>
                            <DetailTitle>
                                Zaplanowane usługi
                                <ServiceCount>({reservation.serviceCount})</ServiceCount>
                            </DetailTitle>
                        </DetailHeader>
                        <ServicesList>
                            {reservation.services.map((service, index) => (
                                <ServiceCard key={index}>
                                    <ServiceHeader>
                                        <ServiceName>{service.name}</ServiceName>
                                        <ServiceQuantity>× {service.quantity}</ServiceQuantity>
                                    </ServiceHeader>
                                    <ServiceFooter>
                                        <ServicePriceGroup>
                                            <ServicePrice $type="net">
                                                <PriceLabel>Netto</PriceLabel>
                                                <PriceValue>{service.basePrice.priceNetto.toFixed(2)} PLN</PriceValue>
                                            </ServicePrice>
                                            <ServicePrice $type="gross">
                                                <PriceLabel>Brutto</PriceLabel>
                                                <PriceValue>{service.finalPrice.priceBrutto.toFixed(2)} PLN</PriceValue>
                                            </ServicePrice>
                                        </ServicePriceGroup>
                                    </ServiceFooter>
                                    {service.note && (
                                        <ServiceNote>
                                            <FaStickyNote />
                                            <span>{service.note}</span>
                                        </ServiceNote>
                                    )}
                                </ServiceCard>
                            ))}
                        </ServicesList>

                        <TotalSection>
                            <TotalRow>
                                <TotalLabel>Suma netto</TotalLabel>
                                <TotalValue>{reservation.totalPriceNetto.toFixed(2)} PLN</TotalValue>
                            </TotalRow>
                            <TotalRow>
                                <TotalLabel>VAT (23%)</TotalLabel>
                                <TotalValue>{reservation.totalTaxAmount.toFixed(2)} PLN</TotalValue>
                            </TotalRow>
                            <TotalDivider />
                            <TotalRow $highlight>
                                <TotalLabel>Suma brutto</TotalLabel>
                                <TotalValue $highlight>{reservation.totalPriceBrutto.toFixed(2)} PLN</TotalValue>
                            </TotalRow>
                        </TotalSection>
                    </DetailGroup>
                )}

                {/* Calendar Color */}
                <DetailGroup>
                    <DetailHeader>
                        <DetailIcon $color={theme.primary}>
                            <FaPalette />
                        </DetailIcon>
                        <DetailTitle>Kolor w kalendarzu</DetailTitle>
                    </DetailHeader>
                    <ColorPreview>
                        <ColorSwatch style={{ backgroundColor: reservation.calendarColorId }} />
                        <ColorInfo>
                            <ColorName>Przypisany kolor</ColorName>
                            <ColorCode>{reservation.calendarColorId}</ColorCode>
                        </ColorInfo>
                    </ColorPreview>
                </DetailGroup>

                {/* Notes */}
                {reservation.notes && (
                    <DetailGroup>
                        <DetailHeader>
                            <DetailIcon $color={theme.warning}>
                                <FaStickyNote />
                            </DetailIcon>
                            <DetailTitle>Dodatkowe notatki</DetailTitle>
                        </DetailHeader>
                        <NotesContent>{reservation.notes}</NotesContent>
                    </DetailGroup>
                )}

                {/* Metadata */}
                <MetadataSection>
                    <MetadataGrid>
                        <MetadataItem>
                            <MetadataIcon>
                                <FaCalendarAlt />
                            </MetadataIcon>
                            <MetadataContent>
                                <MetadataLabel>Utworzono</MetadataLabel>
                                <MetadataValue>{formatDateTime(reservation.createdAt)}</MetadataValue>
                            </MetadataContent>
                        </MetadataItem>
                        <MetadataItem>
                            <MetadataIcon>
                                <FaClock />
                            </MetadataIcon>
                            <MetadataContent>
                                <MetadataLabel>Ostatnia aktualizacja</MetadataLabel>
                                <MetadataValue>{formatDateTime(reservation.updatedAt)}</MetadataValue>
                            </MetadataContent>
                        </MetadataItem>
                    </MetadataGrid>
                </MetadataSection>
            </DetailsSection>

            {/* Actions Section */}
            <ActionsSection>
                <ActionGrid>
                    <SecondaryAction onClick={() => onEdit(reservation.id)}>
                        <FaEdit />
                        <ActionContent>
                            <ActionLabel>Edytuj rezerwację</ActionLabel>
                            <ActionHint>Modyfikuj szczegóły</ActionHint>
                        </ActionContent>
                    </SecondaryAction>

                    <PrimaryAction
                        onClick={() => onStartVisit(reservation)}
                        disabled={!canStartVisit}
                        title={canStartVisit ? 'Rozpocznij wizytę na podstawie rezerwacji' : 'Ta rezerwacja została już przekonwertowana'}
                    >
                        <FaArrowRight />
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

// Premium Styled Components - matching AppointmentDetails
const DetailsContainer = styled.div`
    display: flex;
    flex-direction: column;
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    overflow: hidden;
    max-height: 90vh;
`;

const HeaderSection = styled.div`
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    background: linear-gradient(135deg, ${theme.surfaceElevated} 0%, ${theme.surface} 100%);
    border-bottom: 1px solid ${theme.borderLight};

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg} ${theme.spacing.xl};
    }
`;

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.lg};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.md};
    }
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    flex-shrink: 0;
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

const TitleGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    flex: 1;
    min-width: 0;
`;

const IconWrapper = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${theme.radius.lg};
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: ${theme.shadow.xs};

    @media (max-width: 768px) {
        width: 40px;
        height: 40px;
        font-size: 18px;
    }
`;

const AppointmentTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
    line-height: 1.2;
    word-break: break-word;

    @media (max-width: 768px) {
        font-size: 20px;
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

    @media (max-width: 768px) {
        align-self: flex-start;
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
    padding: ${theme.spacing.xl} ${theme.spacing.xxl};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};
    max-height: 60vh;
    overflow-y: auto;

    @media (max-width: 768px) {
        padding: ${theme.spacing.lg} ${theme.spacing.xl};
        gap: ${theme.spacing.lg};
    }

    /* Premium scrollbar */
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

const DetailGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const DetailHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.xs};
`;

const DetailIcon = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: ${theme.radius.md};
    font-size: 16px;
    flex-shrink: 0;
`;

const DetailTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const ServiceCount = styled.span`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.text.tertiary};
`;

const DetailGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${theme.spacing.lg};
`;

const DetailItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
`;

const DetailLabel = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
        font-size: 11px;
    }
`;

const DetailValue = styled.div<{ $primary?: boolean }>`
    font-size: 15px;
    font-weight: ${props => props.$primary ? 600 : 500};
    color: ${props => props.$primary ? theme.primary : theme.text.primary};
`;

const TimelineContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.borderLight};
`;

const TimelineItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.md};
`;

const TimelineMarker = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border-radius: 50%;
    font-size: 14px;
    flex-shrink: 0;
    border: 2px solid ${props => props.$color}30;
`;

const TimelineContent = styled.div`
    flex: 1;
    padding-top: 2px;
`;

const TimelineLabel = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
`;

const TimelineDate = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: ${theme.text.primary};
`;

const ServicesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const ServiceCard = styled.div`
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.lg};
    transition: all 0.2s ease;

    &:hover {
        border-color: ${theme.border};
        box-shadow: ${theme.shadow.sm};
        transform: translateY(-1px);
    }
`;

const ServiceHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.md};
`;

const ServiceName = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
    flex: 1;
`;

const ServiceQuantity = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: ${theme.text.secondary};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${theme.surface};
    border-radius: ${theme.radius.sm};
`;

const ServiceFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ServicePriceGroup = styled.div`
    display: flex;
    gap: ${theme.spacing.lg};
`;

const ServicePrice = styled.div<{ $type: 'net' | 'gross' }>`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const PriceLabel = styled.div`
    font-size: 11px;
    font-weight: 600;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const PriceValue = styled.div`
    font-size: 15px;
    font-weight: 700;
    color: ${theme.primary};
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

const TotalSection = styled.div`
    margin-top: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.lg};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
`;

const TotalRow = styled.div<{ $highlight?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${props => props.$highlight ? theme.spacing.md : theme.spacing.xs} 0;
    ${props => props.$highlight && `
        background: ${theme.primaryGhost};
        margin: ${theme.spacing.sm} -${theme.spacing.md} 0;
        padding: ${theme.spacing.md};
        border-radius: ${theme.radius.md};
    `}
`;

const TotalLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.secondary};
`;

const TotalValue = styled.div<{ $highlight?: boolean }>`
    font-size: ${props => props.$highlight ? '18px' : '16px'};
    font-weight: 700;
    color: ${props => props.$highlight ? theme.primary : theme.text.primary};
`;

const TotalDivider = styled.div`
    height: 1px;
    background: ${theme.borderLight};
    margin: ${theme.spacing.xs} 0;
`;

const ColorPreview = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.lg};
`;

const ColorSwatch = styled.div`
    width: 48px;
    height: 48px;
    border-radius: ${theme.radius.md};
    border: 2px solid ${theme.surface};
    box-shadow: ${theme.shadow.md};
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
    background: ${theme.surfaceAlt};
    border: 1px solid ${theme.borderLight};
    border-radius: ${theme.radius.lg};
    font-size: 14px;
    color: ${theme.text.primary};
    line-height: 1.6;
    white-space: pre-wrap;
`;

const MetadataSection = styled.div`
    padding-top: ${theme.spacing.lg};
    border-top: 1px solid ${theme.borderLight};
`;

const MetadataGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${theme.spacing.lg};
`;

const MetadataItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    background: ${theme.surfaceAlt};
    border-radius: ${theme.radius.md};
`;

const MetadataIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: ${theme.surface};
    color: ${theme.text.tertiary};
    border-radius: ${theme.radius.sm};
    font-size: 12px;
    flex-shrink: 0;
`;

const MetadataContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
`;

const MetadataLabel = styled.div`
    font-size: 11px;
    font-weight: 600;
    color: ${theme.text.tertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const MetadataValue = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: ${theme.text.secondary};
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
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    min-height: 56px;
    flex-direction: column;

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

    svg {
        font-size: 20px;
    }
`;

const PrimaryAction = styled(BaseAction)`
    background: ${theme.primary};
    color: white;
    border-color: ${theme.primary};

    &:hover:not(:disabled) {
        background: ${theme.primaryDark};
        border-color: ${theme.primaryDark};
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
    gap: 4px;
`;

const ActionLabel = styled.div`
    font-size: 15px;
    font-weight: 600;
`;

const ActionHint = styled.div`
    font-size: 12px;
    opacity: 0.8;
    font-weight: 400;
`;

export default ReservationDetails;