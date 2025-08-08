// src/pages/Settings/components/UserSignatureCard.tsx
import React, { useState, useRef } from 'react';
import { FaPen, FaCheck, FaEye, FaEdit, FaPlus, FaTrashAlt, FaCheckCircle } from 'react-icons/fa';
import { useUserSignature } from '../../../../hooks/useUserSignature';
import { SectionCard } from './SectionCard';
import { ProfessionalSignatureCanvas } from './ProfessionalSignatureCanvas';
import { LoadingSpinner } from './LoadingSpinner';
import {
    SignatureCreator,
    CreatorHeader,
    CreatorTitle,
    CreatorActions,
    CanvasContainer,
    PreviewSection,
    PreviewHeader,
    PreviewTitle,
    PreviewMeta,
    PreviewContent,
    SignatureDisplay,
    PreviewActions,
    EmptyState,
    EmptyIcon,
    EmptyTitle,
    EmptyDescription,
    EmptyActions,
    CompactStatus,
    StatusRow,
    StatusLabel,
    StatusValue,
    ActionButton
} from '../../styles/companySettings/UserSignature.styles';

interface UserSignatureCardProps {
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
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
    const canvasRef = useRef<any>(null);

    const handleSignatureChange = (signatureData: string, isEmpty: boolean) => {
        setCurrentSignatureData(signatureData);
        setIsSignatureEmpty(isEmpty);
    };

    const handleSaveSignature = async () => {
        if (isSignatureEmpty) {
            onError?.('Narysuj podpis przed zapisaniem');
            return;
        }

        try {
            let result;
            if (hasSignature) {
                result = await updateSignature(currentSignatureData);
            } else {
                result = await createSignature(currentSignatureData);
            }

            if (result) {
                onSuccess?.(hasSignature ? 'Podpis został zaktualizowany' : 'Podpis został utworzony');
                setIsCreating(false);
                setCurrentSignatureData('');
                setIsSignatureEmpty(true);
            } else if (error) {
                onError?.(error);
            }
        } catch (err) {
            onError?.('Nie udało się zapisać podpisu');
        }
    };

    const handleDeleteSignature = async () => {
        if (!window.confirm('Czy na pewno chcesz usunąć swój podpis?')) return;

        const success = await deleteSignature();
        if (success) {
            onSuccess?.('Podpis został usunięty');
            setShowPreview(false);
        } else if (error) {
            onError?.(error);
        }
    };

    const startCreating = () => {
        setIsCreating(true);
        setShowPreview(false);
        setCurrentSignatureData('');
        setIsSignatureEmpty(true);
        clearError();
    };

    const handleCancel = () => {
        setIsCreating(false);
        setCurrentSignatureData('');
        setIsSignatureEmpty(true);
        clearError();
    };

    const getActions = () => {
        if (isCreating) return [];

        if (hasSignature) {
            return [
                {
                    icon: FaEye,
                    label: showPreview ? 'Ukryj' : 'Podgląd',
                    onClick: () => setShowPreview(!showPreview),
                    secondary: true
                },
                {
                    icon: FaEdit,
                    label: 'Edytuj',
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
    };

    if (loading) {
        return (
            <SectionCard
                icon={hasSignature ? FaCheck : FaPen}
                title="Podpis elektroniczny"
                subtitle={hasSignature
                    ? 'Twój podpis jest gotowy do użycia w dokumentach'
                    : 'Utwórz podpis, który będzie automatycznie dodawany do dokumentów'
                }
            >
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <LoadingSpinner />
                </div>
            </SectionCard>
        );
    }

    return (
        <SectionCard
            icon={hasSignature ? FaCheck : FaPen}
            title="Podpis elektroniczny"
            subtitle={hasSignature
                ? 'Twój podpis jest gotowy do użycia w dokumentach'
                : 'Utwórz podpis, który będzie automatycznie dodawany do dokumentów'
            }
            actions={getActions()}
        >
            {/* Creating/Editing State */}
            {isCreating && (
                <SignatureCreator>
                    <CreatorHeader>
                        <CreatorTitle>
                            {hasSignature ? 'Edytuj podpis' : 'Utwórz nowy podpis'}
                        </CreatorTitle>
                        <CreatorActions>
                            <ActionButton $secondary onClick={handleCancel}>
                                Anuluj
                            </ActionButton>
                            <ActionButton
                                $primary
                                onClick={handleSaveSignature}
                                disabled={saving || isSignatureEmpty}
                            >
                                {saving ? 'Zapisywanie...' : 'Zapisz podpis'}
                            </ActionButton>
                        </CreatorActions>
                    </CreatorHeader>

                    <CanvasContainer>
                        <ProfessionalSignatureCanvas
                            ref={canvasRef}
                            width={600}
                            height={200}
                            onSignatureChange={handleSignatureChange}
                            initialSignature={hasSignature ? signature?.content : undefined}
                            penStyle="smooth"
                        />
                    </CanvasContainer>
                </SignatureCreator>
            )}

            {/* Preview Mode */}
            {showPreview && hasSignature && !isCreating && (
                <PreviewSection>
                    <PreviewHeader>
                        <PreviewTitle>Podgląd podpisu</PreviewTitle>
                        <PreviewMeta>
                            Utworzony: {new Date(signature!.createdAt).toLocaleDateString('pl-PL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                        </PreviewMeta>
                    </PreviewHeader>
                    <PreviewContent>
                        <SignatureDisplay
                            dangerouslySetInnerHTML={{ __html: signature!.content }}
                        />
                    </PreviewContent>
                    <PreviewActions>
                        <ActionButton $secondary onClick={startCreating}>
                            <FaEdit />
                            Edytuj podpis
                        </ActionButton>
                        <ActionButton $danger onClick={handleDeleteSignature}>
                            <FaTrashAlt />
                            Usuń podpis
                        </ActionButton>
                    </PreviewActions>
                </PreviewSection>
            )}

            {/* Empty State */}
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
                        <ActionButton $primary $large onClick={startCreating}>
                            <FaPen />
                            Utwórz podpis teraz
                        </ActionButton>
                    </EmptyActions>
                </EmptyState>
            )}

            {/* Compact Status for existing signature */}
            {hasSignature && !isCreating && !showPreview && (
                <CompactStatus>
                    <StatusRow>
                        <StatusLabel>Status podpisu:</StatusLabel>
                        <StatusValue $success>
                            <FaCheckCircle />
                            Aktywny
                        </StatusValue>
                    </StatusRow>
                    <StatusRow>
                        <StatusLabel>Utworzony:</StatusLabel>
                        <StatusValue>
                            {new Date(signature!.createdAt).toLocaleDateString('pl-PL')}
                        </StatusValue>
                    </StatusRow>
                    <StatusRow>
                        <StatusLabel>Ostatnia aktualizacja:</StatusLabel>
                        <StatusValue>
                            {new Date(signature!.updatedAt).toLocaleDateString('pl-PL')}
                        </StatusValue>
                    </StatusRow>
                </CompactStatus>
            )}
        </SectionCard>
    );
};