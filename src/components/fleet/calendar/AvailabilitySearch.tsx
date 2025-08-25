// src/components/fleet/calendar/AvailabilitySearch.tsx
import React from 'react';
import styled from 'styled-components';
import {FaCalendarCheck, FaSearch} from 'react-icons/fa';
import {format} from 'date-fns';

interface AvailabilitySearchProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onCheckAvailability: () => void;
    isSearching: boolean;
}

const AvailabilitySearch: React.FC<AvailabilitySearchProps> = ({
                                                                   startDate,
                                                                   endDate,
                                                                   onStartDateChange,
                                                                   onEndDateChange,
                                                                   onCheckAvailability,
                                                                   isSearching
                                                               }) => {
    return (
        <SearchPanel>
            <SearchTitle>
                <FaCalendarCheck />
                <span>Szybkie wyszukiwanie dostępności</span>
            </SearchTitle>

            <SearchForm>
                <DateInputGroup>
                    <DateInputLabel>Data rozpoczęcia</DateInputLabel>
                    <DateInput
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                    />
                </DateInputGroup>

                <DateInputGroup>
                    <DateInputLabel>Data zakończenia</DateInputLabel>
                    <DateInput
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        min={startDate}
                    />
                </DateInputGroup>

                <SearchButton onClick={onCheckAvailability} disabled={isSearching}>
                    {isSearching ? (
                        <>
                            <SearchSpinner />
                            <span>Szukam...</span>
                        </>
                    ) : (
                        <>
                            <FaSearch />
                            <span>Sprawdź dostępność</span>
                        </>
                    )}
                </SearchButton>
            </SearchForm>
        </SearchPanel>
    );
};

const SearchPanel = styled.div`
  background: linear-gradient(135deg, #f5f7fa, #eaedf3);
  border-radius: 14px;
  padding: 22px;
  margin-bottom: 28px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  border: 1px solid #e1e8ed;
`;

const SearchTitle = styled.h2`
  display: flex;
  align-items: center;
  font-size: 18px;
  color: #2c3e50;
  margin: 0 0 18px 0;
  gap: 10px;
  font-weight: 600;

  svg {
    color: #3498db;
  }
`;

const SearchForm = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 14px;
  }
`;

const DateInputGroup = styled.div`
  flex: 1;
`;

const DateInputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #34495e;
  font-weight: 500;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #dde2e8;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 200px;
  padding: 12px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);

  &:hover:not(:disabled) {
    background-color: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default AvailabilitySearch;