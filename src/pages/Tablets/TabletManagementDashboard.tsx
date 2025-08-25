import React, {useState} from 'react';
import styled from 'styled-components';
import {useTablets} from '../../hooks/useTablets';
import {CreateSignatureSessionRequest, SignatureSession, TabletDevice, tabletsApi} from '../../api/tabletsApi';
import {generateUUID} from '../../utils/uuidHelper';
import {
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaEye,
    FaSignature,
    FaSpinner,
    FaTabletAlt,
    FaTimes,
    FaTimesCircle,
    FaTrash,
    FaWifi
} from 'react-icons/fa';
import Modal from "../../components/common/Modal";

// Professional Brand Theme - Consistent with the application
const brandTheme = {
    // Primary Colors - Professional Blue Palette
    primary: 'var(--brand-primary, #1a365d)',
    primaryLight: 'var(--brand-primary-light, #2c5aa0)',
    primaryDark: 'var(--brand-primary-dark, #0f2027)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(26, 54, 93, 0.04))',

    // Surface Colors - Clean & Minimal
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    surfaceHover: '#f1f5f9',

    // Typography Colors
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },

    // Border Colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',

    // Status Colors - Automotive Grade
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

    // Shadows - Professional Depth
    shadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },

    // Spacing Scale
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Border Radius
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        xxl: '20px'
    }
};

interface TabletManagementDashboardProps {
    tablets: TabletDevice[];
    sessions: SignatureSession[];
    onSessionClick: (session: SignatureSession) => void;
    onDataRefresh?: () => void; // Już istnieje - będziemy go używać
    realtimeStats: {
        connectedTablets: number;
        pendingSessions: number;
        completedToday: number;
        successRate: number;
    };
}

const TabletManagementDashboard: React.FC<TabletManagementDashboardProps> = ({
                                                                                 tablets,
                                                                                 sessions,
                                                                                 onSessionClick,
                                                                                 onDataRefresh,
                                                                                 realtimeStats
                                                                             }) => {
    const { createSignatureSession, testTablet, loading, unpairTablet, refreshData } = useTablets();
    const [activeTab, setActiveTab] = useState<'tablets' | 'sessions'>('tablets');
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [selectedTablet, setSelectedTablet] = useState<TabletDevice | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingTabletId, setDeletingTabletId] = useState<string | null>(null);

    // Modal states for confirmation and success
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
    const [showDeleteErrorModal, setShowDeleteErrorModal] = useState(false);
    const [tabletToDelete, setTabletToDelete] = useState<{ id: string; name: string } | null>(null);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>('');

    const generateWorkstationId = () => {
        return generateUUID();
    };

    const getStatusColor = (status: string, isOnline?: boolean) => {
        if (status === 'ACTIVE' && isOnline) return brandTheme.status.success;
        if (status === 'ACTIVE' && !isOnline) return brandTheme.status.warning;
        if (status === 'INACTIVE') return brandTheme.text.muted;
        if (status === 'MAINTENANCE') return brandTheme.status.info;
        if (status === 'ERROR') return brandTheme.status.error;
        return brandTheme.text.muted;
    };

    const getStatusLabel = (status: string, isOnline?: boolean) => {
        if (status === 'ACTIVE' && isOnline) return 'Aktywny';
        if (status === 'ACTIVE' && !isOnline) return 'Nieaktywny';
        if (status === 'INACTIVE') return 'Wyłączony';
        if (status === 'MAINTENANCE') return 'Konserwacja';
        if (status === 'ERROR') return 'Błąd';
        return 'Nieznany';
    };

    const getSessionStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return brandTheme.status.warning;
            case 'SENT_TO_TABLET': return brandTheme.status.info;
            case 'SIGNED': return brandTheme.status.success;
            case 'EXPIRED': return brandTheme.text.muted;
            case 'CANCELLED': return brandTheme.status.error;
            default: return brandTheme.text.muted;
        }
    };

    const formatLastSeen = (lastSeen: string) => {
        const now = new Date();
        const then = new Date(lastSeen);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Teraz';
        if (diffMins < 60) return `${diffMins} min temu`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h temu`;
        return `${Math.floor(diffHours / 24)}d temu`;
    };

    const handleSuccessModalClose = () => {
        setShowDeleteSuccessModal(false);
        setTabletToDelete(null);
        // Wywołaj odświeżenie danych po pomyślnym usunięciu
        if (onDataRefresh) {
            onDataRefresh();
        }
    };

    const handleTestTablet = async (tabletId: string) => {
        try {
            const result = await testTablet(tabletId);
            if (result.success) {
                alert('Test request sent successfully');
            } else {
                alert(`Test failed: ${result.message}`);
            }
        } catch (error) {
            alert('Failed to test tablet');
            console.error('Error testing tablet:', error);
        }
    };

    const handleDeleteTablet = async (tabletId: string, tabletName: string, event: React.MouseEvent) => {
        event.stopPropagation();

        // Zapisz dane tabletu do usunięcia i pokaż modal potwierdzenia
        setTabletToDelete({ id: tabletId, name: tabletName });
        setShowDeleteConfirmModal(true);
    };

    const confirmDeleteTablet = async () => {
        if (!tabletToDelete) return;

        setDeletingTabletId(tabletToDelete.id);
        setShowDeleteConfirmModal(false);

        try {
            // Używamy unpairTablet z hook'a
            const result = await unpairTablet(tabletToDelete.id);

            if (result.success) {
                // Odśwież dane i pokaż modal sukcesu
                await refreshData();
                setShowDeleteSuccessModal(true);
                // NIE resetuj tabletToDelete tutaj - potrzebujemy nazwy w modalu sukcesu
            } else {
                throw new Error(result.message || 'Nie udało się usunąć tabletu');
            }
        } catch (error) {
            console.error('Error deleting tablet:', error);
            const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
            setDeleteErrorMessage(`Nie udało się usunąć tabletu "${tabletToDelete.name}". ${errorMessage}`);
            setShowDeleteErrorModal(true);
            // Reset tylko przy błędzie
            setTabletToDelete(null);
        } finally {
            setDeletingTabletId(null);
        }
    };

    const cancelDeleteTablet = () => {
        setShowDeleteConfirmModal(false);
        setTabletToDelete(null);
    };

    const handleRequestSignature = (tablet: TabletDevice) => {
        setSelectedTablet(tablet);
        setShowSignatureModal(true);
    };

    const handleSendSignatureRequest = (tablet: TabletDevice) => {
        setSelectedTablet(tablet);
        setShowSignatureModal(true);
    };

    const handleSubmitSignatureRequest = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedTablet) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData(event.currentTarget);

            const request: CreateSignatureSessionRequest = {
                workstationId: selectedTablet.workstationId || generateWorkstationId(),
                customerName: formData.get('customerName') as string,
                vehicleInfo: {
                    make: formData.get('make') as string,
                    model: formData.get('model') as string,
                    licensePlate: formData.get('licensePlate') as string,
                    vin: formData.get('vin') as string || undefined,
                    year: formData.get('year') ? parseInt(formData.get('year') as string) : undefined
                },
                serviceType: formData.get('serviceType') as string,
                documentType: formData.get('documentType') as string,
                additionalNotes: formData.get('notes') as string || undefined
            };

            const response = await tabletsApi.createSignatureSessionDirect(request);

            if (response.success) {
                alert(`Signature request sent successfully! Session ID: ${response.sessionId}`);
                setShowSignatureModal(false);
                setSelectedTablet(null);
            } else {
                alert(`Failed to send signature request: ${response.message}`);
            }
        } catch (error) {
            alert('Failed to send signature request');
            console.error('Error sending signature request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardContainer>
            <DashboardCard>
                <ContentArea>
                    {activeTab === 'tablets' ? (
                        <TabletsGrid>
                            {tablets.length === 0 ? (
                                <EmptyState>
                                    <EmptyStateIcon>
                                        <FaTabletAlt />
                                    </EmptyStateIcon>
                                    <EmptyStateText>
                                        <EmptyStateTitle>Brak podłączonych tabletów</EmptyStateTitle>
                                        <EmptyStateDescription>
                                            Użyj przycisku "Sparuj Tablet" aby dodać nowy tablet
                                        </EmptyStateDescription>
                                    </EmptyStateText>
                                </EmptyState>
                            ) : (
                                tablets.map(tablet => (
                                    <TabletCard key={tablet.id} $status={tablet.status} $isOnline={tablet.isOnline}>
                                        <TabletHeader>
                                            <TabletInfo>
                                                <TabletName>{tablet.friendlyName}</TabletName>
                                                <TabletSubtitle>
                                                    {tablet.isOnline ? 'Online' : `Ostatnia aktywność: ${formatLastSeen(tablet.lastSeen)}`}
                                                </TabletSubtitle>
                                            </TabletInfo>
                                            <StatusIndicator $color={getStatusColor(tablet.status, tablet.isOnline)}>
                                                <FaWifi />
                                                {tablet.isOnline ? 'Online' : 'Offline'}
                                            </StatusIndicator>
                                        </TabletHeader>

                                        <TabletDetails>
                                            <DetailRow>
                                                <DetailLabel>Status:</DetailLabel>
                                                <DetailValue>{getStatusLabel(tablet.status, tablet.isOnline)}</DetailValue>
                                            </DetailRow>
                                        </TabletDetails>

                                        {/* Delete Overlay */}
                                        <DeleteOverlay>
                                            <DeleteButton
                                                onClick={(e) => handleDeleteTablet(tablet.id, tablet.friendlyName, e)}
                                                disabled={deletingTabletId === tablet.id}
                                                title={`Usuń tablet ${tablet.friendlyName}`}
                                            >
                                                {deletingTabletId === tablet.id ? (
                                                    <FaSpinner className="spin" />
                                                ) : (
                                                    <FaTrash />
                                                )}
                                            </DeleteButton>
                                        </DeleteOverlay>
                                    </TabletCard>
                                ))
                            )}
                        </TabletsGrid>
                    ) : (
                        <SessionsContainer>
                            {sessions.length === 0 ? (
                                <EmptyState>
                                    <EmptyStateIcon>
                                        <FaSignature />
                                    </EmptyStateIcon>
                                    <EmptyStateText>
                                        <EmptyStateTitle>Brak sesji podpisów</EmptyStateTitle>
                                        <EmptyStateDescription>
                                            Sesje pojawią się tutaj po wysłaniu żądań podpisu do tabletów
                                        </EmptyStateDescription>
                                    </EmptyStateText>
                                </EmptyState>
                            ) : (
                                <SessionsList>
                                    {sessions.map(session => (
                                        <SessionCard key={session.id} onClick={() => onSessionClick(session)}>
                                            <SessionHeader>
                                                <SessionInfo>
                                                    <CustomerName>{session.customerName}</CustomerName>
                                                    <DocumentType>{session.documentType}</DocumentType>
                                                </SessionInfo>
                                                <StatusBadge $color={getSessionStatusColor(session.status)}>
                                                    {session.status === 'SIGNED' && <FaCheckCircle />}
                                                    {session.status === 'EXPIRED' && <FaTimesCircle />}
                                                    {session.status === 'SENT_TO_TABLET' && <FaClock />}
                                                    {session.status === 'CANCELLED' && <FaExclamationTriangle />}
                                                    {session.status}
                                                </StatusBadge>
                                            </SessionHeader>

                                            <SessionDetails>
                                                <DetailRow>
                                                    <DetailLabel>Pojazd:</DetailLabel>
                                                    <VehicleInfo>
                                                        <VehicleName>
                                                            {session.vehicleInfo.make} {session.vehicleInfo.model}
                                                        </VehicleName>
                                                        <LicensePlate>{session.vehicleInfo.licensePlate}</LicensePlate>
                                                    </VehicleInfo>
                                                </DetailRow>
                                                <DetailRow>
                                                    <DetailLabel>Usługa:</DetailLabel>
                                                    <DetailValue>{session.serviceType}</DetailValue>
                                                </DetailRow>
                                                <DetailRow>
                                                    <DetailLabel>Tablet:</DetailLabel>
                                                    <DetailValue>
                                                        {session.assignedTabletId ?
                                                            tablets.find(t => t.id === session.assignedTabletId)?.friendlyName || 'Nieznany'
                                                            : '-'}
                                                    </DetailValue>
                                                </DetailRow>
                                                <DetailRow>
                                                    <DetailLabel>Utworzono:</DetailLabel>
                                                    <DetailValue>{new Date(session.createdAt).toLocaleString('pl-PL')}</DetailValue>
                                                </DetailRow>
                                            </SessionDetails>

                                            <SessionActions onClick={(e) => e.stopPropagation()}>
                                                <ActionButton
                                                    title="Szczegóły"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSessionClick(session);
                                                    }}
                                                    $variant="view"
                                                    $small
                                                >
                                                    <FaEye />
                                                </ActionButton>
                                                {(session.status === 'PENDING' || session.status === 'SENT_TO_TABLET') && (
                                                    <ActionButton
                                                        title="Anuluj"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Handle cancel
                                                        }}
                                                        $variant="delete"
                                                        $small
                                                    >
                                                        <FaTimesCircle />
                                                    </ActionButton>
                                                )}
                                            </SessionActions>
                                        </SessionCard>
                                    ))}
                                </SessionsList>
                            )}
                        </SessionsContainer>
                    )}
                </ContentArea>
            </DashboardCard>

            {/* Signature Request Modal */}
            {showSignatureModal && selectedTablet && (
                <ModalOverlay onClick={() => setShowSignatureModal(false)}>
                    <ModalX onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>
                                <FaSignature />
                                Poproś o Podpis Cyfrowy
                            </ModalTitle>
                            <CloseButton onClick={() => setShowSignatureModal(false)}>
                                <FaTimes />
                            </CloseButton>
                        </ModalHeader>
                        <ModalContent>
                            <SignatureForm onSubmit={handleSubmitSignatureRequest}>
                                <FormGroup>
                                    <Label>Tablet</Label>
                                    <TabletInfoDisplay>
                                        <TabletIcon>
                                            <FaTabletAlt />
                                        </TabletIcon>
                                        <TabletDetails>
                                            <TabletDisplayName>{selectedTablet.friendlyName}</TabletDisplayName>
                                            <TabletStatus $online={selectedTablet.isOnline}>
                                                {selectedTablet.isOnline ? 'Online' : 'Offline'}
                                            </TabletStatus>
                                        </TabletDetails>
                                    </TabletInfoDisplay>
                                </FormGroup>

                                <FormGroup>
                                    <Label>Imię i nazwisko klienta *</Label>
                                    <Input name="customerName" required />
                                </FormGroup>

                                <FormRow>
                                    <FormGroup>
                                        <Label>Marka *</Label>
                                        <Input name="make" required />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Model *</Label>
                                        <Input name="model" required />
                                    </FormGroup>
                                </FormRow>

                                <FormGroup>
                                    <Label>Numer rejestracyjny *</Label>
                                    <Input name="licensePlate" required />
                                </FormGroup>

                                <FormRow>
                                    <FormGroup>
                                        <Label>VIN</Label>
                                        <Input name="vin" />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Rok produkcji</Label>
                                        <Input name="year" type="number" min="1900" max={new Date().getFullYear()} />
                                    </FormGroup>
                                </FormRow>

                                <FormGroup>
                                    <Label>Rodzaj usługi *</Label>
                                    <Select name="serviceType" required>
                                        <option value="">Wybierz usługę</option>
                                        <option value="Detailing Premium">Detailing Premium</option>
                                        <option value="Mycie + Wosk">Mycie + Wosk</option>
                                        <option value="Korekta Lakieru">Korekta Lakieru</option>
                                        <option value="Ochrona Ceramiczna">Ochrona Ceramiczna</option>
                                        <option value="Serwis Podstawowy">Serwis Podstawowy</option>
                                        <option value="Serwis Rozszerzony">Serwis Rozszerzony</option>
                                    </Select>
                                </FormGroup>

                                <FormGroup>
                                    <Label>Typ dokumentu *</Label>
                                    <Select name="documentType" required>
                                        <option value="">Wybierz typ</option>
                                        <option value="Protokół Przyjęcia">Protokół Przyjęcia</option>
                                        <option value="Protokół Wydania">Protokół Wydania</option>
                                        <option value="Umowa Serwisowa">Umowa Serwisowa</option>
                                        <option value="Zgoda na Naprawę">Zgoda na Naprawę</option>
                                    </Select>
                                </FormGroup>

                                <FormGroup>
                                    <Label>Dodatkowe uwagi</Label>
                                    <TextArea
                                        name="notes"
                                        rows={3}
                                        placeholder="Opcjonalne uwagi lub instrukcje specjalne..."
                                    />
                                </FormGroup>

                                <ModalActions>
                                    <CancelButton type="button" onClick={() => setShowSignatureModal(false)}>
                                        Anuluj
                                    </CancelButton>
                                    <SubmitButton type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <FaSpinner className="spin" /> : <FaSignature />}
                                        {isSubmitting ? 'Wysyłanie...' : 'Poproś o podpis'}
                                    </SubmitButton>
                                </ModalActions>
                            </SignatureForm>
                        </ModalContent>
                    </ModalX>
                </ModalOverlay>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirmModal}
                onClose={cancelDeleteTablet}
                title="Potwierdzenie usunięcia"
                size="md"
            >
                <ConfirmationModalContent>
                    <ConfirmationIcon>
                        <FaExclamationTriangle />
                    </ConfirmationIcon>
                    <ConfirmationMessage>
                        Czy na pewno chcesz usunąć tablet <strong>"{tabletToDelete?.name}"</strong>?
                        <br /><br />
                        Ta operacja jest nieodwracalna i rozłączy tablet z systemem.
                    </ConfirmationMessage>
                    <ConfirmationActions>
                        <CancelButton onClick={cancelDeleteTablet}>
                            <FaTimes />
                            Anuluj
                        </CancelButton>
                        <DeleteConfirmButton onClick={confirmDeleteTablet}>
                            <FaTrash />
                            Usuń tablet
                        </DeleteConfirmButton>
                    </ConfirmationActions>
                </ConfirmationModalContent>
            </Modal>

            {/* Delete Success Modal */}
            <Modal
                isOpen={showDeleteSuccessModal}
                onClose={handleSuccessModalClose}
                title="Tablet usunięty"
                size="sm"
            >
                <SuccessModalContent>
                    <SuccessIcon>
                        <FaCheckCircle />
                    </SuccessIcon>
                    <SuccessMessage>
                        Tablet <strong>"{tabletToDelete?.name}"</strong> został pomyślnie usunięty z systemu.
                    </SuccessMessage>
                    <SuccessActions>
                        <SuccessButton onClick={handleSuccessModalClose}>
                            <FaCheckCircle />
                            OK
                        </SuccessButton>
                    </SuccessActions>
                </SuccessModalContent>
            </Modal>

            {/* Delete Error Modal */}
            <Modal
                isOpen={showDeleteErrorModal}
                onClose={() => {
                    setShowDeleteErrorModal(false);
                    setTabletToDelete(null); // Reset przy zamknięciu modala błędu
                }}
                title="Błąd usuwania"
                size="md"
            >
                <ErrorModalContent>
                    <ErrorIcon>
                        <FaTimesCircle />
                    </ErrorIcon>
                    <ErrorMessage>
                        {deleteErrorMessage}
                    </ErrorMessage>
                    <ErrorActions>
                        <ErrorButton onClick={() => {
                            setShowDeleteErrorModal(false);
                            setTabletToDelete(null); // Reset przy zamknięciu
                        }}>
                            <FaTimes />
                            Zamknij
                        </ErrorButton>
                    </ErrorActions>
                </ErrorModalContent>
            </Modal>

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </DashboardContainer>
    );
};

// Styled Components - Updated to match application theme
const DashboardContainer = styled.div`
    padding: 0;
    margin: 0;
`;

const DashboardCard = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    border: 1px solid ${brandTheme.border};
    overflow: hidden;
    box-shadow: ${brandTheme.shadow.sm};
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const TabNavigation = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.lg};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
    flex-shrink: 0;
`;

const TabButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border: 2px solid ${props => props.$active ? brandTheme.primary : brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$active ? brandTheme.primary : brandTheme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 600;

    &:hover {
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
        background: ${brandTheme.primaryGhost};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const TabIcon = styled.div`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
`;

const TabContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
`;

const TabLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
`;

const TabCount = styled.span`
    font-size: 12px;
    opacity: 0.8;
`;

const ContentArea = styled.div`
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    display: flex;
    flex-direction: column;

    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
    }
    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.border};
        border-radius: 3px;
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    flex: 1;
    min-height: 0;
    width: 100%;
`;

const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${brandTheme.text.tertiary};
    margin-bottom: ${brandTheme.spacing.lg};
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;

const EmptyStateText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const EmptyStateTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    margin: 0;
    line-height: 1.5;
`;

const TabletsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: ${brandTheme.spacing.lg};
    padding: ${brandTheme.spacing.lg};
    flex: 1;
`;

const TabletCard = styled.div<{ $status: string; $isOnline: boolean }>`
    background: ${brandTheme.surface};
    border: 2px solid ${props => props.$isOnline ? brandTheme.status.success : brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    cursor: default;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${props => props.$isOnline ? brandTheme.status.success : brandTheme.border};
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.md};
        border-color: ${props => props.$isOnline ? brandTheme.status.success : brandTheme.primary};
    }
`;

const TabletHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${brandTheme.spacing.md};
    gap: ${brandTheme.spacing.md};
`;

const TabletInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const TabletName = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.xs} 0;
    letter-spacing: -0.025em;
`;

const TabletSubtitle = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const StatusIndicator = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${props => `${props.$color}15`};
    color: ${props => props.$color};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid ${props => `${props.$color}30`};
    flex-shrink: 0;
`;

const TabletDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
    margin-bottom: ${brandTheme.spacing.lg};
`;

const DetailRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const DetailLabel = styled.span`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const DetailValue = styled.span`
    font-size: 14px;
    color: ${brandTheme.text.primary};
    font-weight: 600;
    text-align: right;
`;

// Delete Overlay - nowy komponent dla hover effect
const DeleteOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10;
    backdrop-filter: blur(4px);
    border-radius: ${brandTheme.radius.lg};

    ${TabletCard}:hover & {
        opacity: 1;
        visibility: visible;
    }
`;

const DeleteButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, ${brandTheme.status.error} 0%, #b91c1c 100%);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 28px;
    box-shadow: ${brandTheme.shadow.xl};
    transform: scale(0.8);
    border: 3px solid rgba(255, 255, 255, 0.3);

    &:hover:not(:disabled) {
        transform: scale(1);
        box-shadow: 0 20px 40px rgba(239, 68, 68, 0.4);
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    }

    &:active:not(:disabled) {
        transform: scale(0.95);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: scale(0.8);
    }

    svg {
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
`;

const ActionButton = styled.button<{
    $variant: 'view' | 'edit' | 'delete';
    $small?: boolean;
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${props => props.$small ? '28px' : '32px'};
    height: ${props => props.$small ? '28px' : '32px'};
    border: none;
    border-radius: ${brandTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: ${props => props.$small ? '12px' : '13px'};
    position: relative;
    overflow: hidden;

    ${({ $variant }) => {
        switch ($variant) {
            case 'view':
                return `
                    background: ${brandTheme.primaryGhost};
                    color: ${brandTheme.primary};
                    &:hover:not(:disabled) {
                        background: ${brandTheme.primary};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'edit':
                return `
                    background: ${brandTheme.status.warningLight};
                    color: ${brandTheme.status.warning};
                    &:hover:not(:disabled) {
                        background: ${brandTheme.status.warning};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
            case 'delete':
                return `
                    background: ${brandTheme.status.errorLight};
                    color: ${brandTheme.status.error};
                    &:hover:not(:disabled) {
                        background: ${brandTheme.status.error};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${brandTheme.shadow.md};
                    }
                `;
        }
    }}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
    }
`;

const SessionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.lg};
    flex: 1;
`;

const SessionsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const SessionCard = styled.div`
    background: ${brandTheme.surface};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-left: 4px solid ${brandTheme.primary};

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${brandTheme.shadow.lg};
        border-color: ${brandTheme.primary};
    }
`;

const SessionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${brandTheme.spacing.md};
    gap: ${brandTheme.spacing.md};
`;

const SessionInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const CustomerName = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 16px;
    margin-bottom: ${brandTheme.spacing.xs};
`;

const DocumentType = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
`;

const StatusBadge = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    background: ${props => `${props.$color}15`};
    color: ${props => props.$color};
    border-radius: ${brandTheme.radius.md};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    width: fit-content;
    letter-spacing: 0.5px;
    border: 1px solid ${props => `${props.$color}30`};
    flex-shrink: 0;
`;

const SessionDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
    margin-bottom: ${brandTheme.spacing.md};
`;

const VehicleInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: right;
`;

const VehicleName = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
`;

const LicensePlate = styled.div`
    font-size: 12px;
    color: ${brandTheme.text.muted};
    font-family: 'Courier New', monospace;
    background: ${brandTheme.surfaceAlt};
    padding: 2px 6px;
    border-radius: ${brandTheme.radius.sm};
    width: fit-content;
    margin-left: auto;
    font-weight: 600;
    letter-spacing: 0.5px;
`;

const SessionActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.xs};
    justify-content: flex-end;
`;

// Modal Styles - Updated to match application theme
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    backdrop-filter: blur(4px);
    padding: ${brandTheme.spacing.lg};
`;

const ModalX = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;

    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 8px;
    }
    &::-webkit-scrollbar-track {
        background: ${brandTheme.surfaceAlt};
    }
    &::-webkit-scrollbar-thumb {
        background: ${brandTheme.border};
        border-radius: 4px;
    }
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 1px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const ModalTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    margin: 0;
    letter-spacing: -0.025em;

    svg {
        color: ${brandTheme.primary};
        font-size: 24px;
    }
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: ${brandTheme.surfaceHover};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 18px;

    &:hover {
        background: ${brandTheme.status.errorLight};
        color: ${brandTheme.status.error};
        transform: scale(1.05);
    }
`;

const ModalContent = styled.div`
    padding: ${brandTheme.spacing.xl};
`;

const SignatureForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xs};
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${brandTheme.spacing.md};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const TabletInfoDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
    padding: ${brandTheme.spacing.md};
    background: ${brandTheme.primaryGhost};
    border: 2px solid ${brandTheme.primary}30;
    border-radius: ${brandTheme.radius.md};
`;

const TabletIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    border-radius: ${brandTheme.radius.md};
    color: white;
    font-size: 18px;
`;

const TabletDisplayName = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 16px;
`;

const TabletStatus = styled.div<{ $online: boolean }>`
    font-size: 12px;
    font-weight: 500;
    color: ${props => props.$online ? brandTheme.status.success : brandTheme.status.error};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const Input = styled.input`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const Select = styled.select`
    height: 44px;
    padding: 0 ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }
`;

const TextArea = styled.textarea`
    padding: ${brandTheme.spacing.md};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-size: 14px;
    font-weight: 500;
    background: ${brandTheme.surface};
    color: ${brandTheme.text.primary};
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${brandTheme.primary};
        box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
    }

    &::placeholder {
        color: ${brandTheme.text.muted};
        font-weight: 400;
    }
`;

const ModalActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    justify-content: flex-end;
    margin-top: ${brandTheme.spacing.xl};
    padding-top: ${brandTheme.spacing.lg};
    border-top: 1px solid ${brandTheme.border};

    @media (max-width: 576px) {
        flex-direction: column-reverse;
    }
`;

const CancelButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    border: 2px solid ${brandTheme.border};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;

    &:hover {
        border-color: ${brandTheme.borderHover};
        color: ${brandTheme.text.primary};
        background: ${brandTheme.surfaceHover};
        box-shadow: ${brandTheme.shadow.sm};
    }
`;

const SubmitButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    background: linear-gradient(135deg, ${brandTheme.primary} 0%, ${brandTheme.primaryLight} 100%);
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${brandTheme.shadow.sm};
    min-height: 44px;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
        background: linear-gradient(135deg, ${brandTheme.primaryDark} 0%, ${brandTheme.primary} 100%);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: ${brandTheme.shadow.xs};
    }
`;

export default TabletManagementDashboard;

// Modal Content Styles
const ConfirmationModalContent = styled.div`
    padding: ${brandTheme.spacing.xl};
    text-align: center;
`;

const ConfirmationIcon = styled.div`
    width: 80px;
    height: 80px;
    background: ${brandTheme.status.warningLight};
    color: ${brandTheme.status.warning};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    margin: 0 auto ${brandTheme.spacing.xl};
    border: 3px solid ${brandTheme.status.warning}30;
    box-shadow: ${brandTheme.shadow.lg};
`;

const ConfirmationMessage = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    line-height: 1.6;
    margin-bottom: ${brandTheme.spacing.xl};

    strong {
        color: ${brandTheme.text.primary};
        font-weight: 600;
    }
`;

const ConfirmationActions = styled.div`
    display: flex;
    gap: ${brandTheme.spacing.md};
    justify-content: center;

    @media (max-width: 480px) {
        flex-direction: column;
    }
`;

const DeleteConfirmButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.xl};
    background: linear-gradient(135deg, ${brandTheme.status.error} 0%, #b91c1c 100%);
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${brandTheme.shadow.sm};
    min-height: 44px;
    min-width: 140px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.lg};
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    }

    &:active {
        transform: translateY(0);
    }
`;

const SuccessModalContent = styled.div`
    padding: ${brandTheme.spacing.xl};
    text-align: center;
`;

const SuccessIcon = styled.div`
    width: 80px;
    height: 80px;
    background: ${brandTheme.status.successLight};
    color: ${brandTheme.status.success};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    margin: 0 auto ${brandTheme.spacing.xl};
    border: 3px solid ${brandTheme.status.success}30;
    box-shadow: ${brandTheme.shadow.lg};
`;

const SuccessMessage = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    line-height: 1.6;
    margin-bottom: ${brandTheme.spacing.xl};

    strong {
        color: ${brandTheme.text.primary};
        font-weight: 600;
    }
`;

const SuccessActions = styled.div`
    display: flex;
    justify-content: center;
`;

const SuccessButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.xl};
    background: linear-gradient(135deg, ${brandTheme.status.success} 0%, #047857 100%);
    color: white;
    border: none;
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${brandTheme.shadow.sm};
    min-height: 44px;
    min-width: 100px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.lg};
        background: linear-gradient(135deg, #059669 0%, #065f46 100%);
    }
`;

const ErrorModalContent = styled.div`
    padding: ${brandTheme.spacing.xl};
    text-align: center;
`;

const ErrorIcon = styled.div`
    width: 80px;
    height: 80px;
    background: ${brandTheme.status.errorLight};
    color: ${brandTheme.status.error};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    margin: 0 auto ${brandTheme.spacing.xl};
    border: 3px solid ${brandTheme.status.error}30;
    box-shadow: ${brandTheme.shadow.lg};
`;

const ErrorMessage = styled.div`
    font-size: 16px;
    color: ${brandTheme.text.secondary};
    line-height: 1.6;
    margin-bottom: ${brandTheme.spacing.xl};
`;

const ErrorActions = styled.div`
    display: flex;
    justify-content: center;
`;

const ErrorButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${brandTheme.spacing.sm};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.xl};
    background: ${brandTheme.surface};
    color: ${brandTheme.text.secondary};
    border: 2px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;
    min-width: 100px;

    &:hover {
        background: ${brandTheme.surfaceHover};
        border-color: ${brandTheme.borderHover};
        color: ${brandTheme.text.primary};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.sm};
    }
`;