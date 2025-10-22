import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaBars} from 'react-icons/fa';
import Sidebar from './Sidebar';
import SecondaryMenu from './SecondaryMenu';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth <= 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleMenuItemClick = (menuId: string | null) => {
        setActiveMenuItem(menuId);
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    const handleClickOutside = () => {
        if (isMobile && sidebarOpen) {
            setSidebarOpen(false);
        }
    };

    return (
        <LayoutContainer>
            {!sidebarOpen && (
                <HamburgerButton onClick={toggleSidebar}>
                    <FaBars />
                </HamburgerButton>
            )}

            {isMobile && sidebarOpen && (
                <SidebarOverlay onClick={handleClickOutside} />
            )}

            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                onMenuItemClick={handleMenuItemClick}
                activeMenuItem={activeMenuItem}
                isMobile={isMobile}
            />

            <SecondaryMenu
                activeMenuItem={activeMenuItem}
                isMainSidebarOpen={sidebarOpen}
                isMobile={isMobile}
            />

            <MainContent
                sidebarOpen={sidebarOpen}
                hasSecondaryMenu={!!activeMenuItem}
                isMobile={isMobile}
            >
                {children}
            </MainContent>
        </LayoutContainer>
    );
};

const LayoutContainer = styled.div`
    display: flex;
    min-height: 100vh;
    position: relative;
`;

const HamburgerButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 12px;
    left: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #3498db;
    color: white;
    border: none;
    cursor: pointer;
    z-index: 100;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    font-size: 14px;

    &:hover {
        background-color: #2980b9;
    }
`;

const SidebarOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 90;
`;

const MainContent = styled.main<{ sidebarOpen: boolean, hasSecondaryMenu: boolean, isMobile: boolean }>`
    flex: 1;
    padding: 16px;
    margin-left: ${({ sidebarOpen, hasSecondaryMenu, isMobile }) => {
    if (isMobile) return '0';
    if (sidebarOpen && hasSecondaryMenu) return '420px';
    if (sidebarOpen) return '220px';
    return '0';
}};
    transition: margin-left 0.3s ease-in-out;
    width: 100%;
    
    @media (max-width: 768px) {
        padding: 12px;
        margin-top: ${({ sidebarOpen }) => sidebarOpen ? '0' : '48px'};
    }
`;

export default Layout;