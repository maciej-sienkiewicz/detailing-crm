import React, {forwardRef, useImperativeHandle, useState} from 'react';
import styled from 'styled-components';
import {FaExclamationTriangle, FaFileInvoice, FaInfoCircle, FaPlus, FaSpinner, FaTimes} from 'react-icons/fa';
import {useInvoiceTemplates} from '../../hooks/useInvoiceTemplates';
import {TemplatesTable} from '../../components/InvoiceTemplates/TemplatesTable';
import {TemplateUploadModal} from '../../components/InvoiceTemplates/TemplateUploadModal';
import {InstructionsModal} from '../../components/InvoiceTemplates/InstructionsModal';
import {SortField} from '../../types/invoiceTemplate';
import {settingsTheme} from './styles/theme';

interface InvoiceTemplatesPageRef {
    handleAddTemplate: () => void;
}

const InvoiceTemplatesPage = forwardRef<InvoiceTemplatesPageRef>((props, ref) => {
    const {
        templates,
        filters,
        setFilters,
        isLoading,
        isUploading,
        isActivating,
        isDeleting,
        isGeneratingPreview,
        error,
        setError,
        uploadTemplate,
        activateTemplate,
        deleteTemplate,
        previewTemplate,
        exportTemplate
    } = useInvoiceTemplates();

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);

    useImperativeHandle(ref, () => ({
        handleAddTemplate: () => setShowUploadModal(true)
    }));

    const handleSort = (field: SortField) => {
        if (filters.sortField === field) {
            const newDirection =
                filters.sortDirection === 'asc' ? 'desc' :
                    filters.sortDirection === 'desc' ? null : 'asc';
            setFilters({ ...filters, sortDirection: newDirection });
        } else {
            setFilters({ ...filters, sortField: field, sortDirection: 'asc' });
        }
    };

    const handleUploadTemplate = async (uploadData: any) => {
        await uploadTemplate(uploadData);
        setShowUploadModal(false);
    };

    return (
        <PageContainer>
            <TopSection>
                <InfoSection>
                    <TemplateCount>
                        <CountNumber>{templates.length}</CountNumber>
                        <CountLabel>
                            {templates.length === 1 ? 'szablon' :
                                templates.length <= 4 ? 'szablony' : 'szablonów'}
                        </CountLabel>
                    </TemplateCount>
                    <ActiveInfo>
                        {templates.find(t => t.isActive) ? (
                            <ActiveText>
                                Aktywny: <strong>{templates.find(t => t.isActive)?.name}</strong>
                            </ActiveText>
                        ) : (
                            <InactiveText>Brak aktywnego szablonu</InactiveText>
                        )}
                    </ActiveInfo>
                </InfoSection>

                <ActionButtons>
                    <SecondaryButton onClick={() => setShowInstructionsModal(true)}>
                        <FaInfoCircle />
                        Instrukcje
                    </SecondaryButton>
                    <PrimaryButton onClick={() => setShowUploadModal(true)}>
                        <FaPlus />
                        Dodaj szablon
                    </PrimaryButton>
                </ActionButtons>
            </TopSection>

            {error && (
                <ErrorContainer>
                    <ErrorIcon><FaExclamationTriangle /></ErrorIcon>
                    <ErrorText>{error}</ErrorText>
                    <CloseErrorButton onClick={() => setError(null)}>
                        <FaTimes />
                    </CloseErrorButton>
                </ErrorContainer>
            )}

            <ContentArea>
                {isLoading ? (
                    <LoadingContainer>
                        <LoadingSpinner><FaSpinner /></LoadingSpinner>
                        <LoadingText>Ładowanie szablonów...</LoadingText>
                    </LoadingContainer>
                ) : templates.length === 0 ? (
                    <EmptyStateContainer>
                        <EmptyStateIcon><FaFileInvoice /></EmptyStateIcon>
                        <EmptyStateTitle>Brak szablonów faktur</EmptyStateTitle>
                        <EmptyStateDescription>
                            Dodaj pierwszy szablon faktury, aby rozpocząć automatyczne generowanie profesjonalnych faktur.
                        </EmptyStateDescription>
                        <EmptyStateActions>
                            <PrimaryButton onClick={() => setShowUploadModal(true)}>
                                <FaPlus />
                                Dodaj pierwszy szablon
                            </PrimaryButton>
                            <SecondaryButton onClick={() => setShowInstructionsModal(true)}>
                                <FaInfoCircle />
                                Zobacz instrukcje
                            </SecondaryButton>
                        </EmptyStateActions>
                    </EmptyStateContainer>
                ) : (
                    <TemplatesTable
                        templates={templates}
                        sortField={filters.sortField}
                        sortDirection={filters.sortDirection}
                        isActivating={isActivating}
                        isDeleting={isDeleting}
                        isGeneratingPreview={isGeneratingPreview}
                        onSort={handleSort}
                        onActivate={activateTemplate}
                        onPreview={previewTemplate}
                        onExport={exportTemplate}
                        onDelete={deleteTemplate}
                    />
                )}
            </ContentArea>

            {showUploadModal && (
                <TemplateUploadModal
                    onUpload={handleUploadTemplate}
                    onCancel={() => setShowUploadModal(false)}
                    isLoading={isUploading}
                />
            )}

            {showInstructionsModal && (
                <InstructionsModal
                    onClose={() => setShowInstructionsModal(false)}
                />
            )}
        </PageContainer>
    );
});

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${settingsTheme.spacing.xl};
    padding: 0 ${settingsTheme.spacing.xl} ${settingsTheme.spacing.xl};
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
    min-height: 0;

    @media (max-width: 1024px) {
        padding: 0 ${settingsTheme.spacing.lg} ${settingsTheme.spacing.lg};
        gap: ${settingsTheme.spacing.lg};
    }

    @media (max-width: 768px) {
        padding: 0 ${settingsTheme.spacing.md} ${settingsTheme.spacing.md};
        gap: ${settingsTheme.spacing.md};
    }
`;

const TopSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${settingsTheme.spacing.lg};
    background: ${settingsTheme.surface};
    padding: ${settingsTheme.spacing.lg};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.sm};

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: ${settingsTheme.spacing.md};
    }
`;

const InfoSection = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.lg};

    @media (max-width: 768px) {
        justify-content: space-between;
    }
`;

const TemplateCount = styled.div`
    display: flex;
    align-items: baseline;
    gap: ${settingsTheme.spacing.xs};
`;

const CountNumber = styled.span`
    font-size: 28px;
    font-weight: 700;
    color: ${settingsTheme.primary};
    line-height: 1;
`;

const CountLabel = styled.span`
    font-size: 14px;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
`;

const ActiveInfo = styled.div``;

const ActiveText = styled.span`
    font-size: 14px;
    color: ${settingsTheme.text.secondary};

    strong {
        color: ${settingsTheme.status.success};
        font-weight: 600;
    }
`;

const InactiveText = styled.span`
    font-size: 14px;
    color: ${settingsTheme.status.warning};
    font-weight: 500;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.sm};
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;
        
        > * {
            flex: 1;
        }
    }
`;

const PrimaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    white-space: nowrap;
    min-height: 44px;
    background: linear-gradient(135deg, ${settingsTheme.primary} 0%, ${settingsTheme.primaryLight} 100%);
    color: white;
    box-shadow: ${settingsTheme.shadow.sm};

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${settingsTheme.primaryDark} 0%, ${settingsTheme.primary} 100%);
        box-shadow: ${settingsTheme.shadow.md};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const SecondaryButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.sm};
    padding: ${settingsTheme.spacing.sm} ${settingsTheme.spacing.md};
    border-radius: ${settingsTheme.radius.md};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid ${settingsTheme.border};
    white-space: nowrap;
    min-height: 44px;
    background: ${settingsTheme.surface};
    color: ${settingsTheme.text.secondary};
    box-shadow: ${settingsTheme.shadow.xs};

    &:hover:not(:disabled) {
        background: ${settingsTheme.surfaceHover};
        color: ${settingsTheme.text.primary};
        border-color: ${settingsTheme.borderHover};
        box-shadow: ${settingsTheme.shadow.sm};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const ErrorContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${settingsTheme.spacing.md};
    background: ${settingsTheme.status.errorLight};
    color: ${settingsTheme.status.error};
    padding: ${settingsTheme.spacing.md} ${settingsTheme.spacing.lg};
    border-radius: ${settingsTheme.radius.lg};
    border: 1px solid ${settingsTheme.status.error}30;
`;

const ErrorIcon = styled.div`
    font-size: 18px;
    flex-shrink: 0;
`;

const ErrorText = styled.div`
    flex: 1;
    font-weight: 500;
`;

const CloseErrorButton = styled.button`
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: ${settingsTheme.spacing.xs};
    border-radius: ${settingsTheme.radius.sm};
    transition: all 0.2s ease;

    &:hover {
        background: ${settingsTheme.status.error}20;
    }
`;

const ContentArea = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 400px;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${settingsTheme.spacing.xxl};
    gap: ${settingsTheme.spacing.md};
    min-height: 400px;
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
`;

const LoadingSpinner = styled.div`
    font-size: 24px;
    color: ${settingsTheme.primary};
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: 16px;
    color: ${settingsTheme.text.secondary};
    font-weight: 500;
`;

const EmptyStateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${settingsTheme.spacing.xxl};
    text-align: center;
    min-height: 400px;
    background: ${settingsTheme.surface};
    border-radius: ${settingsTheme.radius.xl};
    border: 1px solid ${settingsTheme.border};
    box-shadow: ${settingsTheme.shadow.sm};
`;

const EmptyStateIcon = styled.div`
    width: 80px;
    height: 80px;
    background: ${settingsTheme.surfaceAlt};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: ${settingsTheme.text.muted};
    margin-bottom: ${settingsTheme.spacing.lg};
    box-shadow: ${settingsTheme.shadow.xs};
`;

const EmptyStateTitle = styled.h3`
    font-size: 24px;
    font-weight: 700;
    color: ${settingsTheme.text.primary};
    margin: 0 0 ${settingsTheme.spacing.sm} 0;
    letter-spacing: -0.025em;
`;

const EmptyStateDescription = styled.p`
    font-size: 16px;
    color: ${settingsTheme.text.secondary};
    margin: 0 0 ${settingsTheme.spacing.lg} 0;
    line-height: 1.5;
    max-width: 500px;
`;

const EmptyStateActions = styled.div`
    display: flex;
    gap: ${settingsTheme.spacing.sm};
    margin-top: ${settingsTheme.spacing.md};

    @media (max-width: 768px) {
        flex-direction: column;
        width: 100%;
        max-width: 300px;
    }
`;

export default InvoiceTemplatesPage;