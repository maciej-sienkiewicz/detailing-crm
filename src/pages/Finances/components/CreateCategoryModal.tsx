// src/pages/Finances/components/CreateCategoryModal.tsx
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaPlus, FaTimes} from 'react-icons/fa';

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

interface CreateCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => Promise<boolean>;
    loading: boolean;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onSubmit,
                                                                            loading
                                                                        }) => {
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setCategoryName('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const trimmedName = categoryName.trim();
        if (!trimmedName) {
            setError('Nazwa kategorii jest wymagana');
            return;
        }

        if (trimmedName.length < 2) {
            setError('Nazwa kategorii musi mieć co najmniej 2 znaki');
            return;
        }

        if (trimmedName.length > 100) {
            setError('Nazwa kategorii może mieć maksymalnie 100 znaków');
            return;
        }

        setError('');

        try {
            const success = await onSubmit(trimmedName);
            if (success) {
                onClose();
            }
        } catch (err) {
            setError('Wystąpił błąd podczas tworzenia kategorii');
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
                {/* Compact Header - consistent with stats modals */}
                <ModalHeader>
                    <HeaderLeft>
                        <HeaderIcon>
                            <FaPlus />
                        </HeaderIcon>
                        <HeaderText>
                            <ModalTitle>Utwórz nową kategorię</ModalTitle>
                            <ModalSubtitle>Dodaj kategorię do grupowania usług</ModalSubtitle>
                        </HeaderText>
                    </HeaderLeft>
                    <CloseButton onClick={onClose} disabled={loading}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label htmlFor="categoryName">
                                Nazwa kategorii <Required>*</Required>
                            </Label>
                            <Input
                                id="categoryName"
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="Wprowadź nazwę kategorii..."
                                disabled={loading}
                                autoFocus
                                maxLength={100}
                            />
                            {error && <ErrorMessage>{error}</ErrorMessage>}
                            <HelperText>
                                Nazwa kategorii będzie użyta do grupowania usług
                            </HelperText>
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
                                disabled={loading || !categoryName.trim()}
                            >
                                {loading ? 'Tworzenie...' : 'Utwórz kategorię'}
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
    z-index: 1050;
    padding: ${theme.spacing.lg};
`;

const ModalContainer = styled.div`
    background: ${theme.surface};
    border-radius: ${theme.radius.lg};
    box-shadow: ${theme.shadow.lg};
    width: 100%;
    max-width: 480px;
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
    background: ${theme.primaryGhost};
    border-radius: ${theme.radius.md};
    color: ${theme.primary};
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
`;

const FormGroup = styled.div`
    margin-bottom: ${theme.spacing.xl};
`;

const Label = styled.label`
    display: block;
    font-weight: 500;
    color: ${theme.text.primary};
    margin-bottom: ${theme.spacing.sm};
    font-size: 14px;
`;

const Required = styled.span`
    color: ${theme.error};
`;

const Input = styled.input`
    width: 100%;
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.border};
    border-radius: ${theme.radius.md};
    font-size: 14px;
    color: ${theme.text.primary};
    background: ${theme.surface};
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px ${theme.primaryGhost};
    }

    &:disabled {
        background: ${theme.surfaceAlt};
        color: ${theme.text.disabled};
        cursor: not-allowed;
    }

    &::placeholder {
        color: ${theme.text.muted};
    }
`;

const ErrorMessage = styled.div`
    color: ${theme.error};
    font-size: 12px;
    margin-top: ${theme.spacing.sm};
`;

const HelperText = styled.div`
    color: ${theme.text.muted};
    font-size: 12px;
    margin-top: ${theme.spacing.sm};
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
    background: ${theme.primary};
    border: none;
    border-radius: ${theme.radius.md};
    color: ${theme.surface};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${theme.primaryLight};
    }

    &:disabled {
        background: ${theme.text.disabled};
        cursor: not-allowed;
    }
`;