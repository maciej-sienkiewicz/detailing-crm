// src/pages/Settings/components/brandTheme/ColorPreview.tsx
import React from 'react';
import styled from 'styled-components';
import { FaEye, FaCalendarAlt, FaUser, FaDollarSign } from 'react-icons/fa';
import {settingsTheme} from "../../../Settings/styles/theme";

interface ColorPreviewProps {
    selectedColor: string;
    showLogo?: boolean;
    onTogglePreview?: () => void;
    isPreviewActive?: boolean;
}

const ColorPreview: React.FC<ColorPreviewProps> = ({
                                                       selectedColor,
                                                       showLogo = false,
                                                       onTogglePreview,
                                                       isPreviewActive = false
                                                   }) => {
    return (
        <Container>
            <PreviewHeader>
                <PreviewTitle>Podgląd</PreviewTitle>
                {onTogglePreview && (
                    <PreviewToggle
                        $active={isPreviewActive}
                        onClick={onTogglePreview}
                    >
                        <FaEye />
                        {isPreviewActive ? 'Zakończ podgląd' : 'Podgląd na żywo'}
                    </PreviewToggle>
                )}
            </PreviewHeader>

            {/* Current Selection */}
            <CurrentSelection>
                <ColorDisplay $color={selectedColor} />
                <ColorInfo>
                    <ColorName>Wybrany kolor marki</ColorName>
                    <ColorValue>{selectedColor.toUpperCase()}</ColorValue>
                </ColorInfo>
            </CurrentSelection>

            {/* Demo Components */}
            <DemoSection>
                <DemoTitle>Przykład zastosowania</DemoTitle>

                {/* Buttons */}
                <DemoGroup>
                    <DemoLabel>Przyciski</DemoLabel>
                    <ButtonsDemo>
                        <DemoButton $color={selectedColor} $primary>
                            Główny przycisk
                        </DemoButton>
                        <DemoButton $color={selectedColor} $secondary>
                            Drugorzędny
                        </DemoButton>
                    </ButtonsDemo>
                </DemoGroup>

                {/* Navigation */}
                <DemoGroup>
                    <DemoLabel>Nawigacja</DemoLabel>
                    <NavigationDemo>
                        <NavItem $color={selectedColor} $active>
                            <FaCalendarAlt />
                            Kalendarz
                        </NavItem>
                        <NavItem $color={selectedColor}>
                            <FaUser />
                            Klienci
                        </NavItem>
                        <NavItem $color={selectedColor}>
                            <FaDollarSign />
                            Finanse
                        </NavItem>
                    </NavigationDemo>
                </DemoGroup>

                {/* Card */}
                <DemoGroup>
                    <DemoLabel>Karty</DemoLabel>
                    <CardDemo>
                        <CardHeader $color={selectedColor}>
                            Przykładowa karta
                        </CardHeader>
                        <CardContent>
                            Tak będą wyglądać elementy z kolorem Twojej marki
                        </CardContent>
                    </CardDemo>
                </DemoGroup>
            </DemoSection>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
`;

const PreviewHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${settingsTheme.spacing.md};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const PreviewTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0;
`;

const PreviewToggle = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border: 2px solid ${props => props.$active ? settingsTheme.primary : settingsTheme.border};
    background: ${props => props.$active ? settingsTheme.primaryGhost : settingsTheme.surface};
    color: ${props => props.$active ? settingsTheme.primary : settingsTheme.text.secondary};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    cursor: pointer;
    transition: all ${settingsTheme.transitions.spring};
    font-size: 14px;

    &:hover {
        border-color: ${settingsTheme.primary};
        color: ${settingsTheme.primary};
        background: ${settingsTheme.primaryGhost};
    }
`;

const CurrentSelection = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    padding: ${settingsTheme.spacing.lg};
    background: ${settingsTheme.surfaceAlt};
    border-radius: ${settingsTheme.radius.md};
    border: 1px solid ${settingsTheme.border};
`;

const ColorDisplay = styled.div<{ $color: string }>`
    width: 48px;
    height: 48px;
    background: ${props => props.$color};
    border-radius: ${settingsTheme.radius.sm};
    border: 2px solid ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.sm};
    flex-shrink: 0;
`;

const ColorInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ColorName = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
`;

const ColorValue = styled.div`
    font-size: 12px;
    font-family: monospace;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
`;

const DemoSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
`;

const DemoTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0;
`;

const DemoGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.sm};
`;

const DemoLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${settingsTheme.text.secondary};
`;

const ButtonsDemo = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.sm};
    flex-wrap: wrap;
`;

const DemoButton = styled.button<{ $color: string; $primary?: boolean; $secondary?: boolean }>`
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 500;
    cursor: pointer;
    transition: all ${settingsTheme.transitions.spring};
    font-size: 14px;
    border: 1px solid transparent;

    ${props => props.$primary && `
        background: ${props.$color};
        color: white;
        border-color: ${props.$color};
        box-shadow: ${settingsTheme.shadow.xs};

        &:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
    `}

    ${props => props.$secondary && `
        background: ${props.$color}10;
        color: ${props.$color};
        border-color: ${props.$color}30;

        &:hover {
            background: ${props.$color}20;
            border-color: ${props.$color};
        }
    `}
`;

const NavigationDemo = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    overflow: hidden;
    background: ${settingsTheme.surface};
`;

const NavItem = styled.div<{ $color: string; $active?: boolean }>`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-bottom: 1px solid ${settingsTheme.border};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all ${settingsTheme.transitions.spring};

    background: ${props => props.$active ? `${props.$color}10` : settingsTheme.surface};
    color: ${props => props.$active ? props.$color : settingsTheme.text.primary};
    border-left: 3px solid ${props => props.$active ? props.$color : 'transparent'};

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${props => `${props.$color}05`};
        color: ${props => props.$color};
    }
`;

const CardDemo = styled.div`
    border: 1px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    overflow: hidden;
    background: ${settingsTheme.surface};
`;

const CardHeader = styled.div<{ $color: string }>`
    padding: ${settingsTheme.spacing.md};
    background: ${props => `${props.$color}10`};
    color: ${props => props.$color};
    font-weight: 600;
    font-size: 14px;
    border-bottom: 1px solid ${settingsTheme.border};
`;

const CardContent = styled.div`
    padding: ${settingsTheme.spacing.md};
    color: ${settingsTheme.text.secondary};
    font-size: 14px;
    line-height: 1.5;
`;

const LogoDemo = styled.div<{ $color: string }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.md};
    background: ${props => `${props.$color}05`};
    border: 1px solid ${props => `${props.$color}20`};
    border-radius: ${settingsTheme.radius.md};
`;

const LogoDemoText = styled.div`
    font-size: 12px;
    color: ${settingsTheme.text.muted};
    text-align: center;
`;

export default ColorPreview;