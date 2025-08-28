// src/pages/Settings/components/companySettings/UserSignatureSlide.tsx
import React, { useRef, useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa';
import SignatureCanvas from 'react-signature-canvas';
import { type CompanySettingsResponse } from '../../../../api/companySettingsApi';
import { useUserSignature } from '../../../../hooks/useUserSignature';
import {
    SlideContainer,
    SlideContent
} from '../../styles/companySettings/SlideComponents.styles';
import {
    StatusBanner,
    SignatureArea,
    CanvasWrapper,
    PreviewContainer,
    PreviewImage,
    EmptyState,
    EmptyIcon,
    EmptyTitle,
    EmptyDescription,
    LoadingContainer,
    LoadingSpinner,
    ErrorContainer
} from '../../styles/companySettings/UserSignatureSlide.styles';

interface UserSignatureSlideProps {
    data: CompanySettingsResponse;
    isEditing: boolean;
    saving: boolean;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onChange: (section: keyof CompanySettingsResponse, field: string, value: any) => void;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export const UserSignatureSlide: React.FC<UserSignatureSlideProps> = ({
                                                                          isEditing,
                                                                          saving,
                                                                          onSave,
                                                                          onCancel,
                                                                          onSuccess,
                                                                          onError
                                                                      }) => {
    const signatureRef = useRef<SignatureCanvas>(null);
    const [signatureData, setSignatureData] = useState<string>('');
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const {
        signature,
        hasSignature,
        loading,
        saving: apiSaving,
        error,
        createSignature,
        updateSignature,
        clearError
    } = useUserSignature();

    // Initialize signature when loaded
    useEffect(() => {
        if (signature?.content && signatureRef.current) {
            try {
                signatureRef.current.fromDataURL(signature.content);
                setSignatureData(signature.content);
            } catch (err) {
                console.warn('Failed to load signature:', err);
            }
        }
    }, [signature]);

    // Handle signature drawing
    const handleSignatureEnd = () => {
        if (!signatureRef.current) return;

        const newData = signatureRef.current.toDataURL();
        setSignatureData(newData);

        // Check if signature changed
        const originalData = signature?.content || '';
        setHasChanges(newData !== originalData);
    };

    // Save signature - using useCallback to make it stable for useEffect
    const handleSaveSignature = React.useCallback(async () => {
        if (!signatureRef.current || signatureRef.current.isEmpty()) {
            onError?.('Podpis nie może być pusty');
            return;
        }

        try {
            setIsSaving(true);
            const data = signatureRef.current.toDataURL();
            let result;

            if (hasSignature) {
                result = await updateSignature(data);
            } else {
                result = await createSignature(data);
            }

            if (result) {
                setHasChanges(false);
                onSuccess?.('Podpis został zapisany pomyślnie');
                onSave();
            } else {
                onError?.(error || 'Nie udało się zapisać podpisu');
            }
        } catch (err) {
            console.error('Error saving signature:', err);
            onError?.('Nie udało się zapisać podpisu');
        } finally {
            setIsSaving(false);
        }
    }, [hasSignature, updateSignature, createSignature, onSuccess, onError, onSave, error]);

    // Cancel editing
    const handleCancel = () => {
        if (signature?.content && signatureRef.current) {
            try {
                signatureRef.current.fromDataURL(signature.content);
                setSignatureData(signature.content);
            } catch (err) {
                signatureRef.current?.clear();
                setSignatureData('');
            }
        } else if (signatureRef.current) {
            signatureRef.current.clear();
            setSignatureData('');
        }

        setHasChanges(false);
        onCancel();
    };

    // Clear signature
    const handleClear = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
            setSignatureData('');
            setHasChanges(true);
        }
    };

    // Expose save handler for parent component - with handleSaveSignature in deps
    useEffect(() => {
        const shouldSave = isEditing && saving && !isSaving && !apiSaving;

        if (shouldSave) {
            handleSaveSignature();
        }
    }, [isEditing, saving, isSaving, apiSaving, handleSaveSignature]);

    // Handle cancel from parent
    useEffect(() => {
        if (!isEditing && hasChanges) {
            // Reset signature when canceling
            if (signature?.content && signatureRef.current) {
                try {
                    signatureRef.current.fromDataURL(signature.content);
                    setSignatureData(signature.content);
                } catch (err) {
                    signatureRef.current?.clear();
                    setSignatureData('');
                }
            } else if (signatureRef.current) {
                signatureRef.current.clear();
                setSignatureData('');
            }
            setHasChanges(false);
        }
    }, [isEditing, hasChanges, signature?.content]);

    // Loading state
    if (loading) {
        return (
            <SlideContainer>
                <SlideContent>
                    <LoadingContainer>
                        <LoadingSpinner />
                        <div>Ładowanie podpisu...</div>
                    </LoadingContainer>
                </SlideContent>
            </SlideContainer>
        );
    }

    return (
        <SlideContainer>
            <SlideContent>
                <StatusBanner $hasSignature={hasSignature}>
                    {hasSignature
                        ? 'Podpis elektroniczny jest aktywny'
                        : 'Brak podpisu elektronicznego'
                    }
                </StatusBanner>

                <SignatureArea>
                        <CanvasWrapper>
                            {isEditing ? (
                                <>
                                    <SignatureCanvas
                                        ref={signatureRef}
                                        penColor="#1a365d"
                                        canvasProps={{
                                            width: 500,
                                            height: 200,
                                            className: 'signature-canvas'
                                        }}
                                        onEnd={handleSignatureEnd}
                                    />
                                    {signatureRef.current?.isEmpty() !== false && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            color: '#94a3b8',
                                            fontSize: '14px',
                                            pointerEvents: 'none',
                                            textAlign: 'center',
                                            fontWeight: '500'
                                        }}>
                                            Narysuj swój podpis tutaj
                                        </div>
                                    )}
                                </>
                            ) : hasSignature && signature?.content ? (
                                <PreviewContainer>
                                    <PreviewImage
                                        src={signature.content}
                                        alt="Podpis użytkownika"
                                    />
                                </PreviewContainer>
                            ) : (
                                <EmptyState>
                                    <EmptyIcon>
                                        <FaPen />
                                    </EmptyIcon>
                                    <EmptyTitle>Brak podpisu</EmptyTitle>
                                    <EmptyDescription>
                                        Kliknij "Edytuj sekcję" aby utworzyć podpis
                                    </EmptyDescription>
                                </EmptyState>
                            )}
                        </CanvasWrapper>
                </SignatureArea>

                {/* Error display */}
                {error && (
                    <ErrorContainer>
                        <span>⚠</span>
                        <span>{error}</span>
                        <button
                            onClick={clearError}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#dc2626',
                                cursor: 'pointer',
                                fontSize: '16px',
                                padding: '4px',
                                borderRadius: '4px',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'none';
                            }}
                        >
                            ✕
                        </button>
                    </ErrorContainer>
                )}
            </SlideContent>
        </SlideContainer>
    );
};