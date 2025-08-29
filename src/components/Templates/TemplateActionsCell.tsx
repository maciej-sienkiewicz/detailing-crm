// src/components/Templates/TemplateActionsCell.tsx
import React from 'react';
import styled from 'styled-components';
import { FaDownload, FaEye, FaSpinner, FaTrash, FaToggleOff, FaToggleOn } from 'react-icons/fa';
import { Template, TemplateUpdateData } from '../../types/template';
import { ActionButtons, ActionButton } from '../../components/common/DataTable';

interface TemplateActionsCellProps {
    template: Template;
    isUpdating: boolean;
    isDeleting: boolean;
    isDownloading: boolean;
    isPreviewing: boolean;
    onUpdate: (templateId: string, data: TemplateUpdateData) => Promise<void>;
    onDelete: (templateId: string) => Promise<void>;
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
    const handleToggleStatus = async () => {
        await onUpdate(template.id, {
            name: template.name,
            isActive: !template.isActive
        });
    };

    return (
        <ActionButtons>
            <ActionButton
                $variant="view"
                onClick={() => onPreview(template)}
                disabled={isPreviewing}
                title="Podgląd"
            >
                {isPreviewing ? <FaSpinner className="spinning" /> : <FaEye />}
            </ActionButton>

            <ActionButton
                $variant="info"
                onClick={() => onDownload(template)}
                disabled={isDownloading}
                title="Pobierz"
            >
                {isDownloading ? <FaSpinner className="spinning" /> : <FaDownload />}
            </ActionButton>

            <ActionButton
                $variant={template.isActive ? "success" : "secondary"}
                onClick={handleToggleStatus}
                disabled={isUpdating}
                title={template.isActive ? "Dezaktywuj" : "Aktywuj"}
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
                $variant="delete"
                onClick={() => onDelete(template.id)}
                disabled={isDeleting}
                title="Usuń"
            >
                {isDeleting ? <FaSpinner className="spinning" /> : <FaTrash />}
            </ActionButton>
        </ActionButtons>
    );
};
