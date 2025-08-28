// src/pages/Finances/components/CategoryServicesTable.tsx
import React, {useMemo, useState} from 'react';
import styled from 'styled-components';
import {FaChartLine, FaSort, FaSortDown, FaSortUp, FaSync, FaTable} from 'react-icons/fa';
import {CategoryService} from '../../../api/statsApi';

// Unified theme
const theme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    primaryGhost: 'rgba(26, 54, 93, 0.04)',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    border: '#e2e8f0',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
    },
    status: {
        info: '#0ea5e9',
        infoLight: '#e0f2fe'
    },
    spacing: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px'
    },
    radius: {
        md: '8px',
        lg: '12px'
    },
    shadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }
};

interface CategoryServicesTableProps {
    services: CategoryService[];
    categoryName: string;
    loading: boolean;
    onShowStats: (serviceId: string, serviceName: string) => void;
}

type SortKey = 'name' | 'servicesCount' | 'totalRevenue';
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
    key: SortKey | null;
    direction: SortDirection;
}

export const CategoryServicesTable: React.FC<CategoryServicesTableProps> = ({
                                                                                services,
                                                                                categoryName,
                                                                                loading,
                                                                                onShowStats
                                                                            }) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';

        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') {
                direction = 'desc';
            } else if (sortConfig.direction === 'desc') {
                direction = null; // Reset to original order
            } else {
                direction = 'asc';
            }
        }

        setSortConfig({ key: direction ? key : null, direction });
    };

    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) {
            return <FaSort />;
        }

        switch (sortConfig.direction) {
            case 'asc':
                return <FaSortUp />;
            case 'desc':
                return <FaSortDown />;
            default:
                return <FaSort />;
        }
    };

    const sortedServices = useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) {
            return services;
        }

        const sorted = [...services].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortConfig.key) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'servicesCount':
                    aValue = a.servicesCount;
                    bValue = b.servicesCount;
                    break;
                case 'totalRevenue':
                    aValue = a.totalRevenue;
                    bValue = b.totalRevenue;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sorted;
    }, [services, sortConfig]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <TableWrapper>
                <LoadingContainer>
                    <FaSync className="spinning" style={{ marginRight: '12px' }} />
                    Ładowanie usług kategorii...
                </LoadingContainer>
            </TableWrapper>
        );
    }

    if (services.length === 0) {
        return (
            <TableWrapper>
                <EmptyState>
                    <EmptyStateIcon>
                        <FaTable />
                    </EmptyStateIcon>
                    <EmptyStateText>Brak usług w kategorii "{categoryName}"</EmptyStateText>
                    <EmptyStateSubtext>
                        Usługi zostaną tutaj wyświetlone po przypisaniu ich do tej kategorii
                    </EmptyStateSubtext>
                </EmptyState>
            </TableWrapper>
        );
    }

    return (
        <TableWrapper>
            <TableContainer>
                <TableHeader>
                    <SortableHeaderCell
                        $width="50%"
                        onClick={() => handleSort('name')}
                        $active={sortConfig.key === 'name'}
                        title="Sortuj po nazwie usługi"
                    >
                        <HeaderContent>
                            <HeaderLabel>Nazwa usługi</HeaderLabel>
                            <SortIcon $active={sortConfig.key === 'name'}>
                                {getSortIcon('name')}
                            </SortIcon>
                        </HeaderContent>
                    </SortableHeaderCell>
                    <SortableHeaderCell
                        $width="20%"
                        onClick={() => handleSort('servicesCount')}
                        $active={sortConfig.key === 'servicesCount'}
                        title="Sortuj po liczbie wykonań"
                    >
                        <HeaderContent>
                            <HeaderLabel>Liczba zleceń</HeaderLabel>
                            <SortIcon $active={sortConfig.key === 'servicesCount'}>
                                {getSortIcon('servicesCount')}
                            </SortIcon>
                        </HeaderContent>
                    </SortableHeaderCell>
                    <SortableHeaderCell
                        $width="20%"
                        onClick={() => handleSort('totalRevenue')}
                        $active={sortConfig.key === 'totalRevenue'}
                        title="Sortuj po łącznym przychodzie"
                    >
                        <HeaderContent>
                            <HeaderLabel>Łączny przychód</HeaderLabel>
                            <SortIcon $active={sortConfig.key === 'totalRevenue'}>
                                {getSortIcon('totalRevenue')}
                            </SortIcon>
                        </HeaderContent>
                    </SortableHeaderCell>
                    <NonSortableHeaderCell $width="10%">
                        <HeaderContent>
                            <HeaderLabel>Akcje</HeaderLabel>
                        </HeaderContent>
                    </NonSortableHeaderCell>
                </TableHeader>

                <TableBody>
                    {sortedServices.map((service, index) => (
                        <TableRow key={service.id} $index={index}>
                            <TableCell $width="50%">
                                <ServiceInfo>
                                    <ServiceName>{service.name}</ServiceName>
                                </ServiceInfo>
                            </TableCell>
                            <TableCell $width="20%">
                                <MetricValue>{service.servicesCount}</MetricValue>
                            </TableCell>
                            <TableCell $width="20%">
                                <RevenueDisplay>{formatCurrency(service.totalRevenue)}</RevenueDisplay>
                            </TableCell>
                            <TableCell $width="10%">
                                <ActionButtons>
                                    <ActionButton
                                        onClick={() => onShowStats(service.id, service.name)}
                                        title="Pokaż statystyki"
                                        $variant="info"
                                    >
                                        <FaChartLine />
                                    </ActionButton>
                                </ActionButtons>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>

            {/* Sort Info */}
            {sortConfig.key && (
                <SortInfo>
                    <SortInfoText>
                        Sortowanie: {sortConfig.key === 'name' ? 'nazwa' :
                        sortConfig.key === 'servicesCount' ? 'liczba zleceń' :
                            'przychód'}
                        ({sortConfig.direction === 'asc' ? 'rosnąco' : 'malejąco'})
                    </SortInfoText>
                    <ResetSortButton onClick={() => setSortConfig({ key: null, direction: null })}>
                        Resetuj sortowanie
                    </ResetSortButton>
                </SortInfo>
            )}
        </TableWrapper>
    );
};

// Styled Components
const TableWrapper = styled.div`
    width: 100%;
    background: ${theme.surfaceAlt};
    padding: ${theme.spacing.lg} 0;
`;

const TableContainer = styled.div`
    margin: 0 ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.lg};
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
`;

const TableHeader = styled.div`
    display: flex;
    background: ${theme.surfaceAlt};
    border-bottom: 2px solid ${theme.border};
    min-height: 56px;
`;

const SortableHeaderCell = styled.div<{ $width: string; $active: boolean }>`
    flex: 0 0 ${props => props.$width};
    width: ${props => props.$width};
    display: flex;
    align-items: center;
    padding: 0 ${theme.spacing.lg};
    background: ${props => props.$active ? theme.primaryGhost : theme.surfaceAlt};
    border-right: 1px solid ${theme.border};
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primaryGhost};
        
        ${({ $active }) => !$active && `
            background: ${theme.primary}10;
        `}
    }

    &:last-child {
        border-right: none;
    }
`;

const NonSortableHeaderCell = styled.div<{ $width: string }>`
    flex: 0 0 ${props => props.$width};
    width: ${props => props.$width};
    display: flex;
    align-items: center;
    padding: 0 ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border-right: 1px solid ${theme.border};
    user-select: none;

    &:last-child {
        border-right: none;
    }
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: ${theme.spacing.sm};
`;

const HeaderLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const SortIcon = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: ${props => props.$active ? theme.primary : theme.text.muted};
    font-size: 12px;
    transition: all 0.2s ease;
    opacity: ${props => props.$active ? 1 : 0.6};

    ${SortableHeaderCell}:hover & {
        opacity: 1;
        color: ${theme.primary};
    }
`;

const TableBody = styled.div`
    background: ${theme.surface};
`;

const TableRow = styled.div<{ $index: number }>`
    display: flex;
    border-bottom: 1px solid ${theme.border};
    transition: all 0.3s ease;
    background: ${theme.surface};
    animation: ${props => `fadeInRow 0.3s ease ${props.$index * 0.05}s both`};

    &:hover {
        background: ${theme.surfaceAlt};
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    &:last-child {
        border-bottom: none;
    }

    @keyframes fadeInRow {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const TableCell = styled.div<{ $width?: string }>`
    flex: 0 0 ${props => props.$width || 'auto'};
    width: ${props => props.$width || 'auto'};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    min-height: 68px;
    border-right: 1px solid ${theme.border};

    &:last-child {
        border-right: none;
    }
`;

const ServiceInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
`;

const ServiceName = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: ${theme.text.primary};
    line-height: 1.3;
`;

const MetricValue = styled.div`
    font-weight: 600;
    font-size: 16px;
    color: ${theme.text.primary};
    line-height: 1.2;
`;

const RevenueDisplay = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
`;

const ActionButton = styled.button<{
    $variant: 'info' | 'view' | 'edit' | 'delete';
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;

    ${({ $variant }) => {
        switch ($variant) {
            case 'info':
                return `
                    background: ${theme.status.infoLight};
                    color: ${theme.status.info};
                    &:hover {
                        background: ${theme.status.info};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
                    }
                `;
            default:
                return `
                    background: ${theme.primaryGhost};
                    color: ${theme.primary};
                    &:hover {
                        background: ${theme.primary};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        }
    }}
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing.xl};
    color: ${theme.text.secondary};
    font-size: 14px;

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: ${theme.spacing.xl};
    color: ${theme.text.secondary};
`;

const EmptyStateIcon = styled.div`
    font-size: 32px;
    margin-bottom: ${theme.spacing.lg};
    color: ${theme.text.muted};
    opacity: 0.6;
`;

const EmptyStateText = styled.div`
    font-size: 14px;
    margin-bottom: ${theme.spacing.sm};
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const EmptyStateSubtext = styled.div`
    font-size: 12px;
    color: ${theme.text.muted};
    opacity: 0.8;
`;

const SortInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: ${theme.spacing.sm} ${theme.spacing.lg} 0;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${theme.primaryGhost};
    border: 1px solid ${theme.primary}20;
    border-radius: ${theme.radius.md};
    animation: slideDown 0.3s ease-out;

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const SortInfoText = styled.span`
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const ResetSortButton = styled.button`
    padding: 4px 8px;
    background: transparent;
    border: 1px solid ${theme.primary}40;
    border-radius: ${theme.radius.md};
    color: ${theme.primary};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primary};
        color: white;
    }
`;