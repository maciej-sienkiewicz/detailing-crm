// src/pages/Finances/components/FixedCostsIntegration.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import FixedCostsPage from '../FixedCostsPage';
import FixedCostFormModal from './FixedCostFormModal';
import PaymentRecordModal from './PaymentRecordModal';
import {
    fixedCostsApi,
    FixedCost,
    CreateFixedCostRequest,
    UpdateFixedCostRequest,
    RecordPaymentRequest
} from '../../../api/fixedCostsApi';
import { useToast } from '../../../components/common/Toast/Toast';
import FixedCostViewModal from "./FixedCostViewModal";

interface FixedCostsIntegrationProps {
    onSetRef?: (ref: { handleAddFixedCost?: () => void }) => void;
}

const FixedCostsIntegration: React.FC<FixedCostsIntegrationProps> = ({ onSetRef }) => {
    const { showToast } = useToast();

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedFixedCost, setSelectedFixedCost] = useState<FixedCost | undefined>(undefined);

    // Refresh function reference
    const [refreshDataFn, setRefreshDataFn] = useState<(() => Promise<void>) | null>(null);

    // Handlers
    const handleAddFixedCost = () => {
        setSelectedFixedCost(undefined);
        setShowFormModal(true);
    };

    // Provide ref to parent component
    React.useEffect(() => {
        if (onSetRef) {
            onSetRef({
                handleAddFixedCost
            });
        }
    }, [onSetRef]);

    const handleViewFixedCost = (fixedCost: FixedCost) => {
        setSelectedFixedCost(fixedCost);
        setShowViewModal(true);
    };

    const handleEditFixedCost = (fixedCost: FixedCost) => {
        setSelectedFixedCost(fixedCost);
        setShowFormModal(true);
    };

    const handleRecordPayment = (fixedCost: FixedCost) => {
        setSelectedFixedCost(fixedCost);
        setShowPaymentModal(true);
    };

    const handleDeleteFixedCost = async (id: string, name: string) => {
        if (window.confirm(`Czy na pewno chcesz usunąć koszt stały "${name}"?`)) {
            try {
                const success = await fixedCostsApi.deleteFixedCost(id);
                if (success) {
                    showToast('success', 'Koszt stały został usunięty');
                    await triggerRefresh();
                    // Close view modal if the deleted cost was being viewed
                    if (selectedFixedCost?.id === id) {
                        setShowViewModal(false);
                        setSelectedFixedCost(undefined);
                    }
                } else {
                    showToast('error', 'Nie udało się usunąć kosztu stałego');
                }
            } catch (error) {
                console.error('Error deleting fixed cost:', error);
                showToast('error', 'Wystąpił błąd podczas usuwania kosztu stałego');
            }
        }
    };

    const handleRefreshData = (refreshFn: () => Promise<void>) => {
        setRefreshDataFn(() => refreshFn);
    };

    const triggerRefresh = async () => {
        if (refreshDataFn) {
            await refreshDataFn();
        }
    };

    const handleSaveFixedCost = async (data: CreateFixedCostRequest | UpdateFixedCostRequest) => {
        try {
            if (selectedFixedCost) {
                // Update existing fixed cost
                await fixedCostsApi.updateFixedCost(selectedFixedCost.id, data as UpdateFixedCostRequest);
                showToast('success', 'Koszt stały został zaktualizowany');
            } else {
                // Create new fixed cost
                await fixedCostsApi.createFixedCost(data as CreateFixedCostRequest);
                showToast('success', 'Nowy koszt stały został dodany');
            }

            // Refresh data
            await triggerRefresh();
            setShowFormModal(false);
            setSelectedFixedCost(undefined);
        } catch (error) {
            console.error('Error saving fixed cost:', error);
            showToast('error', 'Wystąpił błąd podczas zapisywania kosztu stałego');
            throw error; // Re-throw to prevent modal from closing
        }
    };

    const handleSavePayment = async (data: RecordPaymentRequest) => {
        if (!selectedFixedCost) return;

        try {
            await fixedCostsApi.recordPayment(selectedFixedCost.id, data);
            showToast('success', 'Płatność została zarejestrowana');

            // Refresh data
            await triggerRefresh();
            setShowPaymentModal(false);
            setSelectedFixedCost(undefined);
        } catch (error) {
            console.error('Error recording payment:', error);
            showToast('error', 'Wystąpił błąd podczas rejestrowania płatności');
            throw error; // Re-throw to prevent modal from closing
        }
    };

    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowPaymentModal(false);
        setShowViewModal(false);
        setSelectedFixedCost(undefined);
    };

    // Handle edit from view modal
    const handleEditFromView = (fixedCost: FixedCost) => {
        setShowViewModal(false);
        setTimeout(() => {
            setSelectedFixedCost(fixedCost);
            setShowFormModal(true);
        }, 100);
    };

    // Handle record payment from view modal
    const handleRecordPaymentFromView = (fixedCost: FixedCost) => {
        setShowViewModal(false);
        setTimeout(() => {
            setSelectedFixedCost(fixedCost);
            setShowPaymentModal(true);
        }, 100);
    };

    return (
        <Container>
            <FixedCostsPage
                onAddFixedCost={handleAddFixedCost}
                onRefreshData={handleRefreshData}
                onViewFixedCost={handleViewFixedCost}
                onEditFixedCost={handleEditFixedCost}
                onRecordPayment={handleRecordPayment}
                onDeleteFixedCost={handleDeleteFixedCost}
            />

            {/* Fixed Cost View Modal */}
            <FixedCostViewModal
                isOpen={showViewModal}
                fixedCost={selectedFixedCost}
                onClose={handleCloseModals}
                onEdit={handleEditFromView}
                onDelete={handleDeleteFixedCost}
                onRecordPayment={handleRecordPaymentFromView}
            />

            {/* Fixed Cost Form Modal */}
            <FixedCostFormModal
                isOpen={showFormModal}
                fixedCost={selectedFixedCost}
                onSave={handleSaveFixedCost}
                onClose={handleCloseModals}
            />

            {/* Payment Record Modal */}
            <PaymentRecordModal
                isOpen={showPaymentModal}
                fixedCost={selectedFixedCost}
                onSave={handleSavePayment}
                onClose={handleCloseModals}
            />
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    height: 100%;
`;

export default FixedCostsIntegration;