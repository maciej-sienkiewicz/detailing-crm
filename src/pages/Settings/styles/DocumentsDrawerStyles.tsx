import styled from 'styled-components';

// Style dla szuflady dokumentów

export const DocumentsDrawerContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 900;
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
`;

export const DrawerHeader = styled.div`
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

export const DrawerEmployeeInfo = styled.div`
  padding: 15px 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

export const ColorDot = styled.div<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 10px;
`;

export const DrawerEmployeeName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #34495e;
  margin-right: 10px;
`;

export const DrawerEmployeePosition = styled.div`
  font-size: 13px;
  color: #7f8c8d;
`;

export const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

export const DocumentsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    color: #34495e;
  }
`;

export const AddDocumentButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #f0f7ff;
  color: #3498db;
  border: 1px solid #d5e9f9;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    background-color: #d5e9f9;
  }
`;

export const EmptyDocuments = styled.div`
  padding: 30px 20px;
  text-align: center;
  color: #7f8c8d;
  background-color: #f9f9f9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const DocumentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const DocumentItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid #3498db;
`;

export const DocumentIcon = styled.div`
  color: #3498db;
  font-size: 18px;
  margin-right: 12px;
`;

export const DocumentInfo = styled.div`
  flex: 1;
`;

export const DocumentName = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #34495e;
  margin-bottom: 3px;
`;

export const DocumentMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

export const DocumentType = styled.div`
  font-size: 12px;
  background-color: #eee;
  padding: 2px 6px;
  border-radius: 3px;
  color: #7f8c8d;
`;

export const DocumentDate = styled.div`
  font-size: 12px;
  color: #95a5a6;
`;

export const DocumentActions = styled.div`
  margin-left: 10px;
`;

export const DocumentActionButton = styled.button<{ danger?: boolean }>`
  background: none;
  border: none;
  color: ${props => props.danger ? '#e74c3c' : '#3498db'};
  font-size: 14px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  
  &:hover {
    background-color: ${props => props.danger ? '#fdecea' : '#f0f7ff'};
  }
`;

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