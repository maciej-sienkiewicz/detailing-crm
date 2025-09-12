// src/components/common/DataTable/DataTable.tsx - Kompletny plik po zmianach
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaList, FaTable, FaCheckSquare, FaSquare } from 'react-icons/fa';
import { DataTableProps, BaseDataItem, HeaderAction, SelectAllConfig } from './types';
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
    EmptyStateAction,
    // NOWE komponenty
    HeaderLeft,
    HeaderRight,
    HeaderActionsContainer,
    SelectAllContainer,
    SelectAllCheckbox,
    SelectionCounter,
    HeaderActionButton,
    ActionBadge,
    ExpandableContent, BulkActionsContainer, BulkActionButton
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
                                                      },
                                                      // NOWE propsy
                                                      headerActions = [],
                                                      selectAllConfig,
                                                      expandableContent,
                                                      expandableVisible = false
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

    // Render header action button
    const renderHeaderAction = (action: HeaderAction) => {
        const IconComponent = action.icon;

        return (
            <HeaderActionButton
                key={action.id}
                onClick={action.onClick}
                $variant={action.variant || 'secondary'}
                $active={action.active}
                $hasBadge={action.badge}
                disabled={action.disabled}
            >
                {IconComponent && <IconComponent />}
                {action.label}
                {action.badge && <ActionBadge />}
            </HeaderActionButton>
        );
    };

    // Render select all section
    const renderSelectAll = () => {
        if (!selectAllConfig) return null;

        const { selectedCount, totalCount, selectAll, onToggleSelectAll, label, bulkActions } = selectAllConfig;

        return (
            <SelectAllContainer>
                {/* Bulk Actions po lewej stronie */}
                {bulkActions && bulkActions.length > 0 && (
                    <BulkActionsContainer>
                        {bulkActions.map(action => (
                            <BulkActionButton
                                key={action.id}
                                onClick={action.onClick}
                                $variant={"primary"}
                                disabled={action.disabled}
                                title={action.label}
                            >
                                {action.icon && <action.icon />}
                                {action.label}
                            </BulkActionButton>
                        ))}
                    </BulkActionsContainer>
                )}

                {/* Select All Checkbox */}
                <SelectAllCheckbox
                    onClick={onToggleSelectAll}
                    $selected={selectAll}
                >
                    {selectAll ? <FaCheckSquare /> : <FaSquare />}
                    <span>{label || `Zaznacz wszystkich (${totalCount})`}</span>
                </SelectAllCheckbox>
            </SelectAllContainer>
        );
    };

    if (data.length === 0) {
        const IconComponent = emptyStateConfig.icon;
        return (
            <TableContainer>
                <TableHeader>
                    <HeaderLeft>
                        <TableTitle>{title} (0)</TableTitle>
                    </HeaderLeft>

                    <HeaderRight>
                        <HeaderActionsContainer>
                            {/* Select All Component - ukryty gdy brak danych */}
                            {/* Custom Header Actions - nadal dostępne */}
                            {headerActions.map(renderHeaderAction)}

                            {/* View Toggle Controls */}
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
                        </HeaderActionsContainer>
                    </HeaderRight>
                </TableHeader>

                {/* Expandable Content - dostępny nawet przy pustych danych */}
                {expandableContent && (
                    <ExpandableContent $visible={expandableVisible}>
                        {expandableContent}
                    </ExpandableContent>
                )}

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
                <HeaderLeft>
                    <TableTitle>{title} ({data.length})</TableTitle>
                </HeaderLeft>

                <HeaderRight>
                    <HeaderActionsContainer>
                        {/* Select All Component */}
                        {renderSelectAll()}

                        {/* Custom Header Actions */}
                        {headerActions.map(renderHeaderAction)}

                        {/* View Toggle Controls */}
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
                    </HeaderActionsContainer>
                </HeaderRight>
            </TableHeader>

            {/* Expandable Content */}
            {expandableContent && (
                <ExpandableContent $visible={expandableVisible}>
                    {expandableContent}
                </ExpandableContent>
            )}

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