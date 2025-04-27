import React from 'react';
import { ProtocolListItem } from '../../../types';
import { ProtocolItem } from './ProtocolItem';
import { FilterType } from './ProtocolFilters';
import Pagination from '../../../components/common/Pagination';
import {
    EmptyState,
    ProtocolsTable,
    TableHeader
} from '../styles';

interface ProtocolListProps {
    protocols: ProtocolListItem[];
    activeFilter: FilterType;
    onViewProtocol: (protocol: ProtocolListItem) => void;
    onEditProtocol: (protocolId: string, isOpenProtocolAction?: boolean) => Promise<void>;
    onDeleteProtocol: (protocolId: string) => Promise<void>;
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
    onPageChange: (page: number) => void;
}

export const ProtocolList: React.FC<ProtocolListProps> = ({
                                                              protocols,
                                                              activeFilter,
                                                              onViewProtocol,
                                                              onEditProtocol,
                                                              onDeleteProtocol,
                                                              pagination,
                                                              onPageChange
                                                          }) => {
    if (protocols.length === 0 && pagination.totalItems === 0) {
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
        <div>
            <ProtocolsTable>
                <thead>
                <tr>
                    <TableHeader>Pojazd</TableHeader>
                    <TableHeader>Data</TableHeader>
                    <TableHeader>Numer rejestracyjny</TableHeader>
                    <TableHeader>Tytuł wizyty</TableHeader>
                    <TableHeader>Właściciel</TableHeader>
                    <TableHeader>Wartość wizyty</TableHeader>
                    <TableHeader>Status</TableHeader>
                </tr>
                </thead>
                <tbody>
                {protocols.length === 0 ? (
                    <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                            Ładowanie danych...
                        </td>
                    </tr>
                ) : (
                    protocols.map(protocol => (
                        <ProtocolItem
                            key={protocol.id}
                            protocol={protocol}
                            onView={onViewProtocol}
                            onEdit={onEditProtocol}
                            onDelete={onDeleteProtocol}
                        />
                    ))
                )}
                </tbody>
            </ProtocolsTable>

            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.currentPage + 1} // Konwersja z indeksowania od 0 do indeksowania od 1
                    totalPages={pagination.totalPages}
                    onPageChange={onPageChange}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.pageSize}
                    showTotalItems={true}
                />
            )}
        </div>
    );
};