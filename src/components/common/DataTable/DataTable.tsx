// src/components/common/DataTable/DataTable.tsx
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaList, FaTable } from 'react-icons/fa';
import { DataTableProps, BaseDataItem } from './types';
import { useTableConfiguration, useTableSorting, useViewMode } from './hooks';
import { ColumnHeader } from './TableHeader';
import {
    TableContainer,
    TableHeader,
    TableTitle,
    ViewControls,
    ViewButton,
    TableWrapper,
    TableContent,
    TableHeaderRow,
    TableBody,
    TableRow,
    TableCell,
    CardsContainer,
    EmptyStateContainer,
    EmptyStateIcon,
    EmptyStateTitle,
    EmptyStateDescription,
    EmptyStateAction
} from './components';

export function DataTable<T extends BaseDataItem>({
                                                      data,
                                                      columns: defaultColumns,
                                                      title,
                                                      emptyStateConfig,
                                                      onItemClick,
                                                      onItemAction,
                                                      renderCell,
                                                      renderCard,
                                                      enableDragAndDrop = false,
                                                      enableViewToggle = true,
                                                      defaultViewMode = 'table',
                                                      storageKeys = {
                                                          viewMode: 'data_table_view_mode',
                                                          columnOrder: 'data_table_columns_order'
                                                      }
                                                  }: DataTableProps<T>) {
    const { columns, moveColumn } = useTableConfiguration(defaultColumns, storageKeys.columnOrder);
    const { viewMode, setViewMode } = useViewMode(defaultViewMode, storageKeys.viewMode);

    const getSortValue = (item: T, columnId: string) => {
        switch (columnId) {
            default:
                return item[columnId] || '';
        }
    };

    const { sortedData, sortColumn, sortDirection, handleSort } = useTableSorting(data, getSortValue);

    const handleItemClick = (item: T) => {
        onItemClick?.(item);
    };

    const handleQuickAction = (action: string, item: T, e: React.MouseEvent) => {
        e.stopPropagation();
        onItemAction?.(action, item, e);
    };

    if (data.length === 0) {
        const IconComponent = emptyStateConfig.icon;
        return (
            <TableContainer>
                <EmptyStateContainer>
                    <EmptyStateIcon>
                        <IconComponent />
                    </EmptyStateIcon>
                    <EmptyStateTitle>{emptyStateConfig.title}</EmptyStateTitle>
                    <EmptyStateDescription>{emptyStateConfig.description}</EmptyStateDescription>
                    <EmptyStateAction>{emptyStateConfig.actionText}</EmptyStateAction>
                </EmptyStateContainer>
            </TableContainer>
        );
    }

    const tableContent = (
        <TableWrapper>
            <TableContent>
                <TableHeaderRow>
                    {columns.map((column, index) => (
                        <ColumnHeader
                            key={column.id}
                            column={column}
                            index={index}
                            moveColumn={moveColumn}
                            sortColumn={sortColumn}
                            sortDirection={sortDirection}
                            onSort={handleSort}
                            enableDragAndDrop={enableDragAndDrop}
                        />
                    ))}
                </TableHeaderRow>

                <TableBody>
                    {sortedData.map(item => (
                        <TableRow
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                        >
                            {columns.map(column => (
                                <TableCell
                                    key={`${item.id}-${column.id}`}
                                    $width={column.width}
                                >
                                    {renderCell(item, column.id)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </TableContent>
        </TableWrapper>
    );

    const cardsContent = renderCard && (
        <CardsContainer>
            {sortedData.map(item => (
                <div key={item.id} onClick={() => handleItemClick(item)}>
                    {renderCard(item)}
                </div>
            ))}
        </CardsContainer>
    );

    return (
        <TableContainer>
            <TableHeader>
                <TableTitle>{title} ({data.length})</TableTitle>
                {enableViewToggle && renderCard && (
                    <ViewControls>
                        <ViewButton
                            $active={viewMode === 'table'}
                            onClick={() => setViewMode('table')}
                            title="Widok tabeli"
                        >
                            <FaTable />
                        </ViewButton>
                        <ViewButton
                            $active={viewMode === 'cards'}
                            onClick={() => setViewMode('cards')}
                            title="Widok kart"
                        >
                            <FaList />
                        </ViewButton>
                    </ViewControls>
                )}
            </TableHeader>

            {viewMode === 'table' ? (
                enableDragAndDrop ? (
                    <DndProvider backend={HTML5Backend}>
                        {tableContent}
                    </DndProvider>
                ) : (
                    tableContent
                )
            ) : (
                cardsContent
            )}
        </TableContainer>
    );
}