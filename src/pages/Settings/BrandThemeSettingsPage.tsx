// src/pages/Settings/BrandThemeSettingsPage.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPalette, FaSave, FaUndo, FaEye, FaCar, FaCheck } from 'react-icons/fa';

// Brand Theme System
const brandTheme = {
    primary: 'var(--brand-primary, #2563eb)',
    primaryLight: 'var(--brand-primary-light, #3b82f6)',
    primaryGhost: 'var(--brand-primary-ghost, rgba(37, 99, 235, 0.08))',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    neutral: '#64748b',
    border: '#e2e8f0'
};

interface BrandPreset {
    id: string;
    name: string;
    color: string;
    description: string;
    category: 'automotive' | 'general' | 'custom';
}

const brandPresets: BrandPreset[] = [
    // Automotive Brands
    { id: 'default', name: 'Domyślny', color: '#2563eb', description: 'Klasyczny niebieski', category: 'general' },
    { id: 'audi', name: 'Audi', color: '#BB0A30', description: 'Charakterystyczny czerwony', category: 'automotive' },
    { id: 'bmw', name: 'BMW', color: '#0066CC', description: 'Firmowy niebieski', category: 'automotive' },
    { id: 'mercedes', name: 'Mercedes', color: '#00ADEF', description: 'Srebrno-błękitny', category: 'automotive' },
    { id: 'porsche', name: 'Porsche', color: '#D5001C', description: 'Racing czerwony', category: 'automotive' },
    { id: 'ferrari', name: 'Ferrari', color: '#DC143C', description: 'Rosso Corsa', category: 'automotive' },
    { id: 'lamborghini', name: 'Lamborghini', color: '#FFA500', description: 'Arancio Borealis', category: 'automotive' },
    { id: 'mclaren', name: 'McLaren', color: '#FF8000', description: 'Papaya Orange', category: 'automotive' },
    { id: 'tesla', name: 'Tesla', color: '#E31937', description: 'Tesla Red', category: 'automotive' },

    // General Professional Colors
    { id: 'luxury-gold', name: 'Luxury Gold', color: '#D4AF37', description: 'Premium złoty', category: 'general' },
    { id: 'racing-green', name: 'Racing Green', color: '#1B4332', description: 'Klasyczna zieleń', category: 'automotive' },
    { id: 'electric-blue', name: 'Electric Blue', color: '#0EA5E9', description: 'Nowoczesny błękit', category: 'general' },
    { id: 'carbon-black', name: 'Carbon Black', color: '#2D3748', description: 'Sportowy czarny', category: 'automotive' },
    { id: 'custom-orange', name: 'Professional Orange', color: '#EA580C', description: 'Energiczny pomarańcz', category: 'general' }
];

const BrandThemeSettingsPage: React.FC = () => {
    const [currentTheme, setCurrentTheme] = useState<string>('default');
    const [customColor, setCustomColor] = useState<string>('#2563eb');
    const [previewMode, setPreviewMode] = useState<boolean>(false);
    const [savedTheme, setSavedTheme] = useState<string>('default');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Load saved theme from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('brandTheme');
        if (saved) {
            try {
                const themeData = JSON.parse(saved);
                setCurrentTheme(themeData.id || 'default');
                setSavedTheme(themeData.id || 'default');
                if (themeData.color) {
                    setCustomColor(themeData.color);
                    applyTheme(themeData.id, themeData.color);
                }
            } catch (error) {
                console.error('Error loading saved theme:', error);
            }
        }
    }, []);

    // Apply theme to the document
    const applyTheme = (themeId: string, color: string) => {
        // Remove previous theme classes
        document.body.className = document.body.className.replace(/theme-\w+/g, '');

        if (themeId === 'custom') {
            // Apply custom color
            document.documentElement.style.setProperty('--brand-primary', color);
        } else if (themeId !== 'default') {
            // Apply preset theme
            document.body.classList.add(`theme-${themeId}`);
            const preset = brandPresets.find(p => p.id === themeId);
            if (preset) {
                document.documentElement.style.setProperty('--brand-primary', preset.color);
            }
        } else {
            // Reset to default
            document.documentElement.style.setProperty('--brand-primary', '#2563eb');
        }
    };

    // Handle preset selection
    const handlePresetSelect = (presetId: string) => {
        setCurrentTheme(presetId);
        const preset = brandPresets.find(p => p.id === presetId);
        if (preset) {
            if (previewMode) {
                applyTheme(presetId, preset.color);
            }
        }
    };

    // Handle custom color change
    const handleCustomColorChange = (color: string) => {
        setCustomColor(color);
        setCurrentTheme('custom');
        if (previewMode) {
            applyTheme('custom', color);
        }
    };

    // Toggle preview mode
    const handlePreviewToggle = () => {
        const newPreviewMode = !previewMode;
        setPreviewMode(newPreviewMode);

        if (newPreviewMode) {
            // Apply current selection
            if (currentTheme === 'custom') {
                applyTheme('custom', customColor);
            } else {
                const preset = brandPresets.find(p => p.id === currentTheme);
                if (preset) {
                    applyTheme(currentTheme, preset.color);
                }
            }
        } else {
            // Restore saved theme
            if (savedTheme === 'custom') {
                const saved = localStorage.getItem('brandTheme');
                if (saved) {
                    const themeData = JSON.parse(saved);
                    applyTheme('custom', themeData.color);
                }
            } else {
                const preset = brandPresets.find(p => p.id === savedTheme);
                if (preset) {
                    applyTheme(savedTheme, preset.color);
                }
            }
        }
    };

    // Save theme
    const handleSave = () => {
        const themeData = {
            id: currentTheme,
            color: currentTheme === 'custom' ? customColor : brandPresets.find(p => p.id === currentTheme)?.color
        };

        // Save to localStorage
        localStorage.setItem('brandTheme', JSON.stringify(themeData));

        // Apply theme
        applyTheme(themeData.id, themeData.color || '#2563eb');

        // Update saved state
        setSavedTheme(currentTheme);

        // Show success message
        setSuccessMessage('Motyw marki został zapisany pomyślnie!');
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    // Reset to default
    const handleReset = () => {
        setCurrentTheme('default');
        setCustomColor('#2563eb');
        if (previewMode) {
            applyTheme('default', '#2563eb');
        }
    };

    const hasChanges = currentTheme !== savedTheme;
    const selectedPreset = brandPresets.find(p => p.id === currentTheme);

    return (
        <PageContainer>
            <PageHeader>
                <HeaderLeft>
                    <HeaderIcon>
                        <FaPalette />
                    </HeaderIcon>
                    <HeaderText>
                        <PageTitle>Kolory marki</PageTitle>
                        <PageSubtitle>Dostosuj wygląd aplikacji do Twojej firmy</PageSubtitle>
                    </HeaderText>
                </HeaderLeft>

                <HeaderActions>
                    <PreviewToggle
                        $active={previewMode}
                        onClick={handlePreviewToggle}
                    >
                        <FaEye />
                        {previewMode ? 'Zakończ podgląd' : 'Podgląd na żywo'}
                    </PreviewToggle>
                </HeaderActions>
            </PageHeader>

            {successMessage && (
                <SuccessMessage>
                    <FaCheck />
                    {successMessage}
                </SuccessMessage>
            )}

            <ContentGrid>
                {/* Theme Selection */}
                <SelectionPanel>
                    <SectionTitle>Gotowe motywy</SectionTitle>

                    {/* Automotive Brands */}
                    <CategorySection>
                        <CategoryTitle>
                            <FaCar />
                            Marki automotive
                        </CategoryTitle>
                        <PresetGrid>
                            {brandPresets.filter(p => p.category === 'automotive').map(preset => (
                                <PresetCard
                                    key={preset.id}
                                    $active={currentTheme === preset.id}
                                    onClick={() => handlePresetSelect(preset.id)}
                                >
                                    <PresetColor color={preset.color} />
                                    <PresetInfo>
                                        <PresetName>{preset.name}</PresetName>
                                        <PresetDescription>{preset.description}</PresetDescription>
                                    </PresetInfo>
                                    {currentTheme === preset.id && (
                                        <ActiveIndicator>
                                            <FaCheck />
                                        </ActiveIndicator>
                                    )}
                                </PresetCard>
                            ))}
                        </PresetGrid>
                    </CategorySection>

                    {/* General Professional */}
                    <CategorySection>
                        <CategoryTitle>
                            <FaPalette />
                            Kolory profesjonalne
                        </CategoryTitle>
                        <PresetGrid>
                            {brandPresets.filter(p => p.category === 'general').map(preset => (
                                <PresetCard
                                    key={preset.id}
                                    $active={currentTheme === preset.id}
                                    onClick={() => handlePresetSelect(preset.id)}
                                >
                                    <PresetColor color={preset.color} />
                                    <PresetInfo>
                                        <PresetName>{preset.name}</PresetName>
                                        <PresetDescription>{preset.description}</PresetDescription>
                                    </PresetInfo>
                                    {currentTheme === preset.id && (
                                        <ActiveIndicator>
                                            <FaCheck />
                                        </ActiveIndicator>
                                    )}
                                </PresetCard>
                            ))}
                        </PresetGrid>
                    </CategorySection>

                    {/* Custom Color */}
                    <CategorySection>
                        <CategoryTitle>
                            <FaPalette />
                            Kolor niestandardowy
                        </CategoryTitle>
                        <CustomColorSection>
                            <CustomColorPicker>
                                <ColorInput
                                    type="color"
                                    value={customColor}
                                    onChange={(e) => handleCustomColorChange(e.target.value)}
                                />
                                <ColorDetails>
                                    <ColorLabel>Wybierz kolor marki</ColorLabel>
                                    <ColorValue>{customColor.toUpperCase()}</ColorValue>
                                </ColorDetails>
                            </CustomColorPicker>
                            {currentTheme === 'custom' && (
                                <CustomActiveIndicator>
                                    <FaCheck /> Aktywny
                                </CustomActiveIndicator>
                            )}
                        </CustomColorSection>
                    </CategorySection>
                </SelectionPanel>

                {/* Preview Panel */}
                <PreviewPanel>
                    <SectionTitle>Podgląd</SectionTitle>
                    <PreviewContent>
                        {/* Current Selection Info */}
                        <CurrentSelectionCard>
                            <SelectionHeader>
                                <SelectionColorPreview
                                    color={currentTheme === 'custom' ? customColor : selectedPreset?.color || '#2563eb'}
                                />
                                <SelectionInfo>
                                    <SelectionName>
                                        {currentTheme === 'custom' ? 'Kolor niestandardowy' : selectedPreset?.name}
                                    </SelectionName>
                                    <SelectionDescription>
                                        {currentTheme === 'custom' ? customColor.toUpperCase() : selectedPreset?.description}
                                    </SelectionDescription>
                                </SelectionInfo>
                            </SelectionHeader>
                        </CurrentSelectionCard>

                        {/* Demo Components */}
                        <DemoSection>
                            <DemoTitle>Przykładowe elementy</DemoTitle>

                            {/* Button Examples */}
                            <DemoGroup>
                                <DemoSubtitle>Przyciski</DemoSubtitle>
                                <ButtonDemo>
                                    <DemoButton $primary>Główny przycisk</DemoButton>
                                    <DemoButton $secondary>Drugorzędny</DemoButton>
                                </ButtonDemo>
                            </DemoGroup>

                            {/* Menu Example */}
                            <DemoGroup>
                                <DemoSubtitle>Menu nawigacji</DemoSubtitle>
                                <MenuDemo>
                                    <MenuDemoItem $active>📅 Kalendarz</MenuDemoItem>
                                    <MenuDemoItem>👥 Klienci</MenuDemoItem>
                                    <MenuDemoItem>💰 Finanse</MenuDemoItem>
                                </MenuDemo>
                            </DemoGroup>

                            {/* Card Example */}
                            <DemoGroup>
                                <DemoSubtitle>Karty informacyjne</DemoSubtitle>
                                <CardDemo>
                                    <CardDemoHeader>Przykładowa karta</CardDemoHeader>
                                    <CardDemoContent>
                                        Tak będą wyglądać elementy z kolorem Twojej marki
                                    </CardDemoContent>
                                </CardDemo>
                            </DemoGroup>
                        </DemoSection>
                    </PreviewContent>

                    {/* Action Buttons */}
                    <ActionButtons>
                        <ResetButton onClick={handleReset}>
                            <FaUndo />
                            Resetuj
                        </ResetButton>
                        <SaveButton
                            onClick={handleSave}
                            $hasChanges={hasChanges}
                            disabled={!hasChanges}
                        >
                            <FaSave />
                            {hasChanges ? 'Zapisz zmiany' : 'Zapisane'}
                        </SaveButton>
                    </ActionButtons>
                </PreviewPanel>
            </ContentGrid>

            {/* Instructions */}
            <InstructionsSection>
                <InstructionsTitle>💡 Instrukcje</InstructionsTitle>
                <InstructionsGrid>
                    <InstructionCard>
                        <InstructionNumber>1</InstructionNumber>
                        <InstructionContent>
                            <InstructionTitle>Wybierz kolor</InstructionTitle>
                            <InstructionText>Wybierz gotowy motyw lub ustaw własny kolor marki</InstructionText>
                        </InstructionContent>
                    </InstructionCard>
                    <InstructionCard>
                        <InstructionNumber>2</InstructionNumber>
                        <InstructionContent>
                            <InstructionTitle>Sprawdź podgląd</InstructionTitle>
                            <InstructionText>Użyj "Podgląd na żywo" aby zobaczyć zmiany w aplikacji</InstructionText>
                        </InstructionContent>
                    </InstructionCard>
                    <InstructionCard>
                        <InstructionNumber>3</InstructionNumber>
                        <InstructionContent>
                            <InstructionTitle>Zapisz ustawienia</InstructionTitle>
                            <InstructionText>Kliknij "Zapisz zmiany" aby zastosować nowy motyw</InstructionText>
                        </InstructionContent>
                    </InstructionCard>
                </InstructionsGrid>
            </InstructionsSection>
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    padding: 24px;
    background: ${brandTheme.surfaceAlt};
    min-height: 100vh;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 24px;
    background: ${brandTheme.surface};
    border-radius: 12px;
    border: 1px solid ${brandTheme.border};
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const HeaderIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${brandTheme.primary};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
`;

const HeaderText = styled.div``;

const PageTitle = styled.h1`
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
`;

const PageSubtitle = styled.p`
    color: ${brandTheme.neutral};
    font-size: 16px;
    margin: 4px 0 0 0;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 12px;
`;

const PreviewToggle = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: 2px solid ${props => props.$active ? brandTheme.primary : brandTheme.border};
    background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$active ? brandTheme.primary : brandTheme.neutral};
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: ${brandTheme.primary};
        color: ${brandTheme.primary};
    }
`;

const SuccessMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    color: #166534;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    margin-bottom: 24px;
    font-weight: 500;
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 24px;
    margin-bottom: 32px;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

const SelectionPanel = styled.div`
    background: ${brandTheme.surface};
    border-radius: 12px;
    border: 1px solid ${brandTheme.border};
    padding: 24px;
`;

const PreviewPanel = styled.div`
    background: ${brandTheme.surface};
    border-radius: 12px;
    border: 1px solid ${brandTheme.border};
    padding: 24px;
    display: flex;
    flex-direction: column;
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 24px 0;
`;

const CategorySection = styled.div`
    margin-bottom: 32px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const CategoryTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 16px 0;
`;

const PresetGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
`;

const PresetCard = styled.div<{ $active: boolean }>`
    position: relative;
    padding: 16px;
    border: 2px solid ${props => props.$active ? brandTheme.primary : brandTheme.border};
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surface};

    &:hover {
        border-color: ${brandTheme.primary};
    }
`;

const PresetColor = styled.div<{ color: string }>`
    width: 32px;
    height: 32px;
    background: ${props => props.color};
    border-radius: 6px;
    margin-bottom: 12px;
    border: 1px solid rgba(0,0,0,0.1);
`;

const PresetInfo = styled.div``;

const PresetName = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 4px;
`;

const PresetDescription = styled.div`
    font-size: 12px;
    color: ${brandTheme.neutral};
`;

const ActiveIndicator = styled.div`
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    background: ${brandTheme.primary};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
`;

const CustomColorSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border: 2px solid ${brandTheme.border};
    border-radius: 8px;
`;

const CustomColorPicker = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const ColorInput = styled.input`
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 8px;
    cursor: pointer;

    &::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    &::-webkit-color-swatch {
        border: 2px solid ${brandTheme.border};
        border-radius: 8px;
    }
`;

const ColorDetails = styled.div``;

const ColorLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 4px;
`;

const ColorValue = styled.div`
    font-size: 12px;
    color: ${brandTheme.neutral};
    font-family: monospace;
`;

const CustomActiveIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${brandTheme.primary};
    font-size: 14px;
    font-weight: 600;
`;

const PreviewContent = styled.div`
    flex: 1;
`;

const CurrentSelectionCard = styled.div`
    padding: 20px;
    background: ${brandTheme.surfaceAlt};
    border-radius: 8px;
    margin-bottom: 24px;
`;

const SelectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const SelectionColorPreview = styled.div<{ color: string }>`
    width: 48px;
    height: 48px;
    background: ${props => props.color};
    border-radius: 8px;
    border: 2px solid rgba(255,255,255,0.9);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SelectionInfo = styled.div``;

const SelectionName = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 4px;
`;

const SelectionDescription = styled.div`
    font-size: 14px;
    color: ${brandTheme.neutral};
`;

const DemoSection = styled.div``;

const DemoTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 16px 0;
`;

const DemoGroup = styled.div`
    margin-bottom: 20px;
`;

const DemoSubtitle = styled.h4`
    font-size: 14px;
    font-weight: 600;
    color: #4b5563;
    margin: 0 0 8px 0;
`;

const ButtonDemo = styled.div`
    display: flex;
    gap: 12px;
`;

const DemoButton = styled.button<{ $primary?: boolean; $secondary?: boolean }>`
    padding: 10px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    ${props => props.$primary && `
        background: ${brandTheme.primary};
        color: white;
        border: none;
    `}

    ${props => props.$secondary && `
        background: ${brandTheme.primaryGhost};
        color: ${brandTheme.primary};
        border: 1px solid ${brandTheme.primary};
    `}
`;

const MenuDemo = styled.div`
    border: 1px solid ${brandTheme.border};
    border-radius: 6px;
    overflow: hidden;
`;

const MenuDemoItem = styled.div<{ $active?: boolean }>`
    padding: 12px 16px;
    border-bottom: 1px solid ${brandTheme.border};
    background: ${props => props.$active ? brandTheme.primaryGhost : brandTheme.surface};
    color: ${props => props.$active ? brandTheme.primary : '#374151'};
    font-weight: ${props => props.$active ? '600' : '500'};

    &:last-child {
        border-bottom: none;
    }
`;

const CardDemo = styled.div`
    border: 1px solid ${brandTheme.border};
    border-radius: 6px;
    overflow: hidden;
`;

const CardDemoHeader = styled.div`
    padding: 12px 16px;
    background: ${brandTheme.primaryGhost};
    color: ${brandTheme.primary};
    font-weight: 600;
    border-bottom: 1px solid ${brandTheme.border};
`;

const CardDemoContent = styled.div`
    padding: 12px 16px;
    color: #374151;
    font-size: 14px;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid ${brandTheme.border};
`;

const ResetButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: ${brandTheme.surface};
    color: ${brandTheme.neutral};
    border: 1px solid ${brandTheme.border};
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: ${brandTheme.surfaceAlt};
        color: #374151;
    }
`;

const SaveButton = styled.button<{ $hasChanges: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: ${props => props.$hasChanges ? brandTheme.primary : '#94a3b8'};
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: ${props => props.$hasChanges ? 'pointer' : 'not-allowed'};
    transition: all 0.2s;
    flex: 1;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
`;

const InstructionsSection = styled.div`
    background: linear-gradient(135deg, ${brandTheme.surfaceAlt} 0%, #e2e8f0 100%);
    border-radius: 12px;
    padding: 32px;
    border: 1px solid ${brandTheme.border};
`;

const InstructionsTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 24px 0;
`;

const InstructionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
`;

const InstructionCard = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
    background: ${brandTheme.surface};
    border-radius: 8px;
    border: 1px solid ${brandTheme.border};
`;

const InstructionNumber = styled.div`
    width: 32px;
    height: 32px;
    background: ${brandTheme.primary};
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
`;

const InstructionContent = styled.div``;

const InstructionTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 6px 0;
`;

const InstructionText = styled.p`
    font-size: 14px;
    color: ${brandTheme.neutral};
    margin: 0;
    line-height: 1.5;
`;

export default BrandThemeSettingsPage;