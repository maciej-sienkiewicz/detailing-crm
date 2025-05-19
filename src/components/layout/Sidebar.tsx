// src/components/layout/Sidebar.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    FaCalendarAlt,
    FaUsers,
    FaCar,
    FaClipboardList,
    FaCog,
    FaMoneyBillWave,
    FaWarehouse,
    FaPercentage,
    FaRegListAlt,
    FaUsersCog,
    FaFileAlt,
    FaCarSide,
    FaSearchPlus,
    FaCogs,
    FaWindowMaximize,
    FaClipboardCheck,
    FaChartBar,
    FaRss,
    FaTimes, FaSms
} from 'react-icons/fa';
import UserProfileSection from './UserProfileSection';

// Dane menu głównego
interface MainMenuItem {
    id: string;
    label: string;
    icon: React.ReactElement;
    path?: string;
    hasSubmenu: boolean;
}

const mainMenuItems: MainMenuItem[] = [
    {
        id: 'activity',
        label: 'Aktualności',
        icon: <FaRss />,
        path: '/activity',
        hasSubmenu: false
    },
    {
        id: 'calendar',
        label: 'Kalendarz',
        icon: <FaCalendarAlt />,
        path: '/calendar',
        hasSubmenu: false
    },
    {
        id: 'orders',
        label: 'Wizyty',
        icon: <FaClipboardCheck />,
        path: '/orders',
        hasSubmenu: false
    },
    {
        id: 'fleet',
        label: 'Flota',
        icon: <FaCar />,
        path: '/fleet',
        hasSubmenu: true
    },
    {
        id: 'clients',
        label: 'Klienci',
        icon: <FaUsers />,
        hasSubmenu: true
    },
    {
        id: 'finances',
        label: 'Finanse',
        icon: <FaMoneyBillWave />,
        hasSubmenu: true
    },
    {
        id: 'warehouse',
        label: 'Magazyn',
        icon: <FaWarehouse />,
        hasSubmenu: true
    },
    {
        id: 'reports',
        label: 'Raporty',
        icon: <FaChartBar />,
        path: '/reports',
        hasSubmenu: false
    },
    {
        id: 'team',
        label: 'Zespół',
        icon: <FaUsers />,
        path: '/team',
        hasSubmenu: false
    },
    {
        id: 'sms',
        label: 'Wysyłka SMS',
        icon: <FaSms />,
        path: '/sms',
        hasSubmenu: false
    },
    {
        id: 'settings',
        label: 'Ustawienia',
        icon: <FaCog />,
        hasSubmenu: true
    }
];

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    onMenuItemClick: (menuId: string | null) => void;
    activeMenuItem: string | null;
    isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
                                             isOpen,
                                             toggleSidebar,
                                             onMenuItemClick,
                                             activeMenuItem,
                                             isMobile
                                         }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleMenuItemClick = (item: MainMenuItem) => {
        if (item.hasSubmenu) {
            onMenuItemClick(item.id === activeMenuItem ? null : item.id);
        } else if (item.path) {
            // Jeśli element menu nie ma submenu, przechodzimy do określonej ścieżki
            onMenuItemClick(null);

            // Zawsze nawiguj do ścieżki, co spowoduje przeładowanie komponentu
            // i zamknięcie formularza jeśli jest otwarty
            navigate(item.path);
        }
    };

    const isItemActive = (item: MainMenuItem): boolean => {
        // Dla elementów z submenu
        if (item.id === activeMenuItem) {
            return true;
        }

        // Dla elementów bez submenu
        if (item.path && location.pathname.startsWith(item.path)) {
            return true;
        }

        return false;
    };

    return (
        <SidebarContainer isOpen={isOpen} isMobile={isMobile}>
            <SidebarHeader>
                <Logo>Detailing CRM</Logo>
                {isMobile && (
                    <CloseButton onClick={toggleSidebar}>
                        <FaTimes />
                    </CloseButton>
                )}
            </SidebarHeader>

            {/* Sekcja profilu użytkownika */}
            <UserProfileSection />

            <SidebarMenu>
                {mainMenuItems.map(item => (
                    <MenuItemContainer
                        key={item.id}
                        onClick={() => handleMenuItemClick(item)}
                        active={isItemActive(item)}
                    >
                        {item.path && !item.hasSubmenu ? (
                            <MenuItemLink
                                to={item.path}
                                $active={location.pathname.startsWith(item.path)}
                                onClick={(e) => {
                                    // Zatrzymaj domyślną nawigację Link
                                    // żeby obsłużyć ją w handleMenuItemClick
                                    e.preventDefault();
                                }}
                            >
                                <MenuIcon>{item.icon}</MenuIcon>
                                <MenuLabel>{item.label}</MenuLabel>
                            </MenuItemLink>
                        ) : (
                            <>
                                <MenuIcon>{item.icon}</MenuIcon>
                                <MenuLabel>{item.label}</MenuLabel>
                            </>
                        )}
                    </MenuItemContainer>
                ))}
            </SidebarMenu>

            <SidebarFooter>
                <Version>Wersja 1.0.5</Version>
            </SidebarFooter>
        </SidebarContainer>
    );
};

const SidebarContainer = styled.div<{ isOpen: boolean, isMobile: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 250px;
    background-color: #2c3e50;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    z-index: 100;
    transform: ${({ isOpen, isMobile }) => {
        // Na urządzeniach mobilnych, całkowicie ukrywamy menu
        if (isMobile) {
            return isOpen ? 'translateX(0)' : 'translateX(-100%)';
        }
        // Na desktopie, pozostawiamy standardowe zachowanie
        return isOpen ? 'translateX(0)' : 'translateX(-100%)';
    }};
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
`;

const SidebarHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #34495e;
`;

const Logo = styled.div`
    font-size: 18px;
    font-weight: bold;
    color: white;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    &:hover {
        color: #ecf0f1;
    }
`;

const SidebarMenu = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    overflow-y: auto;
    flex: 1;
`;

const MenuItemContainer = styled.div<{ active: boolean }>`
    display: flex;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    color: ${({ active }) => (active ? 'white' : '#ecf0f1')};
    background-color: ${({ active }) => (active ? '#34495e' : 'transparent')};
    font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
    transition: background-color 0.2s;

    &:hover {
        background-color: #34495e;
    }
`;

const MenuItemLink = styled(Link)<{ $active: boolean }>`
    display: flex;
    align-items: center;
    width: 100%;
    text-decoration: none;
    color: inherit;
`;

const MenuIcon = styled.div`
    margin-right: 15px;
    font-size: 16px;
    width: 16px;
    text-align: center;
`;

const MenuLabel = styled.div`
    font-size: 14px;
`;

const SidebarFooter = styled.div`
    padding: 15px 20px;
    border-top: 1px solid #34495e;
    text-align: center;
`;

const Version = styled.div`
    font-size: 12px;
    color: #7f8c8d;
`;

export default Sidebar;