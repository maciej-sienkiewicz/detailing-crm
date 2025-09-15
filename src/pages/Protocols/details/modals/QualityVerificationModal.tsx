import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaCheck, FaCheckCircle, FaClipboardCheck, FaTimes} from 'react-icons/fa';
import {CarReceptionProtocol} from "../../../../types";

// Professional Corporate Theme
const corporateTheme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    surface: '#ffffff',
    surfaceElevated: '#fafbfc',
    surfaceHover: '#f8fafc',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    status: {
        success: '#059669',
        successLight: '#f0fdf4',
        successBorder: '#bbf7d0',
        info: '#0369a1',
        infoLight: '#f0f9ff',
        infoBorder: '#bae6fd',
        warning: '#d97706',
        warningLight: '#fffbeb'
    },
    shadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px'
    }
};

interface QualityVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    protocol: CarReceptionProtocol;
}

const QualityVerificationModal: React.FC<QualityVerificationModalProps> = ({
                                                                               isOpen,
                                                                               onClose,
                                                                               onConfirm,
                                                                               protocol
                                                                           }) => {
    const [hasPendingServices, setHasPendingServices] = useState(false);
    const [pendingServicesCount, setPendingServicesCount] = useState(0);

    useEffect(() => {
        if (protocol && protocol.selectedServices) {
            const pendingServices = protocol.selectedServices.filter(
                service => service.approvalStatus === 'PENDING'
            );
            setHasPendingServices(pendingServices.length > 0);
            setPendingServicesCount(pendingServices.length);
        }
    }, [protocol]);

    if (!isOpen) return null;

    const canProceed = !hasPendingServices;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <DocumentIcon>
                            <FaClipboardCheck />
                        </DocumentIcon>
                        <HeaderText>
                            <ModalTitle>Weryfikacja jakości</ModalTitle>
                            <ModalSubtitle>Kontrola przed zmianą statusu na "Gotowe do odbioru"</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <StatusSection>
                        <StatusIndicator>
                            <StatusIcon>
                                <FaClipboardCheck />
                            </StatusIcon>
                            <StatusMessage>
                                Przeprowadź weryfikację jakości przed zmianą statusu zlecenia.
                            </StatusMessage>
                        </StatusIndicator>
                    </StatusSection>

                    {hasPendingServices && (
                        <ErrorSection>
                            <ErrorMessage>
                                Wykryto {pendingServicesCount} usług oczekujących na zatwierdzenie.
                                Zatwierdź lub usuń wszystkie oczekujące usługi przed kontynuacją.
                            </ErrorMessage>
                        </ErrorSection>
                    )}

                    <QualityGuidelinesSection>
                        <SectionTitle>
                            Wytyczne kontroli jakości
                        </SectionTitle>

                        <GuidelinesList>
                            <GuidelineItem>
                                <GuidelineIcon>
                                    <FaCheckCircle />
                                </GuidelineIcon>
                                <GuidelineContent>
                                    <GuidelineTitle>Zgodność z zakresem usługi</GuidelineTitle>
                                    <GuidelineDescription>
                                        Sprawdź czy wszystkie zamówione usługi zostały wykonane zgodnie z umową
                                    </GuidelineDescription>
                                </GuidelineContent>
                            </GuidelineItem>

                            <GuidelineItem>
                                <GuidelineIcon>
                                    <FaCheckCircle />
                                </GuidelineIcon>
                                <GuidelineContent>
                                    <GuidelineTitle>Jakość wykonania</GuidelineTitle>
                                    <GuidelineDescription>
                                        Upewnij się że praca została wykonana starannie bez widocznych niedokładności
                                    </GuidelineDescription>
                                </GuidelineContent>
                            </GuidelineItem>

                            <GuidelineItem>
                                <GuidelineIcon>
                                    <FaCheckCircle />
                                </GuidelineIcon>
                                <GuidelineContent>
                                    <GuidelineTitle>Stan pojazdu</GuidelineTitle>
                                    <GuidelineDescription>
                                        Sprawdź czy pojazd nie posiada dodatkowych uszkodzeń powstałych podczas prac
                                    </GuidelineDescription>
                                </GuidelineContent>
                            </GuidelineItem>
                        </GuidelinesList>
                    </QualityGuidelinesSection>

                    {!canProceed ? (
                        <InfoSection>
                            <InfoMessage>
                                Zatwierdź wszystkie usługi przed kontynuacją weryfikacji jakości.
                            </InfoMessage>
                        </InfoSection>
                    ) : (
                        <SuccessSection>
                            <SuccessMessage>
                                Wszystkie wymagania zostały spełnione. Zlecenie może zostać oznaczone jako gotowe do odbioru.
                            </SuccessMessage>
                        </SuccessSection>
                    )}
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <SecondaryButton onClick={onClose}>
                            Wymaga poprawek
                        </SecondaryButton>
                        <PrimaryButton onClick={onConfirm} disabled={!canProceed}>
                            <FaCheck />
                            Zatwierdzam jakość
                        </PrimaryButton>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.15s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: ${corporateTheme.surface};
    border-radius: ${corporateTheme.radius.lg};
    box-shadow: ${corporateTheme.shadow.elevated};
    width: 580px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${corporateTheme.border};
    animation: slideUp 0.2s ease-out;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const ModalHeader = styled.div`
    padding: ${corporateTheme.spacing.lg} ${corporateTheme.spacing.xl};
    border-bottom: 1px solid ${corporateTheme.border};
    background: ${corporateTheme.surfaceElevated};
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.md};
`;

const DocumentIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${corporateTheme.primary}15;
    color: ${corporateTheme.primary};
    border-radius: ${corporateTheme.radius.md};
    font-size: 18px;
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.xs};
`;

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
    letter-spacing: -0.01em;
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${corporateTheme.text.secondary};
    font-weight: 400;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${corporateTheme.surfaceHover};
    border: 1px solid ${corporateTheme.border};
    border-radius: ${corporateTheme.radius.sm};
    color: ${corporateTheme.text.muted};
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: #fef2f2;
        border-color: #dc2626;
        color: #dc2626;
    }
`;

const ModalBody = styled.div`
    padding: ${corporateTheme.spacing.xl};
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.lg};
`;

const StatusSection = styled.div`
    background: ${corporateTheme.status.successLight};
    border: 1px solid ${corporateTheme.status.successBorder};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const StatusIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.sm};
`;

const StatusIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: ${corporateTheme.status.success};
    color: white;
    border-radius: 50%;
    font-size: 11px;
    flex-shrink: 0;
`;

const StatusMessage = styled.span`
    font-size: 14px;
    color: ${corporateTheme.status.success};
    font-weight: 500;
`;

const ErrorSection = styled.div`
    background: ${corporateTheme.status.warningLight};
    border: 1px solid ${corporateTheme.status.warning};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const ErrorMessage = styled.div`
    color: ${corporateTheme.status.warning};
    font-size: 14px;
    font-weight: 500;
`;

const QualityGuidelinesSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.md};
`;

const SectionTitle = styled.h3`
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
`;

const GuidelinesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.md};
`;

const GuidelineItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${corporateTheme.spacing.md};
    padding: ${corporateTheme.spacing.md};
    background: ${corporateTheme.surface};
    border: 1px solid ${corporateTheme.border};
    border-radius: ${corporateTheme.radius.md};
`;

const GuidelineIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: ${corporateTheme.status.success};
    color: white;
    border-radius: 50%;
    font-size: 12px;
    flex-shrink: 0;
    margin-top: 2px;
`;

const GuidelineContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.xs};
`;

const GuidelineTitle = styled.h4`
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
    line-height: 1.4;
`;

const GuidelineDescription = styled.p`
    margin: 0;
    font-size: 13px;
    color: ${corporateTheme.text.secondary};
    line-height: 1.4;
`;

const InfoSection = styled.div`
    background: ${corporateTheme.status.infoLight};
    border: 1px solid ${corporateTheme.status.infoBorder};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const InfoMessage = styled.div`
    font-size: 13px;
    color: ${corporateTheme.status.info};
    font-weight: 500;
    line-height: 1.4;
`;

const SuccessSection = styled.div`
    background: ${corporateTheme.status.successLight};
    border: 1px solid ${corporateTheme.status.successBorder};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const SuccessMessage = styled.div`
    font-size: 13px;
    color: ${corporateTheme.status.success};
    font-weight: 500;
    line-height: 1.4;
`;

const ModalFooter = styled.div`
    padding: ${corporateTheme.spacing.lg} ${corporateTheme.spacing.xl};
    border-top: 1px solid ${corporateTheme.border};
    background: ${corporateTheme.surfaceElevated};
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${corporateTheme.spacing.sm};
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.sm};
    padding: ${corporateTheme.spacing.sm} ${corporateTheme.spacing.md};
    background: ${corporateTheme.surface};
    color: ${corporateTheme.text.secondary};
    border: 1px solid ${corporateTheme.border};
    border-radius: ${corporateTheme.radius.sm};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    min-height: 40px;
    min-width: 80px;

    &:hover {
        background: ${corporateTheme.surfaceHover};
        border-color: ${corporateTheme.text.muted};
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${corporateTheme.spacing.sm};
    padding: ${corporateTheme.spacing.sm} ${corporateTheme.spacing.lg};
    background: ${corporateTheme.primary};
    color: white;
    border: 1px solid ${corporateTheme.primary};
    border-radius: ${corporateTheme.radius.sm};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    min-height: 40px;
    min-width: 120px;

    &:hover:not(:disabled) {
        background: ${corporateTheme.primaryLight};
        border-color: ${corporateTheme.primaryLight};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${corporateTheme.text.muted};
        border-color: ${corporateTheme.text.muted};
    }
`;

export default QualityVerificationModal;