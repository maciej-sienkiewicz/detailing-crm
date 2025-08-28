import styled from 'styled-components';

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