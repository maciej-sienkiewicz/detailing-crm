import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../../../../components/common/Modal';
import { FaPencilAlt } from 'react-icons/fa';

interface ServiceNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: string) => void;
    serviceName: string;
    initialNote: string;
}

const ServiceNoteModal: React.FC<ServiceNoteModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSave,
                                                               serviceName,
                                                               initialNote
                                                           }) => {
    const [note, setNote] = useState(initialNote || '');

    // Reset stanu przy otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            setNote(initialNote || '');
        }
    }, [isOpen, initialNote]);

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNote(e.target.value);
    };

    const handleSave = () => {
        onSave(note);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
    onClose={onClose}
    title="Notatka do usługi"
        >
        <ModalContent>
            <ServiceInfo>
                <InfoLabel>Usługa:</InfoLabel>
    <InfoValue>{serviceName}</InfoValue>
    </ServiceInfo>

    <FormGroup>
    <Label htmlFor="note">
        <NoteIcon>
            <FaPencilAlt />
        </NoteIcon>
    Notatka
    </Label>
    <NoteTextarea
    id="note"
    value={note}
    onChange={handleNoteChange}
    placeholder="Wprowadź dodatkowe informacje o usłudze..."
    rows={5}
    autoFocus
    />
    </FormGroup>

    <InfoText>
    Ta informacja nie będzie widoczna dla klienta.
    </InfoText>

    <ButtonGroup>
    <CancelButton onClick={onClose}>Anuluj</CancelButton>
        <SaveButton onClick={handleSave}>Zapisz</SaveButton>
        </ButtonGroup>
        </ModalContent>
        </Modal>
);
};

// Styled components
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ServiceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 5px;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
`;

const InfoValue = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #34495e;
  word-break: break-word;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NoteIcon = styled.span`
  color: #3498db;
  font-size: 14px;
`;

const NoteTextarea = styled.textarea`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const InfoText = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #95a5a6;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  background-color: white;
  color: #333;
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

export default ServiceNoteModal;