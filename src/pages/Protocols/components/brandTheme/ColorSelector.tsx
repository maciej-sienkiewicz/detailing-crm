// src/pages/Settings/components/brandTheme/ColorSelector.tsx - Updated with persistent brand color
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPalette, FaCheck } from 'react-icons/fa';
import {useBrandColor} from "../../../../hooks/useBrandColor";
import {settingsTheme} from "../../../Settings/styles/theme";

interface ColorPreset {
    id: string;
    name: string;
    color: string;
    category: 'popular' | 'automotive';
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
    const { brandColor, updateBrandColor, isLoading } = useBrandColor();
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [customColor, setCustomColor] = useState(brandColor);

    const selectedPreset = colorPresets.find(p => p.color === brandColor);

    const handlePresetSelect = (preset: ColorPreset) => {
        updateBrandColor(preset.color);
        setCustomColor(preset.color);
        setShowCustomPicker(false);
        onColorChange?.(preset.color);
    };

    const handleCustomColorChange = (color: string) => {
        setCustomColor(color);
        updateBrandColor(color);
        onColorChange?.(color);
    };

    const handleShowCustomPicker = () => {
        setShowCustomPicker(true);
        if (!selectedPreset) {
            setCustomColor(brandColor);
        }
    };

    const popularColors = colorPresets.filter(p => p.category === 'popular');
    const automotiveColors = colorPresets.filter(p => p.category === 'automotive');

    if (isLoading) {
        return (
            <Container>
                <LoadingState>
                    <LoadingSpinner />
                    <span>Ładowanie kolorów...</span>
                </LoadingState>
            </Container>
        );
    }

    return (
        <Container>
            <SectionTitle>
                <FaPalette />
                Kolor marki
            </SectionTitle>

            {/* Popular Colors */}
            <ColorGroup>
                <GroupTitle>Popularne kolory</GroupTitle>
                <ColorGrid>
                    {popularColors.map(preset => (
                        <ColorOption
                            key={preset.id}
                            $color={preset.color}
                            $active={brandColor === preset.color}
                            onClick={() => handlePresetSelect(preset)}
                            title={preset.name}
                        >
                            {brandColor === preset.color && (
                                <CheckIcon><FaCheck /></CheckIcon>
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
                            $active={brandColor === preset.color}
                            onClick={() => handlePresetSelect(preset)}
                            title={preset.name}
                        >
                            {brandColor === preset.color && (
                                <CheckIcon><FaCheck /></CheckIcon>
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
                        />
                        <ColorValue>{customColor.toUpperCase()}</ColorValue>
                        <CustomButton
                            onClick={() => setShowCustomPicker(false)}
                            $secondary
                        >
                            Gotowe
                        </CustomButton>
                    </CustomColorPicker>
                ) : (
                    <CustomButton onClick={handleShowCustomPicker}>
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
                    </SelectedName>
                    <SelectedValue>{brandColor.toUpperCase()}</SelectedValue>
                </SelectedDetails>
                <SavedIndicator>
                    <FaCheck />
                    Zapisano
                </SavedIndicator>
            </SelectedInfo>
        </Container>
    );
};

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
    width: 24px;
    height: 24px;
    border: 2px solid ${settingsTheme.border};
    border-top: 2px solid ${settingsTheme.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
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
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
    gap: ${settingsTheme.spacing.sm};
    max-width: 300px;
`;

const ColorOption = styled.button<{ $color: string; $active: boolean }>`
    position: relative;
    width: 48px;
    height: 48px;
    background: ${props => props.$color};
    border: 3px solid ${props => props.$active ? settingsTheme.primary : settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    cursor: pointer;
    transition: all ${settingsTheme.transitions.spring};
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        border-color: ${settingsTheme.primary};
        transform: scale(1.05);
        box-shadow: ${settingsTheme.shadow.md};
    }
`;

const CheckIcon = styled.div`
    color: white;
    font-size: 16px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
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
    width: 48px;
    height: 48px;
    border: none;
    border-radius: ${settingsTheme.radius.sm};
    cursor: pointer;

    &::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    &::-webkit-color-swatch {
        border: 2px solid ${settingsTheme.border};
        border-radius: ${settingsTheme.radius.sm};
    }
`;

const ColorValue = styled.code`
    font-family: monospace;
    font-size: 14px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    background: ${settingsTheme.surface};
    padding: ${settingsTheme.spacing.xs} ${settingsTheme.spacing.sm};
    border-radius: ${settingsTheme.radius.sm};
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

    &:hover {
        background: ${props => props.$secondary ? settingsTheme.surfaceHover : settingsTheme.primary};
        color: ${props => props.$secondary ? settingsTheme.text.primary : 'white'};
        border-color: ${settingsTheme.primary};
    }
`;

const SelectedInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    padding: ${settingsTheme.spacing.lg};
    background: ${settingsTheme.surfaceAlt};
    border-radius: ${settingsTheme.radius.md};
    border: 1px solid ${settingsTheme.border};
`;

const SelectedPreview = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    background: ${props => props.$color};
    border-radius: ${settingsTheme.radius.sm};
    border: 2px solid ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.sm};
`;

const SelectedDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
`;

const SelectedName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
`;

const SelectedValue = styled.div`
    font-size: 12px;
    font-family: monospace;
    color: ${settingsTheme.text.secondary};
`;

const SavedIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    color: ${settingsTheme.status.success};
    font-size: 12px;
    font-weight: 600;
`;

export default ColorSelector;