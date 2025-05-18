import styled from 'styled-components';

/**
 * Komponenty formularza używane w filtrach kampanii SMS
 * Te styled components zapewniają spójny wygląd w całej aplikacji
 */

// Kontener dla siatki filtrów
export const FilterGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
`;

// Grupa formularza
export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

// Etykieta pola formularza
export const FormLabel = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: #495057;
`;

// Pole tekstowe
export const FormInput = styled.input`
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.2s;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    &:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
    }
`;

// Pole select
export const FormSelect = styled.select`
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    background-color: white;
    transition: border-color 0.2s;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    &:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
    }
`;

// Pole textarea
export const FormTextarea = styled.textarea`
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.2s;
    resize: vertical;
    min-height: 100px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

// Tekst pomocniczy
export const FormHelp = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

// Kontener dla checkboxa z etykietą
export const FormCheckboxWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
`;

// Checkbox
export const FormCheckbox = styled.input`
    width: 16px;
    height: 16px;
    cursor: pointer;
`;

// Etykieta checkbox
export const FormCheckboxLabel = styled.label`
    font-size: 14px;
    color: #495057;
    cursor: pointer;
`;

// Grupa checkboxów
export const CheckboxGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 10px;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #a1a1a1;
    }
`;

// Kontener dla slidera zakresu
export const FormRangeContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

// Slider zakresu
export const FormRangeInput = styled.input`
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #e9ecef;
    outline: none;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #3498db;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
            background: #2980b9;
        }
    }

    &::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #3498db;
        cursor: pointer;
        transition: background 0.2s;
        border: none;

        &:hover {
            background: #2980b9;
        }
    }
`;

// Wartość zakresu
export const FormRangeValue = styled.div`
    font-size: 14px;
    color: #495057;
`;

// Przełącznik (toggle)
export const FormToggleWrapper = styled.label`
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
`;

export const FormToggleInput = styled.input`
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + span {
        background-color: #3498db;
    }

    &:checked + span:before {
        transform: translateX(26px);
    }

    &:focus + span {
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

export const FormToggleSlider = styled.span`
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ced4da;
    transition: 0.4s;
    border-radius: 24px;

    &:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
    }
`;

// Radio button
export const FormRadioWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
`;

export const FormRadio = styled.input`
    width: 16px;
    height: 16px;
    cursor: pointer;
`;

export const FormRadioLabel = styled.label`
    font-size: 14px;
    color: #495057;
    cursor: pointer;
`;

// Grupa radio buttonów
export const RadioGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

// Etykieta dla pola wymaganego
export const RequiredLabel = styled.span`
    color: #e74c3c;
    margin-left: 4px;
`;

export default {
    FilterGrid,
    FormGroup,
    FormLabel,
    FormInput,
    FormSelect,
    FormTextarea,
    FormHelp,
    FormCheckboxWrapper,
    FormCheckbox,
    FormCheckboxLabel,
    CheckboxGroup,
    FormRangeContainer,
    FormRangeInput,
    FormRangeValue,
    FormToggleWrapper,
    FormToggleInput,
    FormToggleSlider,
    FormRadioWrapper,
    FormRadio,
    FormRadioLabel,
    RadioGroup,
    RequiredLabel
};