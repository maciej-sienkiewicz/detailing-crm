// src/pages/Finances/FinancialReportsPage.tsx
import React, { useState } from 'react';
import { FaChartLine, FaSync, FaPlus } from 'react-icons/fa';
import { useStatsData } from './hooks/useStatsData';
import { CreateCategoryModal } from './components/CreateCategoryModal';
import { AssignToCategoryModal } from './components/AssignToCategoryModal';
import { CategoriesSection } from './components/CategoriesSection';
import { UncategorizedServicesTable } from './components/UncategorizedServicesTable';
import { ServiceStatsModal } from './components/ServiceStatsModal';
import { CategoryStatsModal } from './components/CategoryStatsModal';
import styled from 'styled-components';

// Unified professional theme
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
    success: '#059669',
    spacing: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    },
    radius: {
        md: '8px',
        lg: '12px',
        xl: '16px'
    },
    shadow: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
};

// Simple toast notification
const showToast = (type: 'success' | 'error', message: string) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        background: ${type === 'success' ? '#059669' : '#dc2626'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(toast);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
};

const FinancialReportsPage: React.FC = () => {
    // Main data hook
    const {
        uncategorizedServices,
        categories,
        categoryServices,
        loading,
        error,
        creatingCategory,
        assigningToCategory,
        loadingCategoryServices,
        refreshData,
        fetchCategoryServices,
        createCategory,
        assignToCategory,
        clearError
    } = useStatsData();

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showCategoryStatsModal, setShowCategoryStatsModal] = useState(false);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [selectedService, setSelectedService] = useState<{id: string, name: string} | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<{id: number, name: string} | null>(null);

    // Handle create category
    const handleCreateCategory = () => {
        setShowCreateModal(true);
    };

    const handleCreateCategorySubmit = async (name: string): Promise<boolean> => {
        const success = await createCategory({ name });
        if (success) {
            showToast('success', 'Kategoria została utworzona pomyślnie');
            return true;
        } else {
            showToast('error', error || 'Nie udało się utworzyć kategorii');
            return false;
        }
    };

    // Handle assign to category
    const handleAssignToCategory = (serviceIds: string[]) => {
        setSelectedServiceIds(serviceIds);
        setShowAssignModal(true);
    };

    const handleAssignToCategorySubmit = async (categoryId: number): Promise<boolean> => {
        const success = await assignToCategory(categoryId, selectedServiceIds);
        if (success) {
            showToast('success', `Przypisano ${selectedServiceIds.length} usług do kategorii`);
            setSelectedServiceIds([]);
            return true;
        } else {
            showToast('error', error || 'Nie udało się przypisać usług do kategorii');
            return false;
        }
    };

    // Handle show service statistics
    const handleShowServiceStats = (serviceId: string, serviceName: string) => {
        setSelectedService({ id: serviceId, name: serviceName });
        setShowStatsModal(true);
    };

    // Handle show category statistics
    const handleShowCategoryStats = (categoryId: number, categoryName: string) => {
        setSelectedCategory({ id: categoryId, name: categoryName });
        setShowCategoryStatsModal(true);
    };

    const handleCloseStatsModal = () => {
        setShowStatsModal(false);
        setSelectedService(null);
    };

    const handleCloseCategoryStatsModal = () => {
        setShowCategoryStatsModal(false);
        setSelectedCategory(null);
    };

    // Handle refresh
    const handleRefresh = async () => {
        await refreshData();
        if (error) {
            showToast('error', error);
        }
    };

    // Handle fetch category services
    const handleFetchCategoryServices = async (categoryId: number) => {
        return await fetchCategoryServices(categoryId);
    };

    // Clear error when it changes
    React.useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    return (
        <PageContainer>
            {/* Compact Header */}
            <PageHeader>
                <HeaderContent>
                    <PageIcon>
                        <FaChartLine />
                    </PageIcon>
                    <HeaderText>
                        <PageTitle>Raporty finansowe</PageTitle>
                        <PageSubtitle>Zarządzaj kategoriami usług i przeglądaj statystyki</PageSubtitle>
                    </HeaderText>
                </HeaderContent>
                <HeaderActions>
                    <ActionButton onClick={handleRefresh} disabled={loading} variant="secondary">
                        <FaSync className={loading ? 'spinning' : ''} />
                        Odśwież
                    </ActionButton>
                    <ActionButton onClick={handleCreateCategory} disabled={creatingCategory} variant="primary">
                        <FaPlus />
                        {creatingCategory ? 'Tworzenie...' : 'Nowa kategoria'}
                    </ActionButton>
                </HeaderActions>
            </PageHeader>

            {/* Main Content */}
            <ContentArea>
                {/* Categories Section */}
                <CategoriesSection
                    categories={categories}
                    categoryServices={categoryServices}
                    loadingCategoryServices={loadingCategoryServices}
                    onCreateCategory={handleCreateCategory}
                    onFetchCategoryServices={handleFetchCategoryServices}
                    onShowServiceStats={handleShowServiceStats}
                    onShowCategoryStats={handleShowCategoryStats}
                    creatingCategory={creatingCategory}
                />

                {/* Uncategorized Services Table */}
                <UncategorizedServicesTable
                    services={uncategorizedServices}
                    loading={loading}
                    onRefresh={handleRefresh}
                    onAssignToCategory={handleAssignToCategory}
                    assigningToCategory={assigningToCategory}
                />
            </ContentArea>

            {/* Modals */}
            <CreateCategoryModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateCategorySubmit}
                loading={creatingCategory}
            />

            <AssignToCategoryModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onSubmit={handleAssignToCategorySubmit}
                categories={categories}
                selectedServicesCount={selectedServiceIds.length}
                loading={assigningToCategory}
            />

            {selectedService && (
                <ServiceStatsModal
                    isOpen={showStatsModal}
                    onClose={handleCloseStatsModal}
                    serviceId={selectedService.id}
                    serviceName={selectedService.name}
                />
            )}

            {selectedCategory && (
                <CategoryStatsModal
                    isOpen={showCategoryStatsModal}
                    onClose={handleCloseCategoryStatsModal}
                    categoryId={selectedCategory.id}
                    categoryName={selectedCategory.name}
                />
            )}
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceAlt};
    padding: ${theme.spacing.lg};

    @media (max-width: 768px) {
        padding: ${theme.spacing.md};
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    box-shadow: ${theme.shadow.sm};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.md};
    }
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const PageIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${theme.primaryGhost};
    border-radius: ${theme.radius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.primary};
    font-size: 20px;
`;

const HeaderText = styled.div``;

const PageTitle = styled.h1`
    font-size: 24px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 4px 0;
`;

const PageSubtitle = styled.p`
    font-size: 14px;
    color: ${theme.text.secondary};
    margin: 0;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};

    @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-end;
    }
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${props => props.variant === 'primary' ? theme.primary : theme.border};
    background: ${props => props.variant === 'primary' ? theme.primary : theme.surface};
    color: ${props => props.variant === 'primary' ? 'white' : theme.text.secondary};
    border-radius: ${theme.radius.md};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${props => props.variant === 'primary' ? theme.primaryLight : theme.surfaceAlt};
        color: ${props => props.variant === 'primary' ? 'white' : theme.text.primary};
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        font-size: 14px;
    }
`;

const ContentArea = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
`;

export default FinancialReportsPage;