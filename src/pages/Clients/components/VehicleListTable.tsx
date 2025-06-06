// VehicleListTable.tsx - Professional Premium Automotive CRM
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaHistory, FaEye, FaCar, FaCalendarAlt, FaMoneyBillWave, FaTools, FaUser, FaUsers } from 'react-icons/fa';
import { VehicleExpanded, VehicleOwner } from '../../../types';
import { vehicleApi } from '../../../api/vehiclesApi';

// Professional Brand Theme - Premium Automotive CRM
const brandTheme = {
    // Primary Colors - Professional Blue Palette
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    // Surface Colors - Clean & Minimal
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Typography Colors
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',

    // Status Colors - Automotive Grade
    status: {
        success: '#059669',
        successLight: '#d1fae5',
        warning: '#d97706',
        warningLight: '#fef3c7',
        error: '#dc2626',
        errorLight: '#fee2e2',
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },

    // Shadows - Professional Depth
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    // Spacing Scale
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Border Radius
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

interface VehicleListTableProps {
    vehicles: VehicleExpanded[];
    onSelectVehicle: (vehicle: VehicleExpanded) => void;
    onEditVehicle: (vehicle: VehicleExpanded) => void;
    onDeleteVehicle: (vehicleId: string) => void;
    onShowHistory: (vehicle: VehicleExpanded) => void;
}

interface VehicleWithOwners extends VehicleExpanded {
    ownerNames?: string[];
}

const VehicleListTable: React.FC<VehicleListTableProps> = ({
                                                               vehicles,
                                                               onSelectVehicle,
                                                               onEditVehicle,
                                                               onDeleteVehicle,
                                                               onShowHistory
                                                           }) => {
    const [vehiclesWithOwners, setVehiclesWithOwners] = useState<VehicleWithOwners[]>([]);
    const [loading, setLoading] = useState(true);

    // Pobieranie właścicieli dla pojazdów
    useEffect(() => {
        const fetchOwners = async () => {
            setLoading(true);
            try {
                const vehiclesData = await Promise.all(vehicles.map(async (vehicle) => {
                    const owners = await vehicleApi.fetchOwners(vehicle.id);
                    return {
                        ...vehicle,
                        ownerNames: owners.map(owner => owner.ownerName)
                    };
                }));
                setVehiclesWithOwners(vehiclesData);
            } catch (error) {
                console.error('Error fetching vehicle owners:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOwners();
    }, [vehicles]);

    const getVehicleStatus = (vehicle: VehicleExpanded) => {
        if (vehicle.totalSpent > 20000) {
            return { label: 'Premium', color: brandTheme.status.warning };
        }
        if (vehicle.totalSpent > 10000) {
            return { label: 'VIP', color: brandTheme.status.info };
        }
        return { label: 'Standard', color: brandTheme.text.tertiary };
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const renderOwners = (owners?: string[]) => {
        if (!owners || owners.length === 0) {
            return (
                <OwnerInfo>
                    <EmptyOwners>Brak właścicieli</EmptyOwners>
                </OwnerInfo>
            );
        }

        if (owners.length === 1) {
            return (
                <OwnerInfo>
                    <OwnerItem>
                        <OwnerIcon><FaUser /></OwnerIcon>
                        <OwnerName>{owners[0]}</OwnerName>
                    </OwnerItem>
                </OwnerInfo>
            );
        }

        if (owners.length === 2) {
            return (
                <OwnerInfo>
                    {owners.map((owner, index) => (
                        <OwnerItem key={index}>
                            <OwnerIcon><FaUser /></OwnerIcon>
                            <OwnerName>{owner}</OwnerName>
                        </OwnerItem>
                    ))}
                </OwnerInfo>
            );
        }

        return (
            <OwnerInfo>
                <OwnerItem>
                    <OwnerIcon><FaUser /></OwnerIcon>
                    <OwnerName>{owners[0]}</OwnerName>
                </OwnerItem>
                <OwnerItem>
                    <OwnerIcon><FaUser /></OwnerIcon>
                    <OwnerName>{owners[1]}</OwnerName>
                </OwnerItem>
                <MoreOwners>
                    <FaUsers /> +{owners.length - 2} więcej
                </MoreOwners>
            </OwnerInfo>
        );
    };

    if (vehicles.length === 0) {
        return (
            <EmptyStateContainer>
                <EmptyStateIcon>
                    <FaCar />
                </EmptyStateIcon>
                <EmptyStateTitle>Brak pojazdów</EmptyStateTitle>
                <EmptyStateDescription>
                    Nie znaleziono żadnych pojazdów w bazie danych
                </EmptyStateDescription>
                <EmptyStateAction>
                    Kliknij "Dodaj pojazd", aby utworzyć pierwszy wpis
                </EmptyStateAction>
            </EmptyStateContainer>
        );
    }

    return (
        <ListContainer>
            {/* Header */}
            <ListHeader>
                <ListTitle>
                    Lista pojazdów ({vehicles.length})
                </ListTitle>
            </ListHeader>

            {/* Table Content */}
            <TableWrapper>
                <TableContainer>
                    <TableHeader>
                        <HeaderCell $width="25%">Pojazd</HeaderCell>
                        <HeaderCell $width="20%">Właściciele</HeaderCell>
                        <HeaderCell $width="15%">Statystyki</HeaderCell>
                        <HeaderCell $width="15%">Przychody</HeaderCell>
                        <HeaderCell $width="15%">Ostatnia usługa</HeaderCell>
                        <HeaderCell $width="10%">Akcje</HeaderCell>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <LoadingRow>
                                <LoadingCell colSpan={6}>
                                    <LoadingSpinner />
                                    <LoadingText>Ładowanie danych właścicieli...</LoadingText>
                                </LoadingCell>
                            </LoadingRow>
                        ) : (
                            vehiclesWithOwners.map(vehicle => {
                                const status = getVehicleStatus(vehicle);
                                return (
                                    <StyledTableRow
                                        key={vehicle.id}
                                        onClick={() => onSelectVehicle(vehicle)}
                                    >
                                        <TableCell $width="25%">
                                            <VehicleInfo>
                                                <VehicleHeader>
                                                    <VehicleName>
                                                        {vehicle.make} {vehicle.model}
                                                        <StatusBadge $color={status.color}>
                                                            {status.label}
                                                        </StatusBadge>
                                                    </VehicleName>
                                                </VehicleHeader>
                                                <VehicleDetails>
                                                    <LicensePlate>{vehicle.licensePlate}</LicensePlate>
                                                    <VehicleYear>Rocznik: {vehicle.year}</VehicleYear>
                                                    {vehicle.color && (
                                                        <VehicleColor>Kolor: {vehicle.color}</VehicleColor>
                                                    )}
                                                </VehicleDetails>
                                            </VehicleInfo>
                                        </TableCell>

                                        <TableCell $width="20%">
                                            {renderOwners(vehicle.ownerNames)}
                                        </TableCell>

                                        <TableCell $width="15%">
                                            <MetricsContainer>
                                                <MetricItem>
                                                    <MetricIcon $color={brandTheme.status.info}>
                                                        <FaTools />
                                                    </MetricIcon>
                                                    <MetricContent>
                                                        <MetricValue>{vehicle.totalServices}</MetricValue>
                                                        <MetricLabel>usług</MetricLabel>
                                                    </MetricContent>
                                                </MetricItem>
                                            </MetricsContainer>
                                        </TableCell>

                                        <TableCell $width="15%">
                                            <RevenueDisplay>
                                                <RevenueAmount>
                                                    {formatCurrency(vehicle.totalSpent)}
                                                </RevenueAmount>
                                            </RevenueDisplay>
                                        </TableCell>

                                        <TableCell $width="15%">
                                            {vehicle.lastServiceDate ? (
                                                <LastServiceInfo>
                                                    <LastServiceIcon>
                                                        <FaCalendarAlt />
                                                    </LastServiceIcon>
                                                    <LastServiceDate>
                                                        {formatDate(vehicle.lastServiceDate)}
                                                    </LastServiceDate>
                                                </LastServiceInfo>
                                            ) : (
                                                <NoServiceInfo>
                                                    Brak usług
                                                </NoServiceInfo>
                                            )}
                                        </TableCell>

                                        <TableCell $width="10%" onClick={(e) => e.stopPropagation()}>
                                            <ActionButtons>
                                                <ActionButton
                                                    title="Zobacz szczegóły"
                                                    $variant="view"
                                                    onClick={() => onSelectVehicle(vehicle)}
                                                >
                                                    <FaEye />
                                                </ActionButton>
                                                <ActionButton
                                                    title="Edytuj pojazd"
                                                    $variant="edit"
                                                    onClick={() => onEditVehicle(vehicle)}
                                                >
                                                    <FaEdit />
                                                </ActionButton>
                                                <ActionButton
                                                    title="Historia serwisowa"
                                                    $variant="info"
                                                    onClick={() => onShowHistory(vehicle)}
                                                >
                                                    <FaHistory />
                                                </ActionButton>
                                                <ActionButton
                                                    title="Usuń pojazd"
                                                    $variant="delete"
                                                    onClick={() => onDeleteVehicle(vehicle.id)}
                                                >
                                                    <FaTrash />
                                                </ActionButton>
                                            </ActionButtons>
                                        </TableCell>
                                    </StyledTableRow>
                                );
                            })
                        )}
                    </TableBody>
                </TableContainer>
            </TableWrapper>
        </ListContainer>
    );
};

// Professional Styled Components
const ListContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const ListHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    flex-shrink: 0;
`;

const ListTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
`;

const TableWrapper = styled.div`
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

const TableContainer = styled.div`
    flex: 1;
    overflow: auto;
    min-height: 0;
`;

const TableHeader = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    min-height: 56px;
    position: sticky;
    top: 0;
    z-index: 10;
`;

const HeaderCell = styled.div<{ $width: string }>`
    flex: 0 0 ${props => props.$width};
    width: ${props => props.$width};
    display: flex;
    align-items: center;
    padding: 0 ${brandTheme.spacing.md};
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

const TableBody = styled.div`
    background: ${brandTheme.surface};
`;

const StyledTableRow = styled.div`
    display: flex;
    border-bottom: 1px solid ${brandTheme.borderLight};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background: ${brandTheme.surface};

    &:hover {
        background: ${brandTheme.surfaceHover};
        box-shadow: inset 0 0 0 1px ${brandTheme.borderHover};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.div<{ $width: string }>`
    flex: 0 0 ${props => props.$width};
    width: ${props => props.$width};
    padding: ${brandTheme.spacing.md};
    display: flex;
    align-items: center;
    min-height: 80px;
    border-right: 1px solid ${brandTheme.borderLight};

    &:last-child {
        border-right: none;
    }
`;

const LoadingRow = styled.div`
    display: flex;
`;

const LoadingCell = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    gap: ${brandTheme.spacing.md};
`;

const LoadingSpinner = styled.div`
    width: 24px;
    height: 24px;
    border: 2px solid ${brandTheme.borderLight};
    border-top: 2px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

// Vehicle Info Components
const VehicleInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    width: 100%;
`;

const VehicleHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    margin-bottom: ${brandTheme.spacing.xs};
`;

const VehicleName = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    font-weight: 600;
    font-size: 15px;
    color: ${brandTheme.text.primary};
    line-height: 1.3;
`;

const StatusBadge = styled.span<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: ${brandTheme.radius.lg};
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    border: 1px solid ${props => props.$color}30;
    white-space: nowrap;
`;

const VehicleDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const LicensePlate = styled.div`
    display: inline-block;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    padding: 4px 12px;
    border-radius: ${brandTheme.radius.md};
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 1px;
    text-transform: uppercase;
    box-shadow: ${brandTheme.shadow.sm};
    width: fit-content;
`;

const VehicleYear = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const VehicleColor = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
`;

// Owner Info Components
const OwnerInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
    width: 100%;
`;

const OwnerItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 13px;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.surfaceElevated};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.borderLight};
`;

const OwnerIcon = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 11px;
    flex-shrink: 0;
`;

const OwnerName = styled.span`
    color: ${brandTheme.text.secondary};
    font-weight: 500;
    word-break: break-word;
`;

const EmptyOwners = styled.div`
    color: ${brandTheme.text.muted};
    font-style: italic;
    font-size: 13px;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.surfaceElevated};
    border-radius: ${brandTheme.radius.md};
    text-align: center;
`;

const MoreOwners = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-style: italic;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.primaryGhost};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.primary}20;

    svg {
        font-size: 10px;
    }
`;

// Metrics Components
const MetricsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const MetricItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm};
    background: ${brandTheme.surfaceElevated};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.borderLight};
`;

const MetricIcon = styled.div<{ $color: string }>`
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, ${props => props.$color}15 0%, ${props => props.$color}08 100%);
    border-radius: ${brandTheme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    font-size: 14px;
    flex-shrink: 0;
`;

const MetricContent = styled.div`
    display: flex;
    flex-direction: column;
`;

const MetricValue = styled.div`
    font-weight: 700;
    font-size: 16px;
    color: ${brandTheme.text.primary};
    line-height: 1.2;
`;

const MetricLabel = styled.div`
    font-size: 11px;
    color: ${brandTheme.text.muted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

// Revenue Components
const RevenueDisplay = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const RevenueAmount = styled.div`
    font-weight: 700;
    font-size: 16px;
    color: ${brandTheme.status.success};
    line-height: 1.2;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.status.successLight};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.status.success}30;
`;

// Last Service Components
const LastServiceInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.surfaceElevated};
    border-radius: ${brandTheme.radius.md};
    border: 1px solid ${brandTheme.borderLight};
`;

const LastServiceIcon = styled.div`
    color: ${brandTheme.text.muted};
    font-size: 12px;
    flex-shrink: 0;
`;

const LastServiceDate = styled.div`
    font-size: 13px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const NoServiceInfo = styled.div`
    color: ${brandTheme.text.muted};
    font-style: italic;
    font-size: 13px;
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${brandTheme.surfaceElevated};
    border-radius: ${brandTheme.radius.md};
    text-align: center;
`;

// Action Components
const ActionButtons = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
    align-items: center;
    flex-wrap: wrap;
`;

const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete' | 'info' | 'success' | 'secondary';
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 13px;
    position: relative;
    overflow: hidden;

    ${({ $variant }) => {
    switch ($variant) {
        case 'view':
            return `
                    background: ${brandTheme.primaryGhost};
                    color: ${brandTheme.primary};
                    &:hover {
                        background: ${brandTheme.primary};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
        case 'edit':
            return `
                    background: ${brandTheme.status.warningLight};
                    color: ${brandTheme.status.warning};
                    &:hover {
                        background: ${brandTheme.status.warning};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
        case 'info':
            return `
                    background: ${brandTheme.status.infoLight};
                    color: ${brandTheme.status.info};
                    &:hover {
                        background: ${brandTheme.status.info};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
        case 'delete':
            return `
                    background: ${brandTheme.status.errorLight};
                    color: ${brandTheme.status.error};
                    &:hover {
                        background: ${brandTheme.status.error};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
    }
}}
`;

// Empty State Components
const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 2px dashed ${brandTheme.border};
    text-align: center;
    min-height: 400px;
    margin: ${brandTheme.spacing.lg};
`;

const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${brandTheme.text.tertiary};
    margin-bottom: ${brandTheme.spacing.lg};
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;

const EmptyStateTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    letter-spacing: -0.025em;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
    line-height: 1.5;
`;

const EmptyStateAction = styled.p`
    font-size: 14px;
    color: ${brandTheme.primary};
    margin: 0;
    font-weight: 500;
`;

export default VehicleListTable;