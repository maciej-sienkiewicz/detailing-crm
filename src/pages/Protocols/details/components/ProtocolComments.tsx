import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {format} from 'date-fns';
import {pl} from 'date-fns/locale';
import {FaCalendarAlt, FaClock, FaPaperPlane, FaSpinner, FaUser} from 'react-icons/fa';
import {CarReceptionProtocol, ProtocolStatus} from '../../../../types';
import {Comment, commentsApi} from '../../../../api/commentsApi';

interface ProtocolCommentsProps {
    protocol: CarReceptionProtocol;
    onProtocolUpdate: (updatedProtocol: CarReceptionProtocol) => void;
}

const ProtocolComments: React.FC<ProtocolCommentsProps> = ({ protocol, onProtocolUpdate }) => {
    // Stan lokalny komponentu
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentType, setCommentType] = useState<'internal' | 'customer'>('internal');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pobieranie komentarzy przy pierwszym renderowaniu komponentu
    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedComments = await commentsApi.getComments(protocol.id);
                setComments(fetchedComments);
            } catch (err) {
                console.error('Error fetching comments:', err);
                setError('Nie udało się pobrać komentarzy. Spróbuj odświeżyć stronę.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchComments();
    }, [protocol.id]);

    // Format date for display
    const formatDateTime = (dateString: string): string => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: pl });
    };

    // Handle comment submission
    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // Create new comment object
            const commentData: Comment = {
                protocolId: protocol.id,
                author: 'Administrator', // W prawdziwej aplikacji byłby to aktualny użytkownik
                content: newComment,
                type: commentType
            };

            // Wysyłanie do API
            const savedComment = await commentsApi.addComment(commentData);

            if (savedComment) {
                // Dodaj komentarz do lokalnego stanu
                setComments(prevComments => [...prevComments, savedComment]);

                // Clear input
                setNewComment('');
            } else {
                setError('Nie udało się dodać komentarza. Spróbuj ponownie.');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            setError('Wystąpił błąd podczas dodawania komentarza.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Podziel komentarze na typy dla grupowania
    const internalComments = comments.filter(c => c.type === 'internal');
    const customerComments = comments.filter(c => c.type === 'customer');
    const systemComments = comments.filter(c => c.type === 'system');

    return (
        <CommentsContainer>
            {/* Sekcja dodawania komentarzy */}
            <AddCommentSection>
                <CommentTypeSelector>
                    <TypeButton
                        active={commentType === 'internal'}
                        onClick={() => setCommentType('internal')}
                    >
                        Komentarz wewnętrzny
                    </TypeButton>
                    <TypeButton
                        active={commentType === 'customer'}
                        onClick={() => setCommentType('customer')}
                        disabled={protocol.status === ProtocolStatus.CANCELLED}
                        customerType
                    >
                        Informacja dla klienta
                    </TypeButton>
                </CommentTypeSelector>

                <CommentInputWrapper>
                    <CommentInput
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={commentType === 'internal'
                            ? "Wpisz komentarz wewnętrzny dotyczący zlecenia (nie będzie widoczny dla klienta)..."
                            : "Wpisz informację, która zostanie wysłana do klienta..."
                        }
                        rows={3}
                        typeColor={commentType === 'internal' ? '#3498db' : '#27ae60'}
                    />
                    <SubmitButton
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || isSubmitting}
                        typeColor={commentType === 'internal' ? '#3498db' : '#27ae60'}
                    >
                        {isSubmitting ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
                        {isSubmitting ? 'Dodawanie...' : 'Dodaj komentarz'}
                    </SubmitButton>
                </CommentInputWrapper>

                {error && <ErrorMessage>{error}</ErrorMessage>}
            </AddCommentSection>

            {/* Całkowita historia komentarzy */}
            <SectionTitle>Historia komentarzy</SectionTitle>

            {isLoading ? (
                <LoadingState>
                    <FaSpinner className="spinner" /> Ładowanie komentarzy...
                </LoadingState>
            ) : comments.length === 0 ? (
                <EmptyState>
                    Brak komentarzy. Dodaj pierwszy komentarz dotyczący tego zlecenia.
                </EmptyState>
            ) : (
                <CommentsList>
                    {/* Sekcja komentarzy dla klienta */}
                    {customerComments.length > 0 && (
                        <CommentGroup>
                            <CommentGroupHeader customerType>
                                Informacje wysłane do klienta
                            </CommentGroupHeader>

                            {customerComments.map(comment => (
                                <CommentItem key={comment.id} type={comment.type}>
                                    <CommentAuthor>
                                        <AuthorIcon customerType><FaUser /></AuthorIcon>
                                        <AuthorInfo>
                                            <AuthorName>{comment.author}</AuthorName>
                                            <CommentTime>
                                                <TimeIcon><FaCalendarAlt /></TimeIcon>
                                                {formatDateTime(comment.timestamp || '')}
                                            </CommentTime>
                                        </AuthorInfo>
                                    </CommentAuthor>
                                    <CommentContent>{comment.content}</CommentContent>
                                </CommentItem>
                            ))}
                        </CommentGroup>
                    )}

                    {/* Sekcja komentarzy wewnętrznych */}
                    {internalComments.length > 0 && (
                        <CommentGroup>
                            <CommentGroupHeader>
                                Komentarze wewnętrzne
                            </CommentGroupHeader>

                            {internalComments.map(comment => (
                                <CommentItem key={comment.id} type={comment.type}>
                                    <CommentAuthor>
                                        <AuthorIcon><FaUser /></AuthorIcon>
                                        <AuthorInfo>
                                            <AuthorName>{comment.author}</AuthorName>
                                            <CommentTime>
                                                <TimeIcon><FaCalendarAlt /></TimeIcon>
                                                {formatDateTime(comment.timestamp || '')}
                                            </CommentTime>
                                        </AuthorInfo>
                                    </CommentAuthor>
                                    <CommentContent>{comment.content}</CommentContent>
                                </CommentItem>
                            ))}
                        </CommentGroup>
                    )}

                    {/* Sekcja wpisów systemowych */}
                    {systemComments.length > 0 && (
                        <CommentGroup>
                            <CommentGroupHeader systemType>
                                Wpisy systemowe
                            </CommentGroupHeader>

                            {systemComments.map(comment => (
                                <CommentItem key={comment.id} type={comment.type}>
                                    <SystemCommentContent>
                                        <SystemIcon><FaClock /></SystemIcon>
                                        <div>
                                            <SystemContent>{comment.content}</SystemContent>
                                            <SystemTime>{formatDateTime(comment.timestamp || '')}</SystemTime>
                                        </div>
                                    </SystemCommentContent>
                                </CommentItem>
                            ))}
                        </CommentGroup>
                    )}
                </CommentsList>
            )}
        </CommentsContainer>
    );
};

// Styled components
const CommentsContainer = styled.div``;

const SectionTitle = styled.h3`
    font-size: 16px;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
`;

const AddCommentSection = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 25px;
`;

const CommentTypeSelector = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
`;

const TypeButton = styled.button<{ active?: boolean; customerType?: boolean }>`
    flex: 1;
    padding: 10px;
    border: 1px solid ${props => props.active
            ? (props.customerType ? '#27ae60' : '#3498db')
            : '#ddd'};
    background-color: ${props => props.active
            ? (props.customerType ? '#eafaf1' : '#eaf6fd')
            : 'white'};
    color: ${props => props.active
            ? (props.customerType ? '#27ae60' : '#3498db')
            : '#7f8c8d'};
    border-radius: 4px;
    font-size: 14px;
    font-weight: ${props => props.active ? '500' : 'normal'};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: ${props => props.active
                ? (props.customerType ? '#eafaf1' : '#eaf6fd')
                : '#f5f5f5'};
    }
`;

const CommentInputWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const CommentInput = styled.textarea<{ typeColor: string }>`
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-left: 3px solid ${props => props.typeColor};
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;
    font-family: inherit;

    &:focus {
        outline: none;
        border-color: ${props => props.typeColor};
        box-shadow: 0 0 0 2px ${props => props.typeColor}20;
    }
`;

const SubmitButton = styled.button<{ typeColor: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: ${props => props.typeColor};
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    align-self: flex-end;

    &:hover:not(:disabled) {
        background-color: ${props => props.typeColor}dd;
    }

    &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }

    .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const ErrorMessage = styled.div`
    margin-top: 10px;
    padding: 8px 12px;
    background-color: #fdecea;
    color: #e74c3c;
    border-radius: 4px;
    font-size: 13px;
`;

const LoadingState = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 30px;
    color: #7f8c8d;
    
    .spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const CommentsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 25px;
`;

const CommentGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const CommentGroupHeader = styled.div<{ customerType?: boolean; systemType?: boolean }>`
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.customerType
            ? '#27ae60'
            : props.systemType ? '#7f8c8d' : '#3498db'};
    padding-bottom: 5px;
    border-bottom: 1px dashed #eee;
`;

const EmptyState = styled.div`
    padding: 20px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 4px;
    color: #7f8c8d;
    font-size: 14px;
`;

const CommentItem = styled.div<{ type?: string }>`
    background-color: ${props => {
        switch (props.type) {
            case 'customer':
                return '#eafaf1';
            case 'system':
                return '#f8f9fa';
            default:
                return '#eaf6fd';
        }
    }};
    border-radius: 4px;
    padding: 12px 15px;
`;

const CommentAuthor = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
`;

const AuthorIcon = styled.div<{ customerType?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${props => props.customerType ? '#27ae60' : '#3498db'};
    color: white;
    margin-right: 10px;
`;

const AuthorInfo = styled.div`
    flex: 1;
`;

const AuthorName = styled.div`
    font-weight: 500;
    font-size: 14px;
    color: #34495e;
`;

const CommentTime = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #7f8c8d;
`;

const TimeIcon = styled.span`
    font-size: 10px;
`;

const CommentContent = styled.div`
    font-size: 14px;
    color: #34495e;
    white-space: pre-line;
    padding-left: 42px; /* Wyrównanie z ikoną autora */
`;

// Komponenty dla wpisów systemowych
const SystemCommentContent = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const SystemIcon = styled.div`
    color: #7f8c8d;
    font-size: 16px;
`;

const SystemContent = styled.div`
    font-size: 14px;
    color: #7f8c8d;
`;

const SystemTime = styled.div`
    font-size: 12px;
    color: #95a5a6;
    margin-top: 3px;
`;

export default ProtocolComments;