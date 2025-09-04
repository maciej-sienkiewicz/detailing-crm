// src/components/Templates/TemplateActionsCell.tsx - POPRAWIONA WERSJA
import React from 'react';
import styled from 'styled-components';
import { FaDownload, FaEye, FaSpinner, FaTrash, FaToggleOff, FaToggleOn } from 'react-icons/fa';
import { Template, TemplateUpdateData } from '../../types/template';
import { settingsTheme } from '../../pages/Settings/styles/theme';

interface TemplateActionsCellProps {
    template: Template;
    isUpdating: boolean;
    isDeleting: boolean;
    isDownloading: boolean;
    isPreviewing: boolean;
    onUpdate: (templateId: string, data: TemplateUpdateData) => Promise<void>;
    onDelete: (templateId: string, templateName: string) => Promise<void>;
    onDownload: (template: Template) => Promise<void>;
    onPreview: (template: Template) => Promise<void>;
}

export const TemplateActionsCell: React.FC<TemplateActionsCellProps> = ({
                                                                            template,
                                                                            isUpdating,
                                                                            isDeleting,
                                                                            isDownloading,
                                                                            isPreviewing,
                                                                            onUpdate,
                                                                            onDelete,
                                                                            onDownload,
                                                                            onPreview
                                                                        }) => {
    const handleToggleStatus = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await onUpdate(template.id, {
            name: template.name,
            isActive: !template.isActive
        });
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        // POPRAWKA: przekazanie nazwy szablonu jako drugi parametr
        await onDelete(template.id, template.name);
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await onDownload(template);
    };

    const handlePreview = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await onPreview(template);
    };

    return (
        <ActionsContainer>
            <ActionButton
                onClick={handlePreview}
                disabled={isPreviewing}
                title="Podgląd"
                $variant="view"
            >
                {isPreviewing ? <FaSpinner className="spinning" /> : <FaEye />}
            </ActionButton>

            <ActionButton
                onClick={handleDownload}
                disabled={isDownloading}
                title="Pobierz"
                $variant="download"
            >
                {isDownloading ? <FaSpinner className="spinning" /> : <FaDownload />}
            </ActionButton>

            <ActionButton
                onClick={handleToggleStatus}
                disabled={isUpdating}
                title={template.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                $variant={template.isActive ? "success" : "secondary"}
            >
                {isUpdating ? (
                    <FaSpinner className="spinning" />
                ) : template.isActive ? (
                    <FaToggleOn />
                ) : (
                    <FaToggleOff />
                )}
            </ActionButton>

            <ActionButton
                onClick={handleDelete}
                disabled={isDeleting}
                title="Usuń"
                $variant="danger"
            >
                {isDeleting ? <FaSpinner className="spinning" /> : <FaTrash />}
            </ActionButton>
        </ActionsContainer>
    );
};

const ActionsContainer = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.xs};
    align-items: center;
    justify-content: flex-end;
`;

const ActionButton = styled.button<{ $variant: 'view' | 'download' | 'success' | 'secondary' | 'danger' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: ${settingsTheme.radius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 13px;
    position: relative;

    ${({ $variant }) => {
        switch ($variant) {
            case 'view':
                return `
                    background: ${settingsTheme.primary}15;
                    color: ${settingsTheme.primary};
                    &:hover:not(:disabled) {
                        background: ${settingsTheme.primary};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
            case 'download':
                return `
                    background: ${settingsTheme.status.success}15;
                    color: ${settingsTheme.status.success};
                    &:hover:not(:disabled) {
                        background: ${settingsTheme.status.success};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
            case 'success':
                return `
                    background: ${settingsTheme.status.success}15;
                    color: ${settingsTheme.status.success};
                    &:hover:not(:disabled) {
                        background: ${settingsTheme.status.success};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
            case 'secondary':
                return `
                    background: ${settingsTheme.text.muted}15;
                    color: ${settingsTheme.text.muted};
                    &:hover:not(:disabled) {
                        background: ${settingsTheme.status.warning};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
            case 'danger':
                return `
                    background: ${settingsTheme.status.error}15;
                    color: ${settingsTheme.status.error};
                    &:hover:not(:disabled) {
                        background: ${settingsTheme.status.error};
                        color: white;
                        transform: translateY(-1px);
                    }
                `;
        }
    }}

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;

        .spinning {
            animation: spin 1s linear infinite;
        }
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;