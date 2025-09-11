import React from 'react';
import { FaBarcode, FaCalendarAlt, FaCar, FaIdCard, FaPalette } from 'react-icons/fa';
import { Section, SectionTitle, InfoGrid, InfoItem, InfoLabel, InfoValue } from './VehicleDetailStyles';

interface VehicleBasicInfoProps {
    vehicle: {
        make: string;
        model: string;
        year?: number;
        licensePlate: string;
        color?: string;
        vin?: string;
        displayName?: string;
    };
}

const VehicleBasicInfo: React.FC<VehicleBasicInfoProps> = ({ vehicle }) => {
    return (
        <Section>
            <SectionTitle>
                <FaCar />
                Dane pojazdu
            </SectionTitle>

            <InfoGrid>
                <InfoItem>
                    <InfoLabel>
                        <FaCar />
                        Marka
                    </InfoLabel>
                    <InfoValue>{vehicle.make}</InfoValue>
                </InfoItem>

                <InfoItem>
                    <InfoLabel>
                        <FaCar />
                        Model
                    </InfoLabel>
                    <InfoValue>{vehicle.model}</InfoValue>
                </InfoItem>

                <InfoItem>
                    <InfoLabel>
                        <FaCalendarAlt />
                        Rok produkcji
                    </InfoLabel>
                    <InfoValue>{vehicle.year || 'Nie podano'}</InfoValue>
                </InfoItem>

                <InfoItem>
                    <InfoLabel>
                        <FaIdCard />
                        Nr rejestracyjny
                    </InfoLabel>
                    <InfoValue>{vehicle.licensePlate}</InfoValue>
                </InfoItem>

                {vehicle.color && (
                    <InfoItem>
                        <InfoLabel>
                            <FaPalette />
                            Kolor
                        </InfoLabel>
                        <InfoValue>{vehicle.color}</InfoValue>
                    </InfoItem>
                )}

                {vehicle.vin && (
                    <InfoItem>
                        <InfoLabel>
                            <FaBarcode />
                            Numer VIN
                        </InfoLabel>
                        <InfoValue>{vehicle.vin}</InfoValue>
                    </InfoItem>
                )}

                {vehicle.displayName && (
                    <InfoItem>
                        <InfoLabel>
                            <FaCar />
                            Nazwa wyświetlana
                        </InfoLabel>
                        <InfoValue>{vehicle.displayName}</InfoValue>
                    </InfoItem>
                )}
            </InfoGrid>
        </Section>
    );
};

export default VehicleBasicInfo;