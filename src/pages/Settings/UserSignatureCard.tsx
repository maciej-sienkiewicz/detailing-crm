import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import {
    FaPen,
    FaSave,
    FaTimes,
    FaSpinner,
    FaCheckCircle,
    FaExclamationTriangle,
    FaTrashAlt,
    FaEye,
    FaEdit,
    FaCheck,
    FaPlus
} from 'react-icons/fa';
import { useUserSignature } from '../../hooks/useUserSignature';
import { ProfessionalSignatureCanvas } from './ProfessionalSignatureCanvas'; // Import the new component

// Professional theme matching your app
const theme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    primaryDark: '#0f2027',
    primaryGhost: 'rgba(26, 54, 93, 0.04)',
    success: '#059669',
    successLight: '#d1fae5',
    warning: '#d97706',
    warningLight: '#fef3c7',
    error: '#dc2626',
    errorLight: '#fee2e2',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceElevated: '#f8fafc',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8'
    },
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    shadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)'
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
        xl: '16px'
    }
};

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

    // Handle signature change from canvas
    const handleSignatureChange = (signatureData: string, isEmpty: boolean) => {
        setCurrentSignatureData(signatureData);
        setIsSignatureEmpty(isEmpty);
    };

    // Handle saving signature
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

    // Handle signature deletion
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

    // Start creating signature
    const startCreating = () => {
        setIsCreating(true);
        setShowPreview(false);
        setCurrentSignatureData('');
        setIsSignatureEmpty(true);
        clearError();
    };

    // Cancel creating
    const handleCancel = () => {
        setIsCreating(false);
        setCurrentSignatureData('');
        setIsSignatureEmpty(true);
        clearError();
    };

    if (loading) {
        return (
            <SignatureCard>
                <LoadingState>
                    <LoadingSpinner />
                    <LoadingText>Ładowanie podpisu...</LoadingText>
                </LoadingState>
            </SignatureCard>
        );
    }

    return (
        <SignatureCard>
            <CardHeader>
                <HeaderContent>
                    <HeaderIcon $hasSignature={hasSignature}>
                        {hasSignature ? <FaCheck /> : <FaPen />}
                    </HeaderIcon>
                    <HeaderText>
                        <HeaderTitle>Podpis elektroniczny</HeaderTitle>
                        <HeaderSubtitle>
                            {hasSignature
                                ? 'Twój podpis jest gotowy do użycia w dokumentach'
                                : 'Utwórz podpis, który będzie automatycznie dodawany do dokumentów'
                            }
                        </HeaderSubtitle>
                    </HeaderText>
                </HeaderContent>

                {!isCreating && (
                    <HeaderActions>
                        {hasSignature && (
                            <>
                                <ActionButton
                                    $secondary
                                    onClick={() => setShowPreview(!showPreview)}
                                >
                                    <FaEye />
                                    {showPreview ? 'Ukryj' : 'Podgląd'}
                                </ActionButton>
                                <ActionButton
                                    $secondary
                                    onClick={startCreating}
                                >
                                    <FaEdit />
                                    Edytuj
                                </ActionButton>
                            </>
                        )}
                        {!hasSignature && (
                            <ActionButton $primary onClick={startCreating}>
                                <FaPlus />
                                Utwórz podpis
                            </ActionButton>
                        )}
                    </HeaderActions>
                )}
            </CardHeader>

            {/* Status Banner */}
            <StatusBanner $hasSignature={hasSignature}>
                <StatusIcon>
                    {hasSignature ? (
                        <FaCheckCircle style={{ color: theme.success }} />
                    ) : (
                        <FaExclamationTriangle style={{ color: theme.warning }} />
                    )}
                </StatusIcon>
                <StatusText>
                    {hasSignature
                        ? `Podpis aktywny od ${new Date(signature!.createdAt).toLocaleDateString('pl-PL')}`
                        : 'Podpis nie został jeszcze utworzony'
                    }
                </StatusText>
            </StatusBanner>

            <CardBody>
                {/* Creating/Editing State */}
                {isCreating && (
                    <SignatureCreator>
                        <CreatorHeader>
                            <CreatorTitle>
                                {hasSignature ? 'Edytuj podpis' : 'Utwórz nowy podpis'}
                            </CreatorTitle>
                            <CreatorActions>
                                <ActionButton $secondary onClick={handleCancel}>
                                    <FaTimes />
                                    Anuluj
                                </ActionButton>
                                <ActionButton
                                    $primary
                                    onClick={handleSaveSignature}
                                    disabled={saving || isSignatureEmpty}
                                >
                                    {saving ? <FaSpinner className="spinning" /> : <FaSave />}
                                    {saving ? 'Zapisywanie...' : 'Zapisz podpis'}
                                </ActionButton>
                            </CreatorActions>
                        </CreatorHeader>

                        {/* Professional Canvas Integration */}
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
            </CardBody>
        </SignatureCard>
    );
};

// Styled Components (same as before, but updated for the new structure)
const SignatureCard = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.xl};
    border: 1px solid ${theme.border};
    overflow: hidden;
    box-shadow: ${theme.shadow.sm};
    transition: all 0.2s ease;

    &:hover {
        box-shadow: ${theme.shadow.md};
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg};
    border-bottom: 1px solid ${theme.border};
    background: ${theme.surfaceAlt};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.md};
        align-items: stretch;
    }
`;

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    flex: 1;
    min-width: 0;
`;

const HeaderIcon = styled.div<{ $hasSignature: boolean }>`
    width: 48px;
    height: 48px;
    background: ${props => props.$hasSignature ? theme.successLight : theme.primaryGhost};
    color: ${props => props.$hasSignature ? theme.success : theme.primary};
    border-radius: ${theme.radius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: ${theme.shadow.sm};
`;

const HeaderText = styled.div`
    flex: 1;
    min-width: 0;
`;

const HeaderTitle = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: ${theme.text.primary};
    margin: 0 0 ${theme.spacing.xs} 0;
    letter-spacing: -0.025em;
`;

const HeaderSubtitle = styled.p`
    font-size: 14px;
    color: ${theme.text.secondary};
    margin: 0;
    font-weight: 500;
    line-height: 1.4;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};

    @media (max-width: 768px) {
        width: 100%;

        > * {
            flex: 1;
        }
    }
`;

const StatusBanner = styled.div<{ $hasSignature: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${props => props.$hasSignature ? theme.successLight : theme.warningLight};
    border-bottom: 1px solid ${theme.border};
`;

const StatusIcon = styled.div`
    font-size: 16px;
    flex-shrink: 0;
`;

const StatusText = styled.div`
    font-weight: 600;
    color: ${theme.text.primary};
    flex: 1;
`;

const CardBody = styled.div`
    padding: ${theme.spacing.xl};
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xxl};
    gap: ${theme.spacing.lg};
`;

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid ${theme.borderLight};
    border-top: 3px solid ${theme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const SignatureCreator = styled.div`
    background: ${theme.surfaceElevated};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    overflow: hidden;
`;

const CreatorHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.border};
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.md};
    }
`;

const CreatorTitle = styled.h4`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const CreatorActions = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};

    @media (max-width: 768px) {
        width: 100%;
        
        > * {
            flex: 1;
        }
    }
`;

const CanvasContainer = styled.div`
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
`;

const CreatorControls = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.lg};

    @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;
        gap: ${theme.spacing.md};
    }
`;

const ControlGroup = styled.div`
    display: flex;
    gap: ${theme.spacing.xs};
    background: ${theme.surfaceAlt};
    padding: ${theme.spacing.xs};
    border-radius: ${theme.radius.md};
    border: 1px solid ${theme.border};
`;

const ControlButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: none;
    border: none;
    border-radius: ${theme.radius.sm};
    color: ${theme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${theme.primary};
        color: white;
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }
`;

const ActionGroup = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};

    @media (max-width: 768px) {
        width: 100%;

        > * {
            flex: 1;
        }
    }
`;

const CanvasWrapper = styled.div`
    position: relative;
    background: white;
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    overflow: hidden;
    box-shadow: ${theme.shadow.md};
    margin-bottom: ${theme.spacing.lg};
`;

const SignatureCanvas = styled.canvas`
    display: block;
    width: 100%;
    height: auto;
    cursor: crosshair;
    touch-action: none;
    background: white;

    &:focus {
        outline: 2px solid ${theme.primary};
        outline-offset: 2px;
    }
`;

const CanvasInstructions = styled.div<{ $isExpanded: boolean }>`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.md};
    pointer-events: none;
    opacity: 0.4;
    transition: opacity 0.2s ease;
    text-align: center;
    max-width: 300px;

    ${CanvasWrapper}:hover & {
        opacity: 0.2;
    }
`;

const InstructionIcon = styled.div`
    font-size: 32px;
    color: ${theme.primary};
`;

const InstructionText = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
    line-height: 1.4;
`;

const SignatureTips = styled.div<{ $isExpanded: boolean }>`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.primaryGhost};
    border-radius: ${theme.radius.md};
    border: 1px solid ${theme.primary}20;
`;

const TipItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
`;

const TipIcon = styled.span`
    font-size: 16px;
    flex-shrink: 0;
`;

const TipText = styled.span`
    font-size: 12px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

// Preview Section
const PreviewSection = styled.div`
    background: ${theme.surfaceElevated};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    overflow: hidden;
`;

const PreviewHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border-bottom: 1px solid ${theme.border};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.xs};
    }
`;

const PreviewTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const PreviewMeta = styled.span`
    font-size: 12px;
    color: ${theme.text.muted};
    font-weight: 500;
`;

const PreviewContent = styled.div`
    padding: ${theme.spacing.xxl};
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${theme.surfaceAlt};
    min-height: 120px;
`;

const SignatureDisplay = styled.div`
    max-width: 100%;

    svg {
        max-width: 400px;
        max-height: 150px;
        border: 1px solid ${theme.borderLight};
        border-radius: ${theme.radius.sm};
        background: white;
        padding: ${theme.spacing.md};
        box-shadow: ${theme.shadow.sm};
    }
`;

const PreviewActions = styled.div`
    display: flex;
    justify-content: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.surface};
    border-top: 1px solid ${theme.border};

    @media (max-width: 768px) {
        > * {
            flex: 1;
        }
    }
`;

// Empty State
const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: ${theme.spacing.xxl};
    gap: ${theme.spacing.lg};
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    background: ${theme.primaryGhost};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: ${theme.primary};
    margin-bottom: ${theme.spacing.md};
`;

const EmptyTitle = styled.h3`
    font-size: 24px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const EmptyDescription = styled.p`
    font-size: 16px;
    color: ${theme.text.secondary};
    margin: 0;
    max-width: 500px;
    line-height: 1.6;
`;

const EmptyActions = styled.div`
    margin-top: ${theme.spacing.md};
`;

// Compact Status
const CompactStatus = styled.div`
    background: ${theme.surfaceElevated};
    border-radius: ${theme.radius.md};
    padding: ${theme.spacing.lg};
    border: 1px solid ${theme.border};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
`;

const StatusRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const StatusLabel = styled.span`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const StatusValue = styled.span<{ $success?: boolean }>`
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$success ? theme.success : theme.text.primary};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

// Action Button Component
const ActionButton = styled.button<{
    $primary?: boolean;
    $secondary?: boolean;
    $danger?: boolean;
    $large?: boolean;
}>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${props => props.$large ? `${theme.spacing.md} ${theme.spacing.xl}` : `${theme.spacing.sm} ${theme.spacing.md}`};
    border-radius: ${theme.radius.md};
    font-weight: 600;
    font-size: ${props => props.$large ? '16px' : '14px'};
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: ${props => props.$large ? '48px' : '40px'};
    position: relative;
    overflow: hidden;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.md};
    }

    &:not(:disabled):active {
        transform: translateY(0);
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Primary Button */
    ${props => props.$primary && `
        background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%);
        color: white;
        box-shadow: ${theme.shadow.sm};

        &:not(:disabled):hover {
            background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);
        }
    `}

        /* Secondary Button */
    ${props => props.$secondary && `
        background: ${theme.surface};
        color: ${theme.text.secondary};
        border-color: ${theme.border};
        box-shadow: ${theme.shadow.sm};

        &:not(:disabled):hover {
            background: ${theme.surfaceAlt};
            color: ${theme.text.primary};
            border-color: ${theme.primary};
        }
    `}

        /* Danger Button */
    ${props => props.$danger && `
        background: ${theme.errorLight};
        color: ${theme.error};
        border-color: ${theme.error}30;

        &:not(:disabled):hover {
            background: ${theme.error};
            color: white;
            border-color: ${theme.error};
        }
    `}
`;

export default UserSignatureCard;