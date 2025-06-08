import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaCheck, FaTimesCircle, FaTasks, FaClipboardCheck, FaExclamationTriangle, FaBan, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { CarReceptionProtocol } from "../../../../types";

// Professional Brand Theme
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
    },
    transitions: {
        fast: '0.15s ease',
        normal: '0.2s ease',
        slow: '0.3s ease',
        spring: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
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
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    // Lista kontrolna
    const checklistItems = [
        {
            id: 'scope',
            label: 'Zgodność z zakresem usługi',
            description: 'Wszystkie zamówione usługi zostały wykonane zgodnie z umową'
        },
        {
            id: 'quality',
            label: 'Jakość wykonania',
            description: 'Praca została wykonana starannie bez widocznych niedokładności'
        },
        {
            id: 'condition',
            label: 'Stan pojazdu',
            description: 'Pojazd nie posiada dodatkowych uszkodzeń powstałych podczas prac'
        },
        {
            id: 'cleanup',
            label: 'Sprzątanie stanowiska',
            description: 'Stanowisko pracy zostało uporządkowane po zakończeniu'
        }
    ];

    // Sprawdź usługi oczekujące
    useEffect(() => {
        if (protocol && protocol.selectedServices) {
            const pendingServices = protocol.selectedServices.filter(
                service => service.approvalStatus === 'PENDING'
            );
            setHasPendingServices(pendingServices.length > 0);
            setPendingServicesCount(pendingServices.length);
        }
    }, [protocol]);

    // Resetuj checklist przy otwarciu
    useEffect(() => {
        if (isOpen) {
            setCheckedItems({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChecklistChange = (itemId: string, checked: boolean) => {
        setCheckedItems(prev => ({
            ...prev,
            [itemId]: checked
        }));
    };

    const allItemsChecked = checklistItems.every(item => checkedItems[item.id]);
    const canProceed = !hasPendingServices && allItemsChecked;

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon $hasIssues={hasPendingServices}>
                            <FaClipboardCheck />
                        </HeaderIcon>
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
                    <StatusInfo>
                        <StatusIcon>
                            <FaCheckCircle />
                        </StatusIcon>
                        <StatusText>
                            Pracownik zgłosił zakończenie prac. Przeprowadź weryfikację jakości
                            przed zmianą statusu zlecenia na "Oczekiwanie na odbiór".
                        </StatusText>
                    </StatusInfo>

                    {hasPendingServices && (
                        <ErrorSection>
                            <ErrorCard>
                                <ErrorIcon>
                                    <FaBan />
                                </ErrorIcon>
                                <ErrorContent>
                                    <ErrorTitle>Wykryto usługi oczekujące na zatwierdzenie</ErrorTitle>
                                    <ErrorDescription>
                                        Zlecenie zawiera <strong>{pendingServicesCount}</strong> {
                                        pendingServicesCount === 1 ? 'usługę oczekującą' :
                                            pendingServicesCount < 5 ? 'usługi oczekujące' : 'usług oczekujących'
                                    } na potwierdzenie. Przed zmianą statusu należy zatwierdzić
                                        lub usunąć wszystkie oczekujące usługi.
                                    </ErrorDescription>
                                </ErrorContent>
                            </ErrorCard>
                        </ErrorSection>
                    )}

                    <ChecklistSection>
                        <ChecklistHeader>
                            <ChecklistTitle>
                                <FaTasks />
                                Lista kontrolna jakości
                            </ChecklistTitle>
                            <ChecklistProgress>
                                {Object.values(checkedItems).filter(Boolean).length} / {checklistItems.length}
                            </ChecklistProgress>
                        </ChecklistHeader>

                        <ChecklistItems>
                            {checklistItems.map((item) => (
                                <ChecklistItem key={item.id}>
                                    <CheckboxContainer>
                                        <HiddenCheckbox
                                            type="checkbox"
                                            id={item.id}
                                            checked={checkedItems[item.id] || false}
                                            onChange={(e) => handleChecklistChange(item.id, e.target.checked)}
                                        />
                                        <CustomCheckbox $checked={checkedItems[item.id] || false}>
                                            <FaCheck />
                                        </CustomCheckbox>
                                    </CheckboxContainer>
                                    <ItemContent>
                                        <ItemLabel htmlFor={item.id}>
                                            {item.label}
                                        </ItemLabel>
                                        <ItemDescription>
                                            {item.description}
                                        </ItemDescription>
                                    </ItemContent>
                                </ChecklistItem>
                            ))}
                        </ChecklistItems>
                    </ChecklistSection>

                    {!hasPendingServices && !allItemsChecked && (
                        <WarningInfo>
                            <WarningIcon>
                                <FaExclamationTriangle />
                            </WarningIcon>
                            <WarningText>
                                Potwierdź wszystkie punkty listy kontrolnej aby kontynuować
                            </WarningText>
                        </WarningInfo>
                    )}

                    {canProceed && (
                        <SuccessInfo>
                            <SuccessIcon>
                                <FaCheckCircle />
                            </SuccessIcon>
                            <SuccessText>
                                Wszystkie wymagania zostały spełnione. Zlecenie może zostać
                                oznaczone jako gotowe do odbioru.
                            </SuccessText>
                        </SuccessInfo>
                    )}
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={onClose}>
                        <FaTimesCircle />
                        Wymaga poprawek
                    </SecondaryButton>
                    <PrimaryButton onClick={onConfirm} disabled={!canProceed}>
                        <FaCheck />
                        Zatwierdzam - oznacz jako gotowe
                    </PrimaryButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled Components - Professional Automotive CRM Design
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContainer = styled.div`
    background: ${brandTheme.surface};
    border-radius: ${brandTheme.radius.xl};
    box-shadow: ${brandTheme.shadow.xl};
    width: 600px;
    max-width: 95%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
    border-bottom: 2px solid ${brandTheme.border};
    background: ${brandTheme.surfaceAlt};
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.md};
`;

const HeaderIcon = styled.div<{ $hasIssues: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${props => props.$hasIssues ? brandTheme.status.errorLight : brandTheme.status.infoLight};
    color: ${props => props.$hasIssues ? brandTheme.status.error : brandTheme.status.info};
    border-radius: ${brandTheme.radius.lg};
    font-size: 18px;
`;

const HeaderText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: ${brandTheme.text.primary};
    letter-spacing: -0.025em;
`;

const ModalSubtitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    font-weight: 500;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brandTheme.surfaceHover};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.sm};
    color: ${brandTheme.text.muted};
    cursor: pointer;
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        background: ${brandTheme.status.errorLight};
        border-color: ${brandTheme.status.error};
        color: ${brandTheme.status.error};
        transform: translateY(-1px);
    }
`;

const ModalBody = styled.div`
    padding: ${brandTheme.spacing.xl};
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.xl};

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

const StatusInfo = styled.div`
    background: ${brandTheme.status.infoLight};
    border: 1px solid ${brandTheme.status.info};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const StatusIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: ${brandTheme.status.info};
    font-size: 16px;
    flex-shrink: 0;
`;

const StatusText = styled.div`
    font-size: 14px;
    color: ${brandTheme.status.info};
    font-weight: 500;
    line-height: 1.4;
`;

const ErrorSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const ErrorCard = styled.div`
    background: ${brandTheme.status.errorLight};
    border: 2px solid ${brandTheme.status.error};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    display: flex;
    align-items: flex-start;
    gap: ${brandTheme.spacing.md};
`;

const ErrorIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${brandTheme.status.error};
    color: white;
    border-radius: ${brandTheme.radius.lg};
    font-size: 16px;
    flex-shrink: 0;
`;

const ErrorContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.sm};
`;

const ErrorTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.status.error};
`;

const ErrorDescription = styled.div`
    font-size: 14px;
    color: ${brandTheme.text.primary};
    line-height: 1.5;

    strong {
        font-weight: 600;
        color: ${brandTheme.status.error};
    }
`;

const ChecklistSection = styled.div`
    background: ${brandTheme.surfaceAlt};
    border: 1px solid ${brandTheme.border};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

const ChecklistHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ChecklistTitle = styled.h4`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};

    svg {
        color: ${brandTheme.primary};
        font-size: 16px;
    }
`;

const ChecklistProgress = styled.div`
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    padding: ${brandTheme.spacing.xs} ${brandTheme.spacing.sm};
    border-radius: ${brandTheme.radius.xl};
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
`;

const ChecklistItems = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.md};
`;

const ChecklistItem = styled.div`
   display: flex;
   align-items: flex-start;
   gap: ${brandTheme.spacing.md};
   padding: ${brandTheme.spacing.md};
   background: ${brandTheme.surface};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.md};
   transition: all ${brandTheme.transitions.normal};

   &:hover {
       border-color: ${brandTheme.primary};
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

const CheckboxContainer = styled.div`
   display: flex;
   align-items: center;
   position: relative;
`;

const HiddenCheckbox = styled.input`
   position: absolute;
   opacity: 0;
   width: 0;
   height: 0;
`;

const CustomCheckbox = styled.div<{ $checked: boolean }>`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 20px;
   height: 20px;
   background: ${props => props.$checked ? brandTheme.status.success : brandTheme.surface};
   border: 2px solid ${props => props.$checked ? brandTheme.status.success : brandTheme.border};
   border-radius: ${brandTheme.radius.sm};
   color: white;
   font-size: 12px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.normal};

   &:hover {
       border-color: ${brandTheme.status.success};
       transform: scale(1.1);
   }
`;

const ItemContent = styled.div`
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const ItemLabel = styled.label`
   font-size: 14px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   cursor: pointer;
   line-height: 1.4;
`;

const ItemDescription = styled.div`
   font-size: 13px;
   color: ${brandTheme.text.secondary};
   line-height: 1.4;
`;

const WarningInfo = styled.div`
   background: ${brandTheme.status.warningLight};
   border: 1px solid ${brandTheme.status.warning};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
`;

const WarningIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 24px;
   height: 24px;
   color: ${brandTheme.status.warning};
   font-size: 16px;
   flex-shrink: 0;
`;

const WarningText = styled.div`
   font-size: 14px;
   color: ${brandTheme.status.warning};
   font-weight: 500;
   line-height: 1.4;
`;

const SuccessInfo = styled.div`
   background: ${brandTheme.status.successLight};
   border: 1px solid ${brandTheme.status.success};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
`;

const SuccessIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 24px;
   height: 24px;
   color: ${brandTheme.status.success};
   font-size: 16px;
   flex-shrink: 0;
`;

const SuccessText = styled.div`
   font-size: 14px;
   color: ${brandTheme.status.success};
   font-weight: 500;
   line-height: 1.4;
`;

const ModalFooter = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${brandTheme.spacing.md};
   padding: ${brandTheme.spacing.lg} ${brandTheme.spacing.xl};
   border-top: 2px solid ${brandTheme.border};
   background: ${brandTheme.surfaceAlt};
`;

const SecondaryButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: ${brandTheme.surface};
   color: ${brandTheme.status.error};
   border: 2px solid ${brandTheme.status.error};
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   min-height: 44px;
   min-width: 140px;

   &:hover {
       background: ${brandTheme.status.errorLight};
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

const PrimaryButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: linear-gradient(135deg, ${brandTheme.status.success} 0%, #27ae60 100%);
   color: white;
   border: 2px solid transparent;
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   box-shadow: ${brandTheme.shadow.sm};
   min-height: 44px;
   min-width: 200px;

   &:hover:not(:disabled) {
       background: linear-gradient(135deg, #27ae60 0%, ${brandTheme.status.success} 100%);
       transform: translateY(-1px);
       box-shadow: ${brandTheme.shadow.md};
   }

   &:disabled {
       opacity: 0.6;
       cursor: not-allowed;
       transform: none;
       background: ${brandTheme.text.disabled};
   }

   &:active:not(:disabled) {
       transform: translateY(0);
   }
`;

export default QualityVerificationModal;