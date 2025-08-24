import React from 'react';
import { FaUsers, FaCheckSquare, FaSquare, FaSms, FaTimes } from 'react-icons/fa';
import { TooltipWrapper } from '../components/ClientListTable/styles/components';
import { ClientFilters, ClientStats } from './types';
import { ClientExpanded } from '../../../types';
import { useFormatters } from './hooks';
import {
    StatsSection,
    StatsGrid,
    StatCard,
    StatIcon,
    StatContent,
    StatValue,
    StatLabel,
    SelectionBar,
    SelectAllCheckbox,
    SelectionInfo,
    SearchResultsInfo,
    SearchIcon,
    SearchText,
    SearchSubtext,
    LoadingContainer,
    LoadingSpinner,
    LoadingText,
    EmptyStateContainer,
    EmptyStateIcon,
    EmptyStateTitle,
    EmptyStateDescription,
    EmptyStateAction,
    PaginationContainer,
    BulkSmsContent,
    BulkSmsHeader,
    BulkSmsIcon,
    BulkSmsInfo,
    BulkSmsTitle,
    BulkSmsSubtitle,
    SmsFormSection,
    SmsFormGroup,
    SmsLabel,
    SmsTextarea,
    SmsCharacterCounter,
    BulkSmsActions,
    PrimaryButton,
    SecondaryButton
} from './styles';

interface ClientSelectionBarProps {
    clients: ClientExpanded[];
    selectedClientIds: string[];
    selectAll: boolean;
    onToggleSelectAll: () => void;
}

export const ClientSelectionBar: React.FC<ClientSelectionBarProps> = ({
                                                                          clients,
                                                                          selectedClientIds,
                                                                          selectAll,
                                                                          onToggleSelectAll
                                                                      }) => {
    const { formatClientCount } = useFormatters();

    if (clients.length === 0) return null;

    return (
        <SelectionBar>
            <SelectAllCheckbox onClick={onToggleSelectAll}>
                {selectAll ? <FaCheckSquare /> : <FaSquare />}
                <span>
                    Zaznacz wszystkich na stronie ({clients.length})
                </span>
            </SelectAllCheckbox>
            {selectedClientIds.length > 0 && (
                <SelectionInfo>
                    Zaznaczono: {selectedClientIds.length} {formatClientCount(selectedClientIds.length)}
                </SelectionInfo>
            )}
        </SelectionBar>
    );
};

interface SearchResultsDisplayProps {
    hasActiveFilters: boolean;
    totalItems: number;
    onResetFilters: () => void;
}

export const SearchResultsDisplay: React.FC<SearchResultsDisplayProps> = ({
                                                                              hasActiveFilters,
                                                                              totalItems,
                                                                              onResetFilters
                                                                          }) => {
    const { formatClientCount } = useFormatters();

    if (!hasActiveFilters) return null;

    return (
        <SearchResultsInfo>
            <SearchIcon>🔍</SearchIcon>
            <SearchText>
                Znaleziono {totalItems} {formatClientCount(totalItems)} spełniających kryteria wyszukiwania
            </SearchText>
            {totalItems === 0 && (
                <SearchSubtext>
                    Spróbuj zmienić kryteria wyszukiwania lub wyczyść filtry
                </SearchSubtext>
            )}
        </SearchResultsInfo>
    );
};

interface LoadingDisplayProps {
    hasActiveFilters: boolean;
}

export const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ hasActiveFilters }) => (
    <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>
            {hasActiveFilters ? 'Wyszukiwanie klientów...' : 'Ładowanie danych klientów...'}
        </LoadingText>
    </LoadingContainer>
);

interface EmptyStateDisplayProps {
    hasActiveFilters: boolean;
    onResetFilters: () => void;
}

export const EmptyStateDisplay: React.FC<EmptyStateDisplayProps> = ({
                                                                        hasActiveFilters,
                                                                        onResetFilters
                                                                    }) => (
    <EmptyStateContainer>
        <EmptyStateIcon>
            {hasActiveFilters ? '🔍' : '👥'}
        </EmptyStateIcon>
        <EmptyStateTitle>
            {hasActiveFilters ? 'Brak wyników' : 'Brak klientów'}
        </EmptyStateTitle>
        <EmptyStateDescription>
            {hasActiveFilters
                ? 'Nie znaleziono klientów spełniających podane kryteria'
                : 'Nie znaleziono żadnych klientów w bazie danych'
            }
        </EmptyStateDescription>
        {hasActiveFilters && (
            <EmptyStateAction onClick={onResetFilters}>
                Wyczyść filtry
            </EmptyStateAction>
        )}
    </EmptyStateContainer>
);

interface BulkSmsModalContentProps {
    selectedClientIds: string[];
    bulkSmsText: string;
    onTextChange: (text: string) => void;
    onSend: () => void;
    onCancel: () => void;
}

export const BulkSmsModalContent: React.FC<BulkSmsModalContentProps> = ({
                                                                            selectedClientIds,
                                                                            bulkSmsText,
                                                                            onTextChange,
                                                                            onSend,
                                                                            onCancel
                                                                        }) => {
    const { formatClientCount } = useFormatters();

    return (
        <BulkSmsContent>
            <BulkSmsHeader>
                <BulkSmsIcon>
                    <FaSms />
                </BulkSmsIcon>
                <BulkSmsInfo>
                    <BulkSmsTitle>
                        Wysyłanie SMS do {selectedClientIds.length} {formatClientCount(selectedClientIds.length)}
                    </BulkSmsTitle>
                    <BulkSmsSubtitle>
                        Wiadomość zostanie wysłana do wszystkich zaznaczonych klientów
                    </BulkSmsSubtitle>
                </BulkSmsInfo>
            </BulkSmsHeader>

            <SmsFormSection>
                <SmsFormGroup>
                    <SmsLabel>Treść wiadomości SMS:</SmsLabel>
                    <SmsTextarea
                        value={bulkSmsText}
                        onChange={(e) => onTextChange(e.target.value)}
                        placeholder="Wprowadź treść wiadomości SMS..."
                        rows={5}
                        maxLength={160}
                    />
                    <SmsCharacterCounter $nearLimit={bulkSmsText.length > 140}>
                        {bulkSmsText.length}/160 znaków
                        {bulkSmsText.length > 140 && (
                            <span> - Zbliżasz się do limitu!</span>
                        )}
                    </SmsCharacterCounter>
                </SmsFormGroup>
            </SmsFormSection>

            <BulkSmsActions>
                <SecondaryButton onClick={onCancel}>
                    Anuluj
                </SecondaryButton>
                <PrimaryButton
                    onClick={onSend}
                    disabled={bulkSmsText.trim() === ''}
                >
                    Wyślij SMS ({selectedClientIds.length})
                </PrimaryButton>
            </BulkSmsActions>
        </BulkSmsContent>
    );
};