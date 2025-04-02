import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCheck, FaTags, FaPlus, FaTag } from 'react-icons/fa';
import { fetchSuggestedTags } from '../../../../api/mocks/suggestedTagsMocks';

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
                                                           initialName,
                                                           initialTags = [],
                                                           imageUrl
                                                       }) => {
    const [name, setName] = useState(initialName);
    const [tags, setTags] = useState<string[]>(initialTags);
    const [newTag, setNewTag] = useState('');
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    // Pobieranie sugerowanych tagów przy otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setTags(initialTags || []);
            setNewTag('');
            setShowSuggestions(false);

            // Pobierz sugerowane tagi z mocka
            setLoadingSuggestions(true);
            fetchSuggestedTags()
                .then(suggestedTags => {
                    setSuggestedTags(suggestedTags);
                    setLoadingSuggestions(false);
                })
                .catch(() => {
                    setSuggestedTags([]);
                    setLoadingSuggestions(false);
                });
        }
    }, [initialName, initialTags, isOpen]);

    // Filtrowanie sugerowanych tagów na podstawie wpisanego tekstu
    useEffect(() => {
        if (newTag.trim() === '') {
            setFilteredSuggestions(suggestedTags);
        } else {
            const filtered = suggestedTags.filter(tag =>
                tag.toLowerCase().includes(newTag.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        }
    }, [newTag, suggestedTags]);

    const handleSave = () => {
        onSave(name.trim(), tags);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() !== '' && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
            setShowSuggestions(false);
        }
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSelectSuggestedTag = (tag: string) => {
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
        }
        setNewTag('');
        setShowSuggestions(false);
    };

    const handleTagInputFocus = () => {
        setShowSuggestions(true);
    };

    // Zamknięcie okna podpowiedzi po kliknięciu poza nim
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (showSuggestions && !(e.target as Element).closest('.suggestions-area')) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSuggestions]);

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Edytuj informacje o zdjęciu</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <ImageContainer>
                        <ImagePreview src={imageUrl} alt="Podgląd" />
                    </ImageContainer>

                    <FormGroup>
                        <Label htmlFor="image-name">Nazwa zdjęcia</Label>
                        <Input
                            id="image-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Wprowadź nazwę zdjęcia..."
                            autoFocus
                        />
                    </FormGroup>

                    <FormGroup className="suggestions-area">
                        <Label>
                            <TagIcon><FaTags /></TagIcon> Tagi
                        </Label>
                        <TagInputContainer>
                            <TagInput
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={handleTagInputKeyDown}
                                onFocus={handleTagInputFocus}
                                placeholder="Wpisz tag lub wybierz z sugerowanych..."
                            />
                            <AddTagButton
                                type="button"
                                onClick={handleAddTag}
                                disabled={newTag.trim() === ''}
                            >
                                Dodaj
                            </AddTagButton>
                        </TagInputContainer>

                        {/* Panel z sugerowanymi tagami */}
                        {showSuggestions && (
                            <SuggestionsContainer>
                                {loadingSuggestions ? (
                                    <LoadingMessage>
                                        <LoadingSpinner />
                                        <span>Ładowanie sugestii...</span>
                                    </LoadingMessage>
                                ) : filteredSuggestions.length > 0 ? (
                                    <>
                                        <SuggestionHeader>
                                            Sugerowane tagi
                                        </SuggestionHeader>
                                        <SuggestionsList>
                                            {filteredSuggestions.map(tag => (
                                                <SuggestedTag
                                                    key={tag}
                                                    onClick={() => handleSelectSuggestedTag(tag)}
                                                    isSelected={tags.includes(tag)}
                                                >
                                                    {tag}
                                                </SuggestedTag>
                                            ))}
                                        </SuggestionsList>
                                    </>
                                ) : (
                                    <NoSuggestionsMessage>
                                        Brak pasujących sugestii
                                    </NoSuggestionsMessage>
                                )}
                            </SuggestionsContainer>
                        )}

                        <SelectedTagsLabel>
                            {tags.length > 0 ? 'Wybrane tagi' : 'Brak wybranych tagów'}
                        </SelectedTagsLabel>
                        {tags.length > 0 ? (
                            <SelectedTagsList>
                                {tags.map(tag => (
                                    <SelectedTag key={tag}>
                                        <TagText>{tag}</TagText>
                                        <RemoveTagButton onClick={() => handleRemoveTag(tag)}>
                                            <FaTimes />
                                        </RemoveTagButton>
                                    </SelectedTag>
                                ))}
                            </SelectedTagsList>
                        ) : (
                            <NoTagsMessage>
                                Dodaj tagi, aby ułatwić późniejsze filtrowanie zdjęć w galerii.
                            </NoTagsMessage>
                        )}
                    </FormGroup>
                </ModalBody>

                <ModalFooter>
                    <CancelButton onClick={onClose}>
                        Anuluj
                    </CancelButton>
                    <SaveButton onClick={handleSave}>
                        <FaCheck /> Zapisz
                    </SaveButton>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

// Animacja dla spinnera
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
`;

const ModalContent = styled.div`
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    width: 520px;
    max-width: 92%;
    max-height: 90vh;
    overflow-y: auto;
    z-index: 1101;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 24px;
    border-bottom: 1px solid #f0f0f0;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: #1a1a1a;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: #666;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
        background-color: #f5f5f5;
        color: #1a1a1a;
    }
`;

const ModalBody = styled.div`
    padding: 20px 24px;
`;

const ImageContainer = styled.div`
    background-color: #f9f9f9;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ImagePreview = styled.img`
    max-width: 100%;
    max-height: 220px;
    object-fit: contain;
`;

const FormGroup = styled.div`
    margin-bottom: 24px;
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
`;

const TagIcon = styled.span`
    display: inline-flex;
    margin-right: 6px;
    color: #555;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 1px rgba(52, 152, 219, 0.2);
    }
`;

const TagInputContainer = styled.div`
    display: flex;
    margin-bottom: 10px;
`;

const TagInput = styled(Input)`
    flex: 1;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
`;

const AddTagButton = styled.button`
    padding: 0 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 0 8px 8px 0;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background-color: #2980b9;
    }

    &:disabled {
        background-color: #a0c9e7;
        cursor: not-allowed;
    }
`;

const SuggestionsContainer = styled.div`
    background-color: white;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    max-height: 200px;
    transition: all 0.3s;
    margin-bottom: 16px;
`;

const SuggestionHeader = styled.div`
    padding: 10px 14px;
    font-size: 13px;
    color: #666;
    background-color: #f8f9fa;
    border-bottom: 1px solid #eaeaea;
`;

const SuggestionsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    padding: 12px;
    gap: 8px;
    max-height: 150px;
    overflow-y: auto;
`;

const SuggestedTag = styled.div<{ isSelected: boolean }>`
    background-color: ${props => props.isSelected ? '#e1f0fa' : '#f5f9fc'};
    color: ${props => props.isSelected ? '#2980b9' : '#3f3f3f'};
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 13px;
    border: 1px solid ${props => props.isSelected ? '#a0c9e7' : '#e6e6e6'};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: #e1f0fa;
        border-color: #a0c9e7;
    }
`;

const NoSuggestionsMessage = styled.div`
    padding: 14px;
    text-align: center;
    color: #888;
    font-size: 13px;
`;

const LoadingMessage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px;
    color: #888;
    font-size: 13px;
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid #eaeaea;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const SelectedTagsLabel = styled.div`
    font-size: 14px;
    color: #555;
    margin-bottom: 10px;
    font-weight: 500;
`;

const SelectedTagsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
`;

const SelectedTag = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #e1f0fa;
    color: #2980b9;
    padding: 6px 10px;
    padding-right: 6px;
    border-radius: 16px;
    font-size: 13px;
    transition: all 0.2s;
`;

const TagText = styled.span`
    padding-left: 4px;
`;

const RemoveTagButton = styled.button`
    background: none;
    border: none;
    padding: 0;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #2980b9;
    border-radius: 50%;
    cursor: pointer;

    &:hover {
        background-color: rgba(41, 128, 185, 0.1);
    }
`;

const NoTagsMessage = styled.div`
    color: #888;
    font-size: 13px;
    padding: 14px;
    background-color: #f9f9f9;
    border-radius: 8px;
    text-align: center;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
    gap: 12px;
`;

const Button = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const CancelButton = styled(Button)`
  background-color: #f5f5f5;
  color: #555;
  border: none;

  &:hover {
    background-color: #eaeaea;
    color: #333;
  }
`;

const SaveButton = styled(Button)`
  background-color: #3498db;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background-color: #2980b9;
  }
`;

export default ImageEditModal;