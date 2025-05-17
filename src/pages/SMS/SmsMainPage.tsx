// src/pages/SMS/SmsMainPage.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaSms,
    FaEnvelope,
    FaUserFriends,
    FaChartLine,
    FaCog,
    FaListAlt,
    FaRobot,
    FaPlus
} from 'react-icons/fa';
import { SmsDashboard } from './components/SmsDashboard';
import { SmsMessagesList } from './components/SmsMessagesList';
import { SmsAutomationsList } from './components/SmsAutomationsList';
import { SmsStats } from './components/SmsStats';
import { SmsSettings } from './components/SmsSettings';
import SmsTemplatesList from "./components/SmsTemplatesList";
import SmsCampaignsList from "./components/SmsCampaignsList";

// Typ opcji nawigacji
type NavOption = 'dashboard' | 'messages' | 'templates' | 'campaigns' | 'automations' | 'stats' | 'settings';

const SmsMainPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<NavOption>('dashboard');

    // Ustawienie aktywnej zakładki na podstawie URL
    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (path && ['dashboard', 'messages', 'templates', 'campaigns', 'automations', 'stats', 'settings'].includes(path)) {
            setActiveTab(path as NavOption);
        }
    }, [location]);

    // Zmiana aktywnej zakładki
    const handleTabChange = (tab: NavOption) => {
        setActiveTab(tab);
        navigate(`/sms/${tab}`);
    };

    // Funkcja pomocnicza do renderowania odpowiedniego komponentu
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <SmsDashboard />;
            case 'messages':
                return <SmsMessagesList />;
            case 'automations':
                return <SmsAutomationsList />;
            case 'stats':
                return <SmsStats />;
            case 'settings':
                return <SmsSettings />;
            case "templates":
                return <SmsTemplatesList/>;
            case 'campaigns':
                    return <SmsCampaignsList />;
            default:
                return <SmsDashboard />;
        }
    };

    // Funkcja pomocnicza do otwarcia modalu nowej wiadomości
    const handleNewMessage = () => {
        navigate('/sms/messages/new');
    };

    // Funkcja pomocnicza do otwarcia modalu nowej kampanii
    const handleNewCampaign = () => {
        navigate('/sms/campaigns/new');
    };

    return (
        <PageContainer>
            <PageHeader>
                <PageTitle>
                    <FaSms style={{ marginRight: '10px' }} />
                    Moduł SMS
                </PageTitle>
                <HeaderActions>
                    <ActionButton onClick={handleNewMessage}>
                        <FaEnvelope /> Nowa wiadomość
                    </ActionButton>
                    <ActionButton onClick={handleNewCampaign}>
                        <FaUserFriends /> Nowa kampania
                    </ActionButton>
                </HeaderActions>
            </PageHeader>

            <ContentContainer>
                <NavSidebar>
                    <NavItem
                        active={activeTab === 'dashboard'}
                        onClick={() => handleTabChange('dashboard')}
                    >
                        <NavIcon><FaChartLine /></NavIcon>
                        <NavText>Dashboard</NavText>
                    </NavItem>

                    <NavItem
                        active={activeTab === 'messages'}
                        onClick={() => handleTabChange('messages')}
                    >
                        <NavIcon><FaEnvelope /></NavIcon>
                        <NavText>Wiadomości</NavText>
                    </NavItem>

                    <NavItem
                        active={activeTab === 'templates'}
                        onClick={() => handleTabChange('templates')}
                    >
                        <NavIcon><FaListAlt /></NavIcon>
                        <NavText>Szablony</NavText>
                    </NavItem>

                    <NavItem
                        active={activeTab === 'campaigns'}
                        onClick={() => handleTabChange('campaigns')}
                    >
                        <NavIcon><FaUserFriends /></NavIcon>
                        <NavText>Kampanie</NavText>
                    </NavItem>

                    <NavItem
                        active={activeTab === 'automations'}
                        onClick={() => handleTabChange('automations')}
                    >
                        <NavIcon><FaRobot /></NavIcon>
                        <NavText>Automatyzacje</NavText>
                    </NavItem>

                    <NavItem
                        active={activeTab === 'stats'}
                        onClick={() => handleTabChange('stats')}
                    >
                        <NavIcon><FaChartLine /></NavIcon>
                        <NavText>Statystyki</NavText>
                    </NavItem>

                    <NavItem
                        active={activeTab === 'settings'}
                        onClick={() => handleTabChange('settings')}
                    >
                        <NavIcon><FaCog /></NavIcon>
                        <NavText>Ustawienia</NavText>
                    </NavItem>
                </NavSidebar>

                <MainContent>
                    {renderContent()}
                </MainContent>
            </ContentContainer>
        </PageContainer>
    );
};

// Styled components
const PageContainer = styled.div`
    padding: 24px;
    height: 100%;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`;

const PageTitle = styled.h1`
    font-size: 24px;
    display: flex;
    align-items: center;
    color: #2c3e50;
    margin: 0;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 12px;
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #2980b9;
    }

    svg {
        font-size: 16px;
    }
`;

const ContentContainer = styled.div`
    display: flex;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    height: calc(100vh - 120px);
`;

const NavSidebar = styled.div`
    width: 220px;
    background-color: #f8f9fa;
    border-right: 1px solid #e9ecef;
    padding: 16px 0;
    overflow-y: auto;
`;

const NavItem = styled.div<{ active: boolean }>`
    display: flex;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    color: ${props => props.active ? '#3498db' : '#6c757d'};
    background-color: ${props => props.active ? '#e8f4fd' : 'transparent'};
    font-weight: ${props => props.active ? '500' : 'normal'};
    border-left: 3px solid ${props => props.active ? '#3498db' : 'transparent'};
    transition: all 0.2s;

    &:hover {
        background-color: ${props => props.active ? '#e8f4fd' : '#f1f3f5'};
    }
`;

const NavIcon = styled.div`
    width: 20px;
    text-align: center;
    margin-right: 12px;
    font-size: 16px;
`;

const NavText = styled.div`
    font-size: 14px;
`;

const MainContent = styled.div`
    flex: 1;
    padding: 24px;
    overflow: auto;
`;

export default SmsMainPage;