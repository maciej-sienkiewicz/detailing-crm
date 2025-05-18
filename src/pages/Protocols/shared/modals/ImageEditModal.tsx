import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaPlus, FaTags } from 'react-icons/fa';
import { carReceptionApi } from '../../../../api/carReceptionApi';
import {apiClient} from "../../../../api/apiClient";

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
                                                           initialTags,
                                                           imageUrl
                                                       }) => {
    const [name, setName] = useState(initialName);
    const [tags, setTags] = useState<string[]>(initialTags || []);
    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrlWithAuth, setImageUrlWithAuth] = useState<string>('');

    // Ustaw początkowe wartości przy otwarciu
    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setTags(initialTags || []);
            setNewTag('');
        }
    }, [isOpen, initialName, initialTags]);

    // Pobierz URL obrazu z autoryzacją, jeśli otrzymany URL nie jest tymczasowy (blob: lub data:)
    useEffect(() => {
        if (!isOpen || !imageUrl) return;

        // Sprawdź, czy URL jest już lokalnym blobem, data URL lub jeśli jest to temp_
        if (imageUrl.startsWith('blob:') ||
            imageUrl.startsWith('data:') ||
            imageUrl.includes('temp_')) {
            setImageUrlWithAuth(imageUrl);
            return;
        }

        // Dodajmy logowanie dla debugowania
        console.log('ImageEditModal - Parsing image URL:', imageUrl);
        console.log('Auth token present:', !!apiClient.getAuthToken());

        // Parsuj URL, aby wyodrębnić ID obrazu
        const fetchImage = async () => {
            setLoading(true);
            try {
                // Wyciągnij ID obrazu z URL - zakładamy, że ostatnia część ścieżki to ID
                const urlParts = imageUrl.split('/');
                const imageId = urlParts[urlParts.length - 1].split('?')[0]; // Usuń ewentualne parametry zapytania

                if (imageId) {
                    // Zamiast używać bezpośredniego URL, użyj funkcji fetchVehicleImageAsUrl
                    const authUrl = await carReceptionApi.fetchVehicleImageAsUrl(imageId);
                    setImageUrlWithAuth(authUrl);
                } else {
                    // Jeśli nie można wyodrębnić ID, użyj oryginalnego URL
                    console.warn('Nie można wyodrębnić ID obrazu z URL:', imageUrl);
                    setImageUrlWithAuth(imageUrl);
                }
            } catch (error) {
                console.error('Błąd podczas pobierania obrazu:', error);
                setImageUrlWithAuth(''); // W przypadku błędu ustaw pusty URL
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
    }, [isOpen, imageUrl]);

    // Zwolnij zasoby przy zamknięciu modalu
    useEffect(() => {
        return () => {
            if (imageUrlWithAuth && imageUrlWithAuth.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrlWithAuth);
            }
        };
    }, [imageUrlWithAuth]);

    if (!isOpen) return null;

    const handleAddTag = () => {
        if (newTag.trim() !== '' && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = () => {
        onSave(name.trim(), tags);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTag();
        }
    };

    return (
        <ModalOverlay>
            <ModalContainer>
                <CloseButton onClick={onClose}>
                    <FaTimes />
                </CloseButton>

                <ModalContent>
                    <Title>Edytuj informacje o zdjęciu</Title>

                    <ImagePreviewArea>
                        {loading ? (
                            <LoadingIndicator>Ładowanie...</LoadingIndicator>
                        ) : imageUrlWithAuth ? (
                            <ImagePreview src={imageUrlWithAuth} alt={name || 'Podgląd zdjęcia'} />
                        ) : (
                            <ImagePlaceholder>Nie można załadować obrazu</ImagePlaceholder>
                        )}
                    </ImagePreviewArea>

                    <FormGroup>
                        <Label htmlFor="imageName">Nazwa zdjęcia</Label>
                        <Input
                            id="imageName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Wprowadź nazwę zdjęcia"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>
                            <FaTags /> Tagi
                        </Label>
                        <TagInputContainer>
                            <TagInput
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Dodaj tag i naciśnij Enter"
                            />
                            <AddTagButton onClick={handleAddTag}>
                                <FaPlus />
                            </AddTagButton>
                        </TagInputContainer>

                        <TagsContainer>
                            {tags.length > 0 ? (
                                tags.map((tag, index) => (
                                    <Tag key={index}>
                                        {tag}
                                        <RemoveTagButton onClick={() => handleRemoveTag(tag)}>
                                            <FaTimes />
                                        </RemoveTagButton>
                                    </Tag>
                                ))
                            ) : (
                                <NoTagsMessage>Brak tagów</NoTagsMessage>
                            )}
                        </TagsContainer>
                    </FormGroup>

                    <ButtonContainer>
                        <CancelButton onClick={onClose}>Anuluj</CancelButton>
                        <SaveButton onClick={handleSave}>Zapisz zmiany</SaveButton>
                    </ButtonContainer>
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Style
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContainer = styled.div`
    background-color: #fff;
    border-radius: 8px;
    width: 500px;
    max-width: 90%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: transparent;
    color: #95a5a6;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;

    &:hover {
        color: #34495e;
        background-color: #f0f0f0;
    }
`;

const ModalContent = styled.div`
    padding: 20px;
    overflow-y: auto;
`;

const Title = styled.h3`
    margin: 0 0 20px 0;
    color: #2c3e50;
    font-size: 18px;
`;

const ImagePreviewArea = styled.div`
    margin-bottom: 20px;
    height: 200px;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
`;

const ImagePreview = styled.img`
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
`;

const ImagePlaceholder = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #95a5a6;
    font-size: 14px;
`;

const FormGroup = styled.div`
    margin-bottom: 15px;
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #7f8c8d;
    margin-bottom: 6px;
`;

const Input = styled.input`
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #3498db;
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
    background-color: #3498db;
    color: white;
    border: none;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    padding: 0 10px;
    cursor: pointer;

    &:hover {
        background-color: #2980b9;
    }
`;

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-height: 32px;
`;

const Tag = styled.div`
    display: flex;
    align-items: center;
    background-color: #f0f7ff;
    color: #3498db;
    padding: 4px 8px;
    border-radius: 16px;
    font-size: 12px;
    border: 1px solid #d5e9f9;
    gap: 6px;
`;

const RemoveTagButton = styled.button`
    background: none;
    border: none;
    color: #3498db;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    font-size: 10px;

    &:hover {
        color: #e74c3c;
    }
`;

const NoTagsMessage = styled.div`
    color: #95a5a6;
    font-size: 13px;
    font-style: italic;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
`;

const Button = styled.button`
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CancelButton = styled(Button)`
    background-color: #f0f0f0;
    color: #7f8c8d;
    border: 1px solid #ddd;

    &:hover {
        background-color: #e0e0e0;
    }
`;

const SaveButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: 1px solid #3498db;
    
    &:hover {
        background-color: #2980b9;
        border-color: #2980b9;
    }
`;

const LoadingIndicator = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #3498db;
    font-size: 14px;
`;

export default ImageEditModal;