import React from 'react';
import styled from 'styled-components';
import {FaAngleDoubleLeft, FaAngleDoubleRight, FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import {theme} from "../../styles/theme";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    pageSize?: number;
    showTotalItems?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
                                                   currentPage,
                                                   totalPages,
                                                   onPageChange,
                                                   totalItems,
                                                   pageSize,
                                                   showTotalItems = true
                                               }) => {
    if (totalPages <= 1) return null;

    const renderPageButtons = () => {
        const buttons: JSX.Element[] = [];
        const maxVisiblePages = 5;

        buttons.push(
            <PageButton
                key="first"
                onClick={() => onPageChange(1)}
                active={currentPage === 1}
                disabled={currentPage === 1}
            >
                1
            </PageButton>
        );

        let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(2, endPage - maxVisiblePages + 1);
        }

        if (startPage > 2) {
            buttons.push(
                <EllipsisSpan key="ellipsis-start">...</EllipsisSpan>
            );
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <PageButton
                    key={i}
                    onClick={() => onPageChange(i)}
                    active={currentPage === i}
                    disabled={currentPage === i}
                >
                    {i}
                </PageButton>
            );
        }

        if (endPage < totalPages - 1) {
            buttons.push(
                <EllipsisSpan key="ellipsis-end">...</EllipsisSpan>
            );
        }

        if (totalPages > 1) {
            buttons.push(
                <PageButton
                    key="last"
                    onClick={() => onPageChange(totalPages)}
                    active={currentPage === totalPages}
                    disabled={currentPage === totalPages}
                >
                    {totalPages}
                </PageButton>
            );
        }

        return buttons;
    };

    const calculateItemRange = () => {
        if (!totalItems || !pageSize) return null;

        const firstItem = (currentPage - 1) * pageSize + 1;
        const lastItem = Math.min(currentPage * pageSize, totalItems);

        return `${firstItem}-${lastItem} z ${totalItems}`;
    };

    return (
        <PaginationContainer>
            {showTotalItems && totalItems && pageSize && (
                <ItemsInfo>
                    Wyświetlanie {calculateItemRange()} elementów
                </ItemsInfo>
            )}

            <PaginationControls>
                <PageButton
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    title="Pierwsza strona"
                >
                    <FaAngleDoubleLeft />
                </PageButton>

                <PageButton
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Poprzednia strona"
                >
                    <FaChevronLeft />
                </PageButton>

                {renderPageButtons()}

                <PageButton
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Następna strona"
                >
                    <FaChevronRight />
                </PageButton>

                <PageButton
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Ostatnia strona"
                >
                    <FaAngleDoubleRight />
                </PageButton>
            </PaginationControls>
        </PaginationContainer>
    );
};

const PaginationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: ${theme.spacing.lg};
    flex-wrap: wrap;
    gap: ${theme.spacing.md};
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
    }
`;

const ItemsInfo = styled.div`
    color: ${theme.text.tertiary};
    font-size: ${theme.fontSize.base};
    font-weight: 500;
`;

const PaginationControls = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

const PageButton = styled.button<{ active?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 ${theme.spacing.sm};
    border-radius: ${theme.radius.sm};
    font-size: ${theme.fontSize.base};
    font-weight: ${props => props.active ? '600' : '500'};
    cursor: ${props => props.disabled ? 'default' : 'pointer'};
    background-color: ${props => props.active ? theme.primary : theme.surface};
    color: ${props => props.active ? 'white' : theme.text.secondary};
    border: 1px solid ${props => props.active ? theme.primary : theme.border};
    transition: all ${theme.transitions.normal};
    
    &:hover:not(:disabled) {
        background-color: ${props => props.active ? theme.primaryDark : theme.surfaceHover};
        border-color: ${props => props.active ? theme.primaryDark : theme.borderActive};
        transform: translateY(-1px);
    }
    
    &:disabled {
        opacity: ${props => props.active ? 1 : 0.5};
    }
`;

const EllipsisSpan = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    color: ${theme.text.muted};
    font-size: ${theme.fontSize.base};
`;

export default Pagination;