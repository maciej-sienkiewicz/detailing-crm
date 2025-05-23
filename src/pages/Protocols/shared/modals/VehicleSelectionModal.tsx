import React from 'react';
import styled from 'styled-components';
import { FaCar, FaCalendarAlt, FaTachometerAlt, FaCheck } from 'react-icons/fa';
import { VehicleExpanded } from '../../../../types';

interface VehicleSelectionModalProps {
    vehicles: VehicleExpanded[];
    onSelect: (vehicle: VehicleExpanded) => void;
    onCancel: () => void;
}

const VehicleSelectionModal: React.FC<VehicleSelectionModalProps> = ({
                                                                         vehicles,
                                                                         onSelect,
                                                                         onCancel
                                                                     }) => {
    return (
        <ModalOverlay>
            <ModalContainer>
                <ModalHeader>
                    <h2>Wybierz pojazd</h2>
                    <CloseButton onClick={onCancel}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                    {vehicles.length === 0 ? (
                        <EmptyState>Nie znaleziono pojazdów.</EmptyState>
                    ) : (
                        <>
                            <ModalInfo>
                                Znaleziono {vehicles.length} {vehicles.length === 1 ? 'pojazd' :
                                vehicles.length < 5 ? 'pojazdy' : 'pojazdów'}.
                                Wybierz pojazd aby uzupełnić dane w formularzu.
                            </ModalInfo>
                            <VehiclesList>
                                {vehicles.map(vehicle => (
                                    <VehicleItem key={vehicle.id} onClick={() => onSelect(vehicle)}>
                                        <VehicleHeader>
                                            <VehicleName>
                                                {vehicle.make} {vehicle.model}
                                            </VehicleName>
                                            <LicensePlate>{vehicle.licensePlate}</LicensePlate>
                                        </VehicleHeader>
                                        <VehicleDetails>
                                            <VehicleDetail>
                                                <FaCalendarAlt /> Rok: {vehicle.year}
                                            </VehicleDetail>
                                            {vehicle.vin && (
                                                <VehicleDetail>
                                                    VIN: {vehicle.vin}
                                                </VehicleDetail>
                                            )}
                                            {vehicle.color && (
                                                <VehicleDetail>
                                                    Kolor: {vehicle.color}
                                                </VehicleDetail>
                                            )}
                                            {vehicle.totalServices > 0 && (
                                                <VehicleDetail>
                                                    Liczba wizyt: {vehicle.totalServices}
                                                </VehicleDetail>
                                            )}
                                        </VehicleDetails>
                                    </VehicleItem>
                                ))}
                            </VehiclesList>
                        </>
                    )}
                    <ButtonGroup>
                        <Button secondary onClick={onCancel}>Anuluj</Button>
                    </ButtonGroup>
                </ModalBody>
            </ModalContainer>
        </ModalOverlay>
    );
};

// Style komponentów
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

const ModalContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 550px;
    max-width: 90%;
    max-height: 80vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;

    h2 {
        margin: 0;
        font-size: 18px;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #7f8c8d;

    &:hover {
        color: #34495e;
    }
`;

const ModalBody = styled.div`
    padding: 20px;
`;

const ModalInfo = styled.div`
    padding: 10px 15px;
    background-color: #f0f7ff;
    border-radius: 4px;
    margin-bottom: 15px;
    color: #3498db;
    font-size: 14px;
`;

const EmptyState = styled.div`
    padding: 20px;
    text-align: center;
    color: #7f8c8d;
    background-color: #f9f9f9;
    border-radius: 4px;
`;

const VehiclesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
`;

const VehicleItem = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 12px 15px;
    cursor: pointer;
    border: 1px solid #eee;
    transition: all 0.2s;
    position: relative;

    &:hover {
        background-color: #eaf6fd;
        border-color: #3498db;
    }
`;

const VehicleHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;

const VehicleName = styled.div`
    font-weight: 600;
    font-size: 16px;
    color: #34495e;
`;

const LicensePlate = styled.div`
    display: inline-block;
    padding: 4px 8px;
    background-color: #f0f7ff;
    border: 1px solid #d5e9f9;
    border-radius: 4px;
    font-weight: 500;
    color: #3498db;
`;

const VehicleDetails = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
`;

const VehicleDetail = styled.div`
    font-size: 14px;
    color: #34495e;
    display: flex;
    align-items: center;
    gap: 6px;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
`;

const Button = styled.button<{ primary?: boolean; secondary?: boolean }>`
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid;

    ${props => props.primary && `
    background-color: #3498db;
    color: white;
    border-color: #3498db;
    
    &:hover {
      background-color: #2980b9;
      border-color: #2980b9;
    }
  `}

    ${props => props.secondary && `
    background-color: white;
    color: #333;
    border-color: #ddd;
    
    &:hover {
      background-color: #f5f5f5;
    }
  `}
`;

export default VehicleSelectionModal;