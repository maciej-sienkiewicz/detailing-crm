import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPencilAlt, FaTimes, FaStickyNote } from 'react-icons/fa';

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

interface ServiceNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: string) => void;
    serviceName: string;
    initialNote: string;
}

const ServiceNoteModal: React.FC<ServiceNoteModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSave,
                                                               serviceName,
                                                               initialNote
                                                           }) => {
    const [note, setNote] = useState(initialNote || '');
    const [charCount, setCharCount] = useState(0);

    const MAX_CHARS = 500;

    // Reset stanu przy otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            setNote(initialNote || '');
            setCharCount((initialNote || '').length);
        }
    }, [isOpen, initialNote]);

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newNote = e.target.value;
        if (newNote.length <= MAX_CHARS) {
            setNote(newNote);
            setCharCount(newNote.length);
        }
    };

    const handleSave = () => {
        onSave(note.trim());
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon>
                            <FaStickyNote />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Notatka do usługi</ModalTitle>
                            <ModalSubtitle>Dodaj uwagi wewnętrzne</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <ServiceInfoSection>
                        <ServiceInfoLabel>Usługa:</ServiceInfoLabel>
                        <ServiceInfoValue>{serviceName}</ServiceInfoValue>
                    </ServiceInfoSection>

                    <FormSection>
                        <Label htmlFor="note">
                            <LabelIcon>
                                <FaPencilAlt />
                            </LabelIcon>
                            <span>Treść notatki</span>
                        </Label>
                        <NoteTextareaContainer>
                            <NoteTextarea
                                id="note"
                                value={note}
                                onChange={handleNoteChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Wprowadź dodatkowe informacje o usłudze, uwagi techniczne lub zalecenia..."
                                rows={6}
                                autoFocus
                                maxLength={MAX_CHARS}
                            />
                            <CharCounter isNearLimit={charCount > MAX_CHARS * 0.8}>
                                {charCount}/{MAX_CHARS}
                            </CharCounter>
                        </NoteTextareaContainer>
                    </FormSection>

                    <InfoSection>
                        <InfoIcon>🔒</InfoIcon>
                        <InfoText>
                            Ta notatka jest widoczna tylko dla zespołu serwisowego i nie zostanie udostępniona klientowi
                        </InfoText>
                    </InfoSection>

                    <QuickTips>
                        <TipsTitle>Wskazówki:</TipsTitle>
                        <TipsList>
                            <TipItem>• Użyj Ctrl+Enter aby szybko zapisać</TipItem>
                            <TipItem>• Dodaj szczegóły techniczne, użyte materiały lub czas wykonania</TipItem>
                            <TipItem>• Notuj zalecenia dla przyszłych wizyt</TipItem>
                        </TipsList>
                    </QuickTips>
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={onClose}>
                        <FaTimes />
                        Anuluj
                    </SecondaryButton>
                    <PrimaryButton onClick={handleSave}>
                        <FaStickyNote />
                        Zapisz notatkę
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
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
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
    width: 550px;
    max-width: 95%;
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

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${brandTheme.status.warningLight};
    color: ${brandTheme.status.warning};
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
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.lg};
`;

const ServiceInfoSection = styled.div`
   background: ${brandTheme.surfaceAlt};
   padding: ${brandTheme.spacing.lg};
   border-radius: ${brandTheme.radius.lg};
   border: 1px solid ${brandTheme.border};
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const ServiceInfoLabel = styled.div`
   font-size: 12px;
   color: ${brandTheme.text.muted};
   text-transform: uppercase;
   font-weight: 600;
   letter-spacing: 0.5px;
`;

const ServiceInfoValue = styled.div`
   font-size: 16px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
   word-break: break-word;
   line-height: 1.4;
`;

const FormSection = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.md};
`;

const Label = styled.label`
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
   font-size: 14px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
`;

const LabelIcon = styled.span`
   color: ${brandTheme.status.warning};
   font-size: 14px;
`;

const NoteTextareaContainer = styled.div`
   position: relative;
`;

const NoteTextarea = styled.textarea`
   width: 100%;
   padding: ${brandTheme.spacing.lg};
   padding-bottom: ${brandTheme.spacing.xxl};
   border: 2px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.lg};
   font-size: 14px;
   font-family: inherit;
   resize: vertical;
   min-height: 140px;
   max-height: 300px;
   background: ${brandTheme.surface};
   color: ${brandTheme.text.primary};
   transition: all ${brandTheme.transitions.normal};
   line-height: 1.5;

   &:focus {
       outline: none;
       border-color: ${brandTheme.primary};
       box-shadow: 0 0 0 3px ${brandTheme.primaryGhost};
   }

   &::placeholder {
       color: ${brandTheme.text.muted};
       font-weight: 400;
       line-height: 1.4;
   }

   /* Custom scrollbar */
   &::-webkit-scrollbar {
       width: 6px;
   }

   &::-webkit-scrollbar-track {
       background: ${brandTheme.surfaceAlt};
       border-radius: 3px;
   }

   &::-webkit-scrollbar-thumb {
       background: ${brandTheme.border};
       border-radius: 3px;
   }
`;

const CharCounter = styled.div<{ isNearLimit: boolean }>`
   position: absolute;
   bottom: ${brandTheme.spacing.md};
   right: ${brandTheme.spacing.lg};
   font-size: 12px;
   color: ${props => props.isNearLimit ? brandTheme.status.warning : brandTheme.text.muted};
   font-weight: 500;
   background: ${brandTheme.surface};
   padding: 2px 6px;
   border-radius: ${brandTheme.radius.sm};
   border: 1px solid ${props => props.isNearLimit ? brandTheme.status.warning : brandTheme.border};
   font-variant-numeric: tabular-nums;
`;

const InfoSection = styled.div`
   background: ${brandTheme.status.infoLight};
   border: 1px solid ${brandTheme.status.info};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   display: flex;
   align-items: center;
   gap: ${brandTheme.spacing.sm};
`;

const InfoIcon = styled.div`
   font-size: 16px;
   flex-shrink: 0;
`;

const InfoText = styled.div`
   font-size: 13px;
   color: ${brandTheme.status.info};
   font-weight: 500;
   line-height: 1.4;
`;

const QuickTips = styled.div`
   background: ${brandTheme.surfaceAlt};
   border: 1px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.lg};
   padding: ${brandTheme.spacing.lg};
`;

const TipsTitle = styled.h4`
   margin: 0 0 ${brandTheme.spacing.sm} 0;
   font-size: 14px;
   font-weight: 600;
   color: ${brandTheme.text.primary};
`;

const TipsList = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${brandTheme.spacing.xs};
`;

const TipItem = styled.div`
   font-size: 13px;
   color: ${brandTheme.text.secondary};
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
   color: ${brandTheme.text.secondary};
   border: 2px solid ${brandTheme.border};
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   min-height: 44px;
   min-width: 120px;

   &:hover {
       background: ${brandTheme.surfaceHover};
       color: ${brandTheme.text.primary};
       border-color: ${brandTheme.borderHover};
       box-shadow: ${brandTheme.shadow.sm};
   }
`;

const PrimaryButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   gap: ${brandTheme.spacing.sm};
   padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
   background: linear-gradient(135deg, ${brandTheme.status.warning} 0%, #d97706 100%);
   color: white;
   border: 2px solid transparent;
   border-radius: ${brandTheme.radius.md};
   font-weight: 600;
   font-size: 14px;
   cursor: pointer;
   transition: all ${brandTheme.transitions.spring};
   box-shadow: ${brandTheme.shadow.sm};
   min-height: 44px;
   min-width: 140px;

   &:hover:not(:disabled) {
       background: linear-gradient(135deg, #b45309 0%, ${brandTheme.status.warning} 100%);
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

export default ServiceNoteModal;