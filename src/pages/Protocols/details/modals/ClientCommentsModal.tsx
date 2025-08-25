import React from 'react';
import styled from 'styled-components';
import {FaCheck, FaClock, FaComment, FaInfoCircle, FaTimes, FaUser} from 'react-icons/fa';
import {Comment} from "../../../../api/commentsApi";

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
        infoBorder: '#bae6fd'
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

interface ClientCommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    comments: Comment[] | null
}

const ClientCommentsModal: React.FC<ClientCommentsModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     comments
                                                                 }) => {
    if (!isOpen) return null;

    const customerComments = (comments || []).filter(comment => comment.type === 'CUSTOMER');

    const formatDate = (dateString: string | undefined): string => {
        if(!dateString) return '';
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
                        <DocumentIcon>
                            <FaComment />
                        </DocumentIcon>
                        <HeaderText>
                            <ModalTitle>Informacje dla klienta</ModalTitle>
                            <ModalSubtitle>Uwagi do omówienia podczas wydania pojazdu</ModalSubtitle>
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
                                Nie ma specjalnych uwag do przekazania klientowi podczas odbioru pojazdu.
                            </EmptyDescription>
                        </EmptyState>
                    ) : (
                        <>
                            <StatusSection>
                                <StatusIndicator>
                                    <StatusIcon>
                                        <FaComment />
                                    </StatusIcon>
                                    <StatusMessage>
                                        Wykryto {customerComments.length} {customerComments.length === 1 ? 'uwagę' : 'uwag'} do omówienia z klientem
                                    </StatusMessage>
                                </StatusIndicator>
                            </StatusSection>

                            <CommentsSection>
                                <SectionTitle>Uwagi do omówienia</SectionTitle>

                                <CommentsList>
                                    {customerComments.map((comment, index) => (
                                        <CommentItem key={comment.id}>
                                            <CommentHeader>
                                                <AuthorInfo>
                                                    <AuthorIcon>
                                                        <FaUser />
                                                    </AuthorIcon>
                                                    <AuthorName>{comment.author}</AuthorName>
                                                </AuthorInfo>
                                                <TimeInfo>
                                                    <FaClock />
                                                    <CommentDate>{formatDate(comment!!.timestamp)}</CommentDate>
                                                </TimeInfo>
                                            </CommentHeader>
                                            <CommentContent>{comment.content}</CommentContent>
                                            <CommentNumber>#{index + 1}</CommentNumber>
                                        </CommentItem>
                                    ))}
                                </CommentsList>
                            </CommentsSection>

                            <InfoSection>
                                <InfoMessage>
                                    Po omówieniu wszystkich uwag z klientem, potwierdź przekazanie informacji.
                                </InfoMessage>
                            </InfoSection>
                        </>
                    )}
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <SecondaryButton onClick={onClose}>
                            Zamknij
                        </SecondaryButton>
                        <PrimaryButton onClick={onClose}>
                            <FaCheck />
                            {customerComments.length > 0 ? 'Przekazano informacje' : 'Kontynuuj'}
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

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${corporateTheme.spacing.xl};
    text-align: center;
`;

const EmptyIcon = styled.div`
    font-size: 48px;
    color: ${corporateTheme.text.muted};
    margin-bottom: ${corporateTheme.spacing.lg};
    opacity: 0.6;
`;

const EmptyTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${corporateTheme.text.primary};
    margin: 0 0 ${corporateTheme.spacing.sm} 0;
`;

const EmptyDescription = styled.p`
    font-size: 14px;
    color: ${corporateTheme.text.secondary};
    line-height: 1.5;
    margin: 0;
`;

const CommentsSection = styled.div`
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

const CommentsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${corporateTheme.spacing.sm};
`;

const CommentItem = styled.div`
    position: relative;
    background: ${corporateTheme.status.successLight};
    border: 1px solid ${corporateTheme.status.successBorder};
    border-left: 4px solid ${corporateTheme.status.success};
    border-radius: ${corporateTheme.radius.md};
    padding: ${corporateTheme.spacing.md};
`;

const CommentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${corporateTheme.spacing.sm};
`;

const AuthorInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.sm};
`;

const AuthorIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: ${corporateTheme.status.success};
    color: white;
    border-radius: 50%;
    font-size: 12px;
`;

const AuthorName = styled.div`
    font-weight: 600;
    color: ${corporateTheme.text.primary};
    font-size: 14px;
`;

const TimeInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${corporateTheme.spacing.xs};
    color: ${corporateTheme.text.muted};
`;

const CommentDate = styled.div`
    font-size: 12px;
    font-weight: 500;
`;

const CommentContent = styled.div`
    color: ${corporateTheme.text.primary};
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-line;
    word-break: break-word;
`;

const CommentNumber = styled.div`
    position: absolute;
    top: ${corporateTheme.spacing.sm};
    right: ${corporateTheme.spacing.sm};
    background: ${corporateTheme.status.success};
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: ${corporateTheme.radius.sm};
    min-width: 20px;
    text-align: center;
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
`;

export default ClientCommentsModal;