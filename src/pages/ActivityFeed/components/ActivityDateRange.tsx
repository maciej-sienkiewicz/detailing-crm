import React, { useState } from 'react';
import styled from 'styled-components';
import { format, subDays, isValid } from 'date-fns';
import { pl } from 'date-fns/locale';
import { FaCalendarAlt, FaFileExport, FaChevronDown } from 'react-icons/fa';

interface ActivityDateRangeProps {
    dateRange: {
        startDate: string;
        endDate: string;
    };
    onDateRangeChange: (startDate: string, endDate: string) => void;
}

const ActivityDateRange: React.FC<ActivityDateRangeProps> = ({ dateRange, onDateRangeChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localDateRange, setLocalDateRange] = useState(dateRange);
    const [showExportOptions, setShowExportOptions] = useState(false);

    // Predefiniowane zakresy dat
    const predefinedRanges = [
        { label: 'Dzisiaj', getDates: () => {
                const today = new Date();
                const formattedDate = format(today, 'yyyy-MM-dd');
                return { startDate: formattedDate, endDate: formattedDate };
            }},
        { label: 'Wczoraj', getDates: () => {
                const yesterday = subDays(new Date(), 1);
                const formattedDate = format(yesterday, 'yyyy-MM-dd');
                return { startDate: formattedDate, endDate: formattedDate };
            }},
        { label: 'Ostatnie 7 dni', getDates: () => {
                const today = new Date();
                const sevenDaysAgo = subDays(today, 6);
                return {
                    startDate: format(sevenDaysAgo, 'yyyy-MM-dd'),
                    endDate: format(today, 'yyyy-MM-dd')
                };
            }},
        { label: 'Ostatnie 30 dni', getDates: () => {
                const today = new Date();
                const thirtyDaysAgo = subDays(today, 29);
                return {
                    startDate: format(thirtyDaysAgo, 'yyyy-MM-dd'),
                    endDate: format(today, 'yyyy-MM-dd')
                };
            }}
    ];

    // Obsługa zmiany daty
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Obsługa zastosowania zakresu dat
    const handleApplyRange = () => {
        // Walidacja dat
        const startDate = new Date(localDateRange.startDate);
        const endDate = new Date(localDateRange.endDate);

        if (!isValid(startDate) || !isValid(endDate)) {
            alert('Proszę wprowadzić prawidłowy zakres dat');
            return;
        }

        if (startDate > endDate) {
            alert('Data początkowa nie może być późniejsza niż końcowa');
            return;
        }

        onDateRangeChange(localDateRange.startDate, localDateRange.endDate);
        setIsOpen(false);
    };

    // Obsługa wyboru predefiniowanego zakresu dat
    const handleSelectPredefinedRange = (range: { startDate: string; endDate: string }) => {
        setLocalDateRange(range);
    };

    // Obsługa eksportu danych
    const handleExportData = (format: 'pdf' | 'excel' | 'csv') => {
        // W rzeczywistej aplikacji, tutaj byłoby faktyczne eksportowanie danych
        console.log(`Eksport danych w formacie: ${format}`);
        console.log(`Zakres dat: ${dateRange.startDate} - ${dateRange.endDate}`);

        // Symulacja sukcesu eksportu
        alert(`Eksport danych w formacie ${format.toUpperCase()} rozpoczęty.`);
        setShowExportOptions(false);
    };

    // Formatowanie wyświetlanej daty
    const formatDisplayDate = (dateString: string): string => {
        const date = new Date(dateString);
        if (!isValid(date)) return dateString;
        return format(date, 'd MMMM yyyy', { locale: pl });
    };

    return (
        <DateRangeContainer>
            <DateRangeSelector onClick={() => setIsOpen(!isOpen)}>
                <CalendarIcon>
                    <FaCalendarAlt />
                </CalendarIcon>
                <DateRangeText>
                    {formatDisplayDate(dateRange.startDate)} - {formatDisplayDate(dateRange.endDate)}
                </DateRangeText>
                <DropdownIcon isOpen={isOpen}>
                    <FaChevronDown />
                </DropdownIcon>
            </DateRangeSelector>

            <ExportButton onClick={() => setShowExportOptions(!showExportOptions)}>
                <FaFileExport />
                <span>Eksport</span>
                <DropdownIcon isOpen={showExportOptions}>
                    <FaChevronDown />
                </DropdownIcon>
            </ExportButton>

            {isOpen && (
                <DatePickerDropdown>
                    <PredefinedRanges>
                        <PredefinedRangesTitle>Szybki wybór</PredefinedRangesTitle>
                        <PredefinedRangesList>
                            {predefinedRanges.map((range, index) => (
                                <PredefinedRangeItem
                                    key={index}
                                    onClick={() => handleSelectPredefinedRange(range.getDates())}
                                >
                                    {range.label}
                                </PredefinedRangeItem>
                            ))}
                        </PredefinedRangesList>
                    </PredefinedRanges>

                    <CustomRangePicker>
                        <CustomRangeTitle>Niestandardowy zakres</CustomRangeTitle>
                        <DateInputsContainer>
                            <DateInputGroup>
                                <DateInputLabel>Od:</DateInputLabel>
                                <DateInput
                                    type="date"
                                    name="startDate"
                                    value={localDateRange.startDate}
                                    onChange={handleDateChange}
                                    max={localDateRange.endDate}
                                />
                            </DateInputGroup>

                            <DateInputGroup>
                                <DateInputLabel>Do:</DateInputLabel>
                                <DateInput
                                    type="date"
                                    name="endDate"
                                    value={localDateRange.endDate}
                                    onChange={handleDateChange}
                                    min={localDateRange.startDate}
                                    max={format(new Date(), 'yyyy-MM-dd')} // Max to dzisiaj
                                />
                            </DateInputGroup>
                        </DateInputsContainer>

                        <ApplyButton onClick={handleApplyRange}>
                            Zastosuj
                        </ApplyButton>
                    </CustomRangePicker>
                </DatePickerDropdown>
            )}

            {showExportOptions && (
                <ExportDropdown>
                    <ExportOption onClick={() => handleExportData('pdf')}>
                        Eksport do PDF
                    </ExportOption>
                    <ExportOption onClick={() => handleExportData('excel')}>
                        Eksport do Excel
                    </ExportOption>
                    <ExportOption onClick={() => handleExportData('csv')}>
                        Eksport do CSV
                    </ExportOption>
                </ExportDropdown>
            )}
        </DateRangeContainer>
    );
};

// Styled components
const DateRangeContainer = styled.div`
  display: flex;
  gap: 10px;
  position: relative;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const DateRangeSelector = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  flex: 1;
  
  &:hover {
    border-color: #3498db;
  }
`;

const CalendarIcon = styled.div`
  color: #3498db;
  margin-right: 10px;
`;

const DateRangeText = styled.div`
  flex: 1;
  font-size: 14px;
  color: #34495e;
`;

const DropdownIcon = styled.div<{ isOpen: boolean }>`
  color: #7f8c8d;
  transition: transform 0.2s;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
`;

const ExportButton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f0f7ff;
  color: #3498db;
  border: 1px solid #d5e9f9;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background-color: #d5e9f9;
  }
`;

const DatePickerDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 350px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
  z-index: 10;
  overflow: hidden;
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const PredefinedRanges = styled.div`
  background-color: #f9f9f9;
  padding: 15px;
  border-bottom: 1px solid #eee;
`;

const PredefinedRangesTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #7f8c8d;
  margin-bottom: 10px;
`;

const PredefinedRangesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PredefinedRangeItem = styled.div`
  background-color: white;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  color: #34495e;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f7ff;
    border-color: #d5e9f9;
    color: #3498db;
  }
`;

const CustomRangePicker = styled.div`
  padding: 15px;
`;

const CustomRangeTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #7f8c8d;
  margin-bottom: 10px;
`;

const DateInputsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const DateInputGroup = styled.div`
  flex: 1;
`;

const DateInputLabel = styled.label`
  display: block;
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 5px;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const ApplyButton = styled.button`
  width: 100%;
  padding: 8px 0;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const ExportDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
  z-index: 10;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
    left: 0;
    right: auto;
  }
`;

const ExportOption = styled.div`
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  color: #34495e;
  
  &:hover {
    background-color: #f0f7ff;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;

export default ActivityDateRange;