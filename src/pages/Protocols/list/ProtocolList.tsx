import React, { useState, useEffect, useRef } from 'react';
import { ProtocolListItem } from '../../../types';
import { ProtocolItem } from './ProtocolItem';
import { FilterType } from './ProtocolFilters';
import Pagination from '../../../components/common/Pagination';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    EmptyState,
    TableContainer,
    TableHeaderContainer,
    DraggableHeaderCell,
    TableBody,
    TableRow,
    TableCell
} from '../styles';

// Definicja kolumny tabeli
interface TableColumn {
    id: string;
    label: string;
    width: string;
}

// Klucz do przechowywania konfiguracji kolumn w localStorage
const COLUMN_ORDER_KEY = 'protocol_table_columns_order';

// Typ elementu przeciągania
const COLUMN_TYPE = 'column';

// Komponent nagłówka kolumny z możliwością przeciągania
interface ColumnHeaderProps {
    column: TableColumn;
    index: number;
    moveColumn: (dragIndex: number, hoverIndex: number) => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ column, index, moveColumn }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: COLUMN_TYPE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: COLUMN_TYPE,
        hover: (item: any, monitor) => {
            if (!ref.current) {
                return;
            }

            const dragIndex = item.index;
            const hoverIndex = index;

            // Nie zamieniaj elementu z samym sobą
            if (dragIndex === hoverIndex) {
                return;
            }

            // Określenie granicy prostokąta
            const hoverBoundingRect = ref.current.getBoundingClientRect();

            // Uzyskanie poziomej środkowej pozycji
            const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

            // Uzyskanie bieżącej pozycji myszy
            const clientOffset = monitor.getClientOffset();

            // Uzyskanie odległości od lewej krawędzi
            const hoverClientX = clientOffset!.x - hoverBoundingRect.left;

            // Tylko wykonaj ruch, gdy mysz przekroczy połowę szerokości elementu
            // Podczas przeciągania w lewo sprawdź, czy kursor jest przed środkiem
            // Podczas przeciągania w prawo sprawdź, czy kursor jest za środkiem

            // Przeciąganie w lewo
            if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
                return;
            }

            // Przeciąganie w prawo
            if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
                return;
            }

            // Wykonanie zmiany
            moveColumn(dragIndex, hoverIndex);

            // Uwaga: modyfikujemy obiekt 'item' bez tworzenia kopii
            // Jest to prawidłowe, ponieważ używamy useDrag hook, który nie używa zwracanej wartości
            item.index = hoverIndex;
        },
    });

    // Inicjalizacja referencji drag & drop
    drag(drop(ref));

    return (
        <DraggableHeaderCell
            ref={ref}
            isDragging={isDragging}
            width={column.width}
        >
            {column.label}
        </DraggableHeaderCell>
    );
};

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
    // Domyślna konfiguracja kolumn
    const defaultColumns: TableColumn[] = [
        { id: 'vehicle', label: 'Pojazd', width: '20%' },
        { id: 'date', label: 'Data', width: '15%' },
        { id: 'licensePlate', label: 'Numer rejestracyjny', width: '15%' },
        { id: 'title', label: 'Tytuł wizyty', width: '15%' },
        { id: 'owner', label: 'Właściciel', width: '15%' },
        { id: 'value', label: 'Wartość wizyty', width: '10%' },
        { id: 'status', label: 'Status', width: '10%' }
    ];

    // Stan kolumn z zapisaną konfiguracją lub domyślnymi wartościami
    const [columns, setColumns] = useState<TableColumn[]>(() => {
        try {
            const savedOrder = localStorage.getItem(COLUMN_ORDER_KEY);
            return savedOrder ? JSON.parse(savedOrder) : defaultColumns;
        } catch (e) {
            console.error("Error loading saved column order:", e);
            return defaultColumns;
        }
    });

    // Zapisz konfigurację kolumn w localStorage przy każdej zmianie
    useEffect(() => {
        try {
            localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(columns));
        } catch (e) {
            console.error("Error saving column order:", e);
        }
    }, [columns]);

    // Funkcja do zamiany pozycji kolumn
    const moveColumn = (dragIndex: number, hoverIndex: number) => {
        const draggedColumn = columns[dragIndex];
        const newColumns = [...columns];

        // Usuń przeciągany element
        newColumns.splice(dragIndex, 1);
        // Wstaw element na nowej pozycji
        newColumns.splice(hoverIndex, 0, draggedColumn);

        setColumns(newColumns);
    };

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
            <DndProvider backend={HTML5Backend}>
                <TableContainer>
                    <TableHeaderContainer>
                        {columns.map((column, index) => (
                            <ColumnHeader
                                key={column.id}
                                column={column}
                                index={index}
                                moveColumn={moveColumn}
                            />
                        ))}
                    </TableHeaderContainer>

                    <TableBody>
                        {protocols.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    Ładowanie danych...
                                </TableCell>
                            </TableRow>
                        ) : (
                            protocols.map(protocol => (
                                <TableRow
                                    key={protocol.id}
                                    onClick={() => onViewProtocol(protocol)}
                                >
                                    {columns.map(column => (
                                        <TableCell
                                            key={`${protocol.id}-${column.id}`}
                                            width={column.width}
                                        >
                                            <ProtocolItem
                                                protocol={protocol}
                                                columnId={column.id}
                                                onView={onViewProtocol}
                                                onEdit={onEditProtocol}
                                                onDelete={onDeleteProtocol}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </TableContainer>
            </DndProvider>

            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.currentPage + 1}
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