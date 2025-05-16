import React from 'react';
import { FaEdit, FaTrash, FaFileAlt } from 'react-icons/fa';
import { ProtocolListItem } from '../../../types';
import {
    TableRow,
    TableCell,
    CarInfo,
    DateRange,
    OwnerInfo,
    CompanyInfo,
    ActionButtons,
    ActionButton
} from '../styles';
import {ProtocolStatusBadge} from "../shared/components/ProtocolStatusBadge";

interface ProtocolItemProps {
    protocol: ProtocolListItem;
    onView: (protocol: ProtocolListItem) => void;
    onEdit: (protocolId: string) => void;
    onDelete: (protocolId: string) => void;
}

export const ProtocolItem: React.FC<ProtocolItemProps> = ({
                                                              protocol,
                                                              onView,
                                                              onEdit,
                                                              onDelete
                                                          }) => {
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

    return (
        <TableRow key={protocol.id} onClick={() => onView(protocol)}>
            <TableCell>
                <CarInfo>
                    <strong>{protocol.vehicle.make} {protocol.vehicle.model}</strong>
                    {protocol.vehicle.productionYear > 0 ? (
                        <span>Rok: {protocol.vehicle.productionYear}</span>
                    ) : (
                        <span>Rok: Brak informacji</span>
                    )}                </CarInfo>
            </TableCell>
            <TableCell>
                <DateRange>
                    <span>Od: {formatDate(protocol.period.startDate)}</span>
                    <span>Do: {formatDate(protocol.period.endDate)}</span>
                </DateRange>
            </TableCell>
            <TableCell>
                {protocol.vehicle.licensePlate}
            </TableCell>
            <TableCell>
                <DateRange>
                    <span>{protocol.title}</span>
                </DateRange>
            </TableCell>
            <TableCell>
                <OwnerInfo>
                    <div>{protocol.owner.name}</div>
                    {protocol.owner.companyName && (
                        <CompanyInfo>{protocol.owner.companyName}</CompanyInfo>
                    )}
                </OwnerInfo>
            </TableCell>
            <TableCell>
                {protocol.totalAmount.toFixed(2)} PLN
            </TableCell>
            <TableCell>
                <ProtocolStatusBadge status={protocol.status} />
            </TableCell>
        </TableRow>
    );
};