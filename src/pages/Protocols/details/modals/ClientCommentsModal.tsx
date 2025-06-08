import React from 'react';
import styled from 'styled-components';
import { FaComment, FaInfoCircle, FaCheck, FaTimes, FaUser, FaClock } from 'react-icons/fa';

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

interface ClientCommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    comments: Array<{
        id: string;
        author: string;
        content: string;
        timestamp: string;
        type: 'internal' | 'customer' | 'system';
    }>;
}

const ClientCommentsModal: React.FC<ClientCommentsModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     comments = []
                                                                 }) => {
    if (!isOpen) return null;

    // Filtrujemy tylko komentarze przeznaczone dla klienta
    const customerComments = comments.filter(comment => comment.type === 'customer');

    // Formatujemy datę
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <HeaderContent>
                        <HeaderIcon>
                            <FaComment />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Informacje dla klienta</ModalTitle>
                            <ModalSubtitle>Ważne uwagi do omówienia podczas wydania pojazdu</ModalSubtitle>
                        </HeaderText>
                    </HeaderContent>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    {customerComments.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon>
                                <FaInfoCircle />
                            </EmptyIcon>
                            <EmptyTitle>Brak informacji dla klienta</EmptyTitle>
                            <EmptyDescription>
                                Nie ma żadnych specjalnych uwag do przekazania klientowi podczas odbioru pojazdu.
                            </EmptyDescription>
                        </EmptyState>
                    ) : (
                        <>
                            <ImportantNotice>
                                <NoticeIcon>💬</NoticeIcon>
                                <NoticeText>
                                    Poniższe informacje zostały oznaczone jako ważne dla klienta.
                                    Proszę omówić je szczegółowo podczas wydawania pojazdu.
                                </NoticeText>
                            </ImportantNotice>

                            <CommentsSection>
                                <CommentsHeader>
                                    <CommentsTitle>Uwagi do omówienia ({customerComments.length})</CommentsTitle>
                                </CommentsHeader>

                                <CommentsList>
                                    {customerComments.map((comment, index) => (
                                        <CommentCard key={comment.id}>
                                            <CommentHeader>
                                                <AuthorInfo>
                                                    <AuthorIcon>
                                                        <FaUser />
                                                    </AuthorIcon>
                                                    <AuthorName>{comment.author}</AuthorName>
                                                </AuthorInfo>
                                                <TimeInfo>
                                                    <FaClock />
                                                    <CommentDate>{formatDate(comment.timestamp)}</CommentDate>
                                                </TimeInfo>
                                            </CommentHeader>
                                            <CommentContent>{comment.content}</CommentContent>
                                            <CommentNumber>#{index + 1}</CommentNumber>
                                        </CommentCard>
                                    ))}
                                </CommentsList>
                            </CommentsSection>

                            <ActionReminder>
                                <ReminderIcon>⚠️</ReminderIcon>
                                <ReminderText>
                                    <strong>Pamiętaj:</strong> Po omówieniu wszystkich uwag z klientem,
                                    potwierdź przekazanie informacji przyciskiem poniżej.
                                </ReminderText>
                            </ActionReminder>
                        </>
                    )}
                </ModalBody>

                <ModalFooter>
                    <SecondaryButton onClick={onClose}>
                        <FaTimes />
                        Zamknij
                    </SecondaryButton>
                    <PrimaryButton onClick={onClose}>
                        <FaCheck />
                        {customerComments.length > 0 ? 'Przekazałem wszystkie informacje' : 'Kontynuuj'}
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

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${brandTheme.status.infoLight};
    color: ${brandTheme.status.info};
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
    padding: ${brandTheme.spacing.xxl};
    text-align: center;
`;

const EmptyIcon = styled.div`
    font-size: 48px;
    color: ${brandTheme.text.muted};
    margin-bottom: ${brandTheme.spacing.lg};
    opacity: 0.6;
`;

const EmptyTitle = styled.h4`
    font-size: 18px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
    margin: 0 0 ${brandTheme.spacing.sm} 0;
`;

const EmptyDescription = styled.p`
    font-size: 14px;
    color: ${brandTheme.text.secondary};
    line-height: 1.5;
    margin: 0;
    max-width: 300px;
`;

const ImportantNotice = styled.div`
    background: ${brandTheme.status.warningLight};
    border: 1px solid ${brandTheme.status.warning};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
    margin-bottom: ${brandTheme.spacing.xl};
`;

const NoticeIcon = styled.div`
    font-size: 16px;
    flex-shrink: 0;
`;

const NoticeText = styled.div`
    font-size: 13px;
    color: ${brandTheme.status.warning};
    font-weight: 500;
    line-height: 1.4;
`;

const CommentsSection = styled.div`
    margin-bottom: ${brandTheme.spacing.xl};
`;

const CommentsHeader = styled.div`
    margin-bottom: ${brandTheme.spacing.lg};
`;

const CommentsTitle = styled.h4`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${brandTheme.text.primary};
`;

const CommentsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${brandTheme.spacing.md};
`;

const CommentCard = styled.div`
    position: relative;
    background: ${brandTheme.status.successLight};
    border: 1px solid ${brandTheme.status.success}40;
    border-left: 4px solid ${brandTheme.status.success};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.lg};
    transition: all ${brandTheme.transitions.normal};

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${brandTheme.shadow.md};
    }
`;

const CommentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${brandTheme.spacing.sm};
`;

const AuthorInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const AuthorIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: ${brandTheme.status.success};
    color: white;
    border-radius: 50%;
    font-size: 12px;
`;

const AuthorName = styled.div`
    font-weight: 600;
    color: ${brandTheme.text.primary};
    font-size: 14px;
`;

const TimeInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.xs};
    color: ${brandTheme.text.muted};
`;

const CommentDate = styled.div`
    font-size: 12px;
    font-weight: 500;
`;

const CommentContent = styled.div`
    color: ${brandTheme.text.primary};
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-line;
    word-break: break-word;
`;

const CommentNumber = styled.div`
    position: absolute;
    top: ${brandTheme.spacing.sm};
    right: ${brandTheme.spacing.sm};
    background: ${brandTheme.status.success};
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: ${brandTheme.radius.sm};
    min-width: 20px;
    text-align: center;
`;

const ActionReminder = styled.div`
    background: ${brandTheme.status.infoLight};
    border: 1px solid ${brandTheme.status.info};
    border-radius: ${brandTheme.radius.lg};
    padding: ${brandTheme.spacing.md} ${brandTheme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${brandTheme.spacing.sm};
`;

const ReminderIcon = styled.div`
    font-size: 16px;
    flex-shrink: 0;
`;

const ReminderText = styled.div`
    font-size: 13px;
    color: ${brandTheme.status.info};
    line-height: 1.4;

    strong {
        font-weight: 600;
    }
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
    min-width: 160px;

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

export default ClientCommentsModal;