// src/pages/Settings/components/SimpleSignatureCanvas.tsx
import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FaPen, FaEraser, FaUndo, FaRedo, FaExpand, FaCompress } from 'react-icons/fa';
import {
    SignatureContainer,
    CanvasHeader,
    HeaderTitle,
    ControlsGroup,
    ControlButton,
    CanvasWrapper,
    CanvasOverlay,
    OverlayIcon,
    OverlayText,
    OverlayHint,
    PenStyleSelector,
    StyleLabel,
    StyleButtons,
    StyleButton,
    StylePreview,
    SignatureStats,
    StatItem,
    StatLabel,
    StatValue
} from '../../styles/companySettings/SignatureCanvas.styles';

interface SimpleSignatureCanvasProps {
    width?: number;
    height?: number;
    onSignatureChange?: (signatureData: string, isEmpty: boolean) => void;
    initialSignature?: string;
    disabled?: boolean;
    penStyle?: 'smooth' | 'fountain' | 'marker' | 'ballpoint';
}

interface CanvasRef {
    getSignatureData: () => string; // Returns base64 data URL
    isEmpty: () => boolean;
    clear: () => void;
    getSignatureBlob?: () => Promise<Blob | null>; // Optional blob conversion
}

export const SimpleSignatureCanvas = forwardRef<CanvasRef, SimpleSignatureCanvasProps>(({
                                                                                            width = 600,
                                                                                            height = 200,
                                                                                            onSignatureChange,
                                                                                            initialSignature,
                                                                                            disabled = false,
                                                                                            penStyle = 'smooth'
                                                                                        }, ref) => {
    const signatureRef = useRef<SignatureCanvas>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [currentPenStyle, setCurrentPenStyle] = useState(penStyle);

    // Pen style configurations
    const penStyles = {
        smooth: {
            minWidth: 1,
            maxWidth: 2.5,
            penColor: '#1a365d',
            velocityFilterWeight: 0.7
        },
        fountain: {
            minWidth: 1.5,
            maxWidth: 4,
            penColor: '#000080',
            velocityFilterWeight: 0.5
        },
        marker: {
            minWidth: 2,
            maxWidth: 4,
            penColor: '#2d3748',
            velocityFilterWeight: 0.3
        },
        ballpoint: {
            minWidth: 0.8,
            maxWidth: 1.8,
            penColor: '#1a202c',
            velocityFilterWeight: 0.9
        }
    };

    // Get current canvas dimensions
    const getCurrentDimensions = useCallback(() => ({
        width: isExpanded ? Math.min(width * 1.3, 800) : width,
        height: isExpanded ? height * 1.5 : height
    }), [width, height, isExpanded]);

    // Save current state to history
    const saveToHistory = useCallback(() => {
        if (!signatureRef.current) return;

        try {
            const currentState = signatureRef.current.toDataURL();
            setHistory(prev => {
                // Avoid duplicate saves
                if (prev.length > 0 && prev[prev.length - 1] === currentState) {
                    return prev;
                }

                const newHistory = prev.slice(0, historyIndex + 1);
                newHistory.push(currentState);
                return newHistory.slice(-20); // Keep only last 20 states
            });
            setHistoryIndex(prev => Math.min(prev + 1, 19));
        } catch (error) {
            console.warn('Error saving to history:', error);
        }
    }, [historyIndex]);

    // Check if signature is empty
    const isEmpty = useCallback(() => {
        if (!signatureRef.current) return true;
        return signatureRef.current.isEmpty();
    }, []);

    // Get signature as base64 data URL (better for database storage)
    const getSignatureData = useCallback(() => {
        if (!signatureRef.current || isEmpty()) return '';
        return signatureRef.current.toDataURL('image/png'); // Returns base64 PNG
    }, [isEmpty]);

    // Convert base64 to blob for file operations (if needed)
    const getSignatureBlob = useCallback(async (): Promise<Blob | null> => {
        const dataURL = getSignatureData();
        if (!dataURL) return null;

        try {
            const response = await fetch(dataURL);
            return await response.blob();
        } catch (error) {
            console.warn('Error converting signature to blob:', error);
            return null;
        }
    }, [getSignatureData]);

    // Clear signature
    const clear = useCallback(() => {
        if (!signatureRef.current) return;

        signatureRef.current.clear();
        saveToHistory();

        if (onSignatureChange) {
            onSignatureChange('', true);
        }
    }, [saveToHistory, onSignatureChange]);

    // Notify parent about signature changes
    const notifySignatureChange = useCallback(() => {
        if (!onSignatureChange) return;

        const svgData = getSignatureData();
        const isSignatureEmpty = isEmpty();
        onSignatureChange(svgData, isSignatureEmpty);
    }, [onSignatureChange, getSignatureData, isEmpty]);

    // Handle drawing start
    const handleBegin = useCallback(() => {
        setIsDrawing(true);
    }, []);

    // Handle drawing end
    const handleEnd = useCallback(() => {
        setIsDrawing(false);
        saveToHistory();
        notifySignatureChange();
    }, [saveToHistory, notifySignatureChange]);

    // Undo action
    const undo = useCallback(() => {
        if (historyIndex > 0 && signatureRef.current && history[historyIndex - 1]) {
            try {
                const previousState = history[historyIndex - 1];
                signatureRef.current.fromDataURL(previousState);
                setHistoryIndex(prev => prev - 1);
                notifySignatureChange();
            } catch (error) {
                console.error('Error during undo:', error);
            }
        }
    }, [history, historyIndex, notifySignatureChange]);

    // Redo action
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1 && signatureRef.current && history[historyIndex + 1]) {
            try {
                const nextState = history[historyIndex + 1];
                signatureRef.current.fromDataURL(nextState);
                setHistoryIndex(prev => prev + 1);
                notifySignatureChange();
            } catch (error) {
                console.error('Error during redo:', error);
            }
        }
    }, [history, historyIndex, notifySignatureChange]);

    // Toggle expanded view
    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    // Handle pen style change
    const handlePenStyleChange = useCallback((style: keyof typeof penStyles) => {
        setCurrentPenStyle(style);
    }, []);

    // Load signature from base64 data URL
    const loadSignatureFromDataURL = useCallback((dataURL: string) => {
        if (!signatureRef.current || !dataURL.trim()) return;

        try {
            signatureRef.current.fromDataURL(dataURL);
            // Save to history after loading
            setTimeout(() => {
                saveToHistory();
                notifySignatureChange();
            }, 100);
        } catch (error) {
            console.warn('Error loading signature from data URL:', error);
        }
    }, [saveToHistory, notifySignatureChange]);

    // Load initial signature
    useEffect(() => {
        if (initialSignature && signatureRef.current) {
            try {
                if (initialSignature.startsWith('data:image/')) {
                    // It's already a base64 data URL
                    loadSignatureFromDataURL(initialSignature);
                } else if (initialSignature.startsWith('<svg')) {
                    // It's SVG - we need to convert it to canvas
                    // For now, just initialize empty and show warning
                    console.warn('SVG signatures not supported in SimpleSignatureCanvas. Please use base64 format.');
                    saveToHistory();
                } else {
                    // Assume it's base64 without data URL prefix
                    const dataURL = `data:image/png;base64,${initialSignature}`;
                    loadSignatureFromDataURL(dataURL);
                }
            } catch (error) {
                console.warn('Error loading initial signature:', error);
                saveToHistory();
            }
        } else if (!initialSignature && history.length === 0) {
            // Initialize empty history
            setTimeout(() => saveToHistory(), 100);
        }
    }, [initialSignature, loadSignatureFromDataURL, saveToHistory, history.length]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        getSignatureData,
        isEmpty,
        clear,
        getSignatureBlob // Additional method for file operations
    }), [getSignatureData, isEmpty, clear, getSignatureBlob]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!signatureRef.current) return;
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    undo();
                } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    redo();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const currentStyle = penStyles[currentPenStyle];
    const dimensions = getCurrentDimensions();

    return (
        <SignatureContainer ref={containerRef}>
            <CanvasHeader>
                <HeaderTitle>Profesjonalny podpis elektroniczny</HeaderTitle>
                <ControlsGroup>
                    <ControlButton
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        title="Cofnij (Ctrl+Z)"
                    >
                        <FaUndo />
                    </ControlButton>
                    <ControlButton
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        title="Przywróć (Ctrl+Y)"
                    >
                        <FaRedo />
                    </ControlButton>
                    <ControlButton
                        onClick={clear}
                        title="Wyczyść podpis"
                    >
                        <FaEraser />
                    </ControlButton>
                    <ControlButton
                        onClick={toggleExpanded}
                        title={isExpanded ? 'Zmniejsz obszar' : 'Powiększ obszar'}
                    >
                        {isExpanded ? <FaCompress /> : <FaExpand />}
                    </ControlButton>
                </ControlsGroup>
            </CanvasHeader>

            <CanvasWrapper $isExpanded={isExpanded}>
                <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                        width: dimensions.width,
                        height: dimensions.height,
                        className: 'signature-canvas',
                        style: {
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            cursor: isDrawing ? 'grabbing' : 'crosshair',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease'
                        }
                    }}
                    minWidth={currentStyle.minWidth}
                    maxWidth={currentStyle.maxWidth}
                    penColor={currentStyle.penColor}
                    velocityFilterWeight={currentStyle.velocityFilterWeight}
                    onBegin={handleBegin}
                    onEnd={handleEnd}
                    backgroundColor="#ffffff"
                />

                {isEmpty() && (
                    <CanvasOverlay $isExpanded={isExpanded}>
                        <OverlayIcon>
                            <FaPen />
                        </OverlayIcon>
                        <OverlayText>
                            {isExpanded
                                ? 'Narysuj swój podpis w powiększonym obszarze dla większej precyzji'
                                : 'Narysuj swój podpis używając myszy lub dotyku'
                            }
                        </OverlayText>
                        <OverlayHint>
                            Użyj płynnych ruchów dla najlepszego efektu
                        </OverlayHint>
                    </CanvasOverlay>
                )}
            </CanvasWrapper>

            <PenStyleSelector>
                <StyleLabel>Styl pióra:</StyleLabel>
                <StyleButtons>
                    {Object.entries(penStyles).map(([style, config]) => (
                        <StyleButton
                            key={style}
                            $active={currentPenStyle === style}
                            onClick={() => handlePenStyleChange(style as keyof typeof penStyles)}
                            title={`${style} pen`}
                        >
                            <StylePreview style={{
                                backgroundColor: config.penColor,
                                height: `${config.maxWidth}px`,
                                borderRadius: '2px'
                            }} />
                            {style}
                        </StyleButton>
                    ))}
                </StyleButtons>
            </PenStyleSelector>

            <SignatureStats>
                <StatItem>
                    <StatLabel>Status:</StatLabel>
                    <StatValue $isEmpty={isEmpty()}>
                        {isEmpty() ? 'Pusty' : 'Podpisany'}
                    </StatValue>
                </StatItem>
                <StatItem>
                    <StatLabel>Rozmiar:</StatLabel>
                    <StatValue>
                        {isExpanded ? 'Rozszerzony' : 'Standardowy'}
                    </StatValue>
                </StatItem>
                <StatItem>
                    <StatLabel>Historia:</StatLabel>
                    <StatValue>
                        {historyIndex + 1} / {history.length}
                    </StatValue>
                </StatItem>
            </SignatureStats>
        </SignatureContainer>
    );
});

SimpleSignatureCanvas.displayName = 'SimpleSignatureCanvas';
export default SimpleSignatureCanvas;