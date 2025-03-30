import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCheck } from 'react-icons/fa';

interface ImageNameEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    initialName: string;
    imageUrl: string;
}

const ImageNameEditModal: React.FC<ImageNameEditModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onSave,
                                                                   initialName,
                                                                   imageUrl
                                                               }) => {
    const [name, setName] = useState(initialName);

    useEffect(() => {
        setName(initialName);
    }, [initialName, isOpen]);

    const handleSave = () => {
        onSave(name);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Edytuj nazwę zdjęcia</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <ImagePreview src={imageUrl} alt="Podgląd" />

                    <InputGroup>
                        <Label htmlFor="image-name">Nazwa zdjęcia:</Label>
                        <Input
                            id="image-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Wprowadź nazwę zdjęcia..."
                            autoFocus
                        />
                    </InputGroup>
                </ModalBody>

                <ModalFooter>
                    <CancelButton onClick={onClose}>
                        <FaTimes /> Anuluj
                    </CancelButton>
                    <SaveButton onClick={handleSave}>
                        <FaCheck /> Zapisz
                    </SaveButton>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

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
  z-index: 1100;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1101;
  display: flex;
  flex-direction: column;
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
  color: #34495e;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #34495e;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const ImagePreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  margin-bottom: 15px;
  border-radius: 4px;
  background-color: #f5f5f5;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #34495e;
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
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  gap: 10px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: #7f8c8d;
  border: 1px solid #ddd;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const SaveButton = styled(Button)`
  background-color: #3498db;
  color: white;
  border: none;

  &:hover {
    background-color: #2980b9;
  }
`;

export default ImageNameEditModal;