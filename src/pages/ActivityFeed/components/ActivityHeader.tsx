import React from 'react';
import styled from 'styled-components';
import { FaRss } from 'react-icons/fa';

const ActivityHeader: React.FC = () => {
    return (
        <HeaderContainer>
            <HeaderTitle>
                <HeaderIcon>
                    <FaRss />
                </HeaderIcon>
                Aktualności
            </HeaderTitle>
            <HeaderDescription>
                Przegląd aktywności i zdarzeń w systemie
            </HeaderDescription>
        </HeaderContainer>
    );
};

const HeaderContainer = styled.div`
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  color: #2c3e50;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const HeaderIcon = styled.span`
  color: #3498db;
  margin-right: 10px;
  font-size: 24px;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const HeaderDescription = styled.p`
  color: #7f8c8d;
  margin: 0;
  font-size: 16px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export default ActivityHeader;