// src/pages/Settings/components/ProfessionalSignatureCanvas.tsx
import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';
import { FaPen, FaEraser, FaUndo, FaRedo, FaExpand, FaCompress } from 'react-icons/fa';
import {
    SignatureContainer,
    CanvasHeader,
    HeaderTitle,
    ControlsGroup,
    ControlButton,
    CanvasWrapper,
    StyledCanvas,
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

export const ProfessionalSignatureCanvas = forwardRef<any, ProfessionalSignatureCanvasProps>(({
                                                                                                  width = 600,
                                                                                                  height = 200,
                                                                                                  onSignatureChange,
                                                                                                  initialSignature,
                                                                                                  disabled = false,
                                                                                                  penStyle = 'smooth'
                                                                                              }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentPath, setCurrentPath] = useState<SignaturePoint[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

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
            opacity: 0.85
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

    useImperativeHandle(ref, () => ({
        getSignatureData: () => fabricCanvasRef.current?.toSVG() || '',
        isEmpty: () => fabricCanvasRef.current?.getObjects().length === 0,
        clear: clearCanvas
    }));

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

        const currentPenStyle = penStyles[penStyle];
        canvas.freeDrawingBrush.width = currentPenStyle.strokeWidth;
        canvas.freeDrawingBrush.color = currentPenStyle.stroke;

        if (canvas.freeDrawingBrush instanceof fabric.PencilBrush) {
            canvas.freeDrawingBrush.decimate = 0.4;
        }

        canvas.on('path:created', (e) => {
            const path = e.path as fabric.Path;
            path.set({
                ...currentPenStyle,
                selectable: false,
                evented: false
            });

            saveToHistory();
            const svgData = canvas.toSVG();
            onSignatureChange?.(svgData, false);
        });

        canvas.on('mouse:down', () => setIsDrawing(true));
        canvas.on('mouse:up', () => setIsDrawing(false));

        fabricCanvasRef.current = canvas;

        if (initialSignature) {
            loadSignatureFromSVG(initialSignature);
        }

        saveToHistory();
    }, [width, height, isExpanded, penStyle, onSignatureChange, initialSignature]);

    const saveToHistory = useCallback(() => {
        if (!fabricCanvasRef.current) return;

        const currentState = JSON.stringify(fabricCanvasRef.current.toJSON());
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(currentState);
            return newHistory.slice(-20);
        });
        setHistoryIndex(prev => Math.min(prev + 1, 19));
    }, [historyIndex]);

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

    const clearCanvas = useCallback(() => {
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.clear();
            fabricCanvasRef.current.backgroundColor = '#ffffff';
            saveToHistory();
            onSignatureChange?.('', true);
        }
    }, [saveToHistory, onSignatureChange]);

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

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const isEmpty = useCallback(() => {
        if (!fabricCanvasRef.current) return true;
        return fabricCanvasRef.current.getObjects().length === 0;
    }, []);

    useEffect(() => {
        initializeCanvas();
        return () => {
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
            }
        };
    }, [initializeCanvas]);

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
                            onClick={() => console.log(`Switching to ${style} pen`)}
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
});

ProfessionalSignatureCanvas.displayName = 'ProfessionalSignatureCanvas';
export default ProfessionalSignatureCanvas;