import styled from 'styled-components';
import { FaCalendarAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

// Style głównej strony pracowników
export const PageContainer = styled.div`
  padding: 20px;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h1 {
    font-size: 24px;
    margin: 0;
  }
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #2980b9;
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

export const EmptyState = styled.div`
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 30px;
  text-align: center;
  color: #7f8c8d;
`;

// Style kart pracowników
export const EmployeesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

export const EmployeeCard = styled.div`
  position: relative;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ColorBadge = styled.div<{ color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background-color: ${props => props.color};
`;

export const EmployeeHeader = styled.div`
  padding: 20px 20px 10px;
  border-bottom: 1px solid #f5f5f5;
`;

export const EmployeeName = styled.h3`
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #34495e;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const DocumentsButton = styled.button`
  background: none;
  border: none;
  color: #3498db;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  margin-left: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f0f7ff;
  }
`;

export const EmployeePosition = styled.div`
  font-size: 14px;
  color: #7f8c8d;
`;

export const EmployeeDetails = styled.div`
  padding: 15px 20px;
  flex: 1;
`;

export const EmployeeDetail = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
`;

export const DetailIcon = styled.div`
  margin-right: 10px;
  color: #7f8c8d;
  width: 16px;
  text-align: center;
`;

export const DetailText = styled.div`
  color: #34495e;
`;

export const EmployeeActions = styled.div`
  display: flex;
  padding: 10px 20px 20px;
  gap: 10px;
`;

export const ActionButton = styled.button<{ danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  padding: 8px;
  background-color: ${props => props.danger ? '#f9f2f2' : '#f0f7ff'};
  color: ${props => props.danger ? '#e74c3c' : '#3498db'};
  border: 1px solid ${props => props.danger ? '#fad5d5' : '#d5e9f9'};
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.danger ? '#fad5d5' : '#d5e9f9'};
  }
`;