import React, {useState} from 'react';
import styled from 'styled-components';
import {FaTimes} from 'react-icons/fa';

interface RescheduleProtocolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (dates: { startDate: string; endDate: string }) => void;
    protocolId: string;
}

const RescheduleProtocolModal: React.FC<RescheduleProtocolModalProps> = ({
                                                                             isOpen,
                                                                             onClose,
                                                                             onConfirm,
                                                                             protocolId
                                                                         }) => {
    // Ustawienie domyślnych dat - dzisiaj jako data początkowa
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    // Stan dla dat
    const [startDate, setStartDate] = useState<string>(formattedToday);
    const [startTime, setStartTime] = useState<string>("08:00");
    const [endDate, setEndDate] = useState<string>(formattedToday);
    const [errors, setErrors] = useState<{startDate?: string; endDate?: string}>({});

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Walidacja dat
        const newErrors: {startDate?: string; endDate?: string} = {};

        if (!startDate) {
            newErrors.startDate = "Data początku wizyty jest wymagana";
        }

        if (!endDate) {
            newErrors.endDate = "Data końca wizyty jest wymagana";
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            newErrors.endDate = "Data końcowa nie może być wcześniejsza niż data początkowa";
        }

        // Jeśli są błędy, zaktualizuj stan i przerwij
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Sformatuj daty do formatu ISO
        const startDateTime = `${startDate}T${startTime}:00`;
        const endDateTime = `${endDate}T23:59:59`;

        onConfirm({
            startDate: startDateTime,
            endDate: endDateTime
        });
    };

    return (
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>Ustal nową datę wizyty</ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <Form onSubmit={handleSubmit}>
                    <ModalBody>
                        <InfoMessage>
                            Aby przywrócić anulowaną wizytę, wybierz nową datę:
                        </InfoMessage>

                        <FormGroup>
                            <Label htmlFor="startDate">Data wizyty</Label>
                            <DateTimeContainer>
                                <DateInput
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    min={formattedToday}
                                    hasError={!!errors.startDate}
                                />
                                <TimeInput
                                    id="startTime"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </DateTimeContainer>
                            {errors.startDate && <ErrorText>{errors.startDate}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="endDate">Planowana data zakończenia</Label>
                            <DateInput
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                hasError={!!errors.endDate}
                            />
                            {errors.endDate && <ErrorText>{errors.endDate}</ErrorText>}
                            <HelpText>Wizyta zostanie ustawiona jako trwająca do końca wybranego dnia.</HelpText>
                        </FormGroup>
                    </ModalBody>

                    <ModalFooter>
                        <CancelButton type="button" onClick={onClose}>
                            Anuluj
                        </CancelButton>
                        <ConfirmButton type="submit">
                            Zaplanuj wizytę
                        </ConfirmButton>
                    </ModalFooter>
                </Form>
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
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 450px;
    max-width: 90%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
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
    font-size: 18px;
    color: #7f8c8d;
    cursor: pointer;

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

const InfoMessage = styled.div`
    font-size: 14px;
    color: #34495e;
    margin-bottom: 10px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    color: #34495e;
`;

const DateTimeContainer = styled.div`
    display: flex;
    gap: 10px;
`;

const DateInput = styled.input<{ hasError?: boolean }>`
    flex: 1;
    padding: 10px;
    border: 1px solid ${props => props.hasError ? '#e74c3c' : '#ddd'};
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: ${props => props.hasError ? '#e74c3c' : '#3498db'};
        box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.2)'};
    }
`;

const TimeInput = styled.input`
    width: 120px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const ErrorText = styled.div`
    color: #e74c3c;
    font-size: 12px;
`;

const HelpText = styled.div`
    color: #7f8c8d;
    font-size: 12px;
    margin-top: 4px;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
`;

const Button = styled.button`
    padding: 10px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
`;

const CancelButton = styled(Button)`
    background-color: #f8f9fa;
    color: #7f8c8d;
    border: 1px solid #ddd;
    
    &:hover {
        background-color: #f1f1f1;
    }
`;

const ConfirmButton = styled(Button)`
    background-color: #3498db;
    color: white;
    border: none;
    
    &:hover {
        background-color: #2980b9;
    }
`;

export default RescheduleProtocolModal;