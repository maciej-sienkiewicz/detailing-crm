// src/pages/Finances/FinancialReportsPage.tsx
import React, { useState } from 'react';
import { FaChartLine, FaSync } from 'react-icons/fa';
import { useStatsData } from './hooks/useStatsData';
import { CreateCategoryModal } from './components/CreateCategoryModal';
import { AssignToCategoryModal } from './components/AssignToCategoryModal';
import { CategoriesSection } from './components/CategoriesSection';
import { UncategorizedServicesTable } from './components/UncategorizedServicesTable';
import { ServiceStatsModal } from './components/ServiceStatsModal';
import { CategoryStatsModal } from './components/CategoryStatsModal';
import {
    StatsContainer,
    Header,
    HeaderTop,
    HeaderContent,
    Title,
    Subtitle,
    HeaderActions,
    RefreshButton
} from './styles/statsStyles';

// Simple toast notification (you can replace with your existing toast system)
const showToast = (type: 'success' | 'error', message: string) => {
    // This is a simple implementation - replace with your actual toast system
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
        <StatsContainer>
            <Header>
                <HeaderTop>
                    <HeaderContent>
                        <Title>Statystyki i Kategorie Usług</Title>
                        <Subtitle>
                            Zarządzaj kategoriami usług i przypisuj niekategoryzowane usługi
                        </Subtitle>
                    </HeaderContent>
                    <HeaderActions>
                        <RefreshButton onClick={handleRefresh} disabled={loading}>
                            <FaSync className={loading ? 'spinning' : ''} />
                        </RefreshButton>
                    </HeaderActions>
                </HeaderTop>

                {/* Error display */}
                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        border: '1px solid #dc2626',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        color: '#dc2626',
                        fontSize: '14px',
                        marginTop: '16px'
                    }}>
                        {error}
                    </div>
                )}
            </Header>

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
        </StatsContainer>
    );
};

export default FinancialReportsPage;