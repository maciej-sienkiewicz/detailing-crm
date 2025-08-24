// src/pages/Finances/components/AssignToCategoryModal.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaFolderPlus, FaCheck, FaFolder } from 'react-icons/fa';
import { Category } from '../../../api/statsApi';

// Unified theme
const theme = {
    primary: '#1a365d',
    primaryLight: '#2c5aa0',
    primaryGhost: 'rgba(26, 54, 93, 0.04)',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    border: '#e2e8f0',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8',
        disabled: '#cbd5e1'
    },
    success: '#059669',
    error: '#dc2626',
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px'
    },
    radius: {
        sm: '6px',
        md: '8px',
        lg: '12px'
    },
    shadow: {
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }
};

interface AssignToCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (categoryId: number) => Promise<boolean>;
    categories: Category[];
    selectedServicesCount: number;
    loading: boolean;
}

export const AssignToCategoryModal: React.FC<AssignToCategoryModalProps> = ({
                                                                                isOpen,
                                                                                onClose,
                                                                                onSubmit,
                                                                                categories,
                                                                                selectedServicesCount,
                                                                                loading
                                                                            }) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [error, setError] = useState('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSelectedCategoryId(null);
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCategoryId) {
            setError('Wybierz kategorię do przypisania');
            return;
        }

        setError('');

        try {
            const success = await onSubmit(selectedCategoryId);
            if (success) {
                onClose();
            }
        } catch (err) {
            setError('Wystąpił błąd podczas przypisywania do kategorii');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
                {/* Compact Header - consistent with other modals */}
                <ModalHeader>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaFolderPlus />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Przypisz do kategorii</ModalTitle>
                            <ModalSubtitle>
                                Wybrane usługi: {selectedServicesCount}
                            </ModalSubtitle>
                        </HeaderText>
                    </HeaderLeft>
                    <CloseButton onClick={onClose} disabled={loading}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label>
                                Wybierz kategorię <Required>*</Required>
                            </Label>

                            {categories.length === 0 ? (
                                <EmptyState>
                                    <EmptyStateIcon>
                                        <FaFolder />
                                    </EmptyStateIcon>
                                    <EmptyStateText>
                                        Brak dostępnych kategorii
                                    </EmptyStateText>
                                    <EmptyStateSubtext>
                                        Najpierw utwórz kategorię, aby móc przypisać do niej usługi
                                    </EmptyStateSubtext>
                                </EmptyState>
                            ) : (
                                <CategoriesList>
                                    {categories.map((category) => (
                                        <CategoryOption
                                            key={category.id}
                                            $selected={selectedCategoryId === category.id}
                                            onClick={() => setSelectedCategoryId(category.id)}
                                        >
                                            <CategoryOptionContent>
                                                <CategoryIcon>
                                                    <FaFolder />
                                                </CategoryIcon>
                                                <CategoryInfo>
                                                    <CategoryName>{category.name}</CategoryName>
                                                    <CategoryMeta>
                                                        {category.servicesCount} usług
                                                    </CategoryMeta>
                                                </CategoryInfo>
                                                {selectedCategoryId === category.id && (
                                                    <CheckIcon>
                                                        <FaCheck />
                                                    </CheckIcon>
                                                )}
                                            </CategoryOptionContent>
                                        </CategoryOption>
                                    ))}
                                </CategoriesList>
                            )}

                            {error && <ErrorMessage>{error}</ErrorMessage>}
                        </FormGroup>

                        <ModalFooter>
                            <CancelButton
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Anuluj
                            </CancelButton>
                            <SubmitButton
                                type="submit"
                                disabled={loading || !selectedCategoryId || categories.length === 0}
                            >
                                {loading ? 'Przypisywanie...' : 'Przypisz do kategorii'}
                            </SubmitButton>
                        </ModalFooter>
                    </form>
                </ModalBody>
            </ModalContainer>
        </Overlay>
    );
};

// Styled Components
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1060;
    padding: ${theme.spacing.lg};
`;

const ModalContainer = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    box-shadow: ${theme.shadow.lg};
    width: 100%;
    max-width: 540px;
    max-height: 90vh;
    overflow: hidden;
    animation: modalIn 0.2s ease-out;

    @keyframes modalIn {
        from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    border-bottom: 1px solid ${theme.border};
    background: ${theme.surface};
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const HeaderIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: ${theme.success}20;
    border-radius: ${theme.radius.md};
    color: ${theme.success};
    font-size: 16px;
`;

const HeaderText = styled.div``;

const ModalTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: ${theme.text.primary};
    margin: 0 0 4px 0;
`;

const ModalSubtitle = styled.div`
    font-size: 14px;
    color: ${theme.text.secondary};
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    color: ${theme.text.muted};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: #fee2e2;
        color: #dc2626;
        border-color: #dc2626;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ModalBody = styled.div`
    padding: ${theme.spacing.xl};
    max-height: 60vh;
    overflow-y: auto;
`;

const FormGroup = styled.div`
    margin-bottom: ${theme.spacing.xl};
`;

const Label = styled.label`
    display: block;
    font-weight: 500;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.lg};
    font-size: 14px;
`;

const Required = styled.span`
    color: ${theme.error};
`;

const CategoriesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    max-height: 300px;
    overflow-y: auto;
`;

const CategoryOption = styled.div<{ $selected: boolean }>`
    padding: ${theme.spacing.lg};
    border: 1px solid ${props => props.$selected ? theme.success : theme.border};
    border-radius: ${theme.radius.md};
    background: ${props => props.$selected ? theme.success + '10' : theme.surface};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${props => props.$selected ? theme.success : theme.primary};
        background: ${props => props.$selected ? theme.success + '15' : theme.primaryGhost};
    }
`;

const CategoryOptionContent = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
`;

const CategoryIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${theme.primaryGhost};
    border-radius: ${theme.radius.md};
    color: ${theme.primary};
    font-size: 16px;
`;

const CategoryInfo = styled.div`
    flex: 1;
`;

const CategoryName = styled.div`
    font-weight: 600;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.xs};
    font-size: 15px;
`;

const CategoryMeta = styled.div`
    font-size: 13px;
    color: ${theme.text.muted};
`;

const CheckIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: ${theme.success};
    color: ${theme.surface};
    border-radius: 50%;
    font-size: 12px;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: ${theme.spacing.xl};
    border: 2px dashed ${theme.border};
    border-radius: ${theme.radius.md};
    background: ${theme.surfaceAlt};
`;

const EmptyStateIcon = styled.div`
    font-size: 28px;
    color: ${theme.text.muted};
    margin-bottom: ${theme.spacing.md};
`;

const EmptyStateText = styled.div`
    font-size: 16px;
    color: ${theme.text.secondary};
    margin-bottom: ${theme.spacing.sm};
    font-weight: 500;
`;

const EmptyStateSubtext = styled.div`
    font-size: 14px;
    color: ${theme.text.muted};
    line-height: 1.4;
`;

const ErrorMessage = styled.div`
    color: ${theme.error};
    font-size: 12px;
    margin-top: ${theme.spacing.md};
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing.md};
    margin-top: ${theme.spacing.xl};
`;

const CancelButton = styled.button`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: transparent;
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    color: ${theme.text.secondary};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.surfaceAlt};
        color: ${theme.text.primary};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const SubmitButton = styled.button`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.success};
    border: none;
    border-radius: ${theme.radius.md};
    color: ${theme.surface};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.success};
        filter: brightness(1.1);
    }

    &:disabled {
        background: ${theme.text.disabled};
        cursor: not-allowed;
    }
`;