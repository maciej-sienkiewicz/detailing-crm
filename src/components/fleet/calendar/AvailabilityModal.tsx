// src/components/fleet/calendar/AvailabilityModal.tsx
import React from 'react';
import styled from 'styled-components';
import { FleetVehicle } from '../../../types/fleet';
import EnhancedFuelLevelIndicator from '../common/EnhancedFuelLevelIndicator';
import {
    FaTimes,
    FaMapMarkerAlt,
    FaTachometerAlt,
    FaCalendarCheck,
    FaExclamationTriangle,
    FaCarAlt
} from 'react-icons/fa';

interface AvailabilityModalProps {
    availableVehicles: FleetVehicle[];
    startDate: string;
    endDate: string;
    onClose: () => void;
    onSelectVehicle: (vehicleId: string) => void;
    onCreateReservation: (vehicleId: string) => void;
}

const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
                                                                 availableVehicles,
                                                                 startDate,
                                                                 endDate,
                                                                 onClose,
                                                                 onSelectVehicle,
                                                                 onCreateReservation
                                                             }) => {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pl-PL');
    };

    return (
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>
                        Dostępne pojazdy
                    </ModalTitle>
                    <ModalPeriod>
                        {formatDate(startDate)} - {formatDate(endDate)}
                    </ModalPeriod>
                    <CloseButton onClick={onClose} aria-label="Zamknij">
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    {availableVehicles.length === 0 ? (
                        <NoVehiclesMessage>
                            <NoVehiclesIcon>
                                <FaExclamationTriangle />
                            </NoVehiclesIcon>
                            <NoVehiclesText>
                                Brak dostępnych pojazdów w wybranym terminie
                            </NoVehiclesText>
                        </NoVehiclesMessage>
                    ) : (
                        <VehiclesList>
                            {availableVehicles.map(vehicle => (
                                <VehicleCard key={vehicle.id}>
                                    <VehicleDetails>
                                        <VehicleImageContainer>
                                            <FaCarAlt />
                                        </VehicleImageContainer>
                                        <VehicleInfo>
                                            <VehicleName>
                                                {vehicle.make} {vehicle.model}
                                            </VehicleName>
                                            <VehicleAttributes>
                                                <VehicleAttribute>
                                                    <AttributeIcon>
                                                        <FaMapMarkerAlt />
                                                    </AttributeIcon>
                                                    <AttributeValue>{vehicle.licensePlate}</AttributeValue>
                                                </VehicleAttribute>
                                                <VehicleAttribute>
                                                    <AttributeIcon>
                                                        <FaTachometerAlt />
                                                    </AttributeIcon>
                                                    <AttributeValue>{vehicle.currentMileage.toLocaleString()} km</AttributeValue>
                                                </VehicleAttribute>
                                                <VehicleAttribute>
                                                    <EnhancedFuelLevelIndicator
                                                        vehicleId={vehicle.id}
                                                        size="small"
                                                        onlyIcon={true}
                                                    />
                                                </VehicleAttribute>
                                            </VehicleAttributes>
                                        </VehicleInfo>
                                    </VehicleDetails>

                                    <VehicleActions>
                                        <SelectVehicleButton onClick={() => onSelectVehicle(vehicle.id)}>
                                            Wybierz w kalendarzu
                                        </SelectVehicleButton>
                                        <CreateReservationButton onClick={() => onCreateReservation(vehicle.id)}>
                                            Utwórz rezerwację
                                        </CreateReservationButton>
                                    </VehicleActions>
                                </VehicleCard>
                            ))}
                        </VehiclesList>
                    )}
                </ModalBody>
            </ModalContent>
        </ModalOverlay>
    );
};

// Nowe, bardziej eleganckie i profesjonalne style
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(30, 38, 46, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
    backdrop-filter: blur(3px);
`;

const ModalContent = styled.div`
    background-color: #ffffff;
    width: 100%;
    max-width: 800px;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.25s ease;

    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;

const ModalHeader = styled.div`
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;

    @media (max-width: 576px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 16px;
    }
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    color: #212529;
    font-weight: 500;
`;

const ModalPeriod = styled.div`
    font-size: 15px;
    color: #495057;
    padding: 4px 10px;
    background-color: #e9ecef;
    border-radius: 4px;

    @media (max-width: 576px) {
        align-self: flex-start;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    right: 16px;
    top: 16px;
    background: none;
    border: none;
    color: #6c757d;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    transition: color 0.15s;

    &:hover {
        color: #212529;
    }
`;

const ModalBody = styled.div`
    padding: 24px;
    overflow-y: auto;
    max-height: calc(90vh - 70px);

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #ced4da;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #adb5bd;
    }
`;

const NoVehiclesMessage = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
`;

const NoVehiclesIcon = styled.div`
    font-size: 36px;
    color: #adb5bd;
    margin-bottom: 16px;
`;

const NoVehiclesText = styled.p`
    color: #6c757d;
    font-size: 16px;
    margin: 0;
`;

const VehiclesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const VehicleCard = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    transition: box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transform: translateY(-2px);
    }
`;

const VehicleDetails = styled.div`
    display: flex;
    padding: 16px;
    border-bottom: 1px solid #e9ecef;

    @media (max-width: 576px) {
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }
`;

const VehicleImageContainer = styled.div`
    width: 60px;
    height: 60px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #495057;
    margin-right: 16px;
    border-radius: 4px;
    flex-shrink: 0;

    @media (max-width: 576px) {
        margin-right: 0;
    }
`;

const VehicleInfo = styled.div`
    flex: 1;
`;

const VehicleName = styled.h4`
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 500;
    color: #212529;
`;

const VehicleAttributes = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
`;

const VehicleAttribute = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
`;

const AttributeIcon = styled.span`
    color: #6c757d;
    margin-right: 8px;
    font-size: 12px;
`;

const AttributeValue = styled.span`
    color: #495057;
`;

const VehicleActions = styled.div`
  display: flex;
  padding: 12px 16px;
  gap: 10px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const SelectVehicleButton = styled.button`
  flex: 1;
  padding: 10px 0;
  background: none;
  border: 1px solid #ced4da;
  border-radius: 4px;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    background-color: #f8f9fa;
    border-color: #adb5bd;
  }
  
  @media (max-width: 576px) {
    order: 2;
  }
`;

const CreateReservationButton = styled.button`
  flex: 1;
  padding: 10px 0;
  background-color: #495057;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    background-color: #343a40;
  }
  
  @media (max-width: 576px) {
    order: 1;
  }
`;

export default AvailabilityModal;