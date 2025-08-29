// src/components/Templates/TemplateStatusCell.tsx
import React from 'react';
import { Template } from '../../types/template';
import { StatusBadge } from '../../components/common/DataTable';
import { settingsTheme } from '../../pages/Settings/styles/theme';

interface TemplateStatusCellProps {
    template: Template;
}

export const TemplateStatusCell: React.FC<TemplateStatusCellProps> = ({ template }) => {
    return (
        <StatusBadge $color={template.isActive ? settingsTheme.status.success : settingsTheme.text.muted}>
            {template.isActive ? 'Aktywny' : 'Nieaktywny'}
        </StatusBadge>
    );
};