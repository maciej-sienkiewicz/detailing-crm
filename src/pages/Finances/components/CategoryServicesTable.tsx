// src/pages/Finances/components/CategoryServicesTable.tsx
import React from 'react';
import styled from 'styled-components';
import { FaSync, FaChartLine, FaGripVertical, FaTable } from 'react-icons/fa';
import { CategoryService } from '../../../api/statsApi';

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

export const CategoryServicesTable: React.FC<CategoryServicesTableProps> = ({
                                                                                services,
                                                                                categoryName,
                                                                                loading,
                                                                                onShowStats
                                                                            }) => {
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
                    <HeaderCell $width="50%">
                        <HeaderContent>
                            <DragHandle>
                                <FaGripVertical />
                            </DragHandle>
                            <HeaderLabel>Nazwa usługi</HeaderLabel>
                        </HeaderContent>
                    </HeaderCell>
                    <HeaderCell $width="20%">
                        <HeaderContent>
                            <DragHandle>
                                <FaGripVertical />
                            </DragHandle>
                            <HeaderLabel>Liczba wykonań</HeaderLabel>
                        </HeaderContent>
                    </HeaderCell>
                    <HeaderCell $width="20%">
                        <HeaderContent>
                            <DragHandle>
                                <FaGripVertical />
                            </DragHandle>
                            <HeaderLabel>Łączny przychód</HeaderLabel>
                        </HeaderContent>
                    </HeaderCell>
                    <HeaderCell $width="10%">
                        <HeaderContent>
                            <HeaderLabel>Akcje</HeaderLabel>
                        </HeaderContent>
                    </HeaderCell>
                </TableHeader>

                <TableBody>
                    {services.map(service => (
                        <TableRow key={service.id}>
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
        </TableWrapper>
    );
};

// Styled Components - z pełną szerokością i jednolitym tłem
const TableWrapper = styled.div`
    width: 100%;
    background: ${theme.surfaceAlt};
`;

const TableContainer = styled.div`
    margin: 0 ${theme.spacing.xl} ${theme.spacing.xl} ${theme.spacing.xl};
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
    min-height: 48px;
`;

const HeaderCell = styled.div<{ $width: string }>`
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
    gap: ${theme.spacing.sm};
    width: 100%;
`;

const DragHandle = styled.div`
    color: ${theme.text.muted};
    font-size: 12px;
    opacity: 0.6;
`;

const HeaderLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.primary};
`;

const TableBody = styled.div`
    background: ${theme.surface};
`;

const TableRow = styled.div`
    display: flex;
    border-bottom: 1px solid ${theme.border};
    transition: all 0.2s ease;
    background: ${theme.surface};

    &:hover {
        background: ${theme.surfaceAlt};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.div<{ $width?: string }>`
    flex: 0 0 ${props => props.$width || 'auto'};
    width: ${props => props.$width || 'auto'};
    padding: ${theme.spacing.lg};
    display: flex;
    align-items: center;
    min-height: 60px;
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
    font-size: 15px;
    color: ${theme.text.primary};
    line-height: 1.2;
`;

const RevenueDisplay = styled.div`
    font-size: 14px;
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