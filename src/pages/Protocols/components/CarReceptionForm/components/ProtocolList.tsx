import React from 'react';
import { ProtocolListItem } from '../../../../../types';
import { ProtocolItem } from './ProtocolItem';
import { FilterType } from './ProtocolFilters';
import {
  EmptyState,
  ProtocolsTable,
  TableHeader
} from '../../../styles';

interface ProtocolListProps {
  protocols: ProtocolListItem[];
  activeFilter: FilterType;
  onViewProtocol: (protocol: ProtocolListItem) => void;
  onEditProtocol: (protocolId: string) => void;
  onDeleteProtocol: (protocolId: string) => void;
}

export const ProtocolList: React.FC<ProtocolListProps> = ({
  protocols,
  activeFilter,
  onViewProtocol,
  onEditProtocol,
  onDeleteProtocol
}) => {
  if (protocols.length === 0) {
    return (
      <EmptyState>
        <p>
          Brak protokołów przyjęcia {activeFilter !== 'Wszystkie' ? `w grupie "${activeFilter}"` : ''}.
          {activeFilter === 'Wszystkie' ? ' Kliknij "Nowy protokół", aby utworzyć pierwszy.' : ''}
        </p>
      </EmptyState>
    );
  }

  return (
    <ProtocolsTable>
      <thead>
        <tr>
          <TableHeader>Pojazd</TableHeader>
          <TableHeader>Data</TableHeader>
          <TableHeader>Właściciel</TableHeader>
          <TableHeader>Numer rejestracyjny</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Akcje</TableHeader>
        </tr>
      </thead>
      <tbody>
        {protocols.map(protocol => (
          <ProtocolItem
            key={protocol.id}
            protocol={protocol}
            onView={onViewProtocol}
            onEdit={onEditProtocol}
            onDelete={onDeleteProtocol}
          />
        ))}
      </tbody>
    </ProtocolsTable>
  );
};