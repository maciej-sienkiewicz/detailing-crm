// src/pages/Finances/components/CategoryServicesTable.tsx
import React from 'react';
import styled from 'styled-components';
import { FaSync, FaChartLine, FaGripVertical, FaTable } from 'react-icons/fa';
import { CategoryService } from '../../../api/statsApi';

// Brand Theme System - consistent with ClientListTable
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    accent: '#f8fafc',
    neutral: '#64748b',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0',

    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

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
            <LoadingContainer>
                <FaSync className="spinning" style={{ marginRight: '12px' }} />
                Ładowanie usług kategorii...
            </LoadingContainer>
        );
    }

    if (services.length === 0) {
        return (
            <EmptyState>
                <EmptyStateIcon>
                    <FaTable />
                </EmptyStateIcon>
                <EmptyStateText>Brak usług w kategorii "{categoryName}"</EmptyStateText>
                <EmptyStateSubtext>
                    Usługi zostaną tutaj wyświetlone po przypisaniu ich do tej kategorii
                </EmptyStateSubtext>
            </EmptyState>
        );
    }

    return (
        <TableContainer>
            <TableHeader>
                <ModernHeaderCell $width="50%">
                    <HeaderContent>
                        <DragHandle>
                            <FaGripVertical />
                        </DragHandle>
                        <HeaderLabel>Nazwa usługi</HeaderLabel>
                    </HeaderContent>
                </ModernHeaderCell>
                <ModernHeaderCell $width="20%">
                    <HeaderContent>
                        <DragHandle>
                            <FaGripVertical />
                        </DragHandle>
                        <HeaderLabel>Liczba wykonań</HeaderLabel>
                    </HeaderContent>
                </ModernHeaderCell>
                <ModernHeaderCell $width="20%">
                    <HeaderContent>
                        <DragHandle>
                            <FaGripVertical />
                        </DragHandle>
                        <HeaderLabel>Łączny przychód</HeaderLabel>
                    </HeaderContent>
                </ModernHeaderCell>
                <ModernHeaderCell $width="10%">
                    <HeaderContent>
                        <HeaderLabel>Akcje</HeaderLabel>
                    </HeaderContent>
                </ModernHeaderCell>
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
    );
};

// Styled Components - consistent with main services table
const TableContainer = styled.div`
    width: 100%;
    margin: 16px 24px;
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: 12px;
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
`;

const TableHeader = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    min-height: 48px;
`;

const ModernHeaderCell = styled.div<{ $width: string }>`
    flex: 0 0 ${props => props.$width};
    width: ${props => props.$width};
    display: flex;
    align-items: center;
    padding: 0 16px;
    background: ${brandTheme.surfaceAlt};
    border-right: 1px solid ${brandTheme.border};
    user-select: none;

    &:last-child {
        border-right: none;
    }
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
`;

const DragHandle = styled.div`
    color: ${brandTheme.neutral};
    font-size: 12px;
    opacity: 0.6;
`;

const HeaderLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: #374151;
`;

const TableBody = styled.div`
    background: ${brandTheme.surface};
`;

const TableRow = styled.div`
    display: flex;
    border-bottom: 1px solid ${brandTheme.border};
    transition: all 0.2s ease;
    background: ${brandTheme.surface};

    &:hover {
        background: ${brandTheme.surfaceAlt};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.div<{ $width?: string }>`
    flex: 0 0 ${props => props.$width || 'auto'};
    width: ${props => props.$width || 'auto'};
    padding: 14px 16px;
    display: flex;
    align-items: center;
    min-height: 60px;
    border-right: 1px solid ${brandTheme.border};

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
    color: #1e293b;
    line-height: 1.3;
`;

const MetricValue = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: #374151;
    line-height: 1.2;
`;

const RevenueDisplay = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #374151;
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
                    background: ${brandTheme.status.infoLight};
                    color: ${brandTheme.status.info};
                    &:hover {
                        background: ${brandTheme.status.info};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        case 'view':
            return `
                    background: ${brandTheme.primaryGhost};
                    color: ${brandTheme.primary};
                    &:hover {
                        background: ${brandTheme.primary};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        default:
            return `
                    background: ${brandTheme.primaryGhost};
                    color: ${brandTheme.primary};
                    &:hover {
                        background: ${brandTheme.primary};
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
    padding: 40px;
    color: ${brandTheme.neutral};
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
    padding: 40px 24px;
    color: ${brandTheme.neutral};
`;

const EmptyStateIcon = styled.div`
    font-size: 32px;
    margin-bottom: 16px;
    color: ${brandTheme.neutral};
    opacity: 0.6;
`;

const EmptyStateText = styled.div`
    font-size: 14px;
    margin-bottom: 8px;
    color: ${brandTheme.neutral};
    font-weight: 500;
`;

const EmptyStateSubtext = styled.div`
    font-size: 12px;
    color: ${brandTheme.neutral};
    opacity: 0.8;
`;