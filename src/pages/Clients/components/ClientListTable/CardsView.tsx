// ClientListTable/CardsView.tsx
import React from 'react';
import { FaCheckSquare, FaSquare, FaEdit, FaCar, FaSms } from 'react-icons/fa';
import { getClientStatus, formatCurrency } from './utils/clientUtils';
import {
    CardsContainer,
    ClientCard,
    CardHeader,
    CardTitle,
    SelectionCheckbox,
    StatusBadge,
    CardContent,
    CardRow,
    CardLabel,
    CardValue,
    CardFooter,
    ActionButton
} from './styles/components';
import {ClientExpanded} from "../../../../types";

interface CardsViewProps {
    clients: ClientExpanded[];
    selectedClientIds: string[];
    onToggleSelection: (clientId: string) => void;
    onSelectClient: (client: ClientExpanded) => void;
    onQuickAction: (action: string, client: ClientExpanded, e: React.MouseEvent) => void;
}

export const CardsView: React.FC<CardsViewProps> = ({
                                                        clients,
                                                        selectedClientIds,
                                                        onToggleSelection,
                                                        onSelectClient,
                                                        onQuickAction
                                                    }) => {
    return (
        <CardsContainer>
            {clients.map(client => {
                const status = getClientStatus(client);
                const isSelected = selectedClientIds.includes(client.id);

                return (
                    <ClientCard
                        key={client.id}
                        onClick={() => onSelectClient(client)}
                        $selected={isSelected}
                    >
                        <CardHeader>
                            <CardTitle>
                                {client.firstName} {client.lastName}
                                <StatusBadge $color={status.color}>
                                    {status.label}
                                </StatusBadge>
                            </CardTitle>
                            <SelectionCheckbox
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSelection(client.id);
                                }}
                                $selected={isSelected}
                            >
                                {isSelected ? <FaCheckSquare /> : <FaSquare />}
                            </SelectionCheckbox>
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
                                <CardLabel>Przychody:</CardLabel>
                                <CardValue>{formatCurrency(client.totalRevenue)}</CardValue>
                            </CardRow>
                        </CardContent>

                        <CardFooter>
                            <ActionButton
                                onClick={(e) => onQuickAction('edit', client, e)}
                                title="Edytuj"
                                $variant="edit"
                                $small
                            >
                                <FaEdit />
                            </ActionButton>
                            <ActionButton
                                onClick={(e) => onQuickAction('vehicles', client, e)}
                                title="Pojazdy"
                                $variant="info"
                                $small
                            >
                                <FaCar />
                            </ActionButton>
                            <ActionButton
                                onClick={(e) => onQuickAction('sms', client, e)}
                                title="SMS"
                                $variant="success"
                                $small
                            >
                                <FaSms />
                            </ActionButton>
                        </CardFooter>
                    </ClientCard>
                );
            })}
        </CardsContainer>
    );
};