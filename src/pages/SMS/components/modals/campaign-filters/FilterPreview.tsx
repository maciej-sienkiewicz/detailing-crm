import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaFilter, FaInfoCircle } from 'react-icons/fa';

interface FilterPreviewProps {
    filters: any;
}

/**
 * Komponent podglądu zastosowanych filtrów dla kampanii SMS
 * Wyświetla aktywne filtry jako "tagi", co poprawia czytelność i użyteczność
 */
export const FilterPreview: React.FC<FilterPreviewProps> = ({ filters }) => {
    // Sprawdzenie czy filtry są aktywne
    const hasActiveFilters = () => {
        // Sprawdzamy filtry typów klientów
        if (!filters.includeCompanyClients || !filters.includeIndividualClients) return true;

        // Sprawdzamy filtry segmentu
        if (filters.segmentType !== 'all') return true;

        // Sprawdzamy filtry ilościowe
        if (filters.minTotalVisits > 0) return true;
        if (filters.lastVisitDays > 0) return true;

        // Sprawdzamy filtry pojazdów
        if (filters.vehicleMake || filters.vehicleModel) return true;
        if (filters.vehicleYearFrom > 0 || filters.vehicleYearTo > 0) return true;

        // Sprawdzamy filtry finansowe
        if (filters.minTotalRevenue > 0 || filters.maxTotalRevenue > 0) return true;
        if (filters.customerValueSegment) return true;

        // Sprawdzamy filtry usług
        if (filters.lastServiceType) return true;
        if (filters.serviceTypes && filters.serviceTypes.length > 0) return true;

        // Sprawdzamy filtry lokalizacyjne
        if (filters.region || filters.city || filters.postalCode) return true;
        if (filters.distanceFromShop) return true;

        // Sprawdzamy filtry źródła pozyskania
        if (filters.referralSource) return true;
        if (filters.joinDateFrom || filters.joinDateTo) return true;

        return false;
    };

    // Generowanie podglądu filtrów klientów
    const renderClientFilters = () => {
        const clientFilters = [];

        // Typ klienta
        if (!filters.includeCompanyClients && filters.includeIndividualClients) {
            clientFilters.push({ label: 'Tylko klienci indywidualni', key: 'client-type-individual' });
        } else if (filters.includeCompanyClients && !filters.includeIndividualClients) {
            clientFilters.push({ label: 'Tylko klienci firmowi', key: 'client-type-company' });
        }

        // Segment
        if (filters.segmentType === 'active') {
            clientFilters.push({ label: 'Aktywni klienci', key: 'segment-active' });
        } else if (filters.segmentType === 'inactive') {
            clientFilters.push({ label: 'Nieaktywni klienci', key: 'segment-inactive' });
        } else if (filters.segmentType === 'new') {
            clientFilters.push({ label: 'Nowi klienci', key: 'segment-new' });
        } else if (filters.segmentType === 'returning') {
            clientFilters.push({ label: 'Powracający klienci', key: 'segment-returning' });
        }

        // Wizyty
        if (filters.minTotalVisits > 0) {
            clientFilters.push({ label: `Min. ${filters.minTotalVisits} wizyt`, key: 'min-visits' });
        }

        if (filters.lastVisitDays > 0) {
            if (filters.segmentType === 'active') {
                clientFilters.push({ label: `Wizyta w ostatnich ${filters.lastVisitDays} dniach`, key: 'last-visit-active' });
            } else if (filters.segmentType === 'inactive') {
                clientFilters.push({ label: `Bez wizyty od ${filters.lastVisitDays} dni`, key: 'last-visit-inactive' });
            } else {
                clientFilters.push({ label: `Ostatnia wizyta: ${filters.lastVisitDays} dni`, key: 'last-visit-days' });
            }
        }

        // Lokalizacja
        if (filters.region) {
            clientFilters.push({ label: `Woj. ${getRegionLabel(filters.region)}`, key: 'region' });
        }

        if (filters.city) {
            clientFilters.push({ label: `Miasto: ${filters.city}`, key: 'city' });
        }

        if (filters.postalCode) {
            clientFilters.push({ label: `Kod: ${filters.postalCode}`, key: 'postal-code' });
        }

        if (filters.distanceFromShop) {
            clientFilters.push({ label: `Do ${filters.distanceFromShop} km`, key: 'distance' });
        }

        // Źródło pozyskania
        if (filters.referralSource) {
            clientFilters.push({ label: `Źródło: ${getReferralSourceLabel(filters.referralSource)}`, key: 'referral-source' });
        }

        if (filters.joinDateFrom) {
            clientFilters.push({ label: `Dołączył od: ${formatDate(filters.joinDateFrom)}`, key: 'join-date-from' });
        }

        if (filters.joinDateTo) {
            clientFilters.push({ label: `Dołączył do: ${formatDate(filters.joinDateTo)}`, key: 'join-date-to' });
        }

        return clientFilters;
    };

    // Generowanie podglądu filtrów pojazdów
    const renderVehicleFilters = () => {
        const vehicleFilters = [];

        if (filters.vehicleMake) {
            vehicleFilters.push({ label: `Marka: ${filters.vehicleMake}`, key: 'vehicle-make' });
        }

        if (filters.vehicleModel) {
            vehicleFilters.push({ label: `Model: ${filters.vehicleModel}`, key: 'vehicle-model' });
        }

        if (filters.vehicleYearFrom > 0) {
            vehicleFilters.push({ label: `Rocznik od: ${filters.vehicleYearFrom}`, key: 'vehicle-year-from' });
        }

        if (filters.vehicleYearTo > 0) {
            vehicleFilters.push({ label: `Rocznik do: ${filters.vehicleYearTo}`, key: 'vehicle-year-to' });
        }

        return vehicleFilters;
    };

    // Generowanie podglądu filtrów finansowych
    const renderFinancialFilters = () => {
        const financialFilters = [];

        if (filters.minTotalRevenue > 0) {
            financialFilters.push({ label: `Min. wydatki: ${formatMoney(filters.minTotalRevenue)}`, key: 'min-revenue' });
        }

        if (filters.maxTotalRevenue > 0) {
            financialFilters.push({ label: `Max. wydatki: ${formatMoney(filters.maxTotalRevenue)}`, key: 'max-revenue' });
        } else if (filters.maxTotalRevenue === 0 && filters.minTotalRevenue > 0) {
            financialFilters.push({ label: `Wydatki: bez górnego limitu`, key: 'no-max-revenue' });
        }

        if (filters.customerValueSegment) {
            let segmentLabel = '';

            switch (filters.customerValueSegment) {
                case 'vip':
                    segmentLabel = 'VIP';
                    break;
                case 'premium':
                    segmentLabel = 'Premium';
                    break;
                case 'standard':
                    segmentLabel = 'Standard';
                    break;
                case 'economy':
                    segmentLabel = 'Economy';
                    break;
            }

            if (segmentLabel) {
                financialFilters.push({ label: `Segment: ${segmentLabel}`, key: 'value-segment' });
            }
        }

        if (filters.minServiceValue > 0) {
            financialFilters.push({ label: `Min. usługa: ${formatMoney(filters.minServiceValue)}`, key: 'min-service-value' });
        }

        return financialFilters;
    };

    // Generowanie podglądu filtrów usług
    const renderServiceFilters = () => {
        const serviceFilters = [];

        if (filters.lastServiceType) {
            serviceFilters.push({ label: `Ostatnia usługa: ${filters.lastServiceType}`, key: 'last-service' });
        }

        if (filters.daysSinceLastServiceOption) {
            let periodLabel = '';

            switch (filters.daysSinceLastServiceOption) {
                case '30':
                    periodLabel = 'Ostatnie 30 dni';
                    break;
                case '90':
                    periodLabel = 'Ostatnie 3 miesiące';
                    break;
                case '180':
                    periodLabel = 'Ostatnie 6 miesięcy';
                    break;
                case '365':
                    periodLabel = 'Ostatni rok';
                    break;
                case 'over365':
                    periodLabel = 'Ponad rok temu';
                    break;
                case 'custom':
                    periodLabel = `${filters.daysSinceLastService} dni`;
                    break;
            }

            if (periodLabel) {
                serviceFilters.push({ label: `Okres: ${periodLabel}`, key: 'service-period' });
            }
        }

        if (filters.serviceTypes && filters.serviceTypes.length > 0) {
            const count = filters.serviceTypes.length;
            let logic = '';

            switch (filters.serviceFilterLogic) {
                case 'any':
                    logic = 'dowolna z';
                    break;
                case 'all':
                    logic = 'wszystkie z';
                    break;
                case 'none':
                    logic = 'żadna z';
                    break;
                default:
                    logic = 'dowolna z';
            }

            serviceFilters.push({ label: `Usługi: ${logic} (${count})`, key: 'service-types' });
        }

        return serviceFilters;
    };

    // Pomocnicze funkcje formatujące
    const formatMoney = (value: number): string => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " zł";
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    const getRegionLabel = (regionCode: string): string => {
        const regionMap: Record<string, string> = {
            'dolnoslaskie': 'Dolnośląskie',
            'kujawsko-pomorskie': 'Kujawsko-pomorskie',
            'lubelskie': 'Lubelskie',
            'lubuskie': 'Lubuskie',
            'lodzkie': 'Łódzkie',
            'malopolskie': 'Małopolskie',
            'mazowieckie': 'Mazowieckie',
            'opolskie': 'Opolskie',
            'podkarpackie': 'Podkarpackie',
            'podlaskie': 'Podlaskie',
            'pomorskie': 'Pomorskie',
            'slaskie': 'Śląskie',
            'swietokrzyskie': 'Świętokrzyskie',
            'warminsko-mazurskie': 'Warmińsko-mazurskie',
            'wielkopolskie': 'Wielkopolskie',
            'zachodniopomorskie': 'Zachodniopomorskie'
        };

        return regionMap[regionCode] || regionCode;
    };

    const getReferralSourceLabel = (sourceCode: string): string => {
        const sourceMap: Record<string, string> = {
            'regular_customer': 'Stały klient',
            'recommendation': 'Polecenie',
            'search_engine': 'Wyszukiwarka',
            'social_media': 'Media społecznościowe',
            'local_ad': 'Reklama lokalna',
            'other': 'Inne'
        };

        return sourceMap[sourceCode] || sourceCode;
    };

    // Wszystkie aktywne filtry
    const clientFilters = renderClientFilters();
    const vehicleFilters = renderVehicleFilters();
    const financialFilters = renderFinancialFilters();
    const serviceFilters = renderServiceFilters();

    // Sprawdzenie czy mamy aktywne filtry
    const hasFilters = hasActiveFilters();

    if (!hasFilters) {
        return null;
    }

    return (
        <FiltersPreviewContainer>
            <FiltersPreviewHeader>
                <FaFilter /> Aktywne filtry
            </FiltersPreviewHeader>

            <FiltersPreviewContent>
                {clientFilters.length > 0 && (
                    <FilterGroup>
                        <FilterGroupTitle>Klienci</FilterGroupTitle>
                        <FilterTags>
                            {clientFilters.map(filter => (
                                <FilterTag key={filter.key} category="client">
                                    {filter.label}
                                </FilterTag>
                            ))}
                        </FilterTags>
                    </FilterGroup>
                )}

                {vehicleFilters.length > 0 && (
                    <FilterGroup>
                        <FilterGroupTitle>Pojazdy</FilterGroupTitle>
                        <FilterTags>
                            {vehicleFilters.map(filter => (
                                <FilterTag key={filter.key} category="vehicle">
                                    {filter.label}
                                </FilterTag>
                            ))}
                        </FilterTags>
                    </FilterGroup>
                )}

                {financialFilters.length > 0 && (
                    <FilterGroup>
                        <FilterGroupTitle>Finanse</FilterGroupTitle>
                        <FilterTags>
                            {financialFilters.map(filter => (
                                <FilterTag key={filter.key} category="financial">
                                    {filter.label}
                                </FilterTag>
                            ))}
                        </FilterTags>
                    </FilterGroup>
                )}

                {serviceFilters.length > 0 && (
                    <FilterGroup>
                        <FilterGroupTitle>Usługi</FilterGroupTitle>
                        <FilterTags>
                            {serviceFilters.map(filter => (
                                <FilterTag key={filter.key} category="service">
                                    {filter.label}
                                </FilterTag>
                            ))}
                        </FilterTags>
                    </FilterGroup>
                )}
            </FiltersPreviewContent>

            <InfoMessage>
                <FaInfoCircle style={{ marginRight: '5px' }} />
                Kliknij "Zastosuj filtry", aby aktualizować listę odbiorców na podstawie powyższych kryteriów.
            </InfoMessage>
        </FiltersPreviewContainer>
    );
};

// Styled components
const FiltersPreviewContainer = styled.div`
    margin-top: 20px;
    padding: 16px;
    background-color: #f8f9fa;
    border: 1px dashed #ced4da;
    border-radius: 8px;
`;

const FiltersPreviewHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #495057;
    margin-bottom: 12px;
`;

const FiltersPreviewContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const FilterGroupTitle = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #6c757d;
`;

const FilterTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

interface FilterTagProps {
    category: 'client' | 'vehicle' | 'financial' | 'service';
}

const FilterTag = styled.div<FilterTagProps>`
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 12px;
    background-color: ${props => {
        switch (props.category) {
            case 'client':
                return '#e3f2fd'; // Jasnoniebieski
            case 'vehicle':
                return '#e8f5e9'; // Jasnozielony
            case 'financial':
                return '#fff8e1'; // Jasnożółty
            case 'service':
                return '#f3e5f5'; // Jasnofioletowy
            default:
                return '#f5f5f5';
        }
    }};
    color: ${props => {
        switch (props.category) {
            case 'client':
                return '#1976d2'; // Niebieski
            case 'vehicle':
                return '#388e3c'; // Zielony
            case 'financial':
                return '#f57c00'; // Pomarańczowy
            case 'service':
                return '#7b1fa2'; // Fioletowy
            default:
                return '#616161';
        }
    }};
`;

const InfoMessage = styled.div`
    margin-top: 16px;
    font-size: 12px;
    color: #6c757d;
    display: flex;
    align-items: center;
`;

export default FilterPreview;