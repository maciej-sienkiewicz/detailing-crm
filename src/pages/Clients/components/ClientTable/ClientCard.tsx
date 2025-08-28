// src/pages/Clients/components/ClientTable/ClientCard.tsx
import React from 'react';
import { FaCar, FaCheckSquare, FaEdit, FaEye, FaSms, FaSquare } from 'react-icons/fa';
import { ClientExpanded } from '../../../../types';
import { Card, ActionButton, StatusBadge } from '../../../../components/common/DataTable';
import { formatCurrency, getClientStatus } from './utils';
import {
    SelectionCheckbox,
    CardHeader,
    CardTitle,
    CardHeaderActions,
    CardActions,
    CardContent,
    CardRow,
    CardLabel,
    CardValue
} from './styled';

interface ClientCardProps {
    client: ClientExpanded;
    selectedClientIds: string[];
    onToggleSelection: (clientId: string) => void;
    onSelectClient: (client: ClientExpanded) => void;
    onEditClient: (client: ClientExpanded) => void;
    onDeleteClient: (clientId: string) => void;
    onShowVehicles: (clientId: string) => void;
    onAddContactAttempt: (client: ClientExpanded) => void;
    onSendSMS: (client: ClientExpanded) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
                                                          client,
                                                          selectedClientIds,
                                                          onToggleSelection,
                                                          onSelectClient,
                                                          onEditClient,
                                                          onShowVehicles,
                                                          onSendSMS
                                                      }) => {
    const status = getClientStatus(client);
    const isSelected = selectedClientIds.includes(client.id);

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <Card $selected={isSelected}>
            <CardHeader>
                <CardTitle>
                    {client.firstName} {client.lastName}
                    <StatusBadge $color={status.color}>
                        {status.label}
                    </StatusBadge>
                </CardTitle>
                <CardHeaderActions>
                    <SelectionCheckbox
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSelection(client.id);
                        }}
                        $selected={isSelected}
                    >
                        {isSelected ? <FaCheckSquare /> : <FaSquare />}
                    </SelectionCheckbox>
                    <CardActions>
                        <ActionButton
                            onClick={(e) => handleActionClick(e, () => onSelectClient(client))}
                            title="Zobacz szczegóły"
                            $variant="view"
                            $small
                        >
                            <FaEye />
                        </ActionButton>
                        <ActionButton
                            onClick={(e) => handleActionClick(e, () => onEditClient(client))}
                            title="Edytuj"
                            $variant="edit"
                            $small
                        >
                            <FaEdit />
                        </ActionButton>
                        <ActionButton
                            onClick={(e) => handleActionClick(e, () => onShowVehicles(client.id))}
                            title="Pojazdy"
                            $variant="info"
                            $small
                        >
                            <FaCar />
                        </ActionButton>
                        <ActionButton
                            onClick={(e) => handleActionClick(e, () => onSendSMS(client))}
                            title="SMS"
                            $variant="success"
                            $small
                        >
                            <FaSms />
                        </ActionButton>
                    </CardActions>
                </CardHeaderActions>
            </CardHeader>

            <CardContent>
                <CardRow>
                    <CardLabel>Email:</CardLabel>
                    <CardValue>{client.email}</CardValue>
                </CardRow>
                <CardRow>
                    <CardLabel>Telefon:</CardLabel>
                    <CardValue>{client.phone}</CardValue>
                </CardRow>
                {client.company && (
                    <CardRow>
                        <CardLabel>Firma:</CardLabel>
                        <CardValue>{client.company}</CardValue>
                    </CardRow>
                )}
                <CardRow>
                    <CardLabel>Wizyty:</CardLabel>
                    <CardValue>{client.totalVisits}</CardValue>
                </CardRow>
                <CardRow>
                    <CardLabel>Pojazdy:</CardLabel>
                    <CardValue>{client.vehicles?.length || 0}</CardValue>
                </CardRow>
                <CardRow>
                    <CardLabel>Przychody:</CardLabel>
                    <CardValue>{formatCurrency(client.totalRevenue)}</CardValue>
                </CardRow>
            </CardContent>
        </Card>
    );
};