import styled from 'styled-components';

// Style dla modali

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  
  h2 {
    margin: 0;
    font-size: 18px;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  
  &:hover {
    color: #34495e;
  }
`;

export const ModalBody = styled.div`
  padding: 20px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FormRow = styled.div`
  display: flex;
  gap: 16px;
  
  > ${FormGroup} {
    flex: 1;
  }
`;

export const Label = styled.label`
  font-weight: 500;
  font-size: 14px;
  color: #333;
`;

export const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
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

export const ColorPickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ColorPreview = styled.div<{ color: string }>`
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: 1px solid #ddd;
`;

export const ColorInput = styled.input`
  width: 40px;
  height: 40px;
  border: none;
  padding: 0;
  background: none;
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`;

export const FileUploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #f0f7ff;
  color: #3498db;
  border: 1px solid #d5e9f9;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #d5e9f9;
  }
`;

export const FileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0.1px;
  height: 0.1px;
`;

export const HelpText = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 4px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
`;

export const Button = styled.button<{ primary?: boolean; secondary?: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  
  ${props => props.primary && `
    background-color: #3498db;
    color: white;
    border: 1px solid #3498db;
    
    &:hover {
      background-color: #2980b9;
      border-color: #2980b9;
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
`;

export const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
`;