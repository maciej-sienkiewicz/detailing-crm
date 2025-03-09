import React, { useState } from 'react';
import styled from 'styled-components';
import { FaBars } from 'react-icons/fa';
import Sidebar from './Sidebar';
import SecondaryMenu from './SecondaryMenu';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true); // Domyślnie menu jest otwarte
    const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleMenuItemClick = (menuId: string | null) => {
        setActiveMenuItem(menuId);
    };

    return (
        <LayoutContainer>
            {!sidebarOpen && (
                <HamburgerButton onClick={toggleSidebar}>
                    <FaBars />
                </HamburgerButton>
            )}

            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                onMenuItemClick={handleMenuItemClick}
                activeMenuItem={activeMenuItem}
            />

            <SecondaryMenu
                activeMenuItem={activeMenuItem}
                isMainSidebarOpen={sidebarOpen}
            />

            <MainContent sidebarOpen={sidebarOpen} hasSecondaryMenu={!!activeMenuItem}>
                {children}
            </MainContent>
        </LayoutContainer>
    );
};

const LayoutContainer = styled.div`
    display: flex;
    min-height: 100vh;
`;

const HamburgerButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 20px;
    left: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #3498db;
    color: white;
    border: none;
    cursor: pointer;
    z-index: 50;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

    &:hover {
        background-color: #2980b9;
    }
`;

const MainContent = styled.main<{ sidebarOpen: boolean, hasSecondaryMenu: boolean }>`
    flex: 1;
    padding: 20px;
    margin-left: ${({ sidebarOpen, hasSecondaryMenu }) => {
        if (sidebarOpen && hasSecondaryMenu) return '450px'; // Szerokość głównego + drugiego menu
        if (sidebarOpen) return '250px'; // Tylko główne menu
        return '0';
    }};
    transition: margin-left 0.3s ease-in-out;
    width: 100%;
`;

export default Layout;