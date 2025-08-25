// src/pages/Clients/ClientsVehiclesPage.tsx - Fixed infinite loop issues
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {FaCar, FaExchangeAlt, FaFileExport, FaPlus, FaUsers} from 'react-icons/fa';

// Import existing components
import OwnersPageContent from "./index";
import VehiclesPageContent from "./VehiclePage";

// Professional Brand Theme - Premium Automotive CRM
const brandTheme = {
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

type ActiveTab = 'owners' | 'vehicles';

// URL Query Parameters interface
interface URLParams {
    tab?: ActiveTab;
    clientId?: string;
    vehicleId?: string;
    ownerId?: string;
}

const ClientsVehiclesPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // FIX: Memoize URL params parsing to prevent recreation on every render
    const urlParams = useMemo((): URLParams => {
        const searchParams = new URLSearchParams(location.search);
        return {
            tab: (searchParams.get('tab') as ActiveTab) || 'owners',
            clientId: searchParams.get('clientId') || undefined,
            vehicleId: searchParams.get('vehicleId') || undefined,
            ownerId: searchParams.get('ownerId') || undefined,
        };
    }, [location.search]);

    // Initialize state from URL - FIX: Use memoized urlParams
    const [activeTab, setActiveTab] = useState<ActiveTab>(urlParams.tab || 'owners');

    // Enhanced component refs for communication with navigation helpers
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

    // FIX: Stable update URL function
    const updateURL = useCallback((newParams: Partial<URLParams>) => {
        const searchParams = new URLSearchParams(location.search);

        // Update parameters
        Object.entries(newParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.set(key, value);
            } else {
                searchParams.delete(key);
            }
        });

        // Navigate to new URL
        const newSearch = searchParams.toString();
        const newPath = `${location.pathname}${newSearch ? '?' + newSearch : ''}`;

        if (newPath !== `${location.pathname}${location.search}`) {
            navigate(newPath, { replace: true });
        }
    }, [location.pathname, location.search, navigate]);

    // FIX: Only update active tab when it actually changes
    useEffect(() => {
        if (urlParams.tab && urlParams.tab !== activeTab) {
            setActiveTab(urlParams.tab);
        }
    }, [urlParams.tab]); // Remove activeTab from dependencies to prevent loop

    // Tab configuration
    const tabs = [
        {
            id: 'owners' as ActiveTab,
            label: 'Baza Klientów',
            icon: FaUsers,
            description: 'Zarządzanie relacjami z klientami'
        },
        {
            id: 'vehicles' as ActiveTab,
            label: 'Baza Pojazdów',
            icon: FaCar,
            description: 'Zarządzanie flotą pojazdów'
        }
    ];

    // Enhanced tab change handler
    const handleTabChange = useCallback((tabId: ActiveTab) => {
        setActiveTab(tabId);

        // Clear specific detail parameters when switching tabs
        const clearedParams: Partial<URLParams> = { tab: tabId };

        if (tabId === 'owners') {
            clearedParams.vehicleId = undefined;
        } else if (tabId === 'vehicles') {
            clearedParams.clientId = undefined;
        }

        updateURL(clearedParams);
    }, [updateURL]);

    // Navigation helpers for cross-component communication
    const navigateToClient = useCallback((clientId: string) => {
        updateURL({
            tab: 'owners',
            clientId: clientId,
            vehicleId: undefined,
            ownerId: undefined
        });
    }, [updateURL]);

    const navigateToVehicle = useCallback((vehicleId: string) => {
        updateURL({
            tab: 'vehicles',
            vehicleId: vehicleId,
            clientId: undefined,
            ownerId: undefined
        });
    }, [updateURL]);

    const navigateToVehiclesByOwner = useCallback((ownerId: string) => {
        updateURL({
            tab: 'vehicles',
            ownerId: ownerId,
            clientId: undefined,
            vehicleId: undefined
        });
    }, [updateURL]);

    // Clear URL parameters for details
    const clearDetailParams = useCallback(() => {
        updateURL({
            clientId: undefined,
            vehicleId: undefined
        });
    }, [updateURL]);

    // Handle actions for owners tab
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

    // Handle actions for vehicles tab
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

    // Enhanced ref handlers with navigation capabilities
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

    // FIX: Stable callback functions to prevent child re-renders
    const handleClientSelected = useCallback((clientId: string) => {
        updateURL({ clientId });
    }, [updateURL]);

    const handleClientClosed = useCallback(() => {
        updateURL({ clientId: undefined });
    }, [updateURL]);

    const handleVehicleSelected = useCallback((vehicleId: string) => {
        updateURL({ vehicleId });
    }, [updateURL]);

    const handleVehicleClosed = useCallback(() => {
        updateURL({ vehicleId: undefined });
    }, [updateURL]);

    return (
        <PageContainer>
            {/* Header with unified navigation */}
            <HeaderContainer>
                <HeaderContent>
                    <HeaderLeft>
                        <HeaderIcon>
                            {activeTab === 'owners' ? <FaUsers /> : <FaCar />}
                        </HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>
                                {activeTab === 'owners' ? 'Baza Klientów' : 'Baza Pojazdów'}
                            </HeaderTitle>
                            <HeaderSubtitle>
                                {activeTab === 'owners'
                                    ? 'Zarządzanie relacjami z klientami'
                                    : 'Zarządzanie flotą pojazdów klientów'
                                }
                                {/* Show current selection in subtitle */}
                                {urlParams.clientId && activeTab === 'owners' && (
                                    <span> • Podgląd klienta</span>
                                )}
                                {urlParams.vehicleId && activeTab === 'vehicles' && (
                                    <span> • Podgląd pojazdu</span>
                                )}
                                {urlParams.ownerId && activeTab === 'vehicles' && (
                                    <span> • Pojazdy właściciela</span>
                                )}
                            </HeaderSubtitle>
                        </HeaderText>
                    </HeaderLeft>

                    <HeaderActions>
                        {activeTab === 'owners' && (
                            <>
                                {ownersRef.selectedClientIds && ownersRef.selectedClientIds.length > 0 && (
                                    <BulkActionButton onClick={() => handleOwnersAction('bulk-sms')}>
                                        <FaExchangeAlt />
                                        <span>SMS do zaznaczonych ({ownersRef.selectedClientIds.length})</span>
                                    </BulkActionButton>
                                )}

                                <SecondaryButton onClick={() => handleOwnersAction('export')}>
                                    <FaFileExport />
                                    <span>Eksport</span>
                                </SecondaryButton>

                                <PrimaryButton onClick={() => handleOwnersAction('add')}>
                                    <FaPlus />
                                    <span>Nowy klient</span>
                                </PrimaryButton>
                            </>
                        )}

                        {activeTab === 'vehicles' && (
                            <>
                                <SecondaryButton onClick={() => handleVehiclesAction('export')}>
                                    <FaFileExport />
                                    <span>Eksport</span>
                                </SecondaryButton>

                                <PrimaryButton onClick={() => handleVehiclesAction('add')}>
                                    <FaPlus />
                                    <span>Nowy pojazd</span>
                                </PrimaryButton>
                            </>
                        )}
                    </HeaderActions>
                </HeaderContent>

                {/* Tab Navigation */}
                <TabNavigation>
                    <TabsList>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <TabButton
                                    key={tab.id}
                                    $active={activeTab === tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    <TabIcon>
                                        <Icon />
                                    </TabIcon>
                                    <TabContent>
                                        <TabLabel>{tab.label}</TabLabel>
                                        <TabDescription>{tab.description}</TabDescription>
                                    </TabContent>
                                </TabButton>
                            );
                        })}
                    </TabsList>
                </TabNavigation>
            </HeaderContainer>

            {/* Tab Content */}
            <ContentContainer>
                {activeTab === 'owners' && (
                    <OwnersPageContent
                        onSetRef={handleSetOwnersRef}
                        initialClientId={urlParams.clientId}
                        onNavigateToVehiclesByOwner={navigateToVehiclesByOwner}
                        onClearDetailParams={clearDetailParams}
                        onClientSelected={handleClientSelected}
                        onClientClosed={handleClientClosed}
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

// Styled Components (same as before)
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceAlt};
    display: flex;
    flex-direction: column;
`;

const HeaderContainer = styled.header`
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.sm};
`;

const HeaderContent = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        flex-direction: column;
        align-items: stretch;
        gap: ${brandTheme.spacing.md};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    min-width: 0;
    flex: 1;
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: ${brandTheme.shadow.md};
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 28px;
    }
`;

const HeaderSubtitle = styled.p`
    color: ${brandTheme.text.secondary};
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 1024px) {
        justify-content: flex-end;
        width: 100%;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.xs};

        > * {
            width: 100%;
        }
    }
`;

const BaseButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    span {
        @media (max-width: 480px) {
            display: block;
        }
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
        box-shadow: ${brandTheme.shadow.md};
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-color: ${brandTheme.border};
    box-shadow: ${brandTheme.shadow.xs};

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.text.primary};
        border-color: ${brandTheme.borderHover};
        box-shadow: ${brandTheme.shadow.sm};
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const BulkActionButton = styled(BaseButton)`
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    color: white;
    box-shadow: ${brandTheme.shadow.sm};

    &:hover {
        background: linear-gradient(135deg, #047857 0%, #059669 100%);
        box-shadow: ${brandTheme.shadow.md};
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const TabNavigation = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${brandTheme.spacing.xl};
    border-top: 1px solid ${brandTheme.border};

    @media (max-width: 1024px) {
        padding: 0 ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${brandTheme.spacing.md};
    }
`;

const TabsList = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const TabButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border: none;
    background: ${props => props.$active ? brandTheme.surface : 'transparent'};
    color: ${props => props.$active ? brandTheme.primary : brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.lg} ${brandTheme.radius.lg} 0 0;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    min-width: 200px;
    white-space: nowrap;
    border-bottom: 3px solid ${props => props.$active ? brandTheme.primary : 'transparent'};

    &:hover {
        background: ${props => props.$active ? brandTheme.surface : brandTheme.surfaceHover};
        color: ${props => props.$active ? brandTheme.primary : brandTheme.text.primary};
    }

    @media (max-width: 768px) {
        min-width: 160px;
        padding: ${brandTheme.spacing.sm} ${brandTheme.spacing.md};
    }
`;

const TabIcon = styled.div`
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
`;

const TabContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    min-width: 0;
`;

const TabLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;
`;

const TabDescription = styled.div`
    font-size: 12px;
    font-weight: 400;
    opacity: 0.8;
    line-height: 1.2;
`;

const ContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

export default ClientsVehiclesPage;