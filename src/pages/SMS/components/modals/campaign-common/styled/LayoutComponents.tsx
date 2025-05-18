import styled from 'styled-components';

/**
 * Komponenty układu używane w kampanii SMS
 * Te styled components zapewniają spójny wygląd w całej aplikacji
 */

// Kontener kroku
export const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

// Tytuł kroku
export const StepTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
`;

// Numer kroku
export const StepNumber = styled.div<{ active?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: ${({ active }) => active ? '#3498db' : '#e9ecef'};
    color: ${({ active }) => active ? 'white' : '#6c757d'};
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
`;

// Sekcja formularza
export const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
`;

// Tytuł sekcji
export const SectionTitle = styled.h4`
    font-size: 15px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px 0;
`;

// Zakładki filtrów
export const FilterTabs = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    overflow-x: auto;
    padding-bottom: 4px;
    
    &::-webkit-scrollbar {
        height: 4px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #a1a1a1;
    }
    
    @media (max-width: 768px) {
        flex-wrap: nowrap;
    }
`;

// Przycisk zakładki filtrów
export const FilterTabButton = styled.button<{ active?: boolean }>`
    padding: 8px 16px;
    border: 1px solid ${({ active }) => active ? '#3498db' : '#dee2e6'};
    border-radius: 4px;
    background-color: ${({ active }) => active ? '#e3f2fd' : 'white'};
    color: ${({ active }) => active ? '#3498db' : '#6c757d'};
    font-size: 13px;
    font-weight: ${({ active }) => active ? '600' : '400'};
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    
    &:hover:not(:disabled) {
        background-color: ${({ active }) => active ? '#e3f2fd' : '#f8f9fa'};
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// Przycisk aplikowania filtrów
export const ApplyFiltersButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: #f0f9ff;
    border: 1px solid #bee3f8;
    border-radius: 5px;
    color: #3498db;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: #e3f2fd;
    }
`;

// Informacje o odbiorcach
export const RecipientsInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
`;

// Liczba odbiorców
export const RecipientCount = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #2c3e50;
`;

// Przełącznik podglądu odbiorców
export const RecipientPreviewToggle = styled.button`
    background: none;
    border: none;
    color: #3498db;
    font-size: 13px;
    cursor: pointer;
    
    &:hover {
        text-decoration: underline;
    }
`;

// Komunikat o braku odbiorców
export const NoRecipientsMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background-color: #fff8e6;
    border: 1px solid #ffeeba;
    border-radius: 5px;
    color: #856404;
    font-size: 14px;
`;

// Akcje kroku
export const StepActions = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
`;

// Przyciski
export const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export const PrimaryButton = styled(Button)`
    background-color: #3498db;
    border-color: #3498db;
    color: white;

    &:hover:not(:disabled) {
        background-color: #2980b9;
        border-color: #2980b9;
    }
`;

export const SecondaryButton = styled(Button)`
    background-color: #f8f9fa;
    border-color: #dee2e6;
    color: #6c757d;

    &:hover:not(:disabled) {
        background-color: #e9ecef;
    }
`;

export const DangerButton = styled(Button)`
    background-color: #e74c3c;
    border-color: #e74c3c;
    color: white;

    &:hover:not(:disabled) {
        background-color: #c0392b;
        border-color: #c0392b;
    }
`;

// Kontener ładowania
export const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 0;
    color: #6c757d;
    justify-content: center;
`;

// Spinner ładowania
export const LoadingSpinner = styled.div`
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Komponent karty
export const Card = styled.div`
    background-color: white;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    overflow: hidden;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

// Siatka kart
export const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
`;

// Mniejszy padding do zagnieżdzonych elementów
export const InnerSection = styled.div`
    padding: 12px;
    background-color: white;
    border-radius: 6px;
    border: 1px solid #e9ecef;
`;

export default {
    StepContainer,
    StepTitle,
    StepNumber,
    FormSection,
    SectionTitle,
    FilterTabs,
    FilterTabButton,
    ApplyFiltersButton,
    RecipientsInfo,
    RecipientCount,
    RecipientPreviewToggle,
    NoRecipientsMessage,
    StepActions,
    Button,
    PrimaryButton,
    SecondaryButton,
    DangerButton,
    LoadingContainer,
    LoadingSpinner,
    Card,
    CardGrid,
    InnerSection
};