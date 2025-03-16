import React from 'react';
import styled from 'styled-components';

interface ActivityGroupProps {
    date: string;
    title: string;
    children: React.ReactNode;
}

const ActivityGroup: React.FC<ActivityGroupProps> = ({ date, title, children }) => {
    return (
        <GroupContainer>
            <GroupHeader>
                <GroupTitle>{title}</GroupTitle>
                <GroupLine />
            </GroupHeader>

            <GroupContent>
                {children}
            </GroupContent>
        </GroupContainer>
    );
};

const GroupContainer = styled.div`
  margin-bottom: 30px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const GroupTitle = styled.h3`
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
  flex-shrink: 0;
  margin-right: 15px;
  text-transform: capitalize;
  
  &::first-letter {
    text-transform: uppercase;
  }
`;

const GroupLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: #eee;
`;

const GroupContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export default ActivityGroup;