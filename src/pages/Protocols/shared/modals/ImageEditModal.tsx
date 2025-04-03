import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTimes, FaCheck, FaPlus, FaTag } from 'react-icons/fa';

interface ImageEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, tags: string[]) => void;
    initialName: string;
    initialTags: string[];
    imageUrl: string;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({
                                                           isOpen,
                                                           onClose,
                                                           onSave,
                                                           initialName = '',
                                                           initialTags = [],
                                                           imageUrl
                                                       }) => {
    const [name, setName] = useState(initialName);
    const [tags, setTags] = useState<string[]>(initialTags || []);
    const [newTag, setNewTag] = useState('');

    // Update state when initialName/initialTags change
    useEffect(() => {
        setName(initialName);
        setTags(initialTags || []);
    }, [initialName, initialTags]);

    if (!isOpen) return null;

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleSave = () => {
        onSave(name, tags);
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle><FaEdit /> Edytuj informacje o zdjęciu</ModalTitle>
                    <CloseButton onClick={onClose}><FaTimes /></CloseButton>
                </ModalHeader>
                <ModalBody>
                    <ImagePreview src={imageUrl} alt="Podgląd zdjęcia" />

                    <FormGroup>
                        <Label>Nazwa zdjęcia</Label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nazwij to zdjęcie"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Tagi</Label>
                        <TagInput>
                            <Input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Dodaj tagi (np. przód, lewy bok)"
                            />
                            <AddTagButton onClick={handleAddTag} disabled={!newTag.trim()}>
                                <FaPlus />
                            </AddTagButton>
                        </TagInput>

                        <TagsContainer>
                            {tags.length === 0 && (
                                <EmptyTagsMessage>Brak tagów. Dodaj tagi, aby łatwiej wyszukiwać i kategoryzować zdjęcia.</EmptyTagsMessage>
                            )}

                            {tags.map((tag, index) => (
                                <TagBadge key={index}>
                                    <TagIcon><FaTag /></TagIcon>
                                    <TagText>{tag}</TagText>
                                    <RemoveTagButton onClick={() => handleRemoveTag(tag)}>
                                        <FaTimes />
                                    </RemoveTagButton>
                                </TagBadge>
                            ))}
                        </TagsContainer>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={onClose}>
                        <FaTimes /> Anuluj
                    </CancelButton>
                    <SaveButton onClick={handleSave}>
                        <FaCheck /> Zapisz zmiany
                    </SaveButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Styled components
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 500px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    z-index: 1001;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    color: #3498db;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #7f8c8d;
    
    &:hover {
        color: #34495e;
    }
`;

const ModalBody = styled.div`
    padding: 20px;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
`;

const ImagePreview = styled.img`
    width: 100%;
    height: 200px;
    object-fit: contain;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #eee;
    background-color: #f8f9fa;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const Label = styled.label`
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #34495e;
    font-size: 14px;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }
`;

const TagInput = styled.div`
    display: flex;
    gap: 5px;
    margin-bottom: 10px;
`;

const AddTagButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    width: 36px;
    cursor: pointer;
    
    &:hover:not(:disabled) {
        background-color: #2980b9;
    }
    
    &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }
`;

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
`;

const EmptyTagsMessage = styled.div`
    color: #7f8c8d;
    font-size: 13px;
    font-style: italic;
    padding: 10px 0;
`;

const TagBadge = styled.div`
    display: flex;
    align-items: center;
    background-color: #f0f7ff;
    border: 1px solid #d5e9f9;
    color: #3498db;
    border-radius: 16px;
    padding: 5px 10px;
    font-size: 13px;
`;

const TagIcon = styled.span`
    margin-right: 5px;
    font-size: 11px;
    color: #3498db;
`;

const TagText = styled.span`
    margin-right: 5px;
`;

const RemoveTagButton = styled.button`
    background: none;
    border: none;
    color: #3498db;
    font-size: 12px;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    opacity: 0.7;
    
    &:hover {
        opacity: 1;
    }
`;

const CancelButton = styled.button`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 16px;
    background-color: white;
    color: #7f8c8d;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    
    &:hover {
        background-color: #f5f5f5;
    }
`;

const SaveButton = styled.button`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    
    &:hover {
        background-color: #2980b9;
    }
`;

export default ImageEditModal;