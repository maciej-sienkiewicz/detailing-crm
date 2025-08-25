import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaBan, FaCheckSquare, FaEdit, FaFilePdf, FaKey, FaRedo } from 'react-icons/fa';
import {protocolsApi} from "../../../api/protocolsApi";
import {Comment, commentsApi} from "../../../api/commentsApi";
import {CarReceptionProtocol, ProtocolStatus, SelectedService} from "../../../types";
import ProtocolSummary from "./components/ProtocolSummary";
import ProtocolComments from "./components/ProtocolComments";
import ProtocolInvoices from "./components/ProtocolInvoices";
import ProtocolVehicleStatus from "./components/ProtocolVehicleStatus";
import ProtocolGallery from "./components/ProtocolGallery";
import ProtocolHeader from "./components/ProtocolHeader";
import ProtocolStatusTimeline from "./components/ProtocolStatusTimeline";
import ProtocolTabs from "./components/ProtocolTabs";
import QualityVerificationModal from "./modals/QualityVerificationModal";
import CustomerNotificationModal from "./modals/CustomerNotificationModal";
import ClientCommentsModal from "./modals/ClientCommentsModal";
import PaymentModal from "./modals/PaymentModal";
import PDFViewer from "../../../components/PdfViewer";
import CancelProtocolModal, {CancellationReason} from "../shared/components/CancelProtocolModal";
import RestoreProtocolModal, { RestoreOption } from "../shared/components/RestoreProtocolModal";
import RescheduleProtocolModal from "../shared/components/RescheduleProtocolModal";
import {format} from "date-fns";
import {pl} from "date-fns/locale";

// Brand Theme System - Automotive Premium
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.06))',

    // Professional Color Palette
    surface: '#ffffff',
    surfaceElevated: '#fafbfc',
    surfaceHover: '#f8fafc',

    // Typography
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',

    // Borders & Dividers
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    divider: '#e5e7eb',

    // Status Colors
    success: '#059669',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',

    // Shadows
    shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

    // Spacing
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
        full: '9999px'
    }
};

// Define tab types
type TabType = 'summary' | 'comments' | 'invoices' | 'client' | 'vehicle' | 'gallery';

const ProtocolDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [protocol, setProtocol] = useState<CarReceptionProtocol | null>(null);
    const [comments, setComments] = useState<Comment[] | null>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('summary');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const isCancelled = protocol?.status === ProtocolStatus.CANCELLED;
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);

    // Stany dla modali
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);

    // Stany dla procesu wydania samochodu
    const [showClientCommentsModal, setShowClientCommentsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Stan do obsługi podglądu PDF
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    const handleRestoreProtocol = (option: RestoreOption) => {
        setShowRestoreModal(false);

        if (!protocol) return;

        if (option === 'SCHEDULED') {
            setShowRescheduleModal(true);
        } else if (option === 'REALTIME') {
            navigate(`/visits/${protocol.id}/open?restoreFromCancelled=true`);
        }
    };

    const handleRescheduleConfirm = async (dates: { startDate: string; endDate: string }) => {
        try {
            setShowRescheduleModal(false);

            if (!protocol) return;

            const updatedProtocol = {
                ...protocol,
                status: ProtocolStatus.SCHEDULED,
                startDate: dates.startDate,
                endDate: dates.endDate,
                statusUpdatedAt: new Date().toISOString()
            };

            const result = await protocolsApi.restoreProtocol(protocol.id, {
                newStatus: ProtocolStatus.SCHEDULED,
                newStartDate: dates.startDate,
                newEndDate: dates.endDate
            });

            if (result) {
                setProtocol(result);
                alert('Wizyta została przywrócona i zaplanowana na nowy termin');
            } else {
                const updatedResult = await protocolsApi.updateProtocol(updatedProtocol);

                if (updatedResult) {
                    setProtocol(updatedResult);
                    alert('Wizyta została przywrócona i zaplanowana na nowy termin');
                } else {
                    throw new Error('Nie udało się przywrócić wizyty');
                }
            }
        } catch (error) {
            console.error('Błąd podczas przywracania protokołu z nową datą:', error);
            alert('Wystąpił błąd podczas przywracania wizyty');
        }
    };

    const handleCancelProtocol = async (reason: CancellationReason) => {
        try {

            if (!protocol) return;

            await protocolsApi.updateProtocolStatus(protocol!!.id, ProtocolStatus.CANCELLED, reason);

            setProtocol({
                ...protocol,
                status: ProtocolStatus.CANCELLED,
                statusUpdatedAt: new Date().toISOString()
            });

            setShowCancelModal(false);
            alert('Protokół został anulowany');
        } catch (error) {
            console.error('Błąd podczas anulowania protokołu:', error);
            alert('Wystąpił błąd podczas anulowania protokołu');
        }
    };

    // Load protocol data
    useEffect(() => {
        const loadProtocol = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const data = await protocolsApi.getProtocolDetails(id);
                const comments = await commentsApi.getComments(id)

                if (!data) {
                    setError('Protokół nie został znaleziony.');
                    return;
                }

                setProtocol(data);
                setComments(comments)
                setError(null);
            } catch (err) {
                setError('Wystąpił błąd podczas ładowania protokołu.');
                console.error('Error loading protocol:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProtocol();
    }, [id]);

    // Handle status change
    const handleStatusChange = (newStatus: ProtocolStatus) => {
        if (!protocol) return;

        setProtocol({
            ...protocol,
            status: newStatus,
            statusUpdatedAt: new Date().toISOString(),
        });
    };

    // Go back to protocols list
    const handleGoBack = () => {
        navigate('/visits');
    };

    // Update protocol data after changes
    const handleProtocolUpdate = (updatedProtocol: CarReceptionProtocol) => {
        console.log('Protokół zaktualizowany:', updatedProtocol);
        setProtocol(updatedProtocol);
    };

    // Handle finish order
    const handleFinishOrder = () => {
        setShowVerificationModal(true);
    };

    // Handle quality verified
    const handleQualityVerified = () => {
        setShowVerificationModal(false);
        setShowNotificationModal(true);
    };

    // Handle notification selection
    const handleNotificationSelection = async (notificationOptions: {
        sendSms: boolean;
        sendEmail: boolean;
    }) => {
        setShowNotificationModal(false);
        handleStatusChange(ProtocolStatus.READY_FOR_PICKUP);

        try {
            await protocolsApi.updateProtocolStatus(protocol!.id, ProtocolStatus.READY_FOR_PICKUP);
        } catch (error) {
            console.error('Błąd podczas aktualizacji statusu w API:', error);
        }

        if (notificationOptions.sendSms) {
            console.log('Wysyłanie SMS do klienta:', protocol?.phone);
        }

        if (notificationOptions.sendSms || notificationOptions.sendEmail) {
            console.log('Dodanie informacji o powiadomieniu do historii protokołu');
        }
    };

    // Check if finish order button should be available
    const canFinishOrder = protocol?.status === ProtocolStatus.IN_PROGRESS;
    const canReleaseVehicle = protocol?.status === ProtocolStatus.READY_FOR_PICKUP;
    const isScheduled = protocol?.status === ProtocolStatus.SCHEDULED;

    // Handle vehicle release
    const handleReleaseVehicle = () => {
        if(comments != null && comments.filter(c => c.type === 'CUSTOMER').length > 0) {
            setShowClientCommentsModal(true);
        } else {
            setShowPaymentModal(true);
        }
    };

    // Handle client comments modal close
    const handleClientCommentsModalClose = () => {
        setShowClientCommentsModal(false);
        setShowPaymentModal(true);
    };

    // Handle payment confirm
// Zaktualizowana funkcja handlePaymentConfirm do wstawienia w ProtocolDetailsPage.tsx

    const handlePaymentConfirm = async (paymentData: {
        paymentMethod: 'cash' | 'card' | 'transfer';
        documentType: 'invoice' | 'receipt' | 'other';
        paymentDays?: number;
        overridenItems?: SelectedService[];
    }) => {
        try {
            setShowPaymentModal(false);

            const releaseData = {
                paymentMethod: paymentData.paymentMethod,
                documentType: paymentData.documentType,
                ...(paymentData.paymentDays ? { paymentDays: paymentData.paymentDays } : {}),
                ...(paymentData.overridenItems ? { overridenItems: paymentData.overridenItems } : {})
            };

            console.log('Release data being sent to API:', releaseData);

            const result = await protocolsApi.releaseVehicle(protocol!.id, releaseData);

            if (result) {
                setProtocol(result);
            } else {
                // Fallback - aktualizujemy lokalnie jeśli API nie zwraca zaktualizowanego protokołu
                const updatedProtocol = { ...protocol! };
                updatedProtocol.status = ProtocolStatus.COMPLETED;
                updatedProtocol.statusUpdatedAt = new Date().toISOString();

                setProtocol(updatedProtocol);

                await protocolsApi.updateProtocolStatus(protocol!.id, ProtocolStatus.COMPLETED);
            }

            alert('Pojazd został wydany klientowi');
        } catch (error) {
            console.error('Błąd podczas wydawania pojazdu:', error);
            alert('Wystąpił błąd podczas wydawania pojazdu');
        }
    };

    const handleServiceItemsChange = async (services: SelectedService[]) => {
        if (!protocol) return;

        try {
            const updatedProtocol: CarReceptionProtocol = {
                ...protocol,
                selectedServices: services
            };

            setProtocol(updatedProtocol);

            const result = await protocolsApi.updateProtocol(updatedProtocol);

            if (result) {
                setProtocol(result);
            }
        } catch (error) {
            console.error('Błąd podczas aktualizacji protokołu:', error);
            setProtocol(protocol);
        }
    };

    // Render tab content
    const renderTabContent = () => {
        if (!protocol) {
            return <EmptyTabContent>Brak danych protokołu</EmptyTabContent>;
        }

        switch (activeTab) {
            case 'summary':
                return <ProtocolSummary protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
            case 'comments':
                return <ProtocolComments protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
            case 'invoices':
                return <ProtocolInvoices protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
            case 'vehicle':
                return <ProtocolVehicleStatus protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
            case 'gallery':
                return <ProtocolGallery protocol={protocol} onProtocolUpdate={handleProtocolUpdate} disabled={protocol.status === ProtocolStatus.CANCELLED} />;
            default:
                return <ProtocolSummary protocol={protocol} onProtocolUpdate={handleProtocolUpdate} />;
        }
    };

    if (loading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Ładowanie danych wizyty...</LoadingText>
            </LoadingContainer>
        );
    }

    if (error || !protocol) {
        return (
            <ErrorContainer>
                <ErrorCard>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorMessage>{error || 'Nie znaleziono protokołu.'}</ErrorMessage>
                    <BackButton onClick={handleGoBack}>
                        <FaArrowLeft />
                        <span>Wróć do listy wizyt</span>
                    </BackButton>
                </ErrorCard>
            </ErrorContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderLeft>
                    <BackButton onClick={handleGoBack}>
                        <FaArrowLeft />
                    </BackButton>
                    <HeaderContent>
                        <HeaderTitle>Wizyta #{protocol.id}</HeaderTitle>
                        <HeaderSubtitle>{protocol.make} {protocol.model} • {protocol.licensePlate}</HeaderSubtitle>
                        <HeaderSubtitle>Planowany czas zakończenia: { format(new Date(protocol.endDate), 'yyyy-MM-dd HH:mm', { locale: pl })}</HeaderSubtitle>
                    </HeaderContent>
                </HeaderLeft>

                <HeaderActions>
                    {canFinishOrder && (
                        <PrimaryActionButton onClick={handleFinishOrder} variant="success">
                            <FaCheckSquare />
                            <span>Zakończ wizytę</span>
                        </PrimaryActionButton>
                    )}

                    {canReleaseVehicle && (
                        <PrimaryActionButton onClick={handleReleaseVehicle} variant="warning">
                            <FaKey />
                            <span>Wydaj samochód</span>
                        </PrimaryActionButton>
                    )}

                    {protocol.status == ProtocolStatus.SCHEDULED && (
                        <SecondaryActionButton onClick={() => navigate(`/visits`, {
                            state: { editProtocolId: protocol.id }
                        })}>
                            <FaEdit />
                            <span>Edytuj</span>
                        </SecondaryActionButton>
                    )}

                    {isScheduled && (
                        <PrimaryActionButton onClick={() => navigate(`/visits/${protocol.id}/open`)} variant="primary">
                            <FaEdit />
                            <span>Rozpocznij wizytę</span>
                        </PrimaryActionButton>
                    )}

                    {!isScheduled && (
                        <SecondaryActionButton onClick={() => setShowPdfPreview(true)}>
                            <FaFilePdf />
                            <span>Drukuj protokół</span>
                        </SecondaryActionButton>
                    )}

                    {!isCancelled && (
                        <DangerActionButton onClick={() => setShowCancelModal(true)}>
                            <FaBan />
                            <span>Anuluj wizytę</span>
                        </DangerActionButton>
                    )}

                    {isCancelled && (
                        <RestoreActionButton onClick={() => setShowRestoreModal(true)}>
                            <FaRedo />
                            <span>Przywróć wizytę</span>
                        </RestoreActionButton>
                    )}
                </HeaderActions>
            </PageHeader>

            <MainContent>
                <ContentSection>
                    <ProtocolTabs activeTab={activeTab} onChange={setActiveTab} />
                    <TabContentContainer>
                        {renderTabContent()}
                    </TabContentContainer>
                </ContentSection>
            </MainContent>

            {/* Modals */}
            <QualityVerificationModal
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                onConfirm={handleQualityVerified}
                protocol={protocol}
            />

            <CustomerNotificationModal
                isOpen={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
                onConfirm={handleNotificationSelection}
                customerPhone={protocol?.phone}
                customerEmail={protocol?.email}
            />

            <ClientCommentsModal
                isOpen={showClientCommentsModal}
                onClose={handleClientCommentsModalClose}
                comments={comments}
            />

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onConfirm={handlePaymentConfirm}
                totalAmount={protocol?.selectedServices.reduce((sum, s) => sum + s.finalPrice, 0) || 0}
                services={protocol?.selectedServices || []}
                onServicesChange={handleServiceItemsChange}
                protocolId={protocol.id}
                customerName={protocol?.ownerName}
                customerEmail={protocol?.email}
            />

            {showPdfPreview && protocol && (
                <PDFViewer
                    protocolId={protocol.id}
                    onClose={() => setShowPdfPreview(false)}
                    title={`Protokół przyjęcia pojazdu #${protocol.id}`}
                />
            )}

            {showCancelModal && (
                <CancelProtocolModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={handleCancelProtocol}
                    protocolId={protocol.id}
                />
            )}

            {showRestoreModal && (
                <RestoreProtocolModal
                    isOpen={showRestoreModal}
                    onClose={() => setShowRestoreModal(false)}
                    onRestore={handleRestoreProtocol}
                    protocolId={protocol.id}
                />
            )}

            {showRescheduleModal && (
                <RescheduleProtocolModal
                    isOpen={showRescheduleModal}
                    onClose={() => setShowRescheduleModal(false)}
                    onConfirm={handleRescheduleConfirm}
                    protocolId={protocol.id}
                />
            )}
        </PageContainer>
    );
};

// Professional Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${brandTheme.surfaceElevated};
`;

const PageHeader = styled.header`
    position: sticky;
    top: 0;
    z-index: 100;
    background: ${brandTheme.surface};
    border-bottom: 1px solid ${brandTheme.border};
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: ${brandTheme.shadowSm};

    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${brandTheme.spacing.lg};

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
        flex-direction: column;
        align-items: flex-start;
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

const BackButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: ${brandTheme.surfaceHover};
    border: 1px solid ${brandTheme.borderLight};
    border-radius: ${brandTheme.radius.md};
    color: ${brandTheme.textSecondary};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;

    &:hover {
        background: ${brandTheme.primaryGhost};
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadowMd};
    }

    &:active {
        transform: translateY(0);
    }

    span {
        margin-left: ${brandTheme.spacing.sm};
        font-weight: 500;
        font-size: 14px;

        @media (max-width: 768px) {
            display: none;
        }
    }
`;

const HeaderContent = styled.div`
    min-width: 0;
    flex: 1;
`;

const HeaderTitle = styled.h1`
    font-size: 28px;
    font-weight: 700;
    color: ${brandTheme.textPrimary};
    margin: 0;
    letter-spacing: -0.025em;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

const HeaderSubtitle = styled.div`
    font-size: 16px;
    color: ${brandTheme.textSecondary};
    margin-top: ${brandTheme.spacing.xs};
    font-weight: 500;

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
        width: 100%;
        justify-content: flex-start;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${brandTheme.spacing.xs};

        > * {
            width: 100%;
        }
    }
`;

const BaseActionButton = styled.button`
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

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadowMd};
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    span {
        @media (max-width: 480px) {
            display: none;
        }
    }
`;

const PrimaryActionButton = styled(BaseActionButton)<{ variant?: 'primary' | 'success' | 'warning' }>`
    background: ${props => {
        switch (props.variant) {
            case 'success': return brandTheme.success;
            case 'warning': return brandTheme.warning;
            default: return brandTheme.primary;
        }
    }};
    color: white;
    border-color: ${props => {
        switch (props.variant) {
            case 'success': return brandTheme.success;
            case 'warning': return brandTheme.warning;
            default: return brandTheme.primary;
        }
    }};

    &:hover {
        background: ${props => {
            switch (props.variant) {
                case 'success': return '#0d9668';
                case 'warning': return '#d97706';
                default: return brandTheme.primaryDark;
            }
        }};
    }
`;

const SecondaryActionButton = styled(BaseActionButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.textSecondary};
    border-color: ${brandTheme.border};

    &:hover {
        background: ${brandTheme.surfaceHover};
        color: ${brandTheme.textPrimary};
        border-color: ${brandTheme.primary};
    }
`;

const DangerActionButton = styled(BaseActionButton)`
    background: ${brandTheme.surface};
    color: ${brandTheme.error};
    border-color: ${brandTheme.error};

    &:hover {
        background: ${brandTheme.errorLight};
        color: #dc2626;
    }
`;

const RestoreActionButton = styled(BaseActionButton)`
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    border-color: ${brandTheme.primary};

    &:hover {
        background: ${brandTheme.primary};
        color: white;
    }
`;

const MainContent = styled.main`
    padding: ${brandTheme.spacing.xl};
    max-width: 1600px;
    margin: 0 auto;

    @media (max-width: 1024px) {
        padding: ${brandTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.md};
    }
`;

const ContentSection = styled.section`
    min-width: 0;
`;

const TabContentContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: 0 0 ${brandTheme.radius.lg} ${brandTheme.radius.lg};
    box-shadow: ${brandTheme.shadowMd};
    padding: ${brandTheme.spacing.xl};
    border: 1px solid ${brandTheme.border};
    border-top: none;

    @media (max-width: 768px) {
        padding: ${brandTheme.spacing.lg};
        border-radius: 0 0 ${brandTheme.radius.md} ${brandTheme.radius.md};
    }

    @media (max-width: 480px) {
        padding: ${brandTheme.spacing.md};
    }
`;

const EmptyTabContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${brandTheme.spacing.xxl};
    color: ${brandTheme.textMuted};
    font-size: 16px;
    text-align: center;
    background: ${brandTheme.surfaceElevated};
    border-radius: ${brandTheme.radius.md};
    border: 2px dashed ${brandTheme.borderLight};
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surfaceElevated};
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${brandTheme.borderLight};
    border-top: 3px solid ${brandTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: ${brandTheme.spacing.lg};

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${brandTheme.textSecondary};
    font-weight: 500;
`;

const ErrorContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: ${brandTheme.spacing.xxl};
    background: ${brandTheme.surfaceElevated};
`;

const ErrorCard = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    padding: ${brandTheme.spacing.xxl};
    box-shadow: ${brandTheme.shadowLg};
    border: 1px solid ${brandTheme.border};
    text-align: center;
    max-width: 500px;
    width: 100%;
`;

const ErrorIcon = styled.div`
    font-size: 64px;
    margin-bottom: ${brandTheme.spacing.lg};
`;

const ErrorMessage = styled.div`
    font-size: 18px;
    color: ${brandTheme.textSecondary};
    margin-bottom: ${brandTheme.spacing.xl};
    line-height: 1.5;
`;

export default ProtocolDetailsPage;