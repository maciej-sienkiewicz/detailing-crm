// src/components/fleet/mobile/MobileRentalReturn.tsx

import React, {useRef, useState} from 'react';
import styled from 'styled-components';
import {FleetRental, FleetRentalStatus} from '../../../types/fleetRental';
import {FleetVehicle} from '../../../types/fleet';
import FuelLevelIndicator from '../common/FuelLevelIndicator';
import {useToast} from '../../../components/common/Toast/Toast';
import {fleetRentalApi} from '../../../api/fleetRentalApi';
import {format} from 'date-fns';
import {pl} from 'date-fns/locale';
import {
    FaCalendarAlt,
    FaCamera,
    FaCar,
    FaExclamationTriangle,
    FaGasPump,
    FaTachometerAlt,
    FaUser
} from 'react-icons/fa';

interface MobileRentalReturnProps {
    rental: FleetRental;
    vehicle: FleetVehicle;
    clientName?: string;
    onSuccess: () => void;
}

const MobileRentalReturn: React.FC<MobileRentalReturnProps> = ({
                                                                   rental,
                                                                   vehicle,
                                                                   clientName = "Nieznany klient",
                                                                   onSuccess
                                                               }) => {
    const { showToast } = useToast();
    const [endMileage, setEndMileage] = useState<number>(rental.endMileage || vehicle.currentMileage);
    const [fuelLevelEnd, setFuelLevelEnd] = useState<number>(rental.fuelLevelEnd || rental.fuelLevelStart);
    const [damageReported, setDamageReported] = useState<boolean>(rental.damageReported || false);
    const [damageDescription, setDamageDescription] = useState<string>(rental.damageDescription || '');
    const [endConditionNotes, setEndConditionNotes] = useState<string>(rental.endConditionNotes || '');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndMileage(parseInt(e.target.value) || 0);
    };

    const handleFuelLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFuelLevelEnd(parseInt(e.target.value) / 100);
    };

    const handleDamageToggle = () => {
        setDamageReported(!damageReported);
        if (!damageReported) {
            setDamageDescription('');
        }
    };

    const handleDamageDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDamageDescription(e.target.value);
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEndConditionNotes(e.target.value);
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

            // Generowanie URL-i podglądu
            const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));

        // Zwolnienie URL-a podglądu
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = (): boolean => {
        if (endMileage < rental.startMileage) {
            showToast('error', 'Przebieg końcowy nie może być mniejszy niż początkowy', 3000);
            return false;
        }

        if (damageReported && !damageDescription.trim()) {
            showToast('error', 'Podaj opis uszkodzeń', 3000);
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            // Zakończenie wypożyczenia
            await fleetRentalApi.completeRental(rental.id, {
                endMileage,
                fuelLevelEnd,
                actualEndDate: new Date().toISOString().split('T')[0],
                endConditionNotes,
                damageReported,
                damageDescription: damageReported ? damageDescription : undefined
            });

            // Aktualizacja przebiegu pojazdu
            // Tutaj można by dodać również aktualizację przebiegu pojazdu, ale to zależy od logiki biznesowej

            // Dodawanie zdjęć
            for (const image of images) {
                await fleetRentalApi.uploadRentalImage(
                    rental.id,
                    image,
                    damageReported ? 'Zdjęcie usterki' : 'Stan pojazdu przy zwrocie'
                );
            }

            showToast('success', 'Wypożyczenie zostało zakończone!', 3000);
            onSuccess();
        } catch (error) {
            console.error('Error completing rental:', error);
            showToast('error', 'Wystąpił błąd podczas zamykania wypożyczenia', 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: pl });
    };

    if (rental.status === FleetRentalStatus.COMPLETED) {
        return (
            <Container>
                <InfoAlert>
                    <FaExclamationTriangle />
                    <div>To wypożyczenie zostało już zakończone {rental.actualEndDate && formatDate(rental.actualEndDate)}</div>
                </InfoAlert>
            </Container>
        );
    }

    return (
        <Container>
            <RentalHeader>
                <VehicleInfo>
                    <IconLabel>
                        <FaCar />
                        <div>{vehicle.make} {vehicle.model} ({vehicle.licensePlate})</div>
                    </IconLabel>

                    {rental.clientId && (
                        <IconLabel>
                            <FaUser />
                            <div>{clientName}</div>
                        </IconLabel>
                    )}

                    <IconLabel>
                        <FaCalendarAlt />
                        <div>Od {formatDate(rental.startDate)}</div>
                    </IconLabel>
                </VehicleInfo>
            </RentalHeader>

            <FormSection>
                <FormGroup>
                    <Label>
                        <MileageIcon>
                            <FaTachometerAlt />
                        </MileageIcon>
                        Przebieg końcowy (km)
                    </Label>
                    <InputLarge
                        type="number"
                        value={endMileage}
                        onChange={handleMileageChange}
                        min={rental.startMileage}
                    />
                    <HelpText>Przebieg początkowy: {rental.startMileage} km</HelpText>
                </FormGroup>

                <FormGroup>
                    <Label>
                        <MileageIcon>
                            <FaGasPump />
                        </MileageIcon>
                        Poziom paliwa
                    </Label>
                    <FuelSliderContainer>
                        <FuelSlider
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={fuelLevelEnd * 100}
                            onChange={handleFuelLevelChange}
                        />
                        <FuelLevelIndicator level={fuelLevelEnd} size="large" />
                    </FuelSliderContainer>
                    <HelpText>Poziom początkowy: {Math.round(rental.fuelLevelStart * 100)}%</HelpText>
                </FormGroup>

                <FormGroup>
                    <Label>Uwagi o stanie pojazdu</Label>
                    <TextArea
                        value={endConditionNotes}
                        onChange={handleNotesChange}
                        placeholder="Dodatkowe uwagi o stanie pojazdu..."
                        rows={2}
                    />
                </FormGroup>

                <FormGroup>
                    <ReportIssueButton onClick={handleDamageToggle} active={damageReported}>
                        <FaExclamationTriangle />
                        {damageReported ? 'Anuluj zgłoszenie uszkodzeń' : 'Zgłoś uszkodzenia'}
                    </ReportIssueButton>
                </FormGroup>

                {damageReported && (
                    <FormGroup>
                        <Label>Opis uszkodzeń</Label>
                        <TextArea
                            value={damageDescription}
                            onChange={handleDamageDescriptionChange}
                            placeholder="Opisz uszkodzenia..."
                            rows={3}
                            required={damageReported}
                        />
                    </FormGroup>
                )}

                <FormGroup>
                    <Label>
                        <MileageIcon>
                            <FaCamera />
                        </MileageIcon>
                        Zdjęcia
                    </Label>
                    <PhotosContainer>
                        {previewUrls.map((url, index) => (
                            <PhotoPreview key={index}>
                                <Photo src={url} alt="Podgląd zdjęcia" />
                                <RemovePhotoButton onClick={() => removeImage(index)}>×</RemovePhotoButton>
                            </PhotoPreview>
                        ))}
                        <AddPhotoButton onClick={triggerFileInput}>
                            <FaCamera />
                            <span>Dodaj zdjęcie</span>
                        </AddPhotoButton>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            multiple
                        />
                    </PhotosContainer>
                </FormGroup>
            </FormSection>

            <ButtonGroup>
                <CompletionNote>
                    Po zatwierdzeniu wypożyczenie zostanie zakończone, a pojazd oznaczony jako dostępny
                </CompletionNote>
                <SubmitButton
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Zapisywanie...' : 'Zakończ wypożyczenie'}
                </SubmitButton>
            </ButtonGroup>
        </Container>
    );
};

const Container = styled.div`
    padding: 16px;
    max-width: 500px;
    margin: 0 auto;
`;

const RentalHeader = styled.div`
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
`;

const VehicleInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const IconLabel = styled.div`
    display: flex;
    align-items: center;
    font-size: 16px;
    color: #2c3e50;
    
    svg {
        margin-right: 8px;
        color: #3498db;
        min-width: 16px;
    }
`;

const InfoAlert = styled.div`
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    color: #7f8c8d;
    
    svg {
        color: #f39c12;
        font-size: 20px;
        margin-right: 12px;
    }
`;

const FormSection = styled.div`
    margin-bottom: 24px;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    font-size: 16px;
    margin-bottom: 8px;
    color: #34495e;
`;

const MileageIcon = styled.span`
    margin-right: 8px;
    color: #3498db;
`;

const InputLarge = styled.input`
    width: 100%;
    padding: 15px;
    font-size: 20px;
    border: 2px solid #ddd;
    border-radius: 8px;
    text-align: center;
    
    &:focus {
        border-color: #3498db;
        outline: none;
    }
`;

const HelpText = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 8px;
    text-align: center;
`;

const FuelSliderContainer = styled.div`
    margin-top: 16px;
`;

const FuelSlider = styled.input`
    width: 100%;
    -webkit-appearance: none;
    height: 10px;
    border-radius: 5px;
    background: #ddd;
    outline: none;
    margin-bottom: 16px;
    
    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #3498db;
        cursor: pointer;
    }
    
    &::-moz-range-thumb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #3498db;
        cursor: pointer;
        border: none;
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    resize: vertical;
    
    &:focus {
        border-color: #3498db;
        outline: none;
    }
`;

const ReportIssueButton = styled.button<{ active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border-radius: 8px;
    border: none;
    background-color: ${props => props.active ? '#e74c3c' : '#f39c12'};
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
    
    svg {
        margin-right: 8px;
    }
    
    &:hover {
        background-color: ${props => props.active ? '#c0392b' : '#e67e22'};
    }
`;

const PhotosContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
`;

const PhotoPreview = styled.div`
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
`;

const Photo = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const RemovePhotoButton = styled.button`
    position: absolute;
    top: 5px;
    right: 5px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(231, 76, 60, 0.8);
    color: white;
    border: none;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        background-color: rgba(192, 57, 43, 0.9);
    }
`;

const AddPhotoButton = styled.button`
    width: 100px;
    height: 100px;
    border-radius: 8px;
    border: 2px dashed #ddd;
    background-color: #f9f9f9;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #7f8c8d;
    
    svg {
        font-size: 24px;
        margin-bottom: 4px;
    }
    
    span {
        font-size: 12px;
    }
    
    &:hover {
        border-color: #3498db;
        color: #3498db;
    }
`;

const ButtonGroup = styled.div`
    margin-top: 24px;
`;

const CompletionNote = styled.div`
    text-align: center;
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 16px;
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 16px;
    font-size: 18px;
    font-weight: 500;
    border-radius: 8px;
    border: none;
    background-color: #3498db;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover:not(:disabled) {
        background-color: #2980b9;
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export default MobileRentalReturn;