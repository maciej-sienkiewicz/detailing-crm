import React from 'react';
import styled from 'styled-components';
import {
    FaInfo,
    FaComments,
    FaFileInvoiceDollar,
    FaUser,
    FaCarSide
} from 'react-icons/fa';

// Define tab types
type TabType = 'summary' | 'comments' | 'invoices' | 'client' | 'vehicle';

interface ProtocolTabsProps {
    activeTab: TabType;
    onChange: (tab: TabType) => void;
}

const ProtocolTabs: React.FC<ProtocolTabsProps> = ({ activeTab, onChange }) => {
    return (
        <TabsContainer>
            <TabItem
                active={activeTab === 'summary'}
                onClick={() => onChange('summary')}
            >
                <TabIcon><FaInfo /></TabIcon>
                <TabLabel>Podsumowanie</TabLabel>
            </TabItem>

            <TabItem
                active={activeTab === 'comments'}
                onClick={() => onChange('comments')}
            >
                <TabIcon><FaComments /></TabIcon>
                <TabLabel>Komentarze</TabLabel>
            </TabItem>

            <TabItem
                active={activeTab === 'invoices'}
                onClick={() => onChange('invoices')}
            >
                <TabIcon><FaFileInvoiceDollar /></TabIcon>
                <TabLabel>Faktury zakupowe</TabLabel>
            </TabItem>

            <TabItem
                active={activeTab === 'client'}
                onClick={() => onChange('client')}
            >
                <TabIcon><FaUser /></TabIcon>
                <TabLabel>Dane klienta</TabLabel>
            </TabItem>

            <TabItem
                active={activeTab === 'vehicle'}
                onClick={() => onChange('vehicle')}
            >
                <TabIcon><FaCarSide /></TabIcon>
                <TabLabel>Status pojazdu</TabLabel>
            </TabItem>
        </TabsContainer>
    );
};

// Styled components
const TabsContainer = styled.div`
    display: flex;
    background-color: white;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: -1px;
    position: relative;
    z-index: 2;
`;

const TabItem = styled.div<{ active: boolean }>`
    padding: 15px 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: ${props => props.active ? '#3498db' : '#7f8c8d'};
    font-weight: ${props => props.active ? '500' : 'normal'};
    border-bottom: 2px solid ${props => props.active ? '#3498db' : 'transparent'};
    background-color: ${props => props.active ? 'white' : '#fafafa'};
    
    &:hover {
        background-color: ${props => props.active ? 'white' : '#f5f5f5'};
    }
`;

const TabIcon = styled.div`
    margin-right: 8px;
    font-size: 14px;
`;

const TabLabel = styled.div`
    font-size: 14px;
`;

export default ProtocolTabs;