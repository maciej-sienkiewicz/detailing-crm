// src/pages/Settings/components/companySettings/SignatureCanvas.tsx
import React, { forwardRef, useImperativeHandle, useRef, useCallback, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FaEraser, FaRedo, FaUndo } from 'react-icons/fa';
import styled from 'styled-components';

const CanvasContainer = styled.div`
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
`;

const CanvasHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e2e8f0;
`;

const CanvasTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
`;

const ControlsGroup = styled.div`
    display: flex;
    gap: 8px;
    background: rgba(255, 255, 255, 0.8);
    padding: 6px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
`;

const ControlButton = styled.button<{ $disabled?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${props => props.$disabled ? '#f1f5f9' : 'transparent'};
    border: none;
    border-radius: 6px;
    color: ${props => props.$disabled ? '#cbd5e1' : '#64748b'};
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    font-size: 14px;

    &:hover:not(:disabled) {
        background: #1a365d;
        color: white;
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
    }
`;

const CanvasWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
    background: #ffffff;
    position: relative;
`;

const EmptyOverlay = styled.div<{ $visible: boolean }>`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    pointer-events: none;
    opacity: ${props => props.$visible ? 0.4 : 0};
    transition: opacity 0.3s ease;
    z-index: 1;
`;

const EmptyIcon = styled.div`
    font-size: 32px;
    color: #64748b;
`;

const EmptyText = styled.div`
    font-size: 14px;
    color: #64748b;
    text-align: center;
    font-weight: 500;
`;

interface SignatureCanvasProps {
    width?: number;
    height?: number;
    onSignatureChange?: (signature: string, isEmpty: boolean) => void;
    initialSignature?: string;
}

export interface SignatureCanvasRef {
    getSignatureData: () => string;
    isEmpty: () => boolean;
    clear: () => void;
}

export const CustomSignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(({
                                                                                               width = 600,
                                                                                               height = 200,
                                                                                               onSignatureChange,
                                                                                               initialSignature
                                                                                           }, ref) => {
    const signaturePadRef = useRef<SignatureCanvas>(null);
    const [history, setHistory] = React.useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = React.useState(-1);
    const [isCanvasEmpty, setIsCanvasEmpty] = React.useState(true);

    // Save current state to history
    const saveToHistory = useCallback(() => {
        if (!signaturePadRef.current) return;

        const currentData = signaturePadRef.current.toDataURL();
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(currentData);
            return newHistory.slice(-20); // Keep last 20 states
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    // Check if canvas is empty
    const isEmpty = useCallback(() => {
        if (!signaturePadRef.current) return true;
        return signaturePadRef.current.isEmpty();
    }, []);

    // Get signature data
    const getSignatureData = useCallback(() => {
        if (!signaturePadRef.current || isEmpty()) return '';
        return signaturePadRef.current.toDataURL('image/png');
    }, [isEmpty]);

    // Clear canvas
    const clear = useCallback(() => {
        if (!signaturePadRef.current) return;

        signaturePadRef.current.clear();
        setIsCanvasEmpty(true);
        saveToHistory();

        if (onSignatureChange) {
            onSignatureChange('', true);
        }
    }, [saveToHistory, onSignatureChange]);

    // Undo
    const undo = useCallback(() => {
        if (historyIndex > 0 && signaturePadRef.current && history[historyIndex - 1]) {
            const previousData = history[historyIndex - 1];
            signaturePadRef.current.fromDataURL(previousData);
            setHistoryIndex(prev => prev - 1);

            const newIsEmpty = isEmpty();
            setIsCanvasEmpty(newIsEmpty);

            if (onSignatureChange) {
                onSignatureChange(newIsEmpty ? '' : getSignatureData(), newIsEmpty);
            }
        }
    }, [history, historyIndex, isEmpty, getSignatureData, onSignatureChange]);

    // Redo
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1 && signaturePadRef.current && history[historyIndex + 1]) {
            const nextData = history[historyIndex + 1];
            signaturePadRef.current.fromDataURL(nextData);
            setHistoryIndex(prev => prev + 1);

            const newIsEmpty = isEmpty();
            setIsCanvasEmpty(newIsEmpty);

            if (onSignatureChange) {
                onSignatureChange(newIsEmpty ? '' : getSignatureData(), newIsEmpty);
            }
        }
    }, [history, historyIndex, isEmpty, getSignatureData, onSignatureChange]);

    // Handle drawing end
    const handleEnd = useCallback(() => {
        saveToHistory();
        const newIsEmpty = isEmpty();
        setIsCanvasEmpty(newIsEmpty);

        if (onSignatureChange) {
            const signatureData = newIsEmpty ? '' : getSignatureData();
            onSignatureChange(signatureData, newIsEmpty);
        }
    }, [saveToHistory, isEmpty, getSignatureData, onSignatureChange]);

    // Handle drawing begin
    const handleBegin = useCallback(() => {
        setIsCanvasEmpty(false);
    }, []);

    // Load initial signature
    useEffect(() => {
        if (initialSignature && signaturePadRef.current && initialSignature.trim()) {
            try {
                signaturePadRef.current.fromDataURL(initialSignature);
                setIsCanvasEmpty(false);
                saveToHistory();
            } catch (error) {
                console.warn('Failed to load initial signature:', error);
            }
        } else {
            // Initialize empty history
            setTimeout(() => saveToHistory(), 100);
        }
    }, [initialSignature, saveToHistory]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        getSignatureData,
        isEmpty,
        clear
    }), [getSignatureData, isEmpty, clear]);

    return (
        <CanvasContainer>
            <CanvasHeader>
                <CanvasTitle>Narysuj swój podpis</CanvasTitle>
                <ControlsGroup>
                    <ControlButton
                        onClick={undo}
                        $disabled={historyIndex <= 0}
                        title="Cofnij"
                    >
                        <FaUndo />
                    </ControlButton>
                    <ControlButton
                        onClick={redo}
                        $disabled={historyIndex >= history.length - 1}
                        title="Przywróć"
                    >
                        <FaRedo />
                    </ControlButton>
                    <ControlButton
                        onClick={clear}
                        title="Wyczyść"
                    >
                        <FaEraser />
                    </ControlButton>
                </ControlsGroup>
            </CanvasHeader>

            <CanvasWrapper>
                <SignatureCanvas
                    ref={signaturePadRef}
                    canvasProps={{
                        width,
                        height,
                        style: {
                            border: 'none',
                            borderRadius: '0',
                            backgroundColor: '#ffffff',
                        }
                    }}
                    backgroundColor="#ffffff"
                    penColor="#1a365d"
                    minWidth={1}
                    maxWidth={2.5}
                    velocityFilterWeight={0.7}
                    onBegin={handleBegin}
                    onEnd={handleEnd}
                />

                <EmptyOverlay $visible={isCanvasEmpty}>
                    <EmptyIcon>✍️</EmptyIcon>
                    <EmptyText>
                        Kliknij i przeciągnij aby narysować podpis
                    </EmptyText>
                </EmptyOverlay>
            </CanvasWrapper>
        </CanvasContainer>
    );
});

CustomSignatureCanvas.displayName = 'CustomSignatureCanvas';

export { CustomSignatureCanvas as SignatureCanvas };