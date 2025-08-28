// src/pages/Settings/BrandThemeSettingsPage.tsx - Przeprojektowana wersja
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import styled from 'styled-components';
import { settingsTheme } from './styles/theme';
import ColorSelector from "../Protocols/components/brandTheme/ColorSelector";
import LogoManager from "../Protocols/components/brandTheme/LogoManager";
import {useBrandColor} from "../../hooks/useBrandColor";
import ColorPreview from "../Protocols/components/brandTheme/ColorPreview";

interface BrandThemeSettingsRef {
    handleSave: () => void;
}

const BrandThemeSettingsPage = forwardRef<BrandThemeSettingsRef, {}>((props, ref) => {
    const { brandColor } = useBrandColor();

    // Expose handleSave method to parent component (no longer needed since colors auto-save)
    useImperativeHandle(ref, () => ({
        handleSave: () => {
            // Colors are automatically saved via localStorage
            // Logo is automatically saved via API calls
            console.log('All settings are already saved automatically');
        }
    }));

    return (
        <Container>
            {/* Main Content */}
            <ContentGrid>
                {/* Left Column - Settings */}
                <SettingsColumn>
                    <SettingsCard>
                        <CardBody>
                            <ColorSelector />
                        </CardBody>
                    </SettingsCard>

                    <SettingsCard>
                        <CardBody>
                            <LogoManager />
                        </CardBody>
                    </SettingsCard>
                </SettingsColumn>

                {/* Right Column - Preview */}
                <PreviewColumn>
                    <SettingsCard>
                        <CardBody>
                            <ColorPreview
                                selectedColor={brandColor}
                                showLogo={true}
                            />
                        </CardBody>
                    </SettingsCard>
                </PreviewColumn>
            </ContentGrid>
        </Container>
    );
});

const Container = styled.div`
    flex: 1;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 ${settingsTheme.spacing.xl} ${settingsTheme.spacing.xl};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
    min-height: 0;

    @media (max-width: 1024px) {
        padding: 0 ${settingsTheme.spacing.lg} ${settingsTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${settingsTheme.spacing.md} ${settingsTheme.spacing.md};
        gap: ${settingsTheme.spacing.md};
    }
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: ${settingsTheme.spacing.lg};

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

const SettingsColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
`;

const PreviewColumn = styled.div`
    display: flex;
    flex-direction: column;
`;

const SettingsCard = styled.div`
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.sm};
    overflow: hidden;
    transition: all ${settingsTheme.transitions.spring};

    &:hover {
        box-shadow: ${settingsTheme.shadow.md};
        border-color: ${settingsTheme.borderHover};
    }
`;

const CardBody = styled.div`
    padding: ${settingsTheme.spacing.xl};
`;

export default BrandThemeSettingsPage;