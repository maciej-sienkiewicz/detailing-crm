// src/pages/Protocols/components/brandTheme/ColorSelector.tsx - Fixed version without CSS errors
import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { FaPalette, FaCheck, FaExclamationTriangle, FaSpinner, FaUndo } from 'react-icons/fa';
import { useBrandColorContext } from "../../../../context/BrandColorContext";
import { settingsTheme } from "../../../Settings/styles/theme";

// Import CSS variables helper to avoid TypeScript errors
import { CSSVariables } from '../../../../types/style';

interface ColorPreset {
    id: string;
    name: string;
    color: string;
    category: 'popular' | 'automotive' | 'professional';
}

const colorPresets: ColorPreset[] = [
    // Popular business colors
    { id: 'default', name: 'Niebieski', color: '#1a365d', category: 'popular' },
    { id: 'green', name: 'Zielony', color: '#059669', category: 'popular' },
    { id: 'purple', name: 'Fioletowy', color: '#7c3aed', category: 'popular' },
    { id: 'orange', name: 'Pomarańczowy', color: '#ea580c', category: 'popular' },

    // Automotive
    { id: 'bmw', name: 'BMW', color: '#0066CC', category: 'automotive' },
    { id: 'audi', name: 'Audi', color: '#BB0A30', category: 'automotive' },
    { id: 'mercedes', name: 'Mercedes', color: '#00ADEF', category: 'automotive' },
    { id: 'porsche', name: 'Porsche', color: '#D5001C', category: 'automotive' },
];

interface ColorSelectorProps {
    onColorChange?: (color: string) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ onColorChange }) => {
    const {
        brandColor,
        updateBrandColor,
        resetBrandColor,
        isLoading,
        error,
        validateColor,
        isDefault,
        defaultColor
    } = useBrandColorContext();

    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [customColor, setCustomColor] = useState(brandColor);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Sync custom color with brand color
    useEffect(() => {
        setCustomColor(brandColor);
    }, [brandColor]);

    // Clear messages after timeout
    useEffect(() => {
        if (successMessage) {
            const timeout = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [successMessage]);

    useEffect(() => {
        if (localError) {
            const timeout = setTimeout(() => {
                setLocalError(null);
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [localError]);

    const selectedPreset = colorPresets.find(p => p.color.toLowerCase() === brandColor.toLowerCase());

    const handlePresetSelect = useCallback(async (preset: ColorPreset) => {
        try {
            setIsUpdating(true);
            setLocalError(null);

            await updateBrandColor(preset.color);
            setCustomColor(preset.color);
            setShowCustomPicker(false);
            setSuccessMessage(`Kolor "${preset.name}" został zastosowany`);
            onColorChange?.(preset.color);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się zastosować koloru';
            setLocalError(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    }, [updateBrandColor, onColorChange]);

    const handleCustomColorChange = useCallback(async (color: string) => {
        try {
            setLocalError(null);

            if (!validateColor(color)) {
                setLocalError('Nieprawidłowy format koloru HEX');
                return;
            }

            setCustomColor(color);

            // Debounced update for better UX
            const timeoutId = setTimeout(async () => {
                try {
                    setIsUpdating(true);
                    await updateBrandColor(color);
                    setSuccessMessage('Kolor niestandardowy został zastosowany');
                    onColorChange?.(color);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Nie udało się zastosować koloru';
                    setLocalError(errorMessage);
                } finally {
                    setIsUpdating(false);
                }
            }, 500);

            return () => clearTimeout(timeoutId);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Błąd walidacji koloru';
            setLocalError(errorMessage);
        }
    }, [validateColor, updateBrandColor, onColorChange]);

    const handleReset = useCallback(async () => {
        try {
            setIsUpdating(true);
            setLocalError(null);

            await resetBrandColor();
            setCustomColor(defaultColor);
            setShowCustomPicker(false);
            setSuccessMessage('Kolor został przywrócony do domyślnego');
            onColorChange?.(defaultColor);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się przywrócić koloru';
            setLocalError(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    }, [resetBrandColor, defaultColor, onColorChange]);

    const handleShowCustomPicker = () => {
        setShowCustomPicker(true);
        if (!selectedPreset) {
            setCustomColor(brandColor);
        }
    };

    // Group colors by category
    const popularColors = colorPresets.filter(p => p.category === 'popular');
    const automotiveColors = colorPresets.filter(p => p.category === 'automotive');
    const professionalColors = colorPresets.filter(p => p.category === 'professional');

    if (isLoading) {
        return (
            <Container>
                <LoadingState>
                    <LoadingSpinner />
                    <span>Ładowanie ustawień koloru...</span>
                </LoadingState>
            </Container>
        );
    }

    return (
        <Container>
            <SectionHeader>
                <SectionTitle>
                    <FaPalette />
                    Kolor marki
                </SectionTitle>
                {!isDefault && (
                    <ResetButton onClick={handleReset} disabled={isUpdating}>
                        <FaUndo />
                        Przywróć domyślny
                    </ResetButton>
                )}
            </SectionHeader>

            {/* Messages */}
            {(error || localError) && (
                <ErrorMessage>
                    <FaExclamationTriangle />
                    {error || localError}
                </ErrorMessage>
            )}

            {successMessage && (
                <SuccessMessage>
                    <FaCheck />
                    {successMessage}
                </SuccessMessage>
            )}

            {/* Popular Colors */}
            <ColorGroup>
                <GroupTitle>Popularne kolory biznesowe</GroupTitle>
                <ColorGrid>
                    {popularColors.map(preset => (
                        <ColorOption
                            key={preset.id}
                            $color={preset.color}
                            $active={brandColor.toLowerCase() === preset.color.toLowerCase()}
                            onClick={() => handlePresetSelect(preset)}
                            title={preset.name}
                            disabled={isUpdating}
                        >
                            {brandColor.toLowerCase() === preset.color.toLowerCase() && (
                                <CheckIcon><FaCheck /></CheckIcon>
                            )}
                            {isUpdating && brandColor.toLowerCase() === preset.color.toLowerCase() && (
                                <LoadingIcon><FaSpinner className="spinning" /></LoadingIcon>
                            )}
                        </ColorOption>
                    ))}
                </ColorGrid>
            </ColorGroup>

            {/* Automotive Colors */}
            <ColorGroup>
                <GroupTitle>Kolory automotive</GroupTitle>
                <ColorGrid>
                    {automotiveColors.map(preset => (
                        <ColorOption
                            key={preset.id}
                            $color={preset.color}
                            $active={brandColor.toLowerCase() === preset.color.toLowerCase()}
                            onClick={() => handlePresetSelect(preset)}
                            title={preset.name}
                            disabled={isUpdating}
                        >
                            {brandColor.toLowerCase() === preset.color.toLowerCase() && (
                                <CheckIcon><FaCheck /></CheckIcon>
                            )}
                            {isUpdating && brandColor.toLowerCase() === preset.color.toLowerCase() && (
                                <LoadingIcon><FaSpinner className="spinning" /></LoadingIcon>
                            )}
                        </ColorOption>
                    ))}
                </ColorGrid>
            </ColorGroup>

            {/* Professional Colors */}
            <ColorGroup>
                <GroupTitle>Kolory profesjonalne</GroupTitle>
                <ColorGrid>
                    {professionalColors.map(preset => (
                        <ColorOption
                            key={preset.id}
                            $color={preset.color}
                            $active={brandColor.toLowerCase() === preset.color.toLowerCase()}
                            onClick={() => handlePresetSelect(preset)}
                            title={preset.name}
                            disabled={isUpdating}
                        >
                            {brandColor.toLowerCase() === preset.color.toLowerCase() && (
                                <CheckIcon><FaCheck /></CheckIcon>
                            )}
                            {isUpdating && brandColor.toLowerCase() === preset.color.toLowerCase() && (
                                <LoadingIcon><FaSpinner className="spinning" /></LoadingIcon>
                            )}
                        </ColorOption>
                    ))}
                </ColorGrid>
            </ColorGroup>

            {/* Custom Color */}
            <ColorGroup>
                <GroupTitle>Kolor niestandardowy</GroupTitle>
                {showCustomPicker ? (
                    <CustomColorPicker>
                        <ColorInput
                            type="color"
                            value={customColor}
                            onChange={(e) => handleCustomColorChange(e.target.value)}
                            disabled={isUpdating}
                        />
                        <ColorValue>{customColor.toUpperCase()}</ColorValue>
                        <CustomButton
                            onClick={() => setShowCustomPicker(false)}
                            $secondary
                            disabled={isUpdating}
                        >
                            Gotowe
                        </CustomButton>
                    </CustomColorPicker>
                ) : (
                    <CustomButton onClick={handleShowCustomPicker} disabled={isUpdating}>
                        <FaPalette />
                        Wybierz własny kolor
                    </CustomButton>
                )}
            </ColorGroup>

            {/* Selected Color Info */}
            <SelectedInfo>
                <SelectedPreview $color={brandColor} />
                <SelectedDetails>
                    <SelectedName>
                        {selectedPreset ? selectedPreset.name : 'Kolor niestandardowy'}
                        {isDefault && ' (domyślny)'}
                    </SelectedName>
                    <SelectedValue>{brandColor.toUpperCase()}</SelectedValue>
                </SelectedDetails>
                <SavedIndicator $visible={!isUpdating}>
                    <FaCheck />
                    Zastosowany
                </SavedIndicator>
                {isUpdating && (
                    <UpdatingIndicator>
                        <FaSpinner className="spinning" />
                        Aktualizacja...
                    </UpdatingIndicator>
                )}
            </SelectedInfo>
        </Container>
    );
};

// Styled Components - Using fallback values to avoid CSS variable errors
const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    padding: ${settingsTheme.spacing.xl};
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
`;

const LoadingSpinner = styled.div`
    width: 32px;
    height: 32px;
    border: 3px solid ${settingsTheme.border};
    border-top: 3px solid ${settingsTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
`;

const SectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    font-size: 18px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0;
`;

const ResetButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
    padding: ${settingsTheme.spacing.xs} ${settingsTheme.spacing.sm};
    background: ${settingsTheme.status.warningLight};
    color: ${settingsTheme.status.warning};
    border: 1px solid ${settingsTheme.status.warning}30;
    border-radius: ${settingsTheme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all ${settingsTheme.transitions.spring};

    &:hover:not(:disabled) {
        background: ${settingsTheme.status.warning};
        color: white;
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    background: ${settingsTheme.status.errorLight};
    color: ${settingsTheme.status.error};
    padding: ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    border: 1px solid ${settingsTheme.status.error}30;
    font-weight: 500;
    font-size: 14px;
`;

const SuccessMessage = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    background: ${settingsTheme.status.successLight};
    color: ${settingsTheme.status.success};
    padding: ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    border: 1px solid ${settingsTheme.status.success}30;
    font-weight: 500;
    font-size: 14px;
`;

const ColorGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.sm};
`;

const GroupTitle = styled.h4`
    font-size: 14px;
    font-weight: 600;
    color: ${settingsTheme.text.secondary};
    margin: 0;
`;

const ColorGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    gap: ${settingsTheme.spacing.sm};
    max-width: 400px;
`;

const ColorOption = styled.button<{ $color: string; $active: boolean }>`
    position: relative;
    width: 56px;
    height: 56px;
    background: ${props => props.$color};
    border: 3px solid ${props => props.$active ? settingsTheme.primary : settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    cursor: pointer;
    transition: all ${settingsTheme.transitions.spring};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    &:hover:not(:disabled) {
        border-color: ${settingsTheme.primary};
        transform: scale(1.05);
        box-shadow: ${settingsTheme.shadow.lg};
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
`;

const CheckIcon = styled.div`
    color: white;
    font-size: 16px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    z-index: 2;
`;

const LoadingIcon = styled.div`
    color: white;
    font-size: 16px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    z-index: 2;

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const CustomColorPicker = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    padding: ${settingsTheme.spacing.md};
    background: ${settingsTheme.surfaceAlt};
    border-radius: ${settingsTheme.radius.md};
    border: 1px solid ${settingsTheme.border};
`;

const ColorInput = styled.input`
    width: 56px;
    height: 56px;
    border: 2px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    cursor: pointer;
    transition: all ${settingsTheme.transitions.spring};

    &::-webkit-color-swatch-wrapper {
        padding: 4px;
        border-radius: ${settingsTheme.radius.sm};
        overflow: hidden;
    }

    &::-webkit-color-swatch {
        border: none;
        border-radius: ${settingsTheme.radius.sm};
    }

    &:focus {
        outline: none;
        border-color: ${settingsTheme.primary};
        box-shadow: 0 0 0 3px ${settingsTheme.primaryGhost};
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const ColorValue = styled.code`
    font-family: 'Courier New', monospace;
    font-size: 14px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    background: ${settingsTheme.surface};
    padding: ${settingsTheme.spacing.xs} ${settingsTheme.spacing.sm};
    border-radius: ${settingsTheme.radius.sm};
    border: 1px solid ${settingsTheme.border};
`;

const CustomButton = styled.button<{ $secondary?: boolean }>`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border: 1px solid ${settingsTheme.border};
    background: ${props => props.$secondary ? settingsTheme.surface : settingsTheme.primaryGhost};
    color: ${props => props.$secondary ? settingsTheme.text.secondary : settingsTheme.primary};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 500;
    cursor: pointer;
    transition: all ${settingsTheme.transitions.spring};

    &:hover:not(:disabled) {
        background: ${props => props.$secondary ? settingsTheme.surfaceHover : settingsTheme.primary};
        color: ${props => props.$secondary ? settingsTheme.text.primary : 'white'};
        border-color: ${settingsTheme.primary};
        transform: translateY(-1px);
        box-shadow: ${settingsTheme.shadow.sm};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const SelectedInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    padding: ${settingsTheme.spacing.lg};
    background: ${settingsTheme.surfaceAlt};
    border-radius: ${settingsTheme.radius.lg};
    border: 2px solid ${settingsTheme.border};
    position: relative;
    overflow: hidden;

    /* Dynamic border using current brand color */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, ${settingsTheme.primary}, ${settingsTheme.primaryLight});
    }
`;

const SelectedPreview = styled.div<{ $color: string }>`
    width: 48px;
    height: 48px;
    background: ${props => props.$color};
    border-radius: ${settingsTheme.radius.md};
    border: 2px solid ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.sm};
    flex-shrink: 0;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
`;

const SelectedDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
`;

const SelectedName = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
`;

const SelectedValue = styled.div`
    font-size: 13px;
    font-family: 'Courier New', monospace;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
`;

const SavedIndicator = styled.div<{ $visible: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${settingsTheme.status.success};
    font-size: 12px;
    font-weight: 600;
    opacity: ${props => props.$visible ? 1 : 0};
    transition: opacity ${settingsTheme.transitions.normal};
`;

const UpdatingIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${settingsTheme.primary};
    font-size: 12px;
    font-weight: 600;

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

export default ColorSelector;