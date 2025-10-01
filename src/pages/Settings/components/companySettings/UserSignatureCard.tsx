// src/pages/Settings/components/UserSignatureCard.tsx - Fixed component
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FaCheck, FaCheckCircle, FaEdit, FaEye, FaPen, FaPlus, FaTrashAlt} from 'react-icons/fa';
import {useUserSignature} from '../../../../hooks/useUserSignature';
import {SectionCard} from './SectionCard';
import {SimpleSignatureCanvas} from './SimpleSignatureCanvas'; // Changed import
import {LoadingSpinner} from './LoadingSpinner';
import {
    ActionButton,
    CanvasContainer,
    CompactStatus,
    CreatorActions,
    CreatorHeader,
    CreatorTitle,
    EmptyActions,
    EmptyDescription,
    EmptyIcon,
    EmptyState,
    EmptyTitle,
    PreviewActions,
    PreviewContent,
    PreviewHeader,
    PreviewMeta,
    PreviewSection,
    PreviewTitle,
    SignatureCreator,
    SignatureDisplay,
    StatusLabel,
    StatusRow,
    StatusValue
} from '../../styles/companySettings/UserSignature.styles';

interface UserSignatureCardProps {
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

interface CanvasRef {
    getSignatureData: () => string;
    isEmpty: () => boolean;
    clear: () => void;
}

export const UserSignatureCard: React.FC<UserSignatureCardProps> = ({ onSuccess, onError }) => {
    const {
        signature,
        hasSignature,
        loading,
        saving,
        error,
        createSignature,
        updateSignature,
        deleteSignature,
        clearError
    } = useUserSignature();

    const [isCreating, setIsCreating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [currentSignatureData, setCurrentSignatureData] = useState<string>('');
    const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
    const canvasRef = useRef<CanvasRef>(null);

    // Handle signature changes from canvas
    const handleSignatureChange = useCallback((signatureData: string, isEmpty: boolean) => {

        setCurrentSignatureData(signatureData);
        setIsSignatureEmpty(isEmpty);

        // Clear any existing errors when user starts drawing
        if (!isEmpty && error) {
            clearError();
        }
    }, [error, clearError]);

    // Save signature (create or update)
    const handleSaveSignature = useCallback(async () => {
        if (isSignatureEmpty) {
            onError?.('Narysuj podpis przed zapisaniem');
            return;
        }

        if (!currentSignatureData.trim()) {
            onError?.('Brak danych podpisu do zapisania');
            return;
        }

        try {
            let result: any = null;

            if (hasSignature) {
                result = await updateSignature(currentSignatureData);
            } else {
                result = await createSignature(currentSignatureData);
            }

            if (result) {
                onSuccess?.(hasSignature ? 'Podpis został zaktualizowany pomyślnie' : 'Podpis został utworzony pomyślnie');
                setIsCreating(false);
                setCurrentSignatureData('');
                setIsSignatureEmpty(true);
                setShowPreview(true); // Show preview after saving
            } else {
                // Error was already set in the hook
                if (error) {
                    onError?.(error);
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
            onError?.(errorMessage);
        }
    }, [isSignatureEmpty, currentSignatureData, hasSignature, updateSignature, createSignature, onSuccess, onError, error]);

    // Delete signature with confirmation
    const handleDeleteSignature = useCallback(async () => {
        const confirmed = window.confirm('Czy na pewno chcesz usunąć swój podpis? Ta operacja nie może zostać cofnięta.');
        if (!confirmed) return;

        const success = await deleteSignature();
        if (success) {
            onSuccess?.('Podpis został usunięty pomyślnie');
            setShowPreview(false);
            setIsCreating(false);
            setCurrentSignatureData('');
            setIsSignatureEmpty(true);
        } else if (error) {
            onError?.(error);
        }
    }, [deleteSignature, onSuccess, onError, error]);

    // Start creating/editing signature
    const startCreating = useCallback(() => {
        setIsCreating(true);
        setShowPreview(false);
        // Don't clear signature data here - let canvas handle initial signature loading
        clearError();
    }, [clearError]);

    // Cancel editing
    const handleCancel = useCallback(() => {
        setIsCreating(false);
        setCurrentSignatureData('');
        setIsSignatureEmpty(true);
        clearError();

        // Clear canvas if available
        if (canvasRef.current) {
            canvasRef.current.clear();
        }
    }, [clearError]);

    // Toggle preview
    const togglePreview = useCallback(() => {
        setShowPreview(prev => !prev);
        if (isCreating) {
            setIsCreating(false);
        }
    }, [isCreating]);

    // Handle error display
    useEffect(() => {
        if (error) {
            onError?.(error);
        }
    }, [error, onError]);

    // Get card actions based on current state
    const getCardActions = useCallback(() => {
        if (isCreating) return [];

        if (hasSignature) {
            return [
                {
                    icon: FaEye,
                    label: showPreview ? 'Ukryj podgląd' : 'Pokaż podgląd',
                    onClick: togglePreview,
                    secondary: true
                },
                {
                    icon: FaEdit,
                    label: 'Edytuj podpis',
                    onClick: startCreating,
                    secondary: true
                }
            ];
        }

        return [
            {
                icon: FaPlus,
                label: 'Utwórz podpis',
                onClick: startCreating,
                primary: true
            }
        ];
    }, [isCreating, hasSignature, showPreview, togglePreview, startCreating]);

    // Format date for display
    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    // Show loading state
    if (loading) {
        return (
            <SectionCard
                icon={FaPen}
                title="Podpis elektroniczny"
                subtitle="Ładowanie danych podpisu..."
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '60px 20px',
                    minHeight: '200px'
                }}>
                    <LoadingSpinner />
                </div>
            </SectionCard>
        );
    }

    return (
        <SectionCard
            icon={hasSignature ? FaCheckCircle : FaPen}
            title="Podpis elektroniczny"
            subtitle={hasSignature
                ? 'Twój podpis jest gotowy do użycia w dokumentach'
                : 'Utwórz podpis, który będzie automatycznie dodawany do dokumentów'
            }
            actions={getCardActions()}
        >
            {/* Creating/Editing Mode */}
            {isCreating && (
                <SignatureCreator>
                    <CreatorHeader>
                        <CreatorTitle>
                            {hasSignature ? 'Edytuj podpis' : 'Utwórz nowy podpis'}
                        </CreatorTitle>
                        <CreatorActions>
                            <ActionButton
                                $secondary
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Anuluj
                            </ActionButton>
                            <ActionButton
                                $primary
                                onClick={handleSaveSignature}
                                disabled={saving || isSignatureEmpty}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinning">⟳</span>
                                        Zapisywanie...
                                    </>
                                ) : (
                                    <>
                                        <FaCheck />
                                        Zapisz podpis
                                    </>
                                )}
                            </ActionButton>
                        </CreatorActions>
                    </CreatorHeader>

                    <CanvasContainer>
                        <SimpleSignatureCanvas
                            ref={canvasRef}
                            width={600}
                            height={200}
                            onSignatureChange={handleSignatureChange}
                            initialSignature={hasSignature ? signature?.content : ''}
                            penStyle="smooth"
                            disabled={saving}
                        />
                    </CanvasContainer>
                </SignatureCreator>
            )}

            {/* Preview Mode */}
            {showPreview && hasSignature && !isCreating && signature && (
                <PreviewSection>
                    <PreviewHeader>
                        <div>
                            <PreviewTitle>Podgląd podpisu</PreviewTitle>
                            <PreviewMeta>
                                Utworzony: {formatDate(signature.createdAt)}
                                {signature.updatedAt !== signature.createdAt && (
                                    <> • Ostatnia aktualizacja: {formatDate(signature.updatedAt)}</>
                                )}
                            </PreviewMeta>
                        </div>
                    </PreviewHeader>

                    <PreviewContent>
                        <SignatureDisplay>
                            {signature.content.startsWith('data:image/') ? (
                                <img
                                    src={signature.content}
                                    alt="Podpis użytkownika"
                                    style={{
                                        maxWidth: '400px',
                                        maxHeight: '150px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '4px',
                                        background: 'white',
                                        padding: '8px',
                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: signature.content }} />
                            )}
                        </SignatureDisplay>
                    </PreviewContent>

                    <PreviewActions>
                        <ActionButton
                            $secondary
                            onClick={startCreating}
                            disabled={saving}
                        >
                            <FaEdit />
                            Edytuj podpis
                        </ActionButton>
                        <ActionButton
                            $danger
                            onClick={handleDeleteSignature}
                            disabled={saving}
                        >
                            <FaTrashAlt />
                            {saving ? 'Usuwanie...' : 'Usuń podpis'}
                        </ActionButton>
                    </PreviewActions>
                </PreviewSection>
            )}

            {/* Empty State - No signature exists */}
            {!hasSignature && !isCreating && (
                <EmptyState>
                    <EmptyIcon>
                        <FaPen />
                    </EmptyIcon>
                    <EmptyTitle>Brak podpisu elektronicznego</EmptyTitle>
                    <EmptyDescription>
                        Podpis elektroniczny będzie automatycznie dodawany do wszystkich dokumentów,
                        które wystawiasz. To profesjonalne rozwiązanie dla Twojej firmy detailingowej.
                    </EmptyDescription>
                    <EmptyActions>
                        <ActionButton
                            $primary
                            $large
                            onClick={startCreating}
                            disabled={loading}
                        >
                            <FaPen />
                            Utwórz podpis teraz
                        </ActionButton>
                    </EmptyActions>
                </EmptyState>
            )}

            {/* Compact Status - Signature exists but not in preview mode */}
            {hasSignature && !isCreating && !showPreview && signature && (
                <CompactStatus>
                    <StatusRow>
                        <StatusLabel>Status podpisu:</StatusLabel>
                        <StatusValue $success>
                            <FaCheckCircle />
                            Aktywny i gotowy do użycia
                        </StatusValue>
                    </StatusRow>
                    <StatusRow>
                        <StatusLabel>Utworzony:</StatusLabel>
                        <StatusValue>
                            {new Date(signature.createdAt).toLocaleDateString('pl-PL')}
                        </StatusValue>
                    </StatusRow>
                    {signature.updatedAt !== signature.createdAt && (
                        <StatusRow>
                            <StatusLabel>Ostatnia aktualizacja:</StatusLabel>
                            <StatusValue>
                                {new Date(signature.updatedAt).toLocaleDateString('pl-PL')}
                            </StatusValue>
                        </StatusRow>
                    )}
                    <StatusRow>
                        <StatusLabel>Identyfikator:</StatusLabel>
                        <StatusValue style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                            {signature.id.slice(0, 8)}...
                        </StatusValue>
                    </StatusRow>
                </CompactStatus>
            )}
        </SectionCard>
    );
};