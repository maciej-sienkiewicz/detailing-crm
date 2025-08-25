// src/components/fleet/mobile/MobileVehicleUpdate.tsx

import React, {useRef, useState} from 'react';
import styled from 'styled-components';
import {FleetVehicle} from '../../../types/fleet';
import FuelLevelIndicator from '../common/FuelLevelIndicator';
import {FaCamera, FaCar, FaExclamationTriangle, FaGasPump, FaTachometerAlt} from 'react-icons/fa';
import {fleetVehicleApi} from '../../../api/fleetApi';
import {fleetImageApi} from '../../../api/fleetImageApi';
import {useToast} from '../../../components/common/Toast/Toast';
import {fleetMaintenanceApi} from "../../../api/fleetMaintenanceApi";

interface MobileVehicleUpdateProps {
    vehicle: FleetVehicle;
    onUpdateSuccess: () => void;
}

const MobileVehicleUpdate: React.FC<MobileVehicleUpdateProps> = ({ vehicle, onUpdateSuccess }) => {
    const { showToast } = useToast();
    const [mileage, setMileage] = useState<number>(vehicle.currentMileage);
    const [fuelLevel, setFuelLevel] = useState<number>(0.75); // Domyślny przykładowy poziom
    const [isReportingIssue, setIsReportingIssue] = useState<boolean>(false);
    const [issueDescription, setIssueDescription] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMileage(parseInt(e.target.value) || 0);
    };

    const handleFuelLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFuelLevel(parseInt(e.target.value) / 100);
    };

    const handleIssueToggle = () => {
        setIsReportingIssue(!isReportingIssue);
        if (!isReportingIssue) {
            setIssueDescription('');
        }
    };

    const handleIssueDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setIssueDescription(e.target.value);
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

    // src/components/fleet/mobile/MobileVehicleUpdate.tsx
// Zmodyfikujmy istniejący komponent, aby aktualizował poziom paliwa w API

// W handleSubmit dodajemy aktualizację poziomu paliwa
    const handleSubmit = async () => {
        if (mileage < vehicle.currentMileage) {
            showToast('error', 'Nowy przebieg nie może być mniejszy niż aktualny!', 3000);
            return;
        }

        try {
            setIsSubmitting(true);

            // Aktualizacja przebiegu
            await fleetVehicleApi.updateVehicleMileage(vehicle.id, mileage);

            // Aktualizacja poziomu paliwa
            await fleetMaintenanceApi.updateFuelStatus(vehicle.id, fuelLevel);

            // Jeśli zgłoszono usterkę
            if (isReportingIssue && issueDescription.trim()) {
                // Tutaj można dodać kod do zapisania usterki
                // np. await fleetIssueApi.reportIssue(vehicle.id, issueDescription);
            }

            // Dodawanie zdjęć
            for (const image of images) {
                await fleetImageApi.uploadVehicleImage(
                    vehicle.id,
                    image,
                    isReportingIssue ? 'Zdjęcie usterki' : 'Aktualizacja stanu pojazdu'
                );
            }

            showToast('success', 'Dane pojazdu zostały zaktualizowane!', 3000);
            onUpdateSuccess();
        } catch (error) {
            console.error('Error updating vehicle data:', error);
            showToast('error', 'Wystąpił błąd podczas aktualizacji danych', 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container>
            <VehicleHeader>
                <VehicleIcon>
                    <FaCar />
                </VehicleIcon>
                <VehicleInfo>
                    <VehicleName>{vehicle.make} {vehicle.model}</VehicleName>
                    <VehicleDetailsSmall>{vehicle.licensePlate}</VehicleDetailsSmall>
                </VehicleInfo>
            </VehicleHeader>

            <FormSection>
                <FormGroup>
                    <Label>
                        <MileageIcon>
                            <FaTachometerAlt />
                        </MileageIcon>
                        Aktualny przebieg (km)
                    </Label>
                    <InputLarge
                        type="number"
                        value={mileage}
                        onChange={handleMileageChange}
                        min={vehicle.currentMileage}
                    />
                    <HelpText>Ostatni przebieg: {vehicle.currentMileage} km</HelpText>
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
                            value={fuelLevel * 100}
                            onChange={handleFuelLevelChange}
                        />
                        <FuelLevelIndicator level={fuelLevel} size="large" />
                    </FuelSliderContainer>
                </FormGroup>

                <FormGroup>
                    <ReportIssueButton onClick={handleIssueToggle} active={isReportingIssue}>
                        <FaExclamationTriangle />
                        {isReportingIssue ? 'Anuluj zgłoszenie' : 'Zgłoś usterkę'}
                    </ReportIssueButton>
                </FormGroup>

                {isReportingIssue && (
                    <FormGroup>
                        <Label>Opis usterki</Label>
                        <TextArea
                            value={issueDescription}
                            onChange={handleIssueDescriptionChange}
                            placeholder="Opisz usterkę..."
                            rows={3}
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
                <SubmitButton
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
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

const VehicleHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
`;

const VehicleIcon = styled.div`
    width: 48px;
    height: 48px;
    background-color: #3498db;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-right: 16px;
`;

const VehicleInfo = styled.div`
    flex: 1;
`;

const VehicleName = styled.h2`
    margin: 0;
    font-size: 20px;
    color: #2c3e50;
`;

const VehicleDetailsSmall = styled.div`
    color: #7f8c8d;
    font-size: 14px;
    margin-top: 4px;
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
// Kontynuacja pliku src/components/fleet/mobile/MobileVehicleUpdate.tsx

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

export default MobileVehicleUpdate;