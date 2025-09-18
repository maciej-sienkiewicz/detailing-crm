// src/pages/Clients/ClientsVehiclesPage.tsx - Zaktualizowany bez drawer'a klienta
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {FaCar, FaExchangeAlt, FaFileExport, FaPlus, FaUsers} from 'react-icons/fa';
import {PageHeader, PrimaryButton, SecondaryButton} from '../../components/common/PageHeader';

import OwnersPageContent from "./index";
import VehiclesPageContent from "./VehiclePage";

import {theme} from '../../styles/theme';
import {Tab} from "../../components/common/PageHeader/PageHeader";

type ActiveTab = 'owners' | 'vehicles';

interface URLParams {
    tab?: ActiveTab;
    vehicleId?: string;
    ownerId?: string;
}

const ClientsVehiclesPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const urlParams = useMemo((): URLParams => {
        const searchParams = new URLSearchParams(location.search);
        return {
            tab: (searchParams.get('tab') as ActiveTab) || 'owners',
            vehicleId: searchParams.get('vehicleId') || undefined,
            ownerId: searchParams.get('ownerId') || undefined,
        };
    }, [location.search]);

    const [activeTab, setActiveTab] = useState<ActiveTab>(urlParams.tab || 'owners');

    const [ownersRef, setOwnersRef] = useState<{
        handleAddClient?: () => void;
        handleExportClients?: () => void;
        handleOpenBulkSmsModal?: () => void;
        selectedClientIds?: string[];
        openClientDetail?: (clientId: string) => void;
        navigateToVehiclesByOwner?: (ownerId: string) => void;
        clearDetailParams?: () => void;
    }>({});

    const [vehiclesRef, setVehiclesRef] = useState<{
        handleAddVehicle?: () => void;
        handleExportVehicles?: () => void;
        openVehicleDetail?: (vehicleId: string) => void;
        navigateToClient?: (clientId: string) => void;
        clearDetailParams?: () => void;
    }>({});

    const updateURL = useCallback((newParams: Partial<URLParams>) => {
        const searchParams = new URLSearchParams(location.search);

        Object.entries(newParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.set(key, value);
            } else {
                searchParams.delete(key);
            }
        });

        const newSearch = searchParams.toString();
        const newPath = `${location.pathname}${newSearch ? '?' + newSearch : ''}`;

        if (newPath !== `${location.pathname}${location.search}`) {
            navigate(newPath, { replace: true });
        }
    }, [location.pathname, location.search, navigate]);

    useEffect(() => {
        if (urlParams.tab && urlParams.tab !== activeTab) {
            setActiveTab(urlParams.tab);
        }
    }, [urlParams.tab]);

    const clientsTabs: Tab<ActiveTab>[] = [
        {
            id: 'owners',
            label: 'Baza Klientów',
            icon: FaUsers,
            description: 'Zarządzanie relacjami z klientami'
        },
        {
            id: 'vehicles',
            label: 'Baza Pojazdów',
            icon: FaCar,
            description: 'Zarządzanie flotą pojazdów'
        }
    ];

    const handleTabChange = useCallback((tabId: ActiveTab) => {
        setActiveTab(tabId);

        const clearedParams: Partial<URLParams> = { tab: tabId };

        if (tabId === 'vehicles') {
            // Usuń clientId tylko przy przejściu na zakładkę vehicles
        } else if (tabId === 'owners') {
            clearedParams.vehicleId = undefined;
        }

        updateURL(clearedParams);
    }, [updateURL]);

    const navigateToClient = useCallback((clientId: string) => {
        // ZMIENIONE: Navigacja do osobnej strony szczegółów klienta
        navigate(`/clients/${clientId}`);
    }, [navigate]);

    const navigateToVehicle = useCallback((vehicleId: string) => {
        updateURL({
            tab: 'vehicles',
            vehicleId: vehicleId,
            ownerId: undefined
        });
    }, [updateURL]);

    const navigateToVehiclesByOwner = useCallback((ownerId: string) => {
        updateURL({
            tab: 'vehicles',
            ownerId: ownerId,
            vehicleId: undefined
        });
    }, [updateURL]);

    const clearDetailParams = useCallback(() => {
        updateURL({
            vehicleId: undefined
        });
    }, [updateURL]);

    const handleOwnersAction = useCallback((action: string) => {
        switch (action) {
            case 'add':
                if (ownersRef.handleAddClient) {
                    ownersRef.handleAddClient();
                }
                break;
            case 'export':
                if (ownersRef.handleExportClients) {
                    ownersRef.handleExportClients();
                }
                break;
            case 'bulk-sms':
                if (ownersRef.handleOpenBulkSmsModal) {
                    ownersRef.handleOpenBulkSmsModal();
                }
                break;
        }
    }, [ownersRef.handleAddClient, ownersRef.handleExportClients, ownersRef.handleOpenBulkSmsModal]);

    const handleVehiclesAction = useCallback((action: string) => {
        switch (action) {
            case 'add':
                if (vehiclesRef.handleAddVehicle) {
                    vehiclesRef.handleAddVehicle();
                }
                break;
            case 'export':
                if (vehiclesRef.handleExportVehicles) {
                    vehiclesRef.handleExportVehicles();
                }
                break;
        }
    }, [vehiclesRef.handleAddVehicle, vehiclesRef.handleExportVehicles]);

    const handleSetOwnersRef = useCallback((ref: {
        handleAddClient?: () => void;
        handleExportClients?: () => void;
        handleOpenBulkSmsModal?: () => void;
        selectedClientIds?: string[];
        openClientDetail?: (clientId: string) => void;
    }) => {
        setOwnersRef({
            ...ref,
            navigateToVehiclesByOwner,
            clearDetailParams
        });
    }, [navigateToVehiclesByOwner, clearDetailParams]);

    const handleSetVehiclesRef = useCallback((ref: {
        handleAddVehicle?: () => void;
        handleExportVehicles?: () => void;
        openVehicleDetail?: (vehicleId: string) => void;
    }) => {
        setVehiclesRef({
            ...ref,
            navigateToClient,
            clearDetailParams
        });
    }, [navigateToClient, clearDetailParams]);

    // USUNIĘTE: Handlery związane z drawer'em klienta
    // handleClientSelected, handleClientClosed - już nie potrzebne

    const handleVehicleSelected = useCallback((vehicleId: string) => {
        updateURL({ vehicleId });
    }, [updateURL]);

    const handleVehicleClosed = useCallback(() => {
        updateURL({ vehicleId: undefined });
    }, [updateURL]);

    const currentTab = clientsTabs.find(tab => tab.id === activeTab);
    const headerTitle = currentTab ? currentTab.label : 'Baza Danych';
    const headerSubtitle = currentTab ? currentTab.description : 'Zarządzanie danymi';

    const getHeaderActions = () => {
        const actions = [];

        if (activeTab === 'owners') {
            if (ownersRef.selectedClientIds && ownersRef.selectedClientIds.length > 0) {
                actions.push(
                    <BulkActionButton key="bulk-sms" onClick={() => handleOwnersAction('bulk-sms')}>
                        <FaExchangeAlt />
                        <span>SMS do zaznaczonych ({ownersRef.selectedClientIds.length})</span>
                    </BulkActionButton>
                );
            }

            actions.push(
                <SecondaryButton key="export" onClick={() => handleOwnersAction('export')}>
                    <FaFileExport />
                    <span>Eksport</span>
                </SecondaryButton>
            );

            actions.push(
                <PrimaryButton key="add" onClick={() => handleOwnersAction('add')}>
                    <FaPlus />
                    <span>Nowy klient</span>
                </PrimaryButton>
            );
        }

        if (activeTab === 'vehicles') {
            actions.push(
                <SecondaryButton key="export" onClick={() => handleVehiclesAction('export')}>
                    <FaFileExport />
                    <span>Eksport</span>
                </SecondaryButton>
            );

            actions.push(
                <PrimaryButton key="add" onClick={() => handleVehiclesAction('add')}>
                    <FaPlus />
                    <span>Nowy pojazd</span>
                </PrimaryButton>
            );
        }

        return <>{actions}</>;
    };

    return (
        <PageContainer>
            <PageHeader<ActiveTab>
                icon={activeTab === 'owners' ? FaUsers : FaCar}
                title={headerTitle}
                subtitle={headerSubtitle}
                actions={getHeaderActions()}
                tabs={clientsTabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            <ContentContainer>
                {activeTab === 'owners' && (
                    <OwnersPageContent
                        onSetRef={handleSetOwnersRef}
                        // USUNIĘTE: initialClientId - szczegóły klienta są teraz obsługiwane przez routing
                        onNavigateToVehiclesByOwner={navigateToVehiclesByOwner}
                        onClearDetailParams={clearDetailParams}
                        // USUNIĘTE: handleClientSelected, handleClientClosed - nie potrzebne
                    />
                )}

                {activeTab === 'vehicles' && (
                    <VehiclesPageContent
                        onSetRef={handleSetVehiclesRef}
                        initialVehicleId={urlParams.vehicleId}
                        filterByOwnerId={urlParams.ownerId}
                        onNavigateToClient={navigateToClient}
                        onClearDetailParams={clearDetailParams}
                        onVehicleSelected={handleVehicleSelected}
                        onVehicleClosed={handleVehicleClosed}
                    />
                )}
            </ContentContainer>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const BulkActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    color: white;
    box-shadow: ${theme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, #047857 0%, #059669 100%);
        box-shadow: ${theme.shadow.md};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const ContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

export default ClientsVehiclesPage;