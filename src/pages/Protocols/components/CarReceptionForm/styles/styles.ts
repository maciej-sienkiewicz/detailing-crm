import styled from 'styled-components';

// Container styles
export const FormContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 20px;
    max-width: 100%;

    @media (max-width: 768px) {
        border-radius: 6px;
    }
`;

export const FormHeader = styled.div`
    padding: 16px 20px;
    border-bottom: 1px solid #eee;

    h2 {
        margin: 0;
        font-size: 18px;
        color: #34495e;
    }

    @media (max-width: 576px) {
        padding: 12px 15px;

        h2 {
            font-size: 16px;
        }
    }
`;

export const Form = styled.form`
    padding: 20px;

    @media (max-width: 576px) {
        padding: 15px 10px;
    }
`;

// Section styles
export const FormSection = styled.section`
    margin-bottom: 30px;

    @media (max-width: 576px) {
        margin-bottom: 25px;
    }
`;

export const SectionTitle = styled.h3`
    font-size: 16px;
    color: #3498db;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;

    @media (max-width: 576px) {
        font-size: 15px;
        margin-bottom: 12px;
    }
`;

// Form row and group styles
export const FormRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 15px;

    &.responsive-row {
        @media (max-width: 768px) {
            flex-direction: column;
            gap: 15px;
        }
    }

    &.checkbox-row {
        @media (max-width: 576px) {
            flex-direction: column;
            align-items: flex-start;
        }
    }
`;

export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 200px;

    @media (max-width: 768px) {
        min-width: 100%;
    }

    &.date-time-group {
        flex: 3;
        @media (max-width: 768px) {
            flex: 1;
        }
    }
`;

// Nowy kontener dla pól daty i czasu
export const DateTimeContainer = styled.div`
    display: flex;
    gap: 10px;

    @media (max-width: 576px) {
        flex-direction: column;
        gap: 8px;
    }
`;

// Input styles
export const Label = styled.label`
    font-weight: 500;
    font-size: 14px;
    color: #333;
    margin-bottom: 6px;
`;

export const Input = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;

    &.time-input {
        width: 100px;

        @media (max-width: 576px) {
            width: 100%;
        }
    }

    &.date-input {
        flex: 1;
    }

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

export const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

export const Textarea = styled.textarea`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

// Checkbox styles
export const CheckboxGroup = styled.div`
    display: flex;
    align-items: center;
    margin-right: 20px;

    @media (max-width: 576px) {
        margin-right: 0;
        margin-bottom: 10px;
        width: 100%;
    }
`;

export const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #34495e;
    cursor: pointer;
`;

export const Checkbox = styled.input`
    margin-right: 8px;
    cursor: pointer;
`;

// Search styles
export const SearchContainer = styled.div`
    display: flex;
    margin-bottom: 20px;
    gap: 15px;
    align-items: flex-start;

    @media (max-width: 768px) {
        flex-direction: column;
    }

    @media (max-width: 576px) {
        gap: 10px;
    }
`;

export const SearchInputGroup = styled.div`
    position: relative;
    flex: 1;
`;

export const SearchInputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

export const SearchIcon = styled.div`
    position: absolute;
    left: 12px;
    color: #95a5a6;
    font-size: 14px;
`;

export const SearchInput = styled.input`
    padding: 10px 12px 10px 36px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

export const SearchResultsList = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 5;
    max-height: 200px;
    overflow-y: auto;
`;

export const SearchResultItem = styled.div`
    padding: 10px 15px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;

    &:not(:last-child) {
        border-bottom: 1px solid #eee;
    }

    &:hover {
        background-color: #f5f5f5;
    }
`;

export const SearchResultPrice = styled.div`
    font-weight: 500;
    color: #3498db;
`;

export const AddServiceButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 15px;
    font-size: 14px;
    cursor: pointer;

    &:hover:not(:disabled) {
        background-color: #2980b9;
    }

    &:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
        opacity: 0.7;
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

// Services table styles
export const ServicesTableContainer = styled.div`
    margin-top: 10px;
    overflow-x: auto;

    @media (max-width: 576px) {
        margin-left: -10px;
        margin-right: -10px;
        width: calc(100% + 20px);
    }
`;

export const ServicesTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;

    @media (max-width: 480px) {
        font-size: 12px;
    }
`;

export const TableHeader = styled.th`
    text-align: left;
    padding: 12px;
    background-color: #f5f5f5;
    border-bottom: 2px solid #eee;
    font-weight: 600;
    color: #333;

    @media (max-width: 768px) {
        padding: 10px 8px;
        font-size: 13px;
    }

    @media (max-width: 480px) {
        padding: 8px 5px;
        font-size: 12px;
    }
`;

export const TableCell = styled.td`
    padding: 12px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;

    @media (max-width: 768px) {
        padding: 8px;
        font-size: 13px;
    }

    @media (max-width: 480px) {
        padding: 6px 5px;
        font-size: 12px;
    }
`;

export const TableFooterCell = styled.td`
    padding: 12px;
    font-weight: 600;
    background-color: #f9f9f9;
    border-top: 2px solid #eee;

    @media (max-width: 768px) {
        padding: 10px 8px;
    }
`;

export const DiscountContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 220px;
    min-width: 220px;

    @media (max-width: 768px) {
        width: 180px;
        min-width: 180px;
    }

    @media (max-width: 576px) {
        width: 160px;
        min-width: 160px;
    }

    @media (max-width: 480px) {
        width: 100%;
        min-width: 100px;
    }
`;

export const DiscountInputGroup = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    gap: 4px;

    @media (max-width: 480px) {
        flex-direction: column;
        gap: 5px;
    }
`;

export const DiscountInput = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    width: 80px;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    &[type=number] {
        -moz-appearance: textfield;
    }

    @media (max-width: 768px) {
        width: 60px;
        padding: 6px 8px;
    }

    @media (max-width: 480px) {
        width: 100%;
    }
`;

export const DiscountTypeSelect = styled.select`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    background-color: white;
    flex: 1;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    @media (max-width: 768px) {
        padding: 6px 8px;
        font-size: 12px;
    }

    @media (max-width: 480px) {
        width: 100%;
    }
`;

export const DiscountPercentage = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 4px;
    text-align: right;

    @media (max-width: 768px) {
        font-size: 11px;
    }
`;

export const ActionButton = styled.button`
    background: none;
    border: none;
    color: #e74c3c;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
        background-color: #fdecea;
    }

    @media (max-width: 480px) {
        font-size: 14px;
        padding: 3px;
    }
`;

export const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;

    @media (max-width: 576px) {
        flex-direction: column-reverse;
        gap: 10px;
    }
`;

export const Button = styled.button<{ primary?: boolean; secondary?: boolean }>`
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    width: auto;

    ${props => props.primary && `
    background-color: #3498db;
    color: white;
    border: 1px solid #3498db;
    
    &:hover:not(:disabled) {
      background-color: #2980b9;
      border-color: #2980b9;
    }
    
    &:disabled {
      background-color: #95a5a6;
      border-color: #95a5a6;
      cursor: not-allowed;
      opacity: 0.7;
    }
  `}

    ${props => props.secondary && `
    background-color: white;
    color: #333;
    border: 1px solid #ddd;
    
    &:hover {
      background-color: #f5f5f5;
    }
  `}

    @media (max-width: 576px) {
    width: 100%;
    padding: 12px 20px;
    min-height: 44px;
}
`;

export const ErrorMessage = styled.div`
    background-color: #fdecea;
    color: #e74c3c;
    padding: 12px 20px;
    margin: 0 20px 20px;
    border-radius: 4px;

    @media (max-width: 576px) {
        margin: 0 10px 15px;
        padding: 10px 15px;
    }
`;

export const ErrorText = styled.div`
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
`;

export const AddItemRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #f9f9f9;
    border-top: 1px solid #eee;
`;

export const TotalAmount = styled.div`
    font-size: 14px;
    color: #34495e;
`;

export const TotalValue = styled.span`
    font-weight: 600;
    color: #27ae60;
`;

export const CustomServiceInfo = styled.div`
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 4px;
    font-style: italic;
`;

// Dla SearchField
export const FieldContainer = styled.div`
    width: 100%;

    @media (max-width: 576px) {
        margin-bottom: 5px;
    }
`;

export const InputWithIcon = styled.div`
    position: relative;
    width: 100%;
`;

// Modyfikacja dialoga walidacji
export const ConfirmationDialog = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const DialogContent = styled.div`
    background-color: white;
    padding: 25px;
    border-radius: 6px;
    width: 450px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

    @media (max-width: 576px) {
        width: 90%;
        padding: 20px;
        max-height: 80vh;
        overflow-y: auto;
    }
`;

export const DialogTitle = styled.h3`
    margin-top: 0;
    margin-bottom: 15px;
    color: #e74c3c;
    font-size: 18px;

    @media (max-width: 576px) {
        font-size: 16px;
    }
`;

export const DialogText = styled.p`
    margin-bottom: 20px;
    line-height: 1.5;
    color: #333;

    @media (max-width: 576px) {
        font-size: 14px;
    }
`;

export const DialogActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    @media (max-width: 576px) {
        flex-direction: column-reverse;
    }
`;