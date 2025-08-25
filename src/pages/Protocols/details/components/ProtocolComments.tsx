import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {format} from 'date-fns';
import {pl} from 'date-fns/locale';
import {FaCalendarAlt, FaExclamationTriangle, FaLock, FaPaperPlane, FaShare, FaUser} from 'react-icons/fa';
import {CarReceptionProtocol, ProtocolStatus} from '../../../../types';
import {Comment, commentsApi} from '../../../../api/commentsApi';

// Enterprise Design System - Professional Automotive CRM with Brand Colors
const enterprise = {
    // Brand Color System - Customizable by client
    primary: 'var(--brand-primary, #2563eb)',
    primaryDark: 'var(--brand-primary-dark, #1d4ed8)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',

    // Professional Surfaces
    surface: '#ffffff',
    surfaceSecondary: '#f8fafc',
    surfaceTertiary: '#f1f5f9',

    // Professional Text Hierarchy
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',

    // Enterprise Borders & States
    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    // Communication Types - Professional Automotive Grade
    internal: {
        primary: 'var(--brand-primary, #2563eb)',
        background: '#fafbfc',
        border: '#e2e8f0',
        light: '#f8fafc'
    },
    external: {
        primary: '#334155',
        background: '#f8fafc',
        border: '#cbd5e1',
        light: '#f1f5f9'
    },
    system: {
        primary: '#64748b',
        background: '#f9fafb',
        border: '#d1d5db',
        light: '#f3f4f6'
    },

    // Professional Spacing
    space: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },

    // Enterprise Typography
    fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px'
    },

    // Subtle Professional Effects
    shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    },

    radius: {
        sm: '4px',
        md: '8px',
        lg: '12px'
    }
};

interface ProtocolCommentsProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate: (updatedProtocol: CarReceptionProtocol) => void;
}

const ProtocolComments: React.FC<ProtocolCommentsProps> = ({ protocol }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentType, setCommentType] = useState<'INTERNAL' | 'CUSTOMER'>('INTERNAL');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recentlyAddedId, setRecentlyAddedId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedComments = await commentsApi.getComments(protocol.id);
                setComments(fetchedComments);
            } catch (err) {
                console.error('Error fetching comments:', err);
                setError('Nie udało się pobrać komunikacji. Odśwież stronę.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchComments();
    }, [protocol.id]);

    // Clear recently added highlight after 3 seconds
    useEffect(() => {
        if (recentlyAddedId) {
            const timer = setTimeout(() => {
                setRecentlyAddedId(undefined);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [recentlyAddedId]);

    const formatDateTime = (dateString: string): string => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: pl });
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const commentData: Comment = {
                protocolId: protocol.id,
                author: 'Administrator',
                content: newComment,
                type: commentType
            };

            const savedComment = await commentsApi.addComment(commentData);

            if (savedComment) {
                setComments(prevComments => [savedComment, ...prevComments]); // Add to top for immediate visibility
                setRecentlyAddedId(savedComment.id); // Highlight the new comment
                setNewComment('');
            } else {
                setError('Nie udało się dodać wpisu.');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            setError('Błąd podczas dodawania wpisu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Sort comments by timestamp (newest first) for better UX
    const sortedComments = [...comments].sort((a, b) =>
        new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime()
    );

    return (
        <CommunicationPanel>

            {/* Professional Input Section */}
            <InputSection>
                <InputHeader>
                    <InputTitle>Nowy wpis</InputTitle>
                    <TypeSelector>
                        <TypeOption
                            $active={commentType === 'INTERNAL'}
                            onClick={() => setCommentType('INTERNAL')}
                        >
                            <FaLock />
                            Zespół wewnętrzny
                        </TypeOption>
                        <TypeOption
                            $active={commentType === 'CUSTOMER'}
                            onClick={() => setCommentType('CUSTOMER')}
                            disabled={protocol.status === ProtocolStatus.CANCELLED}
                        >
                            <FaShare />
                            Komunikacja z klientem
                        </TypeOption>
                    </TypeSelector>
                </InputHeader>

                <InputBody>
                    <CommentInput
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={commentType === 'INTERNAL'
                            ? "Dodaj notatkę wewnętrzną dla zespołu..."
                            : "Wpisz informację do przekazania klientowi..."
                        }
                        $type={commentType}
                        rows={4}
                    />

                    <InputFooter>
                        <InputMeta>
                            {commentType === 'CUSTOMER'
                                ? 'Informacja zostanie wysłana do klienta'
                                : 'Wpis widoczny tylko dla zespołu'
                            }
                        </InputMeta>
                        <SubmitButton
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim() || isSubmitting}
                            $type={commentType}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner />
                                    Dodawanie
                                </>
                            ) : (
                                <>
                                    <FaPaperPlane />
                                    Dodaj wpis
                                </>
                            )}
                        </SubmitButton>
                    </InputFooter>
                </InputBody>

                {error && (
                    <ErrorNotification>
                        <FaExclamationTriangle />
                        {error}
                    </ErrorNotification>
                )}
            </InputSection>

            {/* Professional Timeline */}
            <TimelineSection>
                <TimelineHeader>
                    <TimelineTitle>Historia komunikacji</TimelineTitle>
                </TimelineHeader>

                {isLoading ? (
                    <LoadingState>
                        <Spinner />
                        Ładowanie komunikacji
                    </LoadingState>
                ) : comments.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon />
                        <EmptyTitle>Brak wpisów</EmptyTitle>
                        <EmptyDescription>Rozpocznij komunikację dodając pierwszy wpis</EmptyDescription>
                    </EmptyState>
                ) : (
                    <Timeline>
                        {/* Always show ALL comments in chronological order for better UX */}
                        <UnifiedTimeline>
                            <SectionHeader>
                                <SectionTitle>Wszystkie wpisy</SectionTitle>
                                <SectionCount>{sortedComments.length}</SectionCount>
                            </SectionHeader>
                            <CommentsList>
                                {sortedComments.map(comment => {
                                    const isRecent = comment.id === recentlyAddedId;

                                    if (comment.type === 'SYSTEM') {
                                        return (
                                            <SystemEntry key={comment.id} $isRecent={isRecent}>
                                                <SystemIcon>
                                                    <FaCalendarAlt />
                                                </SystemIcon>
                                                <SystemContent>
                                                    <SystemText>{comment.content}</SystemText>
                                                    <SystemTime>{formatDateTime(comment.timestamp || '')}</SystemTime>
                                                </SystemContent>
                                                {isRecent && <NewIndicator>Nowy wpis</NewIndicator>}
                                            </SystemEntry>
                                        );
                                    }

                                    return (
                                        <CommentEntry
                                            key={comment.id}
                                            $type={comment.type === 'CUSTOMER' ? 'EXTERNAL' : 'INTERNAL'}
                                            $isRecent={isRecent}
                                        >
                                            <CommentMeta>
                                                <AuthorInfo>
                                                    <Avatar $type={comment.type === 'CUSTOMER' ? 'EXTERNAL' : 'INTERNAL'}>
                                                        <FaUser />
                                                    </Avatar>
                                                    <AuthorDetails>
                                                        <AuthorName>
                                                            {comment.author}
                                                            <CommentTypeLabel $type={comment.type}>
                                                                {comment.type === 'CUSTOMER' ? 'Komunikacja z klientem' : 'Zespół wewnętrzny'}
                                                            </CommentTypeLabel>
                                                        </AuthorName>
                                                        <Timestamp>{formatDateTime(comment.timestamp || '')}</Timestamp>
                                                    </AuthorDetails>
                                                </AuthorInfo>
                                                {isRecent && <NewIndicator>Nowy wpis</NewIndicator>}
                                            </CommentMeta>
                                            <CommentContent>{comment.content}</CommentContent>
                                        </CommentEntry>
                                    );
                                })}
                            </CommentsList>
                        </UnifiedTimeline>
                    </Timeline>
                )}
            </TimelineSection>
        </CommunicationPanel>
    );
};

// Enterprise-Grade Styled Components
const CommunicationPanel = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.lg};
`;

// Professional Input
const InputSection = styled.div`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    box-shadow: ${enterprise.shadow.sm};
    overflow: hidden;
`;

const InputHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${enterprise.space.lg} ${enterprise.space.xl};
    background: ${enterprise.surfaceSecondary};
    border-bottom: 1px solid ${enterprise.border};
`;

const InputTitle = styled.h3`
    font-size: ${enterprise.fontSize.base};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    margin: 0;
`;

const TypeSelector = styled.div`
    display: flex;
    gap: ${enterprise.space.xs};
`;

const TypeOption = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.sm} ${enterprise.space.md};
    background: ${props => props.$active ? enterprise.primary : enterprise.surface};
    color: ${props => props.$active ? 'white' : enterprise.textSecondary};
    border: 1px solid ${props => props.$active ? enterprise.primary : enterprise.border};
    border-radius: ${enterprise.radius.md};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        ${props => !props.$active && `
            background: ${enterprise.surfaceSecondary};
            border-color: ${enterprise.textTertiary};
            transform: translateY(-1px);
            box-shadow: ${enterprise.shadow.sm};
        `}
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        font-size: ${enterprise.fontSize.xs};
    }
`;

const InputBody = styled.div`
    padding: ${enterprise.space.xl};
`;

const CommentInput = styled.textarea<{ $type: 'INTERNAL' | 'CUSTOMER' }>`
    width: 100%;
    min-height: 120px;
    padding: ${enterprise.space.md};
    border: 1px solid ${enterprise.border};
    border-left: 3px solid ${props => props.$type === 'CUSTOMER' ? enterprise.external.primary : enterprise.primary};
    border-radius: ${enterprise.radius.md};
    background: ${enterprise.surface};
    font-size: ${enterprise.fontSize.sm};
    font-family: inherit;
    line-height: 1.5;
    resize: vertical;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$type === 'CUSTOMER' ? enterprise.external.primary : enterprise.primary};
        box-shadow: 0 0 0 3px ${props => props.$type === 'CUSTOMER' ? 'rgba(51, 65, 85, 0.1)' : 'rgba(37, 99, 235, 0.1)'};
    }

    &::placeholder {
        color: ${enterprise.textMuted};
    }
`;

const InputFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: ${enterprise.space.md};
`;

const InputMeta = styled.div`
    font-size: ${enterprise.fontSize.xs};
    color: ${enterprise.textTertiary};
    font-weight: 500;
`;

const SubmitButton = styled.button<{ $type: 'INTERNAL' | 'CUSTOMER' }>`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.sm} ${enterprise.space.lg};
    background: ${props => props.$type === 'CUSTOMER' ? enterprise.external.primary : enterprise.primary};
    color: white;
    border: none;
    border-radius: ${enterprise.radius.md};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${props => props.$type === 'CUSTOMER' ? '#1e293b' : enterprise.primaryDark};
        transform: translateY(-1px);
        box-shadow: ${enterprise.shadow.md};
    }

    &:disabled {
        background: ${enterprise.textMuted};
        cursor: not-allowed;
    }

    svg {
        font-size: ${enterprise.fontSize.xs};
    }
`;

const ErrorNotification = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.sm};
    padding: ${enterprise.space.md} ${enterprise.space.xl};
    background: #fef2f2;
    border-top: 1px solid #fecaca;
    color: #dc2626;
    font-size: ${enterprise.fontSize.sm};

    svg {
        font-size: ${enterprise.fontSize.sm};
    }
`;

// Professional Timeline
const TimelineSection = styled.div`
    background: ${enterprise.surface};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.lg};
    box-shadow: ${enterprise.shadow.sm};
    overflow: hidden;
`;

const TimelineHeader = styled.div`
    padding: ${enterprise.space.lg} ${enterprise.space.xl};
    background: ${enterprise.surfaceSecondary};
    border-bottom: 1px solid ${enterprise.border};
`;

const TimelineTitle = styled.h3`
    font-size: ${enterprise.fontSize.base};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    margin: 0;
`;

const LoadingState = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${enterprise.space.md};
    padding: ${enterprise.space.xxl};
    color: ${enterprise.textTertiary};
    font-size: ${enterprise.fontSize.sm};
    font-weight: 500;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${enterprise.space.xxl};
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${enterprise.surfaceTertiary};
    border-radius: 50%;
    margin-bottom: ${enterprise.space.lg};
`;

const EmptyTitle = styled.h4`
    font-size: ${enterprise.fontSize.lg};
    font-weight: 600;
    color: ${enterprise.textSecondary};
    margin: 0 0 ${enterprise.space.sm} 0;
`;

const EmptyDescription = styled.p`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textTertiary};
    margin: 0;
`;

const Timeline = styled.div`
    padding: ${enterprise.space.xl};
`;

// Unified Timeline for better UX
const UnifiedTimeline = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.md};
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${enterprise.space.md} ${enterprise.space.lg};
    background: ${enterprise.surfaceSecondary};
    border: 1px solid ${enterprise.border};
    border-radius: ${enterprise.radius.md};
    margin-bottom: ${enterprise.space.md};
`;

const SectionTitle = styled.h4`
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
    color: ${enterprise.textPrimary};
    margin: 0;
`;

const SectionCount = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    background: ${enterprise.textMuted};
    color: white;
    border-radius: ${enterprise.radius.sm};
    font-size: ${enterprise.fontSize.xs};
    font-weight: 600;
`;

const CommentsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.md};
`;

const CommentEntry = styled.div<{ $type: 'INTERNAL' | 'EXTERNAL'; $isRecent?: boolean }>`
    background: ${enterprise.surface};
    border: 1px solid ${props => props.$isRecent ? (props.$type === 'EXTERNAL' ? enterprise.external.primary : enterprise.primary) : enterprise.border};
    border-left: 3px solid ${props => props.$type === 'EXTERNAL' ? enterprise.external.primary : enterprise.primary};
    border-radius: ${enterprise.radius.md};
    padding: ${enterprise.space.lg};
    transition: all 0.3s ease;
    position: relative;

    ${props => props.$isRecent && `
        animation: highlightNew 0.6s ease-out;
        box-shadow: 0 0 0 3px ${props.$type === 'EXTERNAL' ? 'rgba(51, 65, 85, 0.1)' : 'rgba(37, 99, 235, 0.1)'};
    `}

    &:hover {
        box-shadow: ${enterprise.shadow.sm};
        border-color: ${props => props.$type === 'EXTERNAL' ? enterprise.external.primary : enterprise.primary};
    }

    @keyframes highlightNew {
        0% {
            background: ${props => props.$type === 'EXTERNAL' ? 'rgba(51, 65, 85, 0.05)' : 'rgba(37, 99, 235, 0.05)'};
            transform: translateY(-2px);
        }
        100% {
            background: ${enterprise.surface};
            transform: translateY(0);
        }
    }
`;

const CommentMeta = styled.div`
    margin-bottom: ${enterprise.space.md};
`;

const AuthorInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${enterprise.space.md};
`;

const Avatar = styled.div<{ $type: 'INTERNAL' | 'EXTERNAL' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${props => props.$type === 'EXTERNAL' ? enterprise.external.primary : enterprise.primary};
    color: white;
    border-radius: 50%;
    font-size: ${enterprise.fontSize.sm};
`;

const AuthorDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.xs};
`;

const AuthorName = styled.div`
    font-size: ${enterprise.fontSize.sm};
    font-weight: 600;
    color: ${enterprise.textPrimary};
`;

const Timestamp = styled.div`
    font-size: ${enterprise.fontSize.xs};
    color: ${enterprise.textTertiary};
`;

const CommentTypeLabel = styled.div<{ $type: 'INTERNAL' | 'CUSTOMER' }>`
    display: inline-flex;
    align-items: center;
    margin-left: ${enterprise.space.sm};
    padding: 2px ${enterprise.space.sm};
    background: ${props => props.$type === 'CUSTOMER' ? enterprise.external.primary : enterprise.primary};
    color: white;
    border-radius: ${enterprise.radius.sm};
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const NewIndicator = styled.div`
    position: absolute;
    top: ${enterprise.space.md};
    right: ${enterprise.space.md};
    padding: ${enterprise.space.xs} ${enterprise.space.sm};
    background: #10b981;
    color: white;
    border-radius: ${enterprise.radius.sm};
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    animation: fadeInOut 3s ease-out;

    @keyframes fadeInOut {
        0%, 80% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }
`;

const CommentContent = styled.div`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textSecondary};
    line-height: 1.6;
    white-space: pre-line;
`;

const SystemEntry = styled.div<{ $isRecent?: boolean }>`
    display: flex;
    align-items: flex-start;
    gap: ${enterprise.space.md};
    background: ${enterprise.surface};
    border: 1px solid ${props => props.$isRecent ? enterprise.system.primary : enterprise.border};
    border-left: 3px solid ${enterprise.system.primary};
    border-radius: ${enterprise.radius.md};
    padding: ${enterprise.space.lg};
    transition: all 0.3s ease;
    position: relative;

    ${props => props.$isRecent && `
        animation: highlightNew 0.6s ease-out;
        box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
    `}

    &:hover {
        box-shadow: ${enterprise.shadow.sm};
    }

    @keyframes highlightNew {
        0% {
            background: rgba(107, 114, 128, 0.05);
            transform: translateY(-2px);
        }
        100% {
            background: ${enterprise.surface};
            transform: translateY(0);
        }
    }
`;

const SystemIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: ${enterprise.system.primary};
    color: white;
    border-radius: 50%;
    font-size: ${enterprise.fontSize.xs};
    flex-shrink: 0;
`;

const SystemContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${enterprise.space.xs};
`;

const SystemText = styled.div`
    font-size: ${enterprise.fontSize.sm};
    color: ${enterprise.textSecondary};
`;

const SystemTime = styled.div`
    font-size: ${enterprise.fontSize.xs};
    color: ${enterprise.textMuted};
`;

const Spinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export default ProtocolComments;