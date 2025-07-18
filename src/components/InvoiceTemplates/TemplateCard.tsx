import React from 'react';
import styled from 'styled-components';
import {
    FaCheckCircle,
    FaTimesCircle,
    FaEye,
    FaDownload,
    FaTrash,
    FaSpinner
} from 'react-icons/fa';
import { InvoiceTemplate } from '../../types/invoiceTemplate';
import { settingsTheme } from '../../pages/Settings/styles/theme';

interface TemplateCardProps {
    template: InvoiceTemplate;
    isActivating: boolean;
    isDeleting: boolean;
    isGeneratingPreview: boolean;
    onActivate: () => void;
    onPreview: () => void;
    onExport: () => void;
    onDelete: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
                                                              template,
                                                              isActivating,
                                                              isDeleting,
                                                              isGeneratingPreview,
                                                              onActivate,
                                                              onPreview,
                                                              onExport,
                                                              onDelete
                                                          }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTemplateTypeLabel = (type: string) => {
        switch (type) {
            case 'SYSTEM_DEFAULT': return 'Systemowy';
            case 'COMPANY_CUSTOM': return 'Firmowy';
            default: return type;
        }
    };

    const getTemplateTypeColor = (type: string) => {
        switch (type) {
            case 'SYSTEM_DEFAULT': return settingsTheme.status.info;
            case 'COMPANY_CUSTOM': return settingsTheme.primary;
            default: return settingsTheme.text.muted;
        }
    };

    return (
        <Card>
            <CardHeader>
                <TemplateInfo>
                    <TemplateName>{template.name}</TemplateName>
                    {template.description && (
                        <TemplateDescription>{template.description}</TemplateDescription>
                    )}
                    <TemplateTags>
                        {template.metadata.tags.map(tag => (
                            <TemplateTag key={tag}>{tag}</TemplateTag>
                        ))}
                    </TemplateTags>
                </TemplateInfo>
                <StatusBadge $isActive={template.isActive}>
                    {template.isActive ? (
                        <>
                            <FaCheckCircle />
                            Aktywny
                        </>
                    ) : (
                        <>
                            <FaTimesCircle />
                            Nieaktywny
                        </>
                    )}
                </StatusBadge>
            </CardHeader>

            <CardContent>
                <InfoRow>
                    <Label>Typ:</Label>
                    <TypeBadge color={getTemplateTypeColor(template.templateType)}>
                        {getTemplateTypeLabel(template.templateType)}
                    </TypeBadge>
                </InfoRow>

                <InfoRow>
                    <Label>Zgodność VAT:</Label>
                    <ComplianceInfo>
                        <ComplianceIcon $compliant={template.metadata.legalCompliance.vatCompliant}>
                            {template.metadata.legalCompliance.vatCompliant ? <FaCheckCircle /> : <FaTimesCircle />}
                        </ComplianceIcon>
                        <span>
                            {template.metadata.legalCompliance.vatCompliant ? 'Zgodny' : 'Niezgodny'}
                        </span>
                    </ComplianceInfo>
                </InfoRow>

                <InfoRow>
                    <Label>Ostatnia aktualizacja:</Label>
                    <DateInfo>
                        <DateValue>{formatDate(template.updatedAt)}</DateValue>
                        <VersionInfo>v{template.metadata.version}</VersionInfo>
                    </DateInfo>
                </InfoRow>
            </CardContent>

            <CardActions>
                <ActionButton
                    onClick={onPreview}
                    disabled={isGeneratingPreview}
                    title="Podgląd szablonu"
                >
                    {isGeneratingPreview ? (
                        <FaSpinner className="spinning" />
                    ) : (
                        <FaEye />
                    )}
                </ActionButton>

                <ActionButton
                    onClick={onExport}
                    title="Eksportuj szablon"
                >
                    <FaDownload />
                </ActionButton>

                {!template.isActive && (
                    <ActionButton
                        onClick={onActivate}
                        disabled={isActivating}
                        title="Aktywuj szablon"
                        $variant="success"
                    >
                        {isActivating ? (
                            <FaSpinner className="spinning" />
                        ) : (
                            <FaCheckCircle />
                        )}
                    </ActionButton>
                )}

                {template.templateType === 'COMPANY_CUSTOM' && (
                    <ActionButton
                        onClick={onDelete}
                        disabled={isDeleting || template.isActive}
                        title={template.isActive ? "Nie można usunąć aktywnego szablonu" : "Usuń szablon"}
                        $variant="danger"
                    >
                        {isDeleting ? (
                            <FaSpinner className="spinning" />
                        ) : (
                            <FaTrash />
                        )}
                    </ActionButton>
                )}
            </CardActions>
        </Card>
    );
};

const Card = styled.div`
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.lg};
    border: 1px solid ${settingsTheme.border};
    overflow: hidden;
    transition: all 0.2s ease;

    &:hover {
        box-shadow: ${settingsTheme.shadow.md};
        transform: translateY(-1px);
    }
`;

const CardHeader = styled.div`
    padding: ${settingsTheme.spacing.lg};
    border-bottom: 1px solid ${settingsTheme.borderLight};
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: ${settingsTheme.spacing.md};
`;

const TemplateInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const TemplateName = styled.h3`
    margin: 0 0 ${settingsTheme.spacing.xs} 0;
    font-size: 18px;
    font-weight: 600;
    color: ${settingsTheme.text.primary};
    line-height: 1.3;
`;

const TemplateDescription = styled.p`
    margin: 0 0 ${settingsTheme.spacing.sm} 0;
    font-size: 14px;
    color: ${settingsTheme.text.secondary};
    line-height: 1.4;
`;

const TemplateTags = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.xs};
    flex-wrap: wrap;
`;

const TemplateTag = styled.span`
    display: inline-block;
    padding: 2px 6px;
    background: ${settingsTheme.primaryGhost};
    color: ${settingsTheme.primary};
    border-radius: ${settingsTheme.radius.sm};
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatusBadge = styled.div<{ $isActive: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
    padding: ${settingsTheme.spacing.xs} ${settingsTheme.spacing.sm};
    border-radius: ${settingsTheme.radius.md};
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;

    ${({ $isActive }) => $isActive ? `
        background: ${settingsTheme.status.successLight};
        color: ${settingsTheme.status.success};
        border: 1px solid ${settingsTheme.status.success}30;
    ` : `
        background: ${settingsTheme.status.errorLight};
        color: ${settingsTheme.status.error};
        border: 1px solid ${settingsTheme.status.error}30;
    `}
`;

const CardContent = styled.div`
    padding: ${settingsTheme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.md};
`;

const InfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Label = styled.span`
    font-size: 14px;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
`;

const TypeBadge = styled.div<{ color: string }>`
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: ${settingsTheme.radius.sm};
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.color};
    background: ${props => props.color}15;
    border: 1px solid ${props => props.color}30;
`;

const ComplianceInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.xs};
    font-size: 14px;
`;

const ComplianceIcon = styled.div<{ $compliant: boolean }>`
    color: ${props => props.$compliant ? settingsTheme.status.success : settingsTheme.status.error};
    font-size: 12px;
`;

const DateInfo = styled.div`
    text-align: right;
`;

const DateValue = styled.div`
    font-weight: 500;
    color: ${settingsTheme.text.primary};
    font-size: 13px;
    margin-bottom: 2px;
`;

const VersionInfo = styled.div`
    font-size: 11px;
    color: ${settingsTheme.text.muted};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const CardActions = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.xs};
    padding: ${settingsTheme.spacing.lg};
    border-top: 1px solid ${settingsTheme.borderLight};
    background: ${settingsTheme.surfaceAlt};
`;

const ActionButton = styled.button<{ $variant?: 'success' | 'danger' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: ${settingsTheme.radius.sm};
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;
    flex: 1;

    ${({ $variant }) => {
    switch ($variant) {
        case 'success':
            return `
                    background: ${settingsTheme.status.successLight};
                    color: ${settingsTheme.status.success};
                    
                    &:hover:not(:disabled) {
                        background: ${settingsTheme.status.success};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${settingsTheme.shadow.md};
                    }
                `;
        case 'danger':
            return `
                    background: ${settingsTheme.status.errorLight};
                    color: ${settingsTheme.status.error};
                    
                    &:hover:not(:disabled) {
                        background: ${settingsTheme.status.error};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${settingsTheme.shadow.md};
                    }
                `;
        default:
            return `
                    background: ${settingsTheme.primaryGhost};
                    color: ${settingsTheme.primary};
                    
                    &:hover:not(:disabled) {
                        background: ${settingsTheme.primary};
                        color: white;
                        transform: translateY(-1px);
                        box-shadow: ${settingsTheme.shadow.md};
                    }
                `;
    }
}}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;