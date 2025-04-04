import React from 'react';
import styled from 'styled-components';
import { FaPencilAlt } from 'react-icons/fa';

interface ServiceNoteModalWrapperProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: string) => void;
    serviceName: string;
    initialNote: string;
}

const ServiceNoteModalWrapper: React.FC<ServiceNoteModalWrapperProps> = ({
                                                                             isOpen,
                                                                             onClose,
                                                                             onSave,
                                                                             serviceName,
                                                                             initialNote
                                                                         }) => {
    const [note, setNote] = React.useState(initialNote || '');

    // Reset state when modal opens
    React.useEffect(() => {
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

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Notatka do usługi</ModalTitle>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
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
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={onClose}>Anuluj</CancelButton>
                    <SaveButton onClick={handleSave}>Zapisz</SaveButton>
                </ModalFooter>
            </ModalContent>
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
    z-index: 2000; /* Higher z-index to appear above other modals */
`;

const ModalContent = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 500px;
    max-width: 90%;
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
    font-size: 22px;
    cursor: pointer;
    color: #7f8c8d;
    line-height: 1;
    
    &:hover {
        color: #34495e;
    }
`;

const ModalBody = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
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

export default ServiceNoteModalWrapper;