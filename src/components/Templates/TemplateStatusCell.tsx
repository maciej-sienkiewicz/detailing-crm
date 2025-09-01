// src/components/Templates/TemplateStatusCell.tsx - POPRAWIONA WERSJA
import React from 'react';
import styled from 'styled-components';
import { Template } from '../../types/template';
import { settingsTheme } from '../../pages/Settings/styles/theme';

interface TemplateStatusCellProps {
    template: Template;
}

export const TemplateStatusCell: React.FC<TemplateStatusCellProps> = ({ template }) => {
    return (
        <StatusBadge $isActive={template.isActive}>
            {template.isActive ? 'Aktywny' : 'Nieaktywny'}
        </StatusBadge>
    );
};

const StatusBadge = styled.div<{ $isActive: boolean }>`
    display: inline-flex;
    align-items: center;
    padding: ${settingsTheme.spacing.xs} ${settingsTheme.spacing.sm};
    border-radius: ${settingsTheme.radius.md};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    ${({ $isActive }) => $isActive ? `
        background: ${settingsTheme.status.successLight};
        color: ${settingsTheme.status.success};
    ` : `
        background: ${settingsTheme.text.muted}20;
        color: ${settingsTheme.text.muted};
    `}
`;