// src/components/fleet/calendar/SelectedVehicleInfo.tsx
import React from 'react';
import styled from 'styled-components';
import { FleetVehicle, FleetVehicleStatus } from '../../../types/fleet';

interface SelectedVehicleInfoProps {
    vehicle: FleetVehicle;
}

const SelectedVehicleInfo: React.FC<SelectedVehicleInfoProps> = ({ vehicle }) => {
    return (
        <InfoContainer>
            <InfoNote>
                {vehicle.status === FleetVehicleStatus.AVAILABLE
                    ? 'Wybierz datę na kalendarzu, aby utworzyć nowe wypożyczenie dla tego pojazdu'
                    : 'Ten pojazd jest obecnie niedostępny do wypożyczenia'}
            </InfoNote>
        </InfoContainer>
    );
};

const InfoContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: #f8fafd;
  border-radius: 10px;
  border: 1px solid #e1e8ed;
`;

const InfoNote = styled.div`
  font-size: 14px;
  color: #3498db;
  font-style: italic;
  text-align: center;
`;

export default SelectedVehicleInfo;