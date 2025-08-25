import React, {useState} from 'react';
import styled from 'styled-components';
import {FaExclamationTriangle, FaTimes} from 'react-icons/fa';

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

export type CancellationReason = 'CLIENT_REFUSAL' | 'CANCELLED_WITH_CONSENT' | 'NOT_RELEVANT';

interface CancelProtocolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: CancellationReason) => void;
    protocolId: string;
}

const CancelProtocolModal: React.FC<CancelProtocolModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onConfirm,
                                                                     protocolId
                                                                 }) => {
    const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = () => {
        if (!selectedReason) return;

        setIsSubmitting(true);
        onConfirm(selectedReason);
        setTimeout(() => {
            setSelectedReason(null);
            setIsSubmitting(false);
        }, 500);
    };

    if (!isOpen) return null;

    const reasons = [
        { id: 'CLIENT_REFUSAL', label: 'Odmowa klienta', description: 'Klient odmówił wykonania usługi' },
        { id: 'CANCELLED_WITH_CONSENT', label: 'Anulowano za zgodą', description: 'Wzajemne porozumienie stron' },
        { id: 'NOT_RELEVANT', label: 'Inny powód', description: 'Powód nieistotny lub niespecyfikowany' }
    ];

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <DocumentIcon>
                            <FaExclamationTriangle />
                        </DocumentIcon>
                        <HeaderText>
                            <ModalTitle>Anulowanie wizyty #{protocolId}</ModalTitle>
                            <ModalSubtitle>Wybierz powód anulowania protokołu</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <ErrorSection>
                        <ErrorMessage>
                            Anulowanie wizyty jest nieodwracalne. Protokół zostanie oznaczony jako anulowany.
                        </ErrorMessage>
                    </ErrorSection>

                    <OptionsSection>
                        <SectionTitle>Powód anulowania</SectionTitle>

                        <OptionsList>
                            {reasons.map((reason) => (
                                <OptionItem key={reason.id}>
                                    <OptionCheckbox
                                        type="radio"
                                        name="cancellation-reason"
                                        checked={selectedReason === reason.id}
                                        onChange={() => setSelectedReason(reason.id as CancellationReason)}
                                    />
                                    <OptionContent>
                                        <OptionDetails>
                                            <OptionTitle>{reason.label}</OptionTitle>
                                            <OptionDescription>{reason.description}</OptionDescription>
                                        </OptionDetails>
                                    </OptionContent>
                                </OptionItem>
                            ))}
                        </OptionsList>
                    </OptionsSection>
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <SecondaryButton onClick={onClose} disabled={isSubmitting}>
                            Wróć
                        </SecondaryButton>
                        <DangerButton
                            onClick={handleConfirm}
                            disabled={!selectedReason || isSubmitting}
                        >
                            {isSubmitting ? 'Anulowanie...' : 'Anuluj wizytę'}
                        </DangerButton>
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
    width: 480px;
    max-width: 95%;
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
    background: ${corporateTheme.status.warning}20;
    color: ${corporateTheme.status.warning};
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
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.lg};
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

const OptionsSection = styled.div`
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

const OptionsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.sm};
`;

const OptionItem = styled.label`
    display: flex;
    align-items: flex-start;
    gap: ${corporateTheme.spacing.md};
    padding: ${corporateTheme.spacing.md};
    border: 1px solid ${corporateTheme.borderLight};
    border-radius: ${corporateTheme.radius.md};
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        border-color: ${corporateTheme.primary};
        background: ${corporateTheme.surfaceHover};
    }

    &:has(input:checked) {
        border-color: ${corporateTheme.primary};
        background: rgba(26, 54, 93, 0.02);
    }
`;

const OptionCheckbox = styled.input`
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: ${corporateTheme.primary};
    cursor: pointer;
    flex-shrink: 0;
`;

const OptionContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const OptionDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.xs};
`;

const OptionTitle = styled.h4`
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
    line-height: 1.3;
`;

const OptionDescription = styled.p`
    margin: 0;
    font-size: 13px;
    color: ${corporateTheme.text.secondary};
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

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const DangerButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${corporateTheme.spacing.sm};
    padding: ${corporateTheme.spacing.sm} ${corporateTheme.spacing.lg};
    background: ${corporateTheme.status.warning};
    color: white;
    border: 1px solid ${corporateTheme.status.warning};
    border-radius: ${corporateTheme.radius.sm};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    min-height: 40px;
    min-width: 120px;

    &:hover:not(:disabled) {
        background: #b45309;
        border-color: #b45309;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${corporateTheme.text.muted};
        border-color: ${corporateTheme.text.muted};
    }
`;

export default CancelProtocolModal;