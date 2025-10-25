// src/pages/Finances/components/UncategorizedServicesTable.tsx
import React, {useCallback, useState} from 'react';
import styled from 'styled-components';
import {FaCheckSquare, FaFolderPlus, FaGripVertical, FaSquare, FaSync, FaTable} from 'react-icons/fa';
import {UncategorizedService} from '../../../api/statsApi';

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

    spacing: {
        xs: '3px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px'
    },

    radius: {
        sm: '4px',
        md: '6px',
        lg: '8px'
    }
};

interface UncategorizedServicesTableProps {
    services: UncategorizedService[];
    loading: boolean;
    onRefresh: () => void;
    onAssignToCategory: (serviceIds: string[]) => void;
    assigningToCategory: boolean;
}

export const UncategorizedServicesTable: React.FC<UncategorizedServicesTableProps> = ({
                                                                                          services,
                                                                                          loading,
                                                                                          onRefresh,
                                                                                          onAssignToCategory,
                                                                                          assigningToCategory
                                                                                      }) => {
    const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

    const handleServiceSelect = useCallback((serviceId: string, checked: boolean) => {
        setSelectedServices(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(serviceId);
            } else {
                newSet.delete(serviceId);
            }
            return newSet;
        });
    }, []);

    const handleSelectAll = useCallback((checked: boolean) => {
        if (checked) {
            setSelectedServices(new Set(services.map(service => service.id)));
        } else {
            setSelectedServices(new Set());
        }
    }, [services]);

    const handleAssignToCategory = useCallback(() => {
        if (selectedServices.size > 0) {
            onAssignToCategory(Array.from(selectedServices));
            setSelectedServices(new Set());
        }
    }, [selectedServices, onAssignToCategory]);

    React.useEffect(() => {
        setSelectedServices(prev => {
            const currentServiceIds = new Set(services.map(s => s.id));
            const newSelected = new Set(Array.from(prev).filter(id => currentServiceIds.has(id)));
            return newSelected;
        });
    }, [services]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const allSelected = services.length > 0 && selectedServices.size === services.length;

    if (services.length === 0) {
        return (
            <ListContainer>
                <ListHeader>
                    <ListTitle>
                        Niekategoryzowane usługi (0)
                    </ListTitle>
                    <HeaderActions>
                        <RefreshButton onClick={onRefresh} disabled={loading}>
                            <FaSync className={loading ? 'spinning' : ''} />
                        </RefreshButton>
                    </HeaderActions>
                </ListHeader>
                <EmptyStateContainer>
                    <EmptyStateIcon>
                        <FaTable />
                    </EmptyStateIcon>
                    <EmptyStateTitle>Brak niekategoryzowanych usług</EmptyStateTitle>
                    <EmptyStateDescription>
                        Wszystkie usługi zostały już przypisane do kategorii
                    </EmptyStateDescription>
                </EmptyStateContainer>
            </ListContainer>
        );
    }

    return (
        <ListContainer>
            <ListHeader>
                <ListTitle>
                    Niekategoryzowane usługi ({services.length})
                </ListTitle>
                <HeaderActions>
                    <AssignButton
                        disabled={selectedServices.size === 0 || assigningToCategory}
                        onClick={handleAssignToCategory}
                    >
                        <FaFolderPlus />
                        Przypisz do kategorii ({selectedServices.size})
                    </AssignButton>
                    <RefreshButton onClick={onRefresh} disabled={loading}>
                        <FaSync className={loading ? 'spinning' : ''} />
                    </RefreshButton>
                </HeaderActions>
            </ListHeader>

            {loading ? (
                <LoadingContainer>
                    <FaSync className="spinning" style={{ marginRight: '8px' }} />
                    Ładowanie usług...
                </LoadingContainer>
            ) : (
                <TableContainer>
                    <TableHeader>
                        <ModernHeaderCell $width="4%">
                            <HeaderContent>
                                <SelectionCheckbox
                                    $selected={allSelected}
                                    onClick={() => handleSelectAll(!allSelected)}
                                >
                                    {allSelected ? <FaCheckSquare /> : <FaSquare />}
                                </SelectionCheckbox>
                            </HeaderContent>
                        </ModernHeaderCell>
                        <ModernHeaderCell $width="50%">
                            <HeaderContent>
                                <DragHandle>
                                    <FaGripVertical />
                                </DragHandle>
                                <HeaderLabel>Nazwa usługi</HeaderLabel>
                            </HeaderContent>
                        </ModernHeaderCell>
                        <ModernHeaderCell $width="23%">
                            <HeaderContent>
                                <DragHandle>
                                    <FaGripVertical />
                                </DragHandle>
                                <HeaderLabel>Liczba zleceń</HeaderLabel>
                            </HeaderContent>
                        </ModernHeaderCell>
                        <ModernHeaderCell $width="23%">
                            <HeaderContent>
                                <DragHandle>
                                    <FaGripVertical />
                                </DragHandle>
                                <HeaderLabel>Łączny przychód</HeaderLabel>
                            </HeaderContent>
                        </ModernHeaderCell>
                    </TableHeader>

                    <TableBody>
                        {services.map(service => {
                            const isSelected = selectedServices.has(service.id);
                            return (
                                <TableRow
                                    key={service.id}
                                    $selected={isSelected}
                                >
                                    <TableCell $width="4%">
                                        <SelectionCheckbox
                                            $selected={isSelected}
                                            onClick={() => handleServiceSelect(service.id, !isSelected)}
                                        >
                                            {isSelected ? <FaCheckSquare /> : <FaSquare />}
                                        </SelectionCheckbox>
                                    </TableCell>
                                    <TableCell $width="50%">
                                        <ServiceInfo>
                                            <ServiceName>{service.name}</ServiceName>
                                        </ServiceInfo>
                                    </TableCell>
                                    <TableCell $width="23%">
                                        <MetricValue>{service.servicesCount}</MetricValue>
                                    </TableCell>
                                    <TableCell $width="23%">
                                        <RevenueDisplay>{formatCurrency(service.totalRevenue)}</RevenueDisplay>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </TableContainer>
            )}
        </ListContainer>
    );
};

const ListContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.lg};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: ${brandTheme.spacing.lg};
`;

const ListHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const ListTitle = styled.h3`
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const AssignButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: 4px ${brandTheme.spacing.sm};
    background: ${brandTheme.status.success};
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.sm};
    font-weight: 500;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${brandTheme.status.success};
        filter: brightness(1.1);
        transform: translateY(-1px);
    }

    &:disabled {
        background: ${brandTheme.neutral};
        cursor: not-allowed;
        transform: none;
    }

    svg {
        font-size: 10px;
    }
`;

const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: ${brandTheme.surface};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    color: ${brandTheme.neutral};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${brandTheme.primaryGhost};
        color: ${brandTheme.primary};
        border-color: ${brandTheme.primary};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const TableContainer = styled.div`
    width: 100%;
    overflow-x: auto;
`;

const TableHeader = styled.div`
    display: flex;
    background: ${brandTheme.surfaceAlt};
    border-bottom: 2px solid ${brandTheme.border};
    min-height: 40px;
`;

const ModernHeaderCell = styled.div<{ $width: string }>`
    flex: 0 0 ${props => props.$width};
    width: ${props => props.$width};
    display: flex;
    align-items: center;
    padding: 0 ${brandTheme.spacing.md};
    background: ${brandTheme.surfaceAlt};
    border-right: 1px solid ${brandTheme.border};
    cursor: grab;
    user-select: none;
    transition: all 0.2s ease;

    &:hover {
        background: ${brandTheme.primaryGhost};
    }

    &:last-child {
        border-right: none;
    }
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    width: 100%;
`;

const DragHandle = styled.div`
    color: ${brandTheme.neutral};
    font-size: 10px;
    opacity: 0.6;
    transition: opacity 0.2s ease;

    ${ModernHeaderCell}:hover & {
        opacity: 1;
    }
`;

const HeaderLabel = styled.span`
    font-size: 11px;
    font-weight: 600;
    color: #374151;
`;

const TableBody = styled.div`
    background: ${brandTheme.surface};
`;

const TableRow = styled.div<{ $selected?: boolean }>`
    display: flex;
    border-bottom: 1px solid ${brandTheme.border};
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${props => props.$selected ? brandTheme.primaryGhost : brandTheme.surface};

    &:hover {
        background: ${props => props.$selected ? brandTheme.primaryGhost : brandTheme.surfaceAlt};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.div<{ $width?: string }>`
    flex: 0 0 ${props => props.$width || 'auto'};
    width: ${props => props.$width || 'auto'};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    display: flex;
    align-items: center;
    min-height: 56px;
    border-right: 1px solid ${brandTheme.border};

    &:last-child {
        border-right: none;
    }
`;

const SelectionCheckbox = styled.div<{ $selected?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    color: ${props => props.$selected ? brandTheme.primary : brandTheme.neutral};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 6px;
    border-radius: ${brandTheme.radius.sm};

    &:hover {
        color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
        transform: scale(1.1);
    }
`;

const ServiceInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
`;

const ServiceName = styled.div`
    font-weight: 600;
    font-size: 12px;
    color: #1e293b;
    line-height: 1.3;
`;

const MetricValue = styled.div`
    font-weight: 700;
    font-size: 13px;
    color: #374151;
    line-height: 1.2;
`;

const RevenueDisplay = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: #374151;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${brandTheme.spacing.xl} ${brandTheme.spacing.lg};
    color: ${brandTheme.neutral};
    font-size: 12px;
`;

const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xl} ${brandTheme.spacing.lg};
    background: ${brandTheme.surface};
    text-align: center;
`;

const EmptyStateIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: ${brandTheme.neutral};
    margin-bottom: ${brandTheme.spacing.md};
`;

const EmptyStateTitle = styled.h3`
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 ${brandTheme.spacing.xs} 0;
`;

const EmptyStateDescription = styled.p`
    font-size: 13px;
    color: ${brandTheme.neutral};
    margin: 0;
    line-height: 1.5;
`;