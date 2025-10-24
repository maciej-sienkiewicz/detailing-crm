import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';
import {FaBan, FaCheckSquare, FaEdit, FaFilePdf, FaKey, FaRedo} from 'react-icons/fa';
import {protocolsApi} from "../../../api/protocolsApi";
import {Comment, commentsApi} from "../../../api/commentsApi";
import {CarReceptionProtocol, ProtocolStatus, SelectedService} from "../../../types";
import ProtocolSummary from "./components/ProtocolSummary";
import ProtocolComments from "./components/ProtocolComments";
import ProtocolInvoices from "./components/ProtocolInvoices";
import ProtocolVehicleStatus from "./components/ProtocolVehicleStatus";
import ProtocolGallery from "./components/ProtocolGallery";
import ProtocolTabs from "./components/ProtocolTabs";
import QualityVerificationModal from "./modals/QualityVerificationModal";
import CustomerNotificationModal from "./modals/CustomerNotificationModal";
import ClientCommentsModal from "./modals/ClientCommentsModal";
import PaymentModal from "./modals/PaymentModal";
import SuccessModal from "./modals/SuccessModal";
import PDFViewer from "../../../components/PdfViewer";
import CancelProtocolModal, {CancellationReason} from "../shared/components/CancelProtocolModal";
import RestoreProtocolModal, {RestoreOption} from "../shared/components/RestoreProtocolModal";
import RescheduleProtocolModal from "../shared/components/RescheduleProtocolModal";
import {format} from "date-fns";
import {pl} from "date-fns/locale";
import {FaCarSide, FaClipboardCheck} from 'react-icons/fa';
import LoadingOverlay from "./components/LoadingOverlay";
import {PageHeader, PrimaryButton, SecondaryButton} from '../../../components/common/PageHeader';
import {theme} from '../../../styles/theme';

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

    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showClientCommentsModal, setShowClientCommentsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successModalData, setSuccessModalData] = useState<{
        title: string;
        message: string;
        icon?: React.ReactNode;
    }>({
        title: '',
        message: ''
    });

    const [isReleasing, setIsReleasing] = useState(false);

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
                setSuccessModalData({
                    title: 'Wizyta przywrócona',
                    message: 'Wizyta została przywrócona i zaplanowana na nowy termin.',
                    icon: <FaCheckSquare />
                });
                setShowSuccessModal(true);
            } else {
                const updatedResult = await protocolsApi.updateProtocol(updatedProtocol);
                if (updatedResult) {
                    setProtocol(updatedResult);
                    setSuccessModalData({
                        title: 'Wizyta przywrócona',
                        message: 'Wizyta została przywrócona i zaplanowana na nowy termin.',
                        icon: <FaCheckSquare />
                    });
                    setShowSuccessModal(true);
                } else {
                    throw new Error('Nie udało się przywrócić wizyty');
                }
            }
        } catch (error) {
            console.error('Błąd podczas przywracania protokołu z nową datą:', error);
            setSuccessModalData({
                title: 'Błąd',
                message: 'Wystąpił błąd podczas przywracania wizyty. Spróbuj ponownie.',
                icon: <FaBan />
            });
            setShowSuccessModal(true);
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
            setSuccessModalData({
                title: 'Wizyta anulowana',
                message: 'Protokół został pomyślnie anulowany.',
                icon: <FaBan />
            });
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Błąd podczas anulowania protokołu:', error);
            setSuccessModalData({
                title: 'Błąd',
                message: 'Wystąpił błąd podczas anulowania protokołu. Spróbuj ponownie.',
                icon: <FaBan />
            });
            setShowSuccessModal(true);
        }
    };

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

    const handleStatusChange = (newStatus: ProtocolStatus) => {
        if (!protocol) return;
        setProtocol({
            ...protocol,
            status: newStatus,
            statusUpdatedAt: new Date().toISOString(),
        });
    };

    const handleGoBack = () => {
        navigate('/visits');
    };

    const handleProtocolUpdate = (updatedProtocol: CarReceptionProtocol) => {
        setProtocol(updatedProtocol);
    };

    const handleFinishOrder = () => {
        setShowVerificationModal(true);
    };

    const handleQualityVerified = () => {
        setShowVerificationModal(false);
        setShowNotificationModal(true);
    };

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
    };

    const canFinishOrder = protocol?.status === ProtocolStatus.IN_PROGRESS;
    const canReleaseVehicle = protocol?.status === ProtocolStatus.READY_FOR_PICKUP;
    const isScheduled = protocol?.status === ProtocolStatus.SCHEDULED;

    const handleReleaseVehicle = () => {
        if(comments != null && comments.filter(c => c.type === 'CUSTOMER').length > 0) {
            setShowClientCommentsModal(true);
        } else {
            setShowPaymentModal(true);
        }
    };

    const handleClientCommentsModalClose = () => {
        setShowClientCommentsModal(false);
        setShowPaymentModal(true);
    };

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
            setIsReleasing(true);
            const result = await protocolsApi.releaseVehicle(protocol!.id, releaseData);
            setIsReleasing(false);
            if (result) {
                setProtocol(result);
            } else {
                const updatedProtocol = { ...protocol! };
                updatedProtocol.status = ProtocolStatus.COMPLETED;
                updatedProtocol.statusUpdatedAt = new Date().toISOString();
                setProtocol(updatedProtocol);
                await protocolsApi.updateProtocolStatus(protocol!.id, ProtocolStatus.COMPLETED);
            }
            setSuccessModalData({
                title: 'Pojazd został wydany',
                message: 'Pojazd został pomyślnie wydany klientowi. Wizyta została zakończona.',
                icon: <FaCarSide />
            });
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Błąd podczas wydawania pojazdu:', error);
            setSuccessModalData({
                title: 'Błąd',
                message: 'Wystąpił błąd podczas wydawania pojazdu. Spróbuj ponownie.',
                icon: <FaBan />
            });
            setShowSuccessModal(true);
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
                    <SecondaryButton onClick={handleGoBack}>
                        Wróć do listy wizyt
                    </SecondaryButton>
                </ErrorCard>
            </ErrorContainer>
        );
    }

    const headerActions = (
        <>
            {canFinishOrder && (
                <PrimaryButton onClick={handleFinishOrder}>
                    <FaCheckSquare />
                    Zakończ wizytę
                </PrimaryButton>
            )}
            {canReleaseVehicle && (
                <PrimaryButton onClick={handleReleaseVehicle}>
                    <FaKey />
                    Wydaj samochód
                </PrimaryButton>
            )}
            {protocol.status == ProtocolStatus.SCHEDULED && (
                <SecondaryButton onClick={() => navigate(`/visits`, {
                    state: { editProtocolId: protocol.id }
                })}>
                    <FaEdit />
                    Edytuj
                </SecondaryButton>
            )}
            {isScheduled && (
                <PrimaryButton onClick={() => navigate(`/visits/${protocol.id}/open`)}>
                    <FaEdit />
                    Rozpocznij wizytę
                </PrimaryButton>
            )}
            {!isScheduled && (
                <PrimaryButton onClick={() => setShowPdfPreview(true)}>
                    <FaFilePdf />
                    Drukuj protokół
                </PrimaryButton>
            )}
            {!isCancelled && (
                <SecondaryButton onClick={() => setShowCancelModal(true)}>
                    <FaBan />
                    Anuluj wizytę
                </SecondaryButton>
            )}
            {isCancelled && (
                <SecondaryButton onClick={() => setShowRestoreModal(true)}>
                    <FaRedo />
                    Przywróć wizytę
                </SecondaryButton>
            )}
        </>
    );

    return (
        <PageContainer>
            <PageHeader
                icon={FaClipboardCheck}
                title={`Wizyta #${protocol.id}`}
                subtitle={`${protocol.make} ${protocol.model} • ${protocol.licensePlate} • Planowany koniec: ${format(new Date(protocol.endDate), 'yyyy-MM-dd HH:mm', { locale: pl })}`}
                actions={headerActions}
            />

            <MainContent>
                <ContentSection>
                    <ProtocolTabs activeTab={activeTab} onChange={setActiveTab} />
                    <TabContentContainer>
                        {renderTabContent()}
                    </TabContentContainer>
                </ContentSection>
            </MainContent>

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

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={successModalData.title}
                message={successModalData.message}
                icon={successModalData.icon}
                buttonText="OK"
            />

            <LoadingOverlay
                isVisible={isReleasing}
                message="Wydawanie pojazdu..."
                icon={<FaCarSide />}
            />
        </PageContainer>
    );
};

const PageContainer = styled.div`
    min-height: 100vh;
    background: ${theme.surfaceHover};
`;

const MainContent = styled.main`
    padding: ${theme.spacing.lg};
    max-width: 1600px;
    margin: 0 auto;
`;

const ContentSection = styled.section`
    min-width: 0;
`;

const TabContentContainer = styled.div`
    background: ${theme.surface};
    border-radius: 0 0 ${theme.radius.md} ${theme.radius.md};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    padding: ${theme.spacing.lg};
    border: 1px solid ${theme.border};
    border-top: none;
`;

const EmptyTabContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxl};
    color: ${theme.text.muted};
    font-size: 13px;
    text-align: center;
    background: ${theme.surfaceElevated};
    border-radius: ${theme.radius.md};
    border: 2px dashed ${theme.borderLight};
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
`;

const LoadingSpinner = styled.div`
    width: 32px;
    height: 32px;
    border: 2px solid ${theme.borderLight};
    border-top: 2px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: ${theme.spacing.md};

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 13px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const ErrorContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: ${theme.spacing.xxl};
    background: ${theme.surfaceElevated};
`;

const ErrorCard = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    padding: ${theme.spacing.xxl};
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid ${theme.border};
    text-align: center;
    max-width: 500px;
    width: 100%;
`;

const ErrorIcon = styled.div`
    font-size: 48px;
    margin-bottom: ${theme.spacing.md};
`;

const ErrorMessage = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    margin-bottom: ${theme.spacing.lg};
    line-height: 1.5;
`;

export default ProtocolDetailsPage;