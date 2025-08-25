import React from 'react';
import styled from 'styled-components';
import {FaAngleDoubleLeft, FaAngleDoubleRight, FaChevronLeft, FaChevronRight} from 'react-icons/fa';

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
    // Nie wyświetlaj paginacji, jeśli mamy tylko 1 stronę
    if (totalPages <= 1) return null;

    // Logika do wyświetlania odpowiedniej liczby przycisków strony
    const renderPageButtons = () => {
        const buttons: JSX.Element[] = [];

        // Maksymalna liczba przycisków stron do wyświetlenia (bez pierwszej, ostatniej, i przycisków "...")
        const maxVisiblePages = 5;

        // Zawsze pokazuj pierwszą stronę
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

        // Oblicz zakres stron do wyświetlenia
        let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        // Dostosuj początek, jeśli mamy za mało stron na końcu
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(2, endPage - maxVisiblePages + 1);
        }

        // Dodaj "..." po pierwszej stronie, jeśli potrzeba
        if (startPage > 2) {
            buttons.push(
                <EllipsisSpan key="ellipsis-start">...</EllipsisSpan>
            );
        }

        // Dodaj przyciski numeryczne
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

        // Dodaj "..." przed ostatnią stroną, jeśli potrzeba
        if (endPage < totalPages - 1) {
            buttons.push(
                <EllipsisSpan key="ellipsis-end">...</EllipsisSpan>
            );
        }

        // Zawsze pokazuj ostatnią stronę, jeśli jest więcej niż jedna strona
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

    // Obliczenie zakresu wyświetlanych elementów
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
    margin-top: 20px;
    flex-wrap: wrap;
    gap: 16px;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
    }
`;

const ItemsInfo = styled.div`
    color: #7f8c8d;
    font-size: 14px;
`;

const PaginationControls = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const PageButton = styled.button<{ active?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: ${props => props.active ? '600' : '400'};
    cursor: ${props => props.disabled ? 'default' : 'pointer'};
    background-color: ${props => props.active ? '#3498db' : 'white'};
    color: ${props => props.active ? 'white' : '#34495e'};
    border: 1px solid ${props => props.active ? '#3498db' : '#dfe6e9'};
    transition: all 0.2s;
    
    &:hover:not(:disabled) {
        background-color: ${props => props.active ? '#3498db' : '#f8f9fa'};
    }
    
    &:disabled {
        opacity: ${props => props.active ? 1 : 0.5};
    }
`;

const EllipsisSpan = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    color: #7f8c8d;
`;

export default Pagination;