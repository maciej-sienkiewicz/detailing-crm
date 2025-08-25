import React from 'react';
import styled from 'styled-components';
import {FaRss} from 'react-icons/fa';

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
            </HeaderContent>
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


export default ActivityHeader;