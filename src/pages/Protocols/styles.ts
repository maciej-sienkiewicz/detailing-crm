import styled from 'styled-components';
import { ProtocolStatus } from '../../types';

// Główne style strony
export const PageContainer = styled.div`
    padding: 20px;
`;

export const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
        font-size: 24px;
        margin: 0;
    }
`;

export const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
`;

export const BackButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 50%;
    cursor: pointer;
    color: #34495e;

    &:hover {
        background-color: #f0f0f0;
    }
`;

export const AddButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background-color: #2980b9;
    }
`;

// Style dla wiadomości
export const LoadingMessage = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px;
    font-size: 16px;
    color: #7f8c8d;
`;

export const ErrorMessage = styled.div`
    background-color: #fdecea;
    color: #e74c3c;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 20px;
`;

export const EmptyState = styled.div`
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 30px;
    text-align: center;
    color: #7f8c8d;
`;

// Style dla filtrów
export const FilterButtons = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
`;

export const FilterButton = styled.button<{ active: boolean }>`
    padding: 8px 16px;
    background-color: ${props => props.active ? '#3498db' : '#f8f9fa'};
    color: ${props => props.active ? 'white' : '#333'};
    border: 1px solid ${props => props.active ? '#2980b9' : '#ddd'};
    border-radius: 4px;
    font-weight: ${props => props.active ? '500' : 'normal'};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: ${props => props.active ? '#2980b9' : '#f0f0f0'};
    }
`;

// Style dla tabeli protokołów
export const TableContainer = styled.div`
    width: 100%;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

export const TableHeaderContainer = styled.div`
    display: flex;
    width: 100%;
    background-color: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
    min-height: 48px;
`;

export const DraggableHeaderCell = styled.div<{ isDragging?: boolean, width: string }>`
    flex: 0 0 ${props => props.width};
    width: ${props => props.width};
    text-align: left;
    padding: 14px 16px;
    background-color: ${props => props.isDragging ? '#e3f2fd' : '#f5f5f5'};
    color: #34495e;
    font-weight: 600;
    font-size: 14px;
    user-select: none;
    display: flex;
    align-items: center;
    box-shadow: ${props => props.isDragging ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none'};
    transition: all 0.15s ease;
    cursor: grab;
    position: relative;
    z-index: ${props => props.isDragging ? 10 : 1};
    border-right: 1px solid #eee;
    opacity: ${props => props.isDragging ? 0.8 : 1};

    &:last-child {
        border-right: none;
    }

    &:active {
        cursor: grabbing;
    }

    /* Ikona przeciągania */
    &:after {
        content: '⋮⋮';
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        color: #95a5a6;
        opacity: 0;
        transition: opacity 0.2s;
    }

    &:hover:after {
        opacity: 0.7;
    }

    /* Hover style dla elegancji */
    &:hover {
        background-color: ${props => props.isDragging ? '#bbdefb' : '#edf3f8'};
    }
`;

export const TableBody = styled.div`
    width: 100%;
`;

export const TableRow = styled.div`
    display: flex;
    width: 100%;
    border-bottom: 1px solid #eee;
    transition: background-color 0.15s;
    cursor: pointer;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: #f9f9f9;
    }
`;

export const TableCell = styled.div<{ width?: string, colSpan?: number }>`
    flex: ${props => props.colSpan ? `0 0 100%` : `0 0 ${props.width || 'auto'}`};
    width: ${props => props.colSpan ? '100%' : props.width || 'auto'};
    padding: 12px 16px;
    vertical-align: middle;
    display: flex;
    align-items: center;
    text-align: ${props => props.colSpan ? 'center' : 'left'};
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 52px;
`;

export const CarInfo = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;

    strong {
        margin-bottom: 2px;
        color: #34495e;
    }

    span {
        font-size: 13px;
        color: #7f8c8d;
    }
`;

export const DateRange = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
    color: #34495e;
    width: 100%;

    span {
        margin-bottom: 4px;
    }
`;

export const OwnerInfo = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 14px;
    color: #34495e;
    width: 100%;
`;

export const CompanyInfo = styled.div`
    font-size: 13px;
    color: #7f8c8d;
    margin-top: 2px;
`;

export const StatusBadge = styled.div<{ status: ProtocolStatus }>`
    display: inline-block;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => {
        switch (props.status) {
            case ProtocolStatus.SCHEDULED:
                return '#e3f2fd'; // jasny niebieski
            case ProtocolStatus.IN_PROGRESS:
                return '#f3e5f5'; // jasny fioletowy
            case ProtocolStatus.READY_FOR_PICKUP:
                return '#e8f5e9'; // jasny zielony
            case ProtocolStatus.COMPLETED:
                return '#f5f5f5'; // jasny szary
            default:
                return '#f5f5f5';
        }
    }};
    color: ${props => {
        switch (props.status) {
            case ProtocolStatus.SCHEDULED:
                return '#1976d2'; // ciemny niebieski
            case ProtocolStatus.IN_PROGRESS:
                return '#7b1fa2'; // ciemny fioletowy 
            case ProtocolStatus.READY_FOR_PICKUP:
                return '#2e7d32'; // ciemny zielony
            case ProtocolStatus.COMPLETED:
                return '#616161'; // ciemny szary
            default:
                return '#616161';
        }
    }};
    border: 1px solid ${props => {
        switch (props.status) {
            case ProtocolStatus.SCHEDULED:
                return '#bbdefb'; // jaśniejszy niebieski
            case ProtocolStatus.IN_PROGRESS:
                return '#e1bee7'; // jaśniejszy fioletowy
            case ProtocolStatus.READY_FOR_PICKUP:
                return '#c8e6c9'; // jaśniejszy zielony
            case ProtocolStatus.COMPLETED:
                return '#e0e0e0'; // jaśniejszy szary
            default:
                return '#e0e0e0';
        }
    }};
`;

export const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

export const ActionButton = styled.button<{ danger?: boolean }>`
    background: none;
    border: none;
    color: ${props => props.danger ? '#e74c3c' : '#3498db'};
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
        background-color: ${props => props.danger ? '#fdecea' : '#f0f7ff'};
    }
`;