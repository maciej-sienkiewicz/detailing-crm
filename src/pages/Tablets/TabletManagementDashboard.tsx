import React, { useState } from 'react';
import styled from 'styled-components';
import { useTablets } from '../../hooks/useTablets';
import { TabletDevice, SignatureSession } from '../../api/tabletsApi';
import {
    FaTabletAlt,
    FaWifi,
    FaMapMarkerAlt,
    FaEdit,
    FaTrash,
    FaEye,
    FaSignature,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaPaperPlane,
    FaSpinner
} from 'react-icons/fa';

interface TabletManagementDashboardProps {
    tablets: TabletDevice[];
    sessions: SignatureSession[];
    onSessionClick: (session: SignatureSession) => void;
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
                                                                                 realtimeStats
                                                                             }) => {
    const { createSignatureSession, testTablet, loading } = useTablets();
    const [activeTab, setActiveTab] = useState<'tablets' | 'sessions'>('tablets');
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [selectedTablet, setSelectedTablet] = useState<TabletDevice | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStatusColor = (status: string, isOnline?: boolean) => {
        if (status === 'ACTIVE' && isOnline) return '#10b981'; // green
        if (status === 'ACTIVE' && !isOnline) return '#f59e0b'; // yellow
        if (status === 'INACTIVE') return '#6b7280'; // gray
        if (status === 'MAINTENANCE') return '#3b82f6'; // blue
        if (status === 'ERROR') return '#ef4444'; // red
        return '#6b7280';
    };

    const getSessionStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return '#f59e0b';
            case 'SENT_TO_TABLET': return '#3b82f6';
            case 'SIGNED': return '#10b981';
            case 'EXPIRED': return '#6b7280';
            case 'CANCELLED': return '#ef4444';
            default: return '#6b7280';
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

            const request = {
                workstationId: selectedTablet.workstationId || 'default-workstation',
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

            const response = await createSignatureSession(request);

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
                <TabNavigation>
                    <TabButton
                        active={activeTab === 'tablets'}
                        onClick={() => setActiveTab('tablets')}
                    >
                        <FaTabletAlt />
                        Tablety ({tablets.length})
                    </TabButton>
                    <TabButton
                        active={activeTab === 'sessions'}
                        onClick={() => setActiveTab('sessions')}
                    >
                        <FaSignature />
                        Sesje Podpisów ({sessions.length})
                    </TabButton>
                </TabNavigation>

                <ContentArea>
                    {activeTab === 'tablets' ? (
                        <TabletsGrid>
                            {tablets.length === 0 ? (
                                <EmptyState>
                                    <FaTabletAlt />
                                    <EmptyStateText>
                                        <h3>Brak podłączonych tabletów</h3>
                                        <p>Użyj przycisku "Sparuj Tablet" aby dodać nowy tablet</p>
                                    </EmptyStateText>
                                </EmptyState>
                            ) : (
                                tablets.map(tablet => (
                                    <TabletCard key={tablet.id} status={tablet.status} isOnline={tablet.isOnline}>
                                        <TabletHeader>
                                            <TabletName>{tablet.friendlyName}</TabletName>
                                            <StatusIndicator color={getStatusColor(tablet.status, tablet.isOnline)}>
                                                <FaWifi />
                                                {tablet.isOnline ? 'Online' : 'Offline'}
                                            </StatusIndicator>
                                        </TabletHeader>

                                        <TabletInfo>
                                            <InfoRow>
                                                <InfoLabel>Status:</InfoLabel>
                                                <InfoValue>{tablet.status}</InfoValue>
                                            </InfoRow>
                                            <InfoRow>
                                                <InfoLabel>Ostatnia aktywność:</InfoLabel>
                                                <InfoValue>{formatLastSeen(tablet.lastSeen)}</InfoValue>
                                            </InfoRow>
                                            {tablet.workstationId && (
                                                <InfoRow>
                                                    <InfoLabel>Stanowisko:</InfoLabel>
                                                    <InfoValue>#{tablet.workstationId}</InfoValue>
                                                </InfoRow>
                                            )}
                                            <InfoRow>
                                                <InfoLabel>
                                                    <FaMapMarkerAlt />
                                                    Lokalizacja:
                                                </InfoLabel>
                                                <InfoValue>{tablet.locationId}</InfoValue>
                                            </InfoRow>
                                        </TabletInfo>

                                        <TabletActions>
                                            <TabletActionButton
                                                onClick={() => handleSendSignatureRequest(tablet)}
                                                disabled={!tablet.isOnline}
                                                title="Wyślij żądanie podpisu"
                                            >
                                                <FaPaperPlane />
                                            </TabletActionButton>
                                            <TabletActionButton
                                                onClick={() => handleTestTablet(tablet.id)}
                                                disabled={!tablet.isOnline}
                                                title="Test tabletu"
                                            >
                                                <FaEye />
                                            </TabletActionButton>
                                            <TabletActionButton title="Edytuj" disabled>
                                                <FaEdit />
                                            </TabletActionButton>
                                            <TabletActionButton danger title="Usuń" disabled>
                                                <FaTrash />
                                            </TabletActionButton>
                                        </TabletActions>
                                    </TabletCard>
                                ))
                            )}
                        </TabletsGrid>
                    ) : (
                        <SessionsTable>
                            <TableHeader>
                                <HeaderCell>Klient</HeaderCell>
                                <HeaderCell>Pojazd</HeaderCell>
                                <HeaderCell>Usługa</HeaderCell>
                                <HeaderCell>Status</HeaderCell>
                                <HeaderCell>Tablet</HeaderCell>
                                <HeaderCell>Utworzono</HeaderCell>
                                <HeaderCell>Akcje</HeaderCell>
                            </TableHeader>
                            {sessions.length === 0 ? (
                                <EmptySessionsState>
                                    <FaSignature />
                                    <EmptyStateText>
                                        <h3>Brak sesji podpisów</h3>
                                        <p>Sesje pojawią się tutaj po wysłaniu żądań podpisu do tabletów</p>
                                    </EmptyStateText>
                                </EmptySessionsState>
                            ) : (
                                sessions.map(session => (
                                    <TableRow key={session.id} onClick={() => onSessionClick(session)}>
                                        <Cell>
                                            <CustomerInfo>
                                                <CustomerName>{session.customerName}</CustomerName>
                                                <DocumentType>{session.documentType}</DocumentType>
                                            </CustomerInfo>
                                        </Cell>
                                        <Cell>
                                            <VehicleInfo>
                                                <VehicleName>{session.vehicleInfo.make} {session.vehicleInfo.model}</VehicleName>
                                                <LicensePlate>{session.vehicleInfo.licensePlate}</LicensePlate>
                                            </VehicleInfo>
                                        </Cell>
                                        <Cell>{session.serviceType}</Cell>
                                        <Cell>
                                            <StatusBadge color={getSessionStatusColor(session.status)}>
                                                {session.status === 'SIGNED' && <FaCheckCircle />}
                                                {session.status === 'EXPIRED' && <FaTimesCircle />}
                                                {session.status === 'SENT_TO_TABLET' && <FaClock />}
                                                {session.status === 'CANCELLED' && <FaExclamationTriangle />}
                                                {session.status}
                                            </StatusBadge>
                                        </Cell>
                                        <Cell>
                                            {session.assignedTabletId ?
                                                tablets.find(t => t.id === session.assignedTabletId)?.friendlyName || 'Nieznany'
                                                : '-'}
                                        </Cell>
                                        <Cell>{new Date(session.createdAt).toLocaleString('pl-PL')}</Cell>
                                        <Cell>
                                            <SessionActions>
                                                <SessionActionButton title="Szczegóły" onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSessionClick(session);
                                                }}>
                                                    <FaEye />
                                                </SessionActionButton>
                                                {(session.status === 'PENDING' || session.status === 'SENT_TO_TABLET') && (
                                                    <SessionActionButton danger title="Anuluj" onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Handle cancel
                                                    }}>
                                                        <FaTimesCircle />
                                                    </SessionActionButton>
                                                )}
                                            </SessionActions>
                                        </Cell>
                                    </TableRow>
                                ))
                            )}
                        </SessionsTable>
                    )}
                </ContentArea>
            </DashboardCard>

            {/* Signature Request Modal */}
            {showSignatureModal && selectedTablet && (
                <ModalOverlay onClick={() => setShowSignatureModal(false)}>
                    <Modal onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>
                                <FaSignature />
                                Nowe Żądanie Podpisu
                            </ModalTitle>
                            <CloseButton onClick={() => setShowSignatureModal(false)}>×</CloseButton>
                        </ModalHeader>
                        <ModalContent>
                            <SignatureForm onSubmit={handleSubmitSignatureRequest}>
                                <FormGroup>
                                    <Label>Tablet</Label>
                                    <Select disabled>
                                        <option value={selectedTablet.id}>{selectedTablet.friendlyName}</option>
                                    </Select>
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
                                    <TextArea name="notes" rows={3} placeholder="Opcjonalne uwagi lub instrukcje specjalne..." />
                                </FormGroup>

                                <ModalActions>
                                    <Button type="button" onClick={() => setShowSignatureModal(false)}>
                                        Anuluj
                                    </Button>
                                    <Button type="submit" primary disabled={isSubmitting}>
                                        {isSubmitting ? <FaSpinner className="spin" /> : <FaPaperPlane />}
                                        {isSubmitting ? 'Wysyłanie...' : 'Wyślij żądanie'}
                                    </Button>
                                </ModalActions>
                            </SignatureForm>
                        </ModalContent>
                    </Modal>
                </ModalOverlay>
            )}
        </DashboardContainer>
    );
};

// Styled Components
const DashboardContainer = styled.div`
    padding: 0;
    margin: 0;
`;

const DashboardCard = styled.div`
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(226, 232, 240, 0.8);
    overflow: hidden;
`;

const TabNavigation = styled.div`
    display: flex;
    gap: 8px;
    padding: 24px 24px 0 24px;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
`;

const TabButton = styled.button<{ active: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    border: none;
    border-radius: 16px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    ${props => props.active ? `
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        transform: translateY(-2px);
    ` : `
        background: rgba(255, 255, 255, 0.8);
        color: #64748b;
        border: 1px solid rgba(226, 232, 240, 0.8);
        
        &:hover {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
    `}

    svg {
        font-size: 18px;
    }
`;

const ContentArea = styled.div`
    padding: 32px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 40px;
    text-align: center;
    color: #64748b;

    svg {
        font-size: 64px;
        margin-bottom: 24px;
        opacity: 0.5;
    }
`;

const EmptySessionsState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 40px;
    text-align: center;
    color: #64748b;
    grid-column: 1 / -1;

    svg {
        font-size: 64px;
        margin-bottom: 24px;
        opacity: 0.5;
    }
`;

const EmptyStateText = styled.div`
    h3 {
        font-size: 24px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
    }

    p {
        font-size: 16px;
        color: #6b7280;
        margin: 0;
    }
`;

const TabletsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
`;

const TabletCard = styled.div<{ status: string; isOnline: boolean }>`
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 2px solid ${props => props.isOnline ? '#10b981' : 'rgba(226, 232, 240, 0.8)'};
    border-radius: 20px;
    padding: 24px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${props => props.isOnline ?
    'linear-gradient(90deg, #10b981 0%, #059669 100%)' :
    'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)'
};
    }

    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.15);
        border-color: ${props => props.isOnline ? '#059669' : '#3b82f6'};
    }
`;

const TabletHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const TabletName = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.01em;
`;

const StatusIndicator = styled.div<{ color: string }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: ${props => props.color}20;
    color: ${props => props.color};
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const TabletInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
`;

const InfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
`;

const InfoLabel = styled.span`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
`;

const InfoValue = styled.span`
    font-size: 14px;
    color: #1e293b;
    font-weight: 600;
`;

const TabletActions = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
`;

const TabletActionButton = styled.button<{ danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    ${props => props.danger ? `
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        
        &:hover:not(:disabled) {
            background: #ef4444;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }
    ` : `
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        
        &:hover:not(:disabled) {
            background: #3b82f6;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }
    `}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
    }
`;

const SessionsTable = styled.div`
    display: grid;
    grid-template-columns: 1.5fr 1.5fr 1fr 0.8fr 1fr 1fr 0.8fr;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    overflow: hidden;
    backdrop-filter: blur(10px);
`;

const TableHeader = styled.div`
    display: contents;

    > div {
        padding: 20px 24px;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-bottom: 2px solid rgba(226, 232, 240, 0.8);
        font-size: 14px;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
`;

const HeaderCell = styled.div``;

const TableRow = styled.div`
    display: contents;
    cursor: pointer;

    > div {
        padding: 20px 24px;
        border-bottom: 1px solid rgba(241, 245, 249, 0.8);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &:hover > div {
        background: rgba(59, 130, 246, 0.05);
    }

    &:last-child > div {
        border-bottom: none;
    }
`;

const Cell = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #1e293b;
`;

const CustomerInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const CustomerName = styled.div`
    font-weight: 600;
    color: #1e293b;
`;

const DocumentType = styled.div`
    font-size: 12px;
    color: #64748b;
`;

const VehicleInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const VehicleName = styled.div`
    font-weight: 600;
    color: #1e293b;
`;

const LicensePlate = styled.div`
    font-size: 12px;
    color: #64748b;
    font-family: 'Courier New', monospace;
    background: rgba(241, 245, 249, 0.8);
    padding: 4px 8px;
    border-radius: 8px;
    width: fit-content;
    font-weight: 600;
    letter-spacing: 0.05em;
`;

const StatusBadge = styled.div<{ color: string }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: ${props => props.color}20;
    color: ${props => props.color};
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    width: fit-content;
    letter-spacing: 0.05em;
    border: 1px solid ${props => props.color}30;
`;

const SessionActions = styled.div`
    display: flex;
    gap: 8px;
`;

const SessionActionButton = styled.button<{ danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    ${props => props.danger ? `
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        
        &:hover {
            background: #ef4444;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(239, 68, 68, 0.3);
        }
    ` : `
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        
        &:hover {
            background: #3b82f6;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);
        }
    `}
`;

// Modal Styles
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(12px);
`;

const Modal = styled.div`
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 24px;
    box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.8);
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    backdrop-filter: blur(20px);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32px 32px 0;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
`;

const ModalTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.01em;

    svg {
        color: #3b82f6;
        font-size: 32px;
    }
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 50%;
    background: rgba(241, 245, 249, 0.8);
    color: #64748b;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        background: #ef4444;
        color: white;
        transform: scale(1.1);
        box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
    }
`;

const ModalContent = styled.div`
    padding: 32px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
`;

const SignatureForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 4px;
`;

const Input = styled.input`
    padding: 16px 20px;
    border: 2px solid rgba(226, 232, 240, 0.8);
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);

    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        background: rgba(255, 255, 255, 1);
    }

    &::placeholder {
        color: #94a3b8;
    }
`;

const Select = styled.select`
    padding: 16px 20px;
    border: 2px solid rgba(226, 232, 240, 0.8);
    border-radius: 12px;
    font-size: 16px;
    background: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);

    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        background: rgba(255, 255, 255, 1);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const TextArea = styled.textarea`
    padding: 16px 20px;
    border: 2px solid rgba(226, 232, 240, 0.8);
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    resize: vertical;
    min-height: 100px;
    font-family: inherit;

    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        background: rgba(255, 255, 255, 1);
    }

    &::placeholder {
        color: #94a3b8;
    }
`;

const ModalActions = styled.div`
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid rgba(226, 232, 240, 0.8);
`;

const Button = styled.button<{ primary?: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 32px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    ${props => props.primary ? `
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        box-shadow: 0 4px 14px rgba(59, 130, 246, 0.39);
        
        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
        }
    ` : `
        background: rgba(241, 245, 249, 0.8);
        color: #64748b;
        border: 1px solid rgba(226, 232, 240, 0.8);
        
        &:hover {
            background: rgba(226, 232, 240, 0.8);
            color: #475569;
            transform: translateY(-1px);
        }
    `}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
    }

    .spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

export default TabletManagementDashboard;