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

interface CanvasRef {
    getSignatureData: () => string;
    isEmpty: () => boolean;
    clear: () => void;
}

// Extended fabric event interface for path creation
interface FabricPathEvent extends fabric.IEvent {
    path?: fabric.Path;
}

export const ProfessionalSignatureCanvas = forwardRef<CanvasRef, ProfessionalSignatureCanvasProps>(({
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
    const initialLoadRef = useRef(false);
    const isInitializedRef = useRef(false);

    const [isDrawing, setIsDrawing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentPath, setCurrentPath] = useState<SignaturePoint[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [currentPenStyle, setCurrentPenStyle] = useState(penStyle);

    const penStyles = {
        smooth: {
            strokeWidth: 2.5,
            stroke: '#1a365d',
            fill: '',
            strokeLineCap: 'round' as const,
            strokeLineJoin: 'round' as const,
            opacity: 0.9
        },
        fountain: {
            strokeWidth: 3.5,
            stroke: '#000080',
            fill: '',
            strokeLineCap: 'round' as const,
            strokeLineJoin: 'round' as const,
            opacity: 0.85
        },
        marker: {
            strokeWidth: 4,
            stroke: '#2d3748',
            fill: '',
            strokeLineCap: 'round' as const,
            strokeLineJoin: 'round' as const,
            opacity: 0.7
        },
        ballpoint: {
            strokeWidth: 1.8,
            stroke: '#1a202c',
            fill: '',
            strokeLineCap: 'round' as const,
            strokeLineJoin: 'round' as const,
            opacity: 0.95
        }
    };

    // Clear canvas - define early for useImperativeHandle
    const clearCanvas = useCallback(() => {
        if (!fabricCanvasRef.current) return;

        const canvas = fabricCanvasRef.current;

        try {
            canvas.clear();
            canvas.backgroundColor = '#ffffff';
            canvas.renderAll();

            console.log('Canvas cleared, objects:', canvas.getObjects().length);

            // Use refs to avoid dependency issues
            setTimeout(() => {
                if (canvas === fabricCanvasRef.current) {
                    // Manual history update
                    const currentState = JSON.stringify(canvas.toJSON());
                    setHistory(prev => {
                        const newHistory = [...prev, currentState];
                        return newHistory.slice(-20);
                    });
                    setHistoryIndex(prev => Math.min(prev + 1, 19));

                    // Manual notification
                    if (onSignatureChange) {
                        const svgData = canvas.toSVG();
                        const isEmpty = canvas.getObjects().length === 0;
                        onSignatureChange(svgData, isEmpty);
                    }
                }
            }, 10);
        } catch (error) {
            console.error('Error clearing canvas:', error);
        }
    }, [onSignatureChange]); // Only depend on onSignatureChange

    // Check if canvas is empty
    const isEmpty = useCallback(() => {
        if (!fabricCanvasRef.current) return true;

        try {
            return fabricCanvasRef.current.getObjects().length === 0;
        } catch (error) {
            console.warn('Error checking if canvas is empty:', error);
            return true;
        }
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        getSignatureData: () => {
            if (!fabricCanvasRef.current) return '';
            try {
                return fabricCanvasRef.current.toSVG();
            } catch (error) {
                console.warn('Error getting signature data:', error);
                return '';
            }
        },
        isEmpty,
        clear: clearCanvas
    }), [clearCanvas, isEmpty]);

    // Save current state to history - stabilized version
    const saveToHistory = useCallback(() => {
        if (!fabricCanvasRef.current) return;

        try {
            const currentState = JSON.stringify(fabricCanvasRef.current.toJSON());
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

    // Notify parent about signature changes - with additional debugging
    const notifySignatureChange = useCallback(() => {
        if (!fabricCanvasRef.current || !onSignatureChange) return;

        try {
            const canvas = fabricCanvasRef.current;
            const objects = canvas.getObjects();
            const svgData = canvas.toSVG();
            const isEmpty = objects.length === 0;

            console.log('Notifying signature change:', {
                objectCount: objects.length,
                isEmpty,
                svgLength: svgData.length,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height
            });

            // Force one more render before notifying
            canvas.renderAll();

            onSignatureChange(svgData, isEmpty);
        } catch (error) {
            console.warn('Error notifying signature change:', error);
        }
    }, [onSignatureChange]);

    // Initialize canvas - only once
    const initializeCanvas = useCallback(() => {
        if (!canvasRef.current || isInitializedRef.current) return null;

        const currentWidth = isExpanded ? Math.min(width * 1.3, 800) : width;
        const currentHeight = isExpanded ? height * 1.5 : height;

        try {
            const canvas = new fabric.Canvas(canvasRef.current, {
                isDrawingMode: !disabled,
                width: currentWidth,
                height: currentHeight,
                backgroundColor: '#ffffff',
                selection: false,
                preserveObjectStacking: true,
                allowTouchScrolling: false
            });

            console.log('Canvas initialized:', {
                width: canvas.width,
                height: canvas.height,
                isDrawingMode: canvas.isDrawingMode,
                backgroundColor: canvas.backgroundColor,
                canvasElement: canvasRef.current,
                elementWidth: canvasRef.current?.width,
                elementHeight: canvasRef.current?.height,
                elementStyle: canvasRef.current?.style.cssText
            });

            // Configure drawing brush
            const styleConfig = penStyles[currentPenStyle];
            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.width = styleConfig.strokeWidth;
                canvas.freeDrawingBrush.color = styleConfig.stroke;

                console.log('Brush configured:', {
                    width: canvas.freeDrawingBrush.width,
                    color: canvas.freeDrawingBrush.color
                });

                // Configure pencil brush if available
                if (canvas.freeDrawingBrush instanceof fabric.PencilBrush) {
                    canvas.freeDrawingBrush.decimate = 0.4;
                }
            }

            // Handle path creation (when drawing is completed)
            canvas.on('path:created', (e: FabricPathEvent) => {
                if (!e.path || canvas !== fabricCanvasRef.current) return;

                const path = e.path;
                const styleConfig = penStyles[currentPenStyle];

                console.log('Path created:', path);
                console.log('Path type:', path.type);
                console.log('Path visible:', path.visible);
                console.log('Canvas objects before styling:', canvas.getObjects().length);

                // Apply style to the path
                path.set({
                    ...styleConfig,
                    selectable: false,
                    evented: false,
                    visible: true // Ensure path is visible
                });

                console.log('Path after styling:', path);
                console.log('Canvas objects after styling:', canvas.getObjects().length);

                // Force render immediately
                canvas.renderAll();

                console.log('Canvas objects after renderAll:', canvas.getObjects().length);

                // Check if path is still on canvas after render
                setTimeout(() => {
                    if (canvas === fabricCanvasRef.current) {
                        console.log('Canvas objects after timeout:', canvas.getObjects().length);
                        const objects = canvas.getObjects();
                        objects.forEach((obj, index) => {
                            console.log(`Object ${index}:`, obj.type, obj.visible, obj);

                            // Also try to draw path data directly on native canvas context
                            const nativeCanvas = canvasRef.current;
                            const nativeCtx = nativeCanvas?.getContext('2d');
                            if (nativeCtx && obj.type === 'path' && obj.path) {
                                console.log('=== DRAWING PATH ON NATIVE CANVAS ===');
                                nativeCtx.save();
                                nativeCtx.strokeStyle = '#ff0000'; // Red for visibility
                                nativeCtx.lineWidth = 3;
                                nativeCtx.beginPath();

                                const bounds = obj.getBoundingRect();
                                console.log('Drawing path with bounds:', bounds);

                                // Simple fallback - draw bounding rectangle
                                nativeCtx.rect(bounds.left, bounds.top, bounds.width, bounds.height);
                                nativeCtx.stroke();
                                nativeCtx.restore();

                                console.log('Native path drawing completed');
                            }
                        });

                        // Force canvas redraw with explicit context clearing
                        const ctx = canvas.getContext();
                        if (ctx) {
                            console.log('Canvas context:', ctx);
                            console.log('Canvas context fillStyle:', ctx.fillStyle);
                            console.log('Canvas context strokeStyle:', ctx.strokeStyle);
                        }

                        // Try manual redraw
                        canvas.clear();
                        canvas.backgroundColor = '#ffffff';
                        objects.forEach(obj => canvas.add(obj));
                        canvas.renderAll();
                        console.log('Manual redraw completed');

                        saveToHistory();
                        notifySignatureChange();
                    }
                }, 50);
            });

            // Handle drawing events
            canvas.on('mouse:down', (e) => {
                console.log('Mouse down - drawing started');
                setIsDrawing(true);
            });

            canvas.on('mouse:up', (e) => {
                console.log('Mouse up - drawing ended');
                setIsDrawing(false);
            });

            // Add debugging for drawing mode
            canvas.on('path:created', () => {
                console.log('Fabric.js path:created event fired');
            });

            fabricCanvasRef.current = canvas;
            isInitializedRef.current = true;

            // Test: Add a simple rectangle to verify rendering works
            setTimeout(() => {
                if (canvas === fabricCanvasRef.current) {
                    console.log('=== STARTING TEST SHAPES ===');

                    // Test with different shapes and colors
                    const rect = new fabric.Rect({
                        left: 10,
                        top: 10,
                        width: 50,
                        height: 30,
                        fill: 'red',
                        stroke: 'blue',
                        strokeWidth: 2,
                        selectable: false,
                        evented: false
                    });

                    const circle = new fabric.Circle({
                        left: 80,
                        top: 10,
                        radius: 20,
                        fill: 'green',
                        selectable: false,
                        evented: false
                    });

                    canvas.add(rect);
                    canvas.add(circle);
                    canvas.renderAll();

                    console.log('Test shapes added, total objects:', canvas.getObjects().length);

                    console.log('Test shapes added, objects:', canvas.getObjects().length);
                    console.log('Canvas element:', canvasRef.current);
                    console.log('Canvas parent:', canvasRef.current?.parentElement);
                    console.log('Canvas siblings:', canvasRef.current?.parentElement?.children);
                    console.log('Fabric canvas element:', canvas.getElement());
                    console.log('Upper canvas element:', canvas.upperCanvasEl);
                    console.log('Lower canvas element:', canvas.lowerCanvasEl);
                    console.log('Canvas container:', canvas.wrapperEl);

                    // Check if any canvas elements are hidden or have issues
                    const allCanvases = [canvas.getElement(), canvas.upperCanvasEl, canvas.lowerCanvasEl];
                    allCanvases.forEach((canvasEl, i) => {
                        if (canvasEl) {
                            const computedStyle = window.getComputedStyle(canvasEl);
                            console.log(`Canvas ${i} styles:`, {
                                display: computedStyle.display,
                                visibility: computedStyle.visibility,
                                opacity: computedStyle.opacity,
                                width: computedStyle.width,
                                height: computedStyle.height,
                                position: computedStyle.position,
                                zIndex: computedStyle.zIndex
                            });
                        }
                    });

                    // Fallback: try native canvas drawing as test
                    const nativeCanvas = canvasRef.current;
                    const ctx = nativeCanvas?.getContext('2d');
                    if (ctx && nativeCanvas) {
                        console.log('=== NATIVE CANVAS TEST ===');
                        ctx.fillStyle = 'yellow';
                        ctx.fillRect(150, 50, 100, 50);
                        ctx.strokeStyle = 'black';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(150, 50, 100, 50);
                        ctx.fillStyle = 'black';
                        ctx.font = '16px Arial';
                        ctx.fillText('Native Test', 160, 80);
                        console.log('Native canvas drawing completed');

                        // Clear native drawing after 2 seconds
                        setTimeout(() => {
                            if (nativeCanvas === canvasRef.current) {
                                ctx.clearRect(0, 0, nativeCanvas.width, nativeCanvas.height);
                                console.log('Native canvas cleared');
                            }
                        }, 2000);
                    }
                    setTimeout(() => {
                        if (canvas === fabricCanvasRef.current) {
                            canvas.remove(rect, circle);
                            canvas.renderAll();
                            console.log('Test shapes removed');
                        }
                    }, 3000);
                }
            }, 500);

            // Load initial signature if provided
            if (initialSignature && !initialLoadRef.current) {
                loadSignatureFromSVG(initialSignature);
                initialLoadRef.current = true;
            } else {
                // Initialize empty history only once
                setTimeout(() => saveToHistory(), 100);
            }

            return canvas;
        } catch (error) {
            console.error('Error initializing canvas:', error);
            return null;
        }
    }, []); // No dependencies to prevent re-initialization

    // Load signature from SVG string - simplified approach
    const loadSignatureFromSVG = useCallback((svgData: string) => {
        if (!fabricCanvasRef.current || !svgData.trim()) return;

        const canvas = fabricCanvasRef.current;
        console.log('Loading SVG signature:', svgData.substring(0, 100) + '...');

        try {
            fabric.loadSVGFromString(svgData, (objects, options) => {
                if (!canvas || canvas !== fabricCanvasRef.current) {
                    console.log('Canvas reference changed, aborting SVG load');
                    return;
                }

                console.log('SVG loaded, objects:', objects.length);

                // Clear existing content
                canvas.clear();

                // Set white background
                canvas.backgroundColor = '#ffffff';

                // Add all objects from SVG
                objects.forEach((obj, index) => {
                    if (obj) {
                        obj.set({
                            selectable: false,
                            evented: false
                        });
                        canvas.add(obj);
                        console.log(`Added object ${index}:`, obj.type);
                    }
                });

                // Force render
                canvas.renderAll();

                console.log('Canvas after SVG load - objects:', canvas.getObjects().length);

                // Notify parent after a brief delay
                setTimeout(() => {
                    if (canvas === fabricCanvasRef.current) {
                        notifySignatureChange();
                    }
                }, 100);
            });
        } catch (error) {
            console.error('Error loading SVG signature:', error);
        }
    }, [notifySignatureChange]);

    // Undo action
    const undo = useCallback(() => {
        if (historyIndex > 0 && fabricCanvasRef.current && history[historyIndex - 1]) {
            const canvas = fabricCanvasRef.current;
            const previousState = history[historyIndex - 1];

            try {
                canvas.loadFromJSON(previousState, () => {
                    if (canvas === fabricCanvasRef.current) {
                        canvas.renderAll();
                        setHistoryIndex(prev => prev - 1);
                        notifySignatureChange();
                    }
                });
            } catch (error) {
                console.error('Error during undo:', error);
            }
        }
    }, [history, historyIndex, notifySignatureChange]);

    // Redo action
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1 && fabricCanvasRef.current && history[historyIndex + 1]) {
            const canvas = fabricCanvasRef.current;
            const nextState = history[historyIndex + 1];

            try {
                canvas.loadFromJSON(nextState, () => {
                    if (canvas === fabricCanvasRef.current) {
                        canvas.renderAll();
                        setHistoryIndex(prev => prev + 1);
                        notifySignatureChange();
                    }
                });
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

        if (fabricCanvasRef.current?.freeDrawingBrush) {
            const canvas = fabricCanvasRef.current;
            const styleConfig = penStyles[style];

            try {
                canvas.freeDrawingBrush.width = styleConfig.strokeWidth;
                canvas.freeDrawingBrush.color = styleConfig.stroke;
            } catch (error) {
                console.warn('Error updating pen style:', error);
            }
        }
    }, []);

    // Update pen style without reinitializing canvas
    const updatePenStyle = useCallback(() => {
        if (!fabricCanvasRef.current) return;

        const canvas = fabricCanvasRef.current;
        const styleConfig = penStyles[currentPenStyle];

        try {
            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.width = styleConfig.strokeWidth;
                canvas.freeDrawingBrush.color = styleConfig.stroke;
            }
        } catch (error) {
            console.warn('Error updating pen style:', error);
        }
    }, [currentPenStyle]);

    // Update disabled state without reinitializing
    const updateCanvasState = useCallback(() => {
        if (!fabricCanvasRef.current) return;

        const canvas = fabricCanvasRef.current;
        try {
            canvas.isDrawingMode = !disabled;
            canvas.renderAll();
        } catch (error) {
            console.warn('Error updating canvas state:', error);
        }
    }, [disabled]);

    // Initialize canvas only once on mount
    useEffect(() => {
        if (!isInitializedRef.current) {
            console.log('Initializing canvas...');
            const canvas = initializeCanvas();

            return () => {
                console.log('Cleaning up canvas...');
                // Cleanup on unmount only
                if (fabricCanvasRef.current) {
                    try {
                        fabricCanvasRef.current.off();
                        fabricCanvasRef.current.dispose();
                    } catch (error) {
                        console.warn('Error during canvas cleanup:', error);
                    }
                    fabricCanvasRef.current = null;
                    isInitializedRef.current = false;
                }
            };
        }
    }, []); // Empty dependency array - initialize only once

    // Update pen style when it changes
    useEffect(() => {
        if (isInitializedRef.current) {
            updatePenStyle();
        }
    }, [updatePenStyle]);

    // Update disabled state when it changes
    useEffect(() => {
        if (isInitializedRef.current) {
            updateCanvasState();
        }
    }, [updateCanvasState]);

    // Load initial signature after canvas is initialized
    useEffect(() => {
        if (isInitializedRef.current && fabricCanvasRef.current && initialSignature && !initialLoadRef.current) {
            console.log('Loading initial signature...');
            loadSignatureFromSVG(initialSignature);
            initialLoadRef.current = true;
        }
    }, [initialSignature, loadSignatureFromSVG]);
    // Handle canvas resize when expanded state changes
    useEffect(() => {
        if (fabricCanvasRef.current && isInitializedRef.current) {
            const canvas = fabricCanvasRef.current;
            const currentWidth = isExpanded ? Math.min(width * 1.3, 800) : width;
            const currentHeight = isExpanded ? height * 1.5 : height;

            try {
                canvas.setDimensions({
                    width: currentWidth,
                    height: currentHeight
                });
                canvas.renderAll();
            } catch (error) {
                console.warn('Error resizing canvas:', error);
            }
        }
    }, [isExpanded, width, height]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle shortcuts when canvas is active and not in an input field
            if (!fabricCanvasRef.current) return;
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
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [undo, redo]);

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
                            $active={currentPenStyle === style}
                            onClick={() => handlePenStyleChange(style as keyof typeof penStyles)}
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