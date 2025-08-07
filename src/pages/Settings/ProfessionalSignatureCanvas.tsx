// Professional Signature Component with Fabric.js
// MIT License - 100% free for commercial use
// npm install fabric @types/fabric

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import styled from 'styled-components';
import {
    FaPen,
    FaEraser,
    FaUndo,
    FaRedo,
    FaPaintBrush,
    FaAdjust,
    FaExpand,
    FaCompress,
    FaSave,
    FaTimes
} from 'react-icons/fa';

// Professional theme
const theme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    success: '#059669',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
    },
    border: '#e2e8f0',
    shadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)'
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

interface SignaturePoint {
    x: number;
    y: number;
    pressure?: number;
    timestamp: number;
}

interface ProfessionalSignatureCanvasProps {
    width?: number;
    height?: number;
    onSignatureChange?: (signatureData: string, isEmpty: boolean) => void;
    initialSignature?: string;
    disabled?: boolean;
    penStyle?: 'smooth' | 'fountain' | 'marker' | 'ballpoint';
}

export const ProfessionalSignatureCanvas: React.FC<ProfessionalSignatureCanvasProps> = ({
                                                                                            width = 600,
                                                                                            height = 200,
                                                                                            onSignatureChange,
                                                                                            initialSignature,
                                                                                            disabled = false,
                                                                                            penStyle = 'smooth'
                                                                                        }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentPath, setCurrentPath] = useState<SignaturePoint[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [penSettings, setPenSettings] = useState({
        width: 2.5,
        color: '#1a365d',
        opacity: 0.9
    });

    // Professional pen styles
    const penStyles = {
        smooth: {
            strokeWidth: 2.5,
            stroke: '#1a365d',
            fill: '',
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            opacity: 0.9
        },
        fountain: {
            strokeWidth: 3.5,
            stroke: '#000080',
            fill: '',
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            opacity: 0.85,
            shadow: new fabric.Shadow({
                color: 'rgba(0, 0, 128, 0.2)',
                blur: 2,
                offsetX: 1,
                offsetY: 1
            })
        },
        marker: {
            strokeWidth: 4,
            stroke: '#2d3748',
            fill: '',
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            opacity: 0.7
        },
        ballpoint: {
            strokeWidth: 1.8,
            stroke: '#1a202c',
            fill: '',
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            opacity: 0.95
        }
    };

    // Initialize Fabric.js canvas
    const initializeCanvas = useCallback(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            isDrawingMode: true,
            width: isExpanded ? Math.min(width * 1.3, 800) : width,
            height: isExpanded ? height * 1.5 : height,
            backgroundColor: '#ffffff',
            selection: false,
            preserveObjectStacking: true
        });

        // Apply professional pen style
        const currentPenStyle = penStyles[penStyle];
        canvas.freeDrawingBrush.width = currentPenStyle.strokeWidth;
        canvas.freeDrawingBrush.color = currentPenStyle.stroke;

        // Advanced brush configuration for smooth drawing
        if (canvas.freeDrawingBrush instanceof fabric.PencilBrush) {
            canvas.freeDrawingBrush.decimate = 0.4; // Reduce points for smoother curves
            (canvas.freeDrawingBrush as any).strokeLineCap = 'round';
            (canvas.freeDrawingBrush as any).strokeLineJoin = 'round';
        }

        // Event listeners for professional experience
        canvas.on('path:created', (e) => {
            const path = e.path as fabric.Path;

            // Apply professional styling
            path.set({
                ...currentPenStyle,
                selectable: false,
                evented: false
            });

            // Save to history
            saveToHistory();

            // Notify parent component
            const svgData = canvas.toSVG();
            onSignatureChange?.(svgData, false);
        });

        canvas.on('mouse:down', () => {
            setIsDrawing(true);
        });

        canvas.on('mouse:up', () => {
            setIsDrawing(false);
        });

        fabricCanvasRef.current = canvas;

        // Load initial signature if provided
        if (initialSignature) {
            loadSignatureFromSVG(initialSignature);
        }

        // Save initial state
        saveToHistory();

    }, [width, height, isExpanded, penStyle, onSignatureChange, initialSignature]);

    // Save canvas state to history
    const saveToHistory = useCallback(() => {
        if (!fabricCanvasRef.current) return;

        const currentState = JSON.stringify(fabricCanvasRef.current.toJSON());
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(currentState);
            return newHistory.slice(-20); // Keep last 20 states
        });
        setHistoryIndex(prev => Math.min(prev + 1, 19));
    }, [historyIndex]);

    // Undo functionality
    const undo = useCallback(() => {
        if (historyIndex > 0 && fabricCanvasRef.current) {
            const previousState = history[historyIndex - 1];
            fabricCanvasRef.current.loadFromJSON(previousState, () => {
                fabricCanvasRef.current!.renderAll();
                setHistoryIndex(prev => prev - 1);

                const svgData = fabricCanvasRef.current!.toSVG();
                const isEmpty = fabricCanvasRef.current!.getObjects().length === 0;
                onSignatureChange?.(svgData, isEmpty);
            });
        }
    }, [history, historyIndex, onSignatureChange]);

    // Redo functionality
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1 && fabricCanvasRef.current) {
            const nextState = history[historyIndex + 1];
            fabricCanvasRef.current.loadFromJSON(nextState, () => {
                fabricCanvasRef.current!.renderAll();
                setHistoryIndex(prev => prev + 1);

                const svgData = fabricCanvasRef.current!.toSVG();
                const isEmpty = fabricCanvasRef.current!.getObjects().length === 0;
                onSignatureChange?.(svgData, isEmpty);
            });
        }
    }, [history, historyIndex, onSignatureChange]);

    // Clear canvas
    const clearCanvas = useCallback(() => {
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.clear();
            fabricCanvasRef.current.backgroundColor = '#ffffff';
            saveToHistory();
            onSignatureChange?.('', true);
        }
    }, [saveToHistory, onSignatureChange]);

    // Load signature from SVG
    const loadSignatureFromSVG = useCallback((svgData: string) => {
        if (!fabricCanvasRef.current) return;

        fabric.loadSVGFromString(svgData, (objects, options) => {
            fabricCanvasRef.current!.clear();

            objects.forEach(obj => {
                obj.set({
                    selectable: false,
                    evented: false
                });
                fabricCanvasRef.current!.add(obj);
            });

            fabricCanvasRef.current!.renderAll();
            saveToHistory();
        });
    }, [saveToHistory]);

    // Toggle expanded mode
    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    // Initialize canvas on mount and when size changes
    useEffect(() => {
        initializeCanvas();

        return () => {
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
            }
        };
    }, [initializeCanvas]);

    // Update canvas size when expanded state changes
    useEffect(() => {
        if (fabricCanvasRef.current) {
            const newWidth = isExpanded ? Math.min(width * 1.3, 800) : width;
            const newHeight = isExpanded ? height * 1.5 : height;

            fabricCanvasRef.current.setDimensions({
                width: newWidth,
                height: newHeight
            });
        }
    }, [isExpanded, width, height]);

    // Get signature data
    const getSignatureData = useCallback(() => {
        if (!fabricCanvasRef.current) return '';
        return fabricCanvasRef.current.toSVG();
    }, []);

    // Check if canvas is empty
    const isEmpty = useCallback(() => {
        if (!fabricCanvasRef.current) return true;
        return fabricCanvasRef.current.getObjects().length === 0;
    }, []);

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
                        onClick={clearCanvas}
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
                <StyledCanvas
                    ref={canvasRef}
                    $isDrawing={isDrawing}
                    $isExpanded={isExpanded}
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
                            $active={penStyle === style}
                            onClick={() => {
                                // You can add pen style change logic here
                                console.log(`Switching to ${style} pen`);
                            }}
                            title={`${style} pen`}
                        >
                            <StylePreview style={{
                                backgroundColor: config.stroke,
                                opacity: config.opacity,
                                height: `${config.strokeWidth}px`
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
};

// Styled Components
const SignatureContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    border: 1px solid ${theme.border};
    overflow: hidden;
    box-shadow: ${theme.shadow.md};
`;

const CanvasHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border-bottom: 1px solid ${theme.border};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.md};
    }
`;

const HeaderTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0;
`;

const ControlsGroup = styled.div`
    display: flex;
    gap: ${theme.spacing.xs};
    background: ${theme.surface};
    padding: ${theme.spacing.xs};
    border-radius: ${theme.radius.md};
    border: 1px solid ${theme.border};
`;

const ControlButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    border-radius: ${theme.radius.sm};
    color: ${theme.text.secondary};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;

    &:hover:not(:disabled) {
        background: ${theme.primary};
        color: white;
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

const CanvasWrapper = styled.div<{ $isExpanded: boolean }>`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing.xl};
    background: ${theme.surfaceAlt};
    transition: all 0.3s ease;
`;

const StyledCanvas = styled.canvas<{ $isDrawing: boolean; $isExpanded: boolean }>`
    border: 2px solid ${theme.border};
    border-radius: ${theme.radius.lg};
    background: white;
    cursor: ${props => props.$isDrawing ? 'grabbing' : 'crosshair'};
    box-shadow: ${theme.shadow.md};
    transition: all 0.2s ease;
    
    &:hover {
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}20;
    }
    
    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primary}30;
    }
`;

const CanvasOverlay = styled.div<{ $isExpanded: boolean }>`
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
    text-align: center;
    max-width: ${props => props.$isExpanded ? '400px' : '300px'};
    z-index: 1;
`;

const OverlayIcon = styled.div`
    font-size: 48px;
    color: ${theme.primary};
    margin-bottom: ${theme.spacing.md};
`;

const OverlayText = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${theme.text.primary};
    line-height: 1.4;
`;

const OverlayHint = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
    font-style: italic;
`;

const PenStyleSelector = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    background: ${theme.surfaceAlt};
    border-top: 1px solid ${theme.border};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.sm};
    }
`;

const StyleLabel = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.text.secondary};
    white-space: nowrap;
`;

const StyleButtons = styled.div`
    display: flex;
    gap: ${theme.spacing.sm};
    flex-wrap: wrap;
`;

const StyleButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    background: ${props => props.$active ? theme.primary : theme.surface};
    color: ${props => props.$active ? 'white' : theme.text.secondary};
    border: 1px solid ${props => props.$active ? theme.primary : theme.border};
    border-radius: ${theme.radius.md};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: capitalize;

    &:hover {
        background: ${props => props.$active ? theme.primary : theme.surfaceAlt};
        border-color: ${theme.primary};
    }
`;

const StylePreview = styled.div`
    width: 24px;
    height: 3px;
    border-radius: 2px;
`;

const SignatureStats = styled.div`
    display: flex;
    justify-content: space-around;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.surface};
    border-top: 1px solid ${theme.border};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: ${theme.spacing.sm};
    }
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    font-size: 14px;
`;

const StatLabel = styled.span`
    color: ${theme.text.secondary};
    font-weight: 500;
`;

const StatValue = styled.span<{ $isEmpty?: boolean }>`
    color: ${props => props.$isEmpty ? theme.text.muted : theme.text.primary};
    font-weight: 600;
`;

export default ProfessionalSignatureCanvas;