import React from 'react';
import styled from 'styled-components';
import { FaRss, FaQuestion, FaInfoCircle } from 'react-icons/fa';

const ActivityHeader: React.FC = () => {
    return (
        <HeaderContainer>
            <HeaderContent>
                <HeaderTitle>
                    <HeaderIcon>
                        <FaRss />
                    </HeaderIcon>
                    Aktualności i aktywności
                </HeaderTitle>
                <HeaderDescription>
                    Przegląd aktywności i zdarzeń w systemie
                </HeaderDescription>
            </HeaderContent>

            <HeaderActions>
                <HelpButton>
                    <FaQuestion />
                </HelpButton>
                <InfoTooltip>
                    <InfoIcon>
                        <FaInfoCircle />
                    </InfoIcon>
                    <TooltipContent>
                        <TooltipHeader>O tym widoku</TooltipHeader>
                        <TooltipText>
                            W tym widoku możesz przeglądać wszystkie aktywności i zdarzenia, które miały miejsce w systemie.
                            Użyj filtrów po lewej stronie, aby zawęzić wyniki do interesujących Cię kategorii.
                        </TooltipText>
                    </TooltipContent>
                </InfoTooltip>
            </HeaderActions>
        </HeaderContainer>
    );
};

// Styled components
const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 20px;

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const HeaderContent = styled.div`
    flex: 1;
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
  
  @media (max-width: 480px) {
    margin-bottom: 10px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 480px) {
    align-self: flex-end;
  }
`;

const HelpButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f0f7ff;
  color: #3498db;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #d5e9f9;
  }
`;

const InfoTooltip = styled.div`
  position: relative;
  
  &:hover > div {
    display: block;
  }
`;

const InfoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f0f7ff;
  color: #3498db;
  cursor: pointer;
  
  &:hover {
    background-color: #d5e9f9;
  }
`;

const TooltipContent = styled.div`
  display: none;
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 300px;
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    right: 14px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid white;
  }
  
  @media (max-width: 480px) {
    width: 250px;
    right: -10px;
  }
`;

const TooltipHeader = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #34495e;
  margin-bottom: 5px;
`;

const TooltipText = styled.div`
  font-size: 13px;
  color: #7f8c8d;
  line-height: 1.4;
`;

export default ActivityHeader;