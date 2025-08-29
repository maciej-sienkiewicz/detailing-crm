// src/components/Templates/TemplateDateCell.tsx
import React from 'react';
import { Template } from '../../types/template';

interface TemplateDateCellProps {
    template: Template;
}

export const TemplateDateCell: React.FC<TemplateDateCellProps> = ({ template }) => {
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return <span>{formatDate(template.updatedAt)}</span>;
};