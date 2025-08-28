// src/components/common/DataTable/TableHeader.tsx
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FaGripVertical, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { TableColumn, SortDirection } from './types';
import { HeaderCell, HeaderContent, DragHandle, HeaderLabel, SortIcon } from './components';

const COLUMN_TYPE = 'column';

interface ColumnHeaderProps {
    column: TableColumn;
    index: number;
    moveColumn: (dragIndex: number, hoverIndex: number) => void;
    sortColumn: string | null;
    sortDirection: SortDirection;
    onSort: (columnId: string) => void;
    enableDragAndDrop: boolean;
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = ({
                                                              column,
                                                              index,
                                                              moveColumn,
                                                              sortColumn,
                                                              sortDirection,
                                                              onSort,
                                                              enableDragAndDrop
                                                          }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: COLUMN_TYPE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: enableDragAndDrop,
    });

    const [, drop] = useDrop({
        accept: COLUMN_TYPE,
        hover: (item: any, monitor) => {
            if (!ref.current || !enableDragAndDrop) return;

            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientX = clientOffset!.x - hoverBoundingRect.left;

            if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;
            if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;

            moveColumn(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    if (enableDragAndDrop) {
        drag(drop(ref));
    }

    const handleSort = () => {
        if (column.sortable) {
            onSort(column.id);
        }
    };

    const getSortIcon = () => {
        if (!column.sortable) return null;

        if (sortColumn === column.id) {
            return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    };

    return (
        <HeaderCell
            ref={ref}
            $isDragging={isDragging}
            $width={column.width}
            $sortable={column.sortable}
            onClick={handleSort}
        >
            <HeaderContent>
                {enableDragAndDrop && (
                    <DragHandle>
                        <FaGripVertical />
                    </DragHandle>
                )}
                <HeaderLabel>{column.label}</HeaderLabel>
                {column.sortable && (
                    <SortIcon $active={sortColumn === column.id}>
                        {getSortIcon()}
                    </SortIcon>
                )}
            </HeaderContent>
        </HeaderCell>
    );
};