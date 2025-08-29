// src/components/Templates/TemplateTypeCell.tsx
import React from 'react';
import styled from 'styled-components';
import { Template } from '../../types/template';
import { settingsTheme } from '../../pages/Settings/styles/theme';

interface TemplateTypeCellProps {
    template: Template;
}

export const TemplateTypeCell: React.FC<TemplateTypeCellProps> = ({ template }) => {
    return (
        <TypeContainer>
            <TypeName>{template.type.displayName}</TypeName>
            <TypeBadge>{template.contentType === 'application/pdf' ? 'PDF' : 'HTML'}</TypeBadge>
        </TypeContainer>
    );
};

const TypeContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xs};
`;

const TypeName = styled.div`
    font-weight: 500;
    color: ${settingsTheme.text.primary};
`;

const TypeBadge = styled.span`
    display: inline-block;
    padding: 2px 6px;
    background: ${settingsTheme.primaryGhost};
    color: ${settingsTheme.primary};
    border-radius: ${settingsTheme.radius.sm};
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: fit-content;
`;