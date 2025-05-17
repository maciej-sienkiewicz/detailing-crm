import React from 'react';
import { ProtocolListItem } from '../../../types';
import {
    CarInfo,
    DateRange,
    OwnerInfo,
    CompanyInfo,
    ActionButtons,
    ActionButton,
    StatusBadge
} from '../styles';
import { ProtocolStatusBadge } from "../shared/components/ProtocolStatusBadge";

interface ProtocolItemProps {
    protocol: ProtocolListItem;
    columnId: string; // ID kolumny do renderowania
    onView: (protocol: ProtocolListItem) => void;
    onEdit: (protocolId: string) => void;
    onDelete: (protocolId: string) => void;
}

export const ProtocolItem: React.FC<ProtocolItemProps> = ({
                                                              protocol,
                                                              columnId,
                                                              onView,
                                                              onEdit,
                                                              onDelete
                                                          }) => {
    // Zatrzymaj propagację kliknięcia dla przycisków akcji
    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    // Formatowanie daty
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';

        const date = new Date(dateString);

        // Formatowanie daty
        const formattedDate = date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        // Dodajemy godzinę tylko dla daty początkowej (startDate)
        if (dateString.includes('T') && dateString.split('T')[1] !== '23:59:59') {
            const time = date.toLocaleTimeString('pl-PL', {
                hour: '2-digit',
                minute: '2-digit'
            });
            return `${formattedDate}, ${time}`;
        }

        return formattedDate;
    };

    // Renderuj odpowiednią zawartość komórki na podstawie ID kolumny
    switch (columnId) {
        case 'vehicle':
            return (
                <CarInfo>
                    <strong>{protocol.vehicle.make} {protocol.vehicle.model}</strong>
                    {protocol.vehicle.productionYear > 0 ? (
                        <span>Rok: {protocol.vehicle.productionYear}</span>
                    ) : (
                        <span>Rok: Brak informacji</span>
                    )}
                </CarInfo>
            );

        case 'date':
            return (
                <DateRange>
                    <span>Od: {formatDate(protocol.period.startDate)}</span>
                    <span>Do: {formatDate(protocol.period.endDate)}</span>
                </DateRange>
            );

        case 'licensePlate':
            return (
                <div>{protocol.vehicle.licensePlate}</div>
            );

        case 'title':
            return (
                <div>{protocol.title}</div>
            );

        case 'owner':
            return (
                <OwnerInfo>
                    <div>{protocol.owner.name}</div>
                    {protocol.owner.companyName && (
                        <CompanyInfo>{protocol.owner.companyName}</CompanyInfo>
                    )}
                </OwnerInfo>
            );

        case 'value':
            return (
                <div>{protocol.totalAmount.toFixed(2)} PLN</div>
            );

        case 'status':
            return (
                <ProtocolStatusBadge status={protocol.status} />
            );

        case 'lastUpdate':
            return (
                <div>{protocol.lastUpdate}</div>
            );

        default:
            return null;
    }
};