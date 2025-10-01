// src/pages/Settings/components/brandTheme/LogoManager.tsx - Updated with React Query integration
import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaImage, FaUpload, FaTrash, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { settingsTheme } from "../../../Settings/styles/theme";
import {logoApi} from "../../../../api/logoApi";
import {useCompanyLogo} from "../../../../hooks/useCompanyLogo";

interface LogoManagerProps {
    onLogoChange?: () => void;
}

const LogoManager: React.FC<LogoManagerProps> = ({ onLogoChange }) => {
    const {
        logoUrl,
        hasLogo,
        isLoading,
        refetch: refetchLogo
    } = useCompanyLogo();

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showMessage = useCallback((message: string, isError: boolean = false) => {
        if (isError) {
            setError(message);
            setSuccess(null);
        } else {
            setSuccess(message);
            setError(null);
        }

        setTimeout(() => {
            setError(null);
            setSuccess(null);
        }, 3000);
    }, []);

    const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        const validation = logoApi.validateLogoFile(file);
        if (!validation.valid) {
            showMessage(validation.error || 'Nieprawidłowy plik', true);
            return;
        }

        setUploading(true);
        setError(null);

        try {

            // Upload logo
            await logoApi.uploadLogo(file);

            // Trigger React Query refetch - this will update the cache automatically
            refetchLogo();

            // Callback for parent component
            onLogoChange?.();

            showMessage('Logo zostało przesłane pomyślnie');
        } catch (err) {
            console.error('Error uploading logo:', err);
            showMessage('Nie udało się przesłać logo', true);
        } finally {
            setUploading(false);
        }
    }, [refetchLogo, onLogoChange, showMessage]);

    const handleDeleteLogo = useCallback(async () => {
        if (!window.confirm('Czy na pewno chcesz usunąć logo?')) {
            return;
        }

        setUploading(true);
        setError(null);

        try {

            await logoApi.deleteLogo();

            // Trigger React Query refetch - this will update the cache automatically
            refetchLogo();

            // Callback for parent component
            onLogoChange?.();

            showMessage('Logo zostało usunięte');
        } catch (err) {
            console.error('Error deleting logo:', err);
            showMessage('Nie udało się usunąć logo', true);
        } finally {
            setUploading(false);
        }
    }, [refetchLogo, onLogoChange, showMessage]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Container>
            <SectionTitle>
                <FaImage />
                Logo firmy
            </SectionTitle>

            {/* Messages */}
            {error && (
                <Message $error>
                    <FaExclamationTriangle />
                    {error}
                </Message>
            )}

            {success && (
                <Message $success>
                    <FaCheck />
                    {success}
                </Message>
            )}

            {/* Logo Display */}
            <LogoSection>
                <LogoPreview $hasLogo={hasLogo}>
                    {isLoading ? (
                        <LoadingState>
                            <FaSpinner className="spinning" />
                            <span>Ładowanie...</span>
                        </LoadingState>
                    ) : hasLogo && logoUrl ? (
                        <LogoImage
                            src={logoUrl}
                            alt="Logo firmy"
                            onError={(e) => {
                                console.error('Logo load error:', e);
                                showMessage('Błąd ładowania logo', true);
                            }}
                            onLoad={() => {
                            }}
                        />
                    ) : (
                        <EmptyState>
                            <EmptyIcon>
                                <FaImage />
                            </EmptyIcon>
                            <EmptyText>Brak logo</EmptyText>
                        </EmptyState>
                    )}
                </LogoPreview>

                {/* Actions */}
                <LogoActions>
                    {hasLogo ? (
                        <>
                            <ActionButton
                                onClick={handleUploadClick}
                                disabled={uploading}
                                $secondary
                            >
                                {uploading ? <FaSpinner className="spinning" /> : <FaUpload />}
                                Zmień logo
                            </ActionButton>
                            <ActionButton
                                onClick={handleDeleteLogo}
                                disabled={uploading}
                                $danger
                            >
                                <FaTrash />
                                Usuń
                            </ActionButton>
                        </>
                    ) : (
                        <ActionButton
                            onClick={handleUploadClick}
                            disabled={uploading}
                            $primary
                        >
                            {uploading ? <FaSpinner className="spinning" /> : <FaUpload />}
                            Dodaj logo
                        </ActionButton>
                    )}
                </LogoActions>
            </LogoSection>

            {/* Requirements */}
            <Requirements>
                <RequirementsTitle>Wymagania</RequirementsTitle>
                <RequirementsList>
                    <RequirementItem>Formaty: JPG, PNG, WebP</RequirementItem>
                    <RequirementItem>Maksymalny rozmiar: 5MB</RequirementItem>
                    <RequirementItem>Zalecane wymiary: 200×100px</RequirementItem>
                    <RequirementItem>Przezroczyste tło: PNG</RequirementItem>
                </RequirementsList>
            </Requirements>

            {/* Hidden file input */}
            <HiddenFileInput
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
            />
        </Container>
    );
};

// Styled Components - identical to simplified version
const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
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

const Message = styled.div<{ $error?: boolean; $success?: boolean }>`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 500;
    font-size: 14px;

    ${props => props.$error && `
        background: ${settingsTheme.status.errorLight};
        color: ${settingsTheme.status.error};
        border: 1px solid ${settingsTheme.status.error}30;
    `}

    ${props => props.$success && `
        background: ${settingsTheme.status.successLight};
        color: ${settingsTheme.status.success};
        border: 1px solid ${settingsTheme.status.success}30;
    `}
`;

const LogoSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.lg};
`;

const LogoPreview = styled.div<{ $hasLogo: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background: ${settingsTheme.surfaceAlt};
    border: 2px dashed ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.lg};
    transition: all ${settingsTheme.transitions.spring};

    ${props => props.$hasLogo && `
        border-style: solid;
        border-color: ${settingsTheme.border};
        background: ${settingsTheme.surface};
    `}
`;

const LogoImage = styled.img`
    max-width: 100%;
    max-height: 150px;
    object-fit: contain;
    border-radius: ${settingsTheme.radius.sm};
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    color: ${settingsTheme.text.secondary};
    font-weight: 500;

    .spinning {
        animation: spin 1s linear infinite;
        font-size: 24px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    color: ${settingsTheme.text.muted};
`;

const EmptyIcon = styled.div`
    font-size: 48px;
    opacity: 0.5;
`;

const EmptyText = styled.div`
    font-size: 16px;
    font-weight: 500;
`;

const LogoActions = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.sm};
    justify-content: center;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const ActionButton = styled.button<{
    $primary?: boolean;
    $secondary?: boolean;
    $danger?: boolean;
}>`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.lg};
    border: 1px solid transparent;
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all ${settingsTheme.transitions.spring};
    min-width: 120px;
    justify-content: center;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: ${settingsTheme.shadow.md};
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    ${props => props.$primary && `
        background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
        color: white;
        box-shadow: ${settingsTheme.shadow.sm};

        &:not(:disabled):hover {
            background: linear-gradient(135deg, ${settingsTheme.primaryDark} 0%, ${settingsTheme.primary} 100%);
        }
    `}

    ${props => props.$secondary && `
        background: ${settingsTheme.surface};
        color: ${settingsTheme.text.secondary};
        border-color: ${settingsTheme.border};
        box-shadow: ${settingsTheme.shadow.xs};

        &:not(:disabled):hover {
            background: ${settingsTheme.surfaceHover};
            color: ${settingsTheme.text.primary};
            border-color: ${settingsTheme.borderHover};
        }
    `}

    ${props => props.$danger && `
        background: ${settingsTheme.status.errorLight};
        color: ${settingsTheme.status.error};
        border-color: ${settingsTheme.status.error}30;

        &:not(:disabled):hover {
            background: ${settingsTheme.status.error};
            color: white;
            border-color: ${settingsTheme.status.error};
        }
    `}
`;

const Requirements = styled.div`
    background: ${settingsTheme.surfaceAlt};
    border: 1px solid ${settingsTheme.border};
    border-radius: ${settingsTheme.radius.md};
    padding: ${settingsTheme.spacing.lg};
`;

const RequirementsTitle = styled.h4`
    font-size: 14px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.sm} 0;
`;

const RequirementsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xs};
`;

const RequirementItem = styled.li`
    font-size: 12px;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};

    &::before {
        content: '•';
        color: ${settingsTheme.primary};
        font-weight: bold;
        font-size: 14px;
    }
`;

const HiddenFileInput = styled.input`
    display: none;
`;

export default LogoManager;