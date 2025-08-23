// src/pages/Finances/FinancialReportsPage.tsx
import React, { useState } from 'react';
import { FaChartLine, FaSync } from 'react-icons/fa';
import { useStatsData } from './hooks/useStatsData';
import { CreateCategoryModal } from './components/CreateCategoryModal';
import { AssignToCategoryModal } from './components/AssignToCategoryModal';
import { CategoriesSection } from './components/CategoriesSection';
import { UncategorizedServicesTable } from './components/UncategorizedServicesTable';
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
        loading,
        error,
        creatingCategory,
        assigningToCategory,
        refreshData,
        createCategory,
        assignToCategory,
        clearError
    } = useStatsData();

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

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
    const handleAssignToCategory = (serviceIds: number[]) => {
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

    // Handle refresh
    const handleRefresh = async () => {
        await refreshData();
        if (error) {
            showToast('error', error);
        }
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
            {/* Categories Section */}
            <CategoriesSection
                categories={categories}
                onCreateCategory={handleCreateCategory}
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
        </StatsContainer>
    );
};

export default FinancialReportsPage;