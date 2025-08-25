import React, {useState} from 'react';
import {FaArrowLeft, FaArrowRight, FaExclamationTriangle, FaFilter, FaUsers} from 'react-icons/fa';
import {ClientFilters} from '../campaign-filters/ClientFilters';
import {VehicleFilters} from '../campaign-filters/VehicleFilters';
import {FinancialFilters} from '../campaign-filters/FinancialFilters';
import {ServiceFilters} from '../campaign-filters/ServiceFilters';
import {FilterPreview} from '../campaign-filters/FilterPreview';
import {RecipientsList} from '../campaign-common/RecipientsList';
import {
    ApplyFiltersButton,
    FilterTabButton,
    FilterTabs,
    FormSection,
    LoadingContainer,
    LoadingSpinner,
    NoRecipientsMessage,
    PrimaryButton,
    RecipientCount,
    RecipientPreviewToggle,
    RecipientsInfo,
    SecondaryButton,
    SectionTitle,
    StepActions,
    StepContainer,
    StepNumber,
    StepTitle
} from '../campaign-common/styled/LayoutComponents';
import {ClientExpanded} from "../../../../../types";

interface Step2RecipientsProps {
    recipientFilters: any;
    onFilterChange: (name: string, value: any) => void;
    applyFilters: () => void;
    selectedRecipients: string[];
    recipientPreview: ClientExpanded[];
    isLoading: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

/**
 * Drugi krok kreatora kampanii SMS - wybór odbiorców z rozszerzonymi filtrami
 */
const Step2Recipients: React.FC<Step2RecipientsProps> = ({
                                                             recipientFilters,
                                                             onFilterChange,
                                                             applyFilters,
                                                             selectedRecipients,
                                                             recipientPreview,
                                                             isLoading,
                                                             onPrevious,
                                                             onNext
                                                         }) => {
    const [activeTab, setActiveTab] = useState<'clients' | 'vehicles' | 'financial' | 'services'>('clients');
    const [showRecipientPreview, setShowRecipientPreview] = useState(false);

    // Obsługa zmiany zakładki filtrów
    const handleTabChange = (tab: 'clients' | 'vehicles' | 'financial' | 'services') => {
        setActiveTab(tab);
    };

    // Renderowanie aktywnej zakładki z filtrami
    const renderActiveFilterTab = () => {
        switch (activeTab) {
            case 'clients':
                return (
                    <ClientFilters
                        filters={recipientFilters}
                        onFilterChange={onFilterChange}
                    />
                );
            case 'vehicles':
                return (
                    <VehicleFilters
                        filters={recipientFilters}
                        onFilterChange={onFilterChange}
                    />
                );
            case 'financial':
                return (
                    <FinancialFilters
                        filters={recipientFilters}
                        onFilterChange={onFilterChange}
                    />
                );
            case 'services':
                return (
                    <ServiceFilters
                        filters={recipientFilters}
                        onFilterChange={onFilterChange}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <StepContainer>
            <StepTitle>
                <StepNumber>1</StepNumber>
                <StepNumber active>2</StepNumber>
                Wybór odbiorców
            </StepTitle>

            <FormSection>
                <SectionTitle>Filtry odbiorców</SectionTitle>

                {/* Zakładki z filtrami */}
                <FilterTabs>
                    <FilterTabButton
                        active={activeTab === 'clients'}
                        onClick={() => handleTabChange('clients')}
                    >
                        Dane klientów
                    </FilterTabButton>
                    <FilterTabButton
                        active={activeTab === 'vehicles'}
                        onClick={() => handleTabChange('vehicles')}
                    >
                        Pojazdy
                    </FilterTabButton>
                    <FilterTabButton
                        active={activeTab === 'financial'}
                        onClick={() => handleTabChange('financial')}
                    >
                        Finanse
                    </FilterTabButton>
                    <FilterTabButton
                        active={activeTab === 'services'}
                        onClick={() => handleTabChange('services')}
                    >
                        Usługi
                    </FilterTabButton>
                </FilterTabs>

                {/* Wyświetlenie aktywnej zakładki z filtrami */}
                {renderActiveFilterTab()}

                {/* Podgląd aktywnych filtrów */}
                <FilterPreview filters={recipientFilters} />

                <ApplyFiltersButton onClick={applyFilters}>
                    <FaFilter /> Zastosuj filtry
                </ApplyFiltersButton>
            </FormSection>

            {/* Sekcja wyników */}
            <FormSection>
                <SectionTitle>Odbiorcy kampanii</SectionTitle>

                {isLoading ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <span>Ładowanie danych klientów...</span>
                    </LoadingContainer>
                ) : (
                    <>
                        <RecipientsInfo>
                            <RecipientCount>
                                <FaUsers /> Liczba odbiorców: <strong>{selectedRecipients.length}</strong>
                            </RecipientCount>

                            <RecipientPreviewToggle
                                onClick={() => setShowRecipientPreview(!showRecipientPreview)}
                            >
                                {showRecipientPreview ? 'Ukryj podgląd odbiorców' : 'Pokaż podgląd odbiorców'}
                            </RecipientPreviewToggle>
                        </RecipientsInfo>

                        {/* Lista odbiorców */}
                        {showRecipientPreview && (
                            <RecipientsList
                                recipients={recipientPreview}
                                totalCount={selectedRecipients.length}
                            />
                        )}

                        {selectedRecipients.length === 0 && (
                            <NoRecipientsMessage>
                                <FaExclamationTriangle />
                                Nie wybrano żadnych odbiorców. Użyj filtrów aby wybrać odbiorców kampanii.
                            </NoRecipientsMessage>
                        )}
                    </>
                )}
            </FormSection>

            <StepActions>
                <SecondaryButton onClick={onPrevious}>
                    <FaArrowLeft /> Wstecz
                </SecondaryButton>
                <PrimaryButton
                    onClick={onNext}
                    disabled={selectedRecipients.length === 0}
                >
                    Dalej <FaArrowRight />
                </PrimaryButton>
            </StepActions>
        </StepContainer>
    );
};

export default Step2Recipients;